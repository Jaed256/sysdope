"use client";

import { create } from "zustand";
import type {
  CompartmentMap,
  EnzymeActivityLevel,
  SimulationState,
} from "@/types/simulation";
import type { Compartment } from "@/types/reaction";
import { SEED_ENZYMES } from "@/lib/pathway/seedEnzymes";
import { SEED_REACTIONS } from "@/lib/pathway/seedReactions";
import { applyVesicleReleaseDirect, createInitialState, tick } from "./engine";
import { SCENARIOS, type Scenario } from "./scenarios";
import {
  COFACTORS,
  SIMULATION_REFRESH_MS,
  SIMULATION_TICK_DT,
} from "./kineticsConfig";

type DrawerKind = "compound" | "enzyme";
export type DrawerState =
  | { kind: DrawerKind; targetId: string }
  | null;

type ApplyScenarioMode = "merge" | "reset";

export type SimStore = SimulationState & {
  drawer: DrawerState;
  /**
   * Smoothed copy of `speed` for pathway edge animation only. The physics
   * `speed` updates immediately from the slider; this value eases toward it so
   * CSS dash timing does not reset harshly every time the dial moves.
   */
  speedDisplay: number;

  setEnzymeActivity: (enzymeId: string, level: EnzymeActivityLevel) => void;
  setInhibitorStrength: (enzymeId: string, strength: number) => void;
  dismissAlert: (alertId: string) => void;
  applyScenario: (scenarioId: string, mode?: ApplyScenarioMode) => void;
  addPrecursor: (compoundId: string, compartment: Compartment, amount: number) => void;
  releaseVesicles: (count?: number) => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
  refillCofactors: () => void;

  openDrawer: (kind: DrawerKind, targetId: string) => void;
  closeDrawer: () => void;

  startLoop: () => () => void;
};

const ALERT_DISMISS_COOLDOWN_TICKS = 48;

const initial = createInitialState({ enzymes: SEED_ENZYMES });

function mergeConcentrations(
  base: Record<string, CompartmentMap>,
  patch: Record<string, CompartmentMap>,
): Record<string, CompartmentMap> {
  const out = { ...base };
  for (const [cid, map] of Object.entries(patch)) {
    out[cid] = { ...(out[cid] ?? {}), ...map };
  }
  return out;
}

export const useSimulationStore = create<SimStore>((set, get) => ({
  ...initial,
  drawer: null,
  speedDisplay: initial.speed,

  setEnzymeActivity: (enzymeId, level) => {
    set((s) => ({
      enzymeActivity: { ...s.enzymeActivity, [enzymeId]: level },
      eventLog: [...s.eventLog, `t=${s.time} enzyme ${enzymeId} -> ${level}`].slice(-200),
    }));
  },

  setInhibitorStrength: (enzymeId, strength) => {
    const clamped = Math.min(1, Math.max(0, strength));
    set((s) => ({
      inhibitorStrength: { ...s.inhibitorStrength, [enzymeId]: clamped },
    }));
  },

  dismissAlert: (alertId) => {
    set((s) => ({
      alertDismissedUntil: {
        ...s.alertDismissedUntil,
        [alertId]: s.time + ALERT_DISMISS_COOLDOWN_TICKS,
      },
    }));
  },

  applyScenario: (scenarioId, mode = "merge") => {
    const scenario: Scenario | undefined = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    set((s) => {
      const baseState = mode === "reset" ? createInitialState({ enzymes: SEED_ENZYMES }) : s;
      const enzymeActivity = { ...baseState.enzymeActivity };
      for (const k of Object.keys(enzymeActivity)) enzymeActivity[k] = "normal";
      for (const [k, v] of Object.entries(scenario.enzymeActivity ?? {})) {
        if (v) enzymeActivity[k] = v;
      }
      const inhibitorStrength = { ...baseState.inhibitorStrength };
      for (const k of Object.keys(inhibitorStrength)) inhibitorStrength[k] = 0;
      for (const [k, v] of Object.entries(scenario.inhibitorStrength ?? {})) {
        if (v !== undefined) inhibitorStrength[k] = Math.min(1, Math.max(0, v));
      }
      const concentrations = scenario.concentrations
        ? mergeConcentrations(baseState.concentrations, scenario.concentrations)
        : baseState.concentrations;
      const cofactors = { ...baseState.cofactors };
      if (scenario.cofactors) {
        for (const [k, v] of Object.entries(scenario.cofactors)) {
          cofactors[k] = Math.max(0, v);
        }
      }
      return {
        ...baseState,
        enzymeActivity,
        inhibitorStrength,
        cofactors,
        concentrations,
        speedDisplay: mode === "reset" ? 1 : (s as SimStore).speedDisplay,
        alertDismissedUntil: mode === "reset" ? {} : { ...s.alertDismissedUntil },
        eventLog: [
          ...baseState.eventLog,
          `t=${baseState.time} scenario "${scenario.title}" applied`,
        ].slice(-200),
      };
    });
  },

  addPrecursor: (compoundId, compartment, amount) => {
    set((s) => {
      const existing = s.concentrations[compoundId] ?? {};
      const prev = existing[compartment] ?? 0;
      return {
        concentrations: {
          ...s.concentrations,
          [compoundId]: { ...existing, [compartment]: prev + amount },
        },
        eventLog: [
          ...s.eventLog,
          `t=${s.time} +${amount} ${compoundId} -> ${compartment}`,
        ].slice(-200),
      };
    });
  },

  releaseVesicles: (count = 1) => {
    const n = Math.max(1, Math.floor(count));
    set((s) => applyVesicleReleaseDirect(s, n));
  },

  togglePause: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed: Math.max(0.1, Math.min(8, speed)) }),

  reset: () =>
    set({
      ...createInitialState({ enzymes: SEED_ENZYMES }),
      drawer: null,
      speedDisplay: 1,
    }),

  refillCofactors: () => {
    set((s) => {
      const cofactors = { ...s.cofactors };
      for (const [id, cfg] of Object.entries(COFACTORS)) {
        cofactors[id] = cfg.replenishTarget;
      }
      return {
        cofactors,
        eventLog: [...s.eventLog, `t=${s.time} cofactors refilled`].slice(-200),
      };
    });
  },

  openDrawer: (kind, targetId) => set({ drawer: { kind, targetId } }),
  closeDrawer: () => set({ drawer: null }),

  startLoop: () => {
    let cancelled = false;
    let lastTickWall = performance.now();
    let lastFrame = performance.now();
    const step = (now: number) => {
      if (cancelled) return;
      const frameDtSec = Math.min(0.09, Math.max(0, (now - lastFrame) / 1000));
      lastFrame = now;

      const s = get();
      const target = s.speed;
      const prevDisplay = s.speedDisplay ?? target;
      let nextDisplay = prevDisplay + (target - prevDisplay) * Math.min(1, frameDtSec * 11);
      if (Math.abs(target - nextDisplay) < 0.004) nextDisplay = target;
      const speedDisplay = Math.round(nextDisplay * 24) / 24;

      const elapsed = now - lastTickWall;
      if (elapsed >= SIMULATION_REFRESH_MS) {
        lastTickWall = now;
        if (!s.paused) {
          const dt = SIMULATION_TICK_DT * s.speed;
          set({
            ...tick(s, {
              reactions: SEED_REACTIONS,
              enzymes: SEED_ENZYMES,
              dt,
            }),
            drawer: s.drawer,
            speedDisplay,
          });
        } else {
          set({ speedDisplay });
        }
      } else if (speedDisplay !== s.speedDisplay) {
        set({ speedDisplay });
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return () => {
      cancelled = true;
    };
  },
}));

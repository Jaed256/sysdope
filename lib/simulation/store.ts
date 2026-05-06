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
import { createInitialState, tick } from "./engine";
import { SCENARIOS, type Scenario } from "./scenarios";

const TICK_DT = 0.5; // simulated seconds per tick (placeholder unit)
const RAF_INTERVAL_MS = 100; // wall-clock ms per scheduled tick

type DrawerKind = "compound" | "enzyme";
export type DrawerState =
  | { kind: DrawerKind; targetId: string }
  | null;

type ApplyScenarioMode = "merge" | "reset";

export type SimStore = SimulationState & {
  drawer: DrawerState;

  setEnzymeActivity: (enzymeId: string, level: EnzymeActivityLevel) => void;
  applyScenario: (scenarioId: string, mode?: ApplyScenarioMode) => void;
  addPrecursor: (compoundId: string, compartment: Compartment, amount: number) => void;
  releaseVesicles: (count?: number) => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  reset: () => void;

  openDrawer: (kind: DrawerKind, targetId: string) => void;
  closeDrawer: () => void;

  startLoop: () => () => void;
};

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

  setEnzymeActivity: (enzymeId, level) => {
    set((s) => ({
      enzymeActivity: { ...s.enzymeActivity, [enzymeId]: level },
      eventLog: [...s.eventLog, `t=${s.time} enzyme ${enzymeId} -> ${level}`].slice(-200),
    }));
  },

  applyScenario: (scenarioId, mode = "merge") => {
    const scenario: Scenario | undefined = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    set((s) => {
      const baseState = mode === "reset" ? createInitialState({ enzymes: SEED_ENZYMES }) : s;
      const enzymeActivity = { ...baseState.enzymeActivity };
      // any enzyme not explicitly set goes back to "normal" for clarity
      for (const k of Object.keys(enzymeActivity)) enzymeActivity[k] = "normal";
      for (const [k, v] of Object.entries(scenario.enzymeActivity ?? {})) {
        if (v) enzymeActivity[k] = v;
      }
      const concentrations = scenario.concentrations
        ? mergeConcentrations(baseState.concentrations, scenario.concentrations)
        : baseState.concentrations;
      return {
        ...baseState,
        enzymeActivity,
        concentrations,
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
    set((s) => ({
      pendingReleases: s.pendingReleases + count,
      eventLog: [...s.eventLog, `t=${s.time} vesicle release x${count}`].slice(-200),
    }));
  },

  togglePause: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed: Math.max(0.1, Math.min(8, speed)) }),

  reset: () =>
    set({
      ...createInitialState({ enzymes: SEED_ENZYMES }),
      drawer: null,
    }),

  openDrawer: (kind, targetId) => set({ drawer: { kind, targetId } }),
  closeDrawer: () => set({ drawer: null }),

  startLoop: () => {
    let cancelled = false;
    let last = performance.now();
    const step = (now: number) => {
      if (cancelled) return;
      const elapsed = now - last;
      if (elapsed >= RAF_INTERVAL_MS) {
        last = now;
        const s = get();
        if (!s.paused) {
          const dt = TICK_DT * s.speed;
          set(
            tick(s, {
              reactions: SEED_REACTIONS,
              enzymes: SEED_ENZYMES,
              dt,
            }),
          );
        }
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return () => {
      cancelled = true;
    };
  },
}));

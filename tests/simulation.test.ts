import { describe, expect, it } from "vitest";
import { createInitialState, tick, applyVesicleReleaseDirect } from "@/lib/simulation/engine";
import { estimateDopamineAutoOxidationFlux } from "@/lib/simulation/dopamineModulation";
import { SEED_ENZYMES } from "@/lib/pathway/seedEnzymes";
import { SEED_REACTIONS } from "@/lib/pathway/seedReactions";
import type {
  EnzymeActivityLevel,
  SimulationState,
} from "@/types/simulation";

const REACTIONS = SEED_REACTIONS;
const ENZYMES = SEED_ENZYMES;
const DT = 0.5;

function makeState(overrides?: {
  enzymeActivity?: Partial<Record<string, EnzymeActivityLevel>>;
  conc?: SimulationState["concentrations"];
}): SimulationState {
  const s = createInitialState({ enzymes: ENZYMES });
  return {
    ...s,
    enzymeActivity: { ...s.enzymeActivity, ...(overrides?.enzymeActivity ?? {}) },
    concentrations: { ...s.concentrations, ...(overrides?.conc ?? {}) },
  };
}

function run(steps: number, state: SimulationState, perTick?: (s: SimulationState, i: number) => SimulationState): SimulationState {
  let cur = state;
  for (let i = 0; i < steps; i++) {
    if (perTick) cur = perTick(cur, i);
    cur = tick(cur, { reactions: REACTIONS, enzymes: ENZYMES, dt: DT });
  }
  return cur;
}

function totalAcrossCompartments(s: SimulationState, cid: string): number {
  return Object.values(s.concentrations[cid] ?? {}).reduce(
    (sum, v) => sum + (v ?? 0),
    0,
  );
}

describe("simulation engine", () => {
  it("applyVesicleReleaseDirect moves vesicular DA to synapse even when paused", () => {
    const s = createInitialState({ enzymes: ENZYMES });
    const paused = { ...s, paused: true };
    const after = applyVesicleReleaseDirect(paused, 1);
    expect(after.concentrations.dopamine?.synapse ?? 0).toBeGreaterThan(
      s.concentrations.dopamine?.synapse ?? 0,
    );
    expect(after.concentrations.dopamine?.vesicle ?? 0).toBeLessThan(
      s.concentrations.dopamine?.vesicle ?? 0,
    );
  });

  it("lastFluxRate matches lastFlux divided by the tick dt", () => {
    const s = makeState({
      conc: {
        dopamine: { cytosol: 40, vesicle: 120, synapse: 35 },
      },
    });
    const dt = 0.5;
    const after = tick(s, { reactions: REACTIONS, enzymes: ENZYMES, dt });
    expect(after.lastTickSimDt).toBe(dt);
    for (const rid of Object.keys(after.lastFlux)) {
      const flux = after.lastFlux[rid] ?? 0;
      const rate = after.lastFluxRate[rid] ?? 0;
      expect(rate).toBeCloseTo(flux / dt, 5);
    }
  });

  it("sustained high dopamine tone trends DAT up, TH tonic down, and D2 gain down (toy homeostasis)", () => {
    let s = makeState({
      enzymeActivity: {
        dat: "inhibit",
        comt: "inhibit",
        d1: "inhibit",
        d2: "inhibit",
        d3: "inhibit",
        d4: "inhibit",
        d5: "inhibit",
      },
      conc: {
        dopamine: { cytosol: 50, vesicle: 80, synapse: 130 },
      },
    });
    const d2Start = s.receptorHomeostaticFactor.d2 ?? 1;
    const datStart = s.datHomeostaticFactor;
    const thStart = s.thTonicFactor;
    for (let i = 0; i < 500; i++) {
      let next = tick(s, { reactions: REACTIONS, enzymes: ENZYMES, dt: 0.5 });
      const d = next.concentrations.dopamine ?? {};
      // Pin cleft load so diffusion/reuptake toy sinks cannot invert the tone
      // (instrumental; asserts directionality of the slow regulators).
      next = {
        ...next,
        concentrations: {
          ...next.concentrations,
          dopamine: { ...d, synapse: 130 },
        },
      };
      s = next;
    }
    expect(s.receptorHomeostaticFactor.d2 ?? 1).toBeLessThan(d2Start - 0.03);
    expect(s.datHomeostaticFactor).toBeGreaterThan(datStart + 0.04);
    expect(s.thTonicFactor).toBeLessThan(thStart - 0.03);
  });

  it("schematic autoxidation flux is visible when cytosolic + synaptic dopamine is very high", () => {
    const s = makeState({
      conc: {
        dopamine: { cytosol: 4000, synapse: 200, vesicle: 30, extracellular: 0 },
      },
    });
    expect(estimateDopamineAutoOxidationFlux(s, DT)).toBeGreaterThan(0.02);
    const after = tick(s, { reactions: REACTIONS, enzymes: ENZYMES, dt: DT });
    expect(after.lastAutoOxidationFlux).toBeGreaterThan(0.02);
  });

  it("never produces negative concentrations across many ticks of a noisy scenario", () => {
    let state = makeState({
      conc: {
        phenylalanine: { precursor: 1000 },
        tyrosine: { precursor: 1000 },
        l_dopa: { cytosol: 100 },
        dopamine: { cytosol: 100, vesicle: 200, synapse: 80 },
      },
    });
    const allLevels: EnzymeActivityLevel[] = [
      "inhibit",
      "partial",
      "normal",
      "upregulate",
      "overexpress",
    ];
    for (let step = 0; step < 1000; step++) {
      // randomly toggle a few enzymes per tick
      if (step % 25 === 0) {
        const enzId = ENZYMES[step % ENZYMES.length]!.id;
        const level = allLevels[step % allLevels.length]!;
        state = { ...state, enzymeActivity: { ...state.enzymeActivity, [enzId]: level } };
      }
      if (step % 50 === 0) {
        state = { ...state, pendingReleases: state.pendingReleases + 1 };
      }
      state = tick(state, { reactions: REACTIONS, enzymes: ENZYMES, dt: DT });
      for (const map of Object.values(state.concentrations)) {
        for (const v of Object.values(map)) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(v)).toBe(true);
        }
      }
    }
  });

  it("TH bottleneck: high tyrosine + inhibited TH => downstream dopamine stays bounded vs baseline", () => {
    const baseline = run(
      300,
      makeState({
        conc: {
          tyrosine: { precursor: 1000 },
          dopamine: { cytosol: 0, vesicle: 0, synapse: 0 },
        },
      }),
    );
    const inhibited = run(
      300,
      makeState({
        enzymeActivity: { th: "inhibit" },
        conc: {
          tyrosine: { precursor: 1000 },
          dopamine: { cytosol: 0, vesicle: 0, synapse: 0 },
        },
      }),
    );
    expect(totalAcrossCompartments(baseline, "dopamine")).toBeGreaterThan(
      totalAcrossCompartments(inhibited, "dopamine") + 5,
    );
    // tyrosine should remain very high in the inhibited scenario (substrate
    // accumulation upstream of TH)
    expect(inhibited.concentrations.tyrosine?.precursor ?? 0).toBeGreaterThan(900);
    // and either the partial-throughput bottleneck toast or the explicit
    // "TH fully blocked" info alert must have surfaced in the live log.
    const sawAlert = inhibited.eventLog.some(
      (e) => e.includes("TH bottleneck") || e.includes("TH is fully blocked"),
    );
    expect(sawAlert).toBe(true);
  });

  it("ALDH inhibition: DOPAL accumulates strictly more than baseline", () => {
    const baseline = run(
      400,
      makeState({
        conc: { dopamine: { cytosol: 200, vesicle: 50, synapse: 0 } },
      }),
    );
    const inhibited = run(
      400,
      makeState({
        enzymeActivity: { aldh: "inhibit" },
        conc: { dopamine: { cytosol: 200, vesicle: 50, synapse: 0 } },
      }),
    );
    const baseDopal = baseline.concentrations.dopal?.cytosol ?? 0;
    const inhDopal = inhibited.concentrations.dopal?.cytosol ?? 0;
    expect(inhDopal).toBeGreaterThan(baseDopal + 5);
  });

  it("VMAT2 inhibition: vesicular DA decreases and cytosolic DA increases vs baseline", () => {
    const baseline = run(
      300,
      makeState({
        conc: { dopamine: { cytosol: 50, vesicle: 100, synapse: 0 } },
      }),
    );
    const inhibited = run(
      300,
      makeState({
        enzymeActivity: { vmat2: "inhibit" },
        conc: { dopamine: { cytosol: 50, vesicle: 100, synapse: 0 } },
      }),
    );
    const baseVes = baseline.concentrations.dopamine?.vesicle ?? 0;
    const inhVes = inhibited.concentrations.dopamine?.vesicle ?? 0;
    const baseCyt = baseline.concentrations.dopamine?.cytosol ?? 0;
    const inhCyt = inhibited.concentrations.dopamine?.cytosol ?? 0;
    expect(inhVes).toBeLessThan(baseVes);
    expect(inhCyt).toBeGreaterThan(baseCyt);
  });

  it("DAT inhibition: synaptic DA half-life after a release is longer than baseline", () => {
    function timeToHalf(state: SimulationState): number {
      const start = state.concentrations.dopamine?.synapse ?? 0;
      let cur = state;
      for (let i = 0; i < 500; i++) {
        cur = tick(cur, { reactions: REACTIONS, enzymes: ENZYMES, dt: DT });
        const v = cur.concentrations.dopamine?.synapse ?? 0;
        if (v <= start / 2) return i + 1;
      }
      return 500;
    }
    const seed = makeState({
      conc: { dopamine: { cytosol: 0, vesicle: 200, synapse: 0 } },
    });
    const baselineState = tick(
      { ...seed, pendingReleases: 3 },
      { reactions: REACTIONS, enzymes: ENZYMES, dt: DT },
    );
    const inhibitedState = tick(
      { ...seed, enzymeActivity: { ...seed.enzymeActivity, dat: "inhibit" }, pendingReleases: 3 },
      { reactions: REACTIONS, enzymes: ENZYMES, dt: DT },
    );
    const baselineHalf = timeToHalf(baselineState);
    const inhibitedHalf = timeToHalf(inhibitedState);
    expect(inhibitedHalf).toBeGreaterThan(baselineHalf);
  });

  it("HVA urinary output increases when dopamine is being released and degradation pathways are active", () => {
    let state = makeState({
      conc: {
        dopamine: { cytosol: 100, vesicle: 200, synapse: 0 },
        tyrosine: { precursor: 200 },
      },
    });
    let lastUrine = 0;
    let saw = false;
    for (let i = 0; i < 600; i++) {
      if (i % 10 === 0) state = { ...state, pendingReleases: state.pendingReleases + 1 };
      state = tick(state, { reactions: REACTIONS, enzymes: ENZYMES, dt: DT });
      const u = state.concentrations.hva?.urine ?? 0;
      if (u > lastUrine) saw = true;
      lastUrine = u;
    }
    expect(saw).toBe(true);
    expect(lastUrine).toBeGreaterThan(0);
  });
});

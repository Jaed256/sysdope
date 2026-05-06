import { describe, expect, it } from "vitest";
import { createInitialState, tick } from "@/lib/simulation/engine";
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
    // and a TH bottleneck alert must have fired at some point
    const sawAlert = inhibited.eventLog.some((e) => e.includes("TH bottleneck"));
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

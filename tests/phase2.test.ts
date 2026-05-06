import { describe, expect, it } from "vitest";
import { createInitialState, tick } from "@/lib/simulation/engine";
import { SEED_ENZYMES } from "@/lib/pathway/seedEnzymes";
import { SEED_REACTIONS } from "@/lib/pathway/seedReactions";
import { COFACTORS } from "@/lib/simulation/kineticsConfig";
import type {
  EnzymeActivityLevel,
  SimulationState,
} from "@/types/simulation";

const REACTIONS = SEED_REACTIONS;
const ENZYMES = SEED_ENZYMES;

function freshState(overrides?: {
  enzymeActivity?: Partial<Record<string, EnzymeActivityLevel>>;
  inhibitorStrength?: Partial<Record<string, number>>;
  conc?: SimulationState["concentrations"];
  cofactors?: Partial<Record<string, number>>;
}): SimulationState {
  const s = createInitialState({ enzymes: ENZYMES });
  return {
    ...s,
    enzymeActivity: { ...s.enzymeActivity, ...(overrides?.enzymeActivity ?? {}) },
    inhibitorStrength: { ...s.inhibitorStrength, ...(overrides?.inhibitorStrength ?? {}) },
    concentrations: { ...s.concentrations, ...(overrides?.conc ?? {}) },
    cofactors: { ...s.cofactors, ...(overrides?.cofactors ?? {}) },
  };
}

function totalCompound(s: SimulationState, cid: string): number {
  return Object.values(s.concentrations[cid] ?? {}).reduce(
    (sum, v) => sum + (v ?? 0),
    0,
  );
}

function runFor(state: SimulationState, steps: number, dt: number): SimulationState {
  let cur = state;
  for (let i = 0; i < steps; i++) {
    cur = tick(cur, { reactions: REACTIONS, enzymes: ENZYMES, dt });
  }
  return cur;
}

describe("Phase 2 — substepping numerical stability", () => {
  it("never produces negative concentrations even at extreme dt and high substrate", () => {
    let state = freshState({
      enzymeActivity: {
        th: "overexpress",
        ddc: "overexpress",
        vmat2: "overexpress",
      },
      conc: {
        tyrosine: { precursor: 5000 },
        l_dopa: { cytosol: 5000 },
        dopamine: { cytosol: 5000, vesicle: 0, synapse: 0 },
      },
    });
    for (let i = 0; i < 50; i++) {
      state = tick(state, { reactions: REACTIONS, enzymes: ENZYMES, dt: 5 });
      for (const map of Object.values(state.concentrations)) {
        for (const v of Object.values(map)) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(v)).toBe(true);
        }
      }
    }
  });

  it("substepping conserves rough mass: large dt total ≈ same simulated time at small dt", () => {
    const seed = freshState({
      conc: { tyrosine: { precursor: 500 }, dopamine: { cytosol: 0, vesicle: 0 } },
    });
    const totalSimTime = 60;
    // path A: 60 steps of dt=1
    const a = runFor(seed, 60, 1);
    // path B: 6 steps of dt=10 (will trigger substepping)
    const b = runFor(seed, 6, 10);

    const aDA = totalCompound(a, "dopamine") + totalCompound(a, "norepinephrine");
    const bDA = totalCompound(b, "dopamine") + totalCompound(b, "norepinephrine");

    // both should agree to within ~25% — substepping should pull large-dt
    // toward small-dt result
    const ratio = bDA / Math.max(1e-3, aDA);
    expect(ratio).toBeGreaterThan(0.6);
    expect(ratio).toBeLessThan(1.6);
    expect(a.time).toBe(totalSimTime);
    expect(b.time).toBe(6);
  });
});

describe("Phase 2 — cofactor pools", () => {
  it("BH4 depletion throttles TH flux compared to baseline", () => {
    const seed = freshState({
      conc: {
        tyrosine: { precursor: 500 },
        dopamine: { cytosol: 0, vesicle: 0 },
      },
    });
    const baseline = runFor(seed, 80, 0.5);
    const depleted = runFor(
      freshState({
        conc: {
          tyrosine: { precursor: 500 },
          dopamine: { cytosol: 0, vesicle: 0 },
        },
        cofactors: { BH4: 1 },
      }),
      80,
      0.5,
    );
    expect(totalCompound(depleted, "l_dopa") + totalCompound(depleted, "dopamine"))
      .toBeLessThan(totalCompound(baseline, "l_dopa") + totalCompound(baseline, "dopamine"));
  });

  it("cofactors regenerate toward replenishTarget when usage stops", () => {
    let state = freshState({ cofactors: { BH4: 1, SAM: 1, "NAD+": 1 } });
    // No upstream substrate so reactions don't consume cofactors
    state = {
      ...state,
      concentrations: {
        ...state.concentrations,
        tyrosine: { precursor: 0 },
        phenylalanine: { precursor: 0 },
        l_dopa: { cytosol: 0 },
        dopamine: { cytosol: 0, vesicle: 0, synapse: 0 },
      },
    };
    state = runFor(state, 200, 0.5);
    for (const id of Object.keys(COFACTORS)) {
      const target = COFACTORS[id as keyof typeof COFACTORS].replenishTarget;
      const v = state.cofactors[id] ?? 0;
      // should have regenerated significantly
      expect(v).toBeGreaterThan(target * 0.5);
    }
  });

  it("emits a cofactor-low alert when a pool is depleted", () => {
    const state = runFor(
      freshState({
        cofactors: { BH4: 0 },
        conc: { tyrosine: { precursor: 500 } },
      }),
      5,
      0.5,
    );
    const sawAlert = state.alerts.some((a) => a.id.startsWith("cofactor_BH4"));
    expect(sawAlert).toBe(true);
  });
});

describe("Phase 2 — inhibitor strength continuity", () => {
  it("monotonically reduces flux through the targeted enzyme as inhibitor strength rises", () => {
    function dopamineYield(strength: number): number {
      const seed = freshState({
        inhibitorStrength: { th: strength },
        conc: {
          tyrosine: { precursor: 500 },
          dopamine: { cytosol: 0, vesicle: 0 },
        },
      });
      const out = runFor(seed, 60, 0.5);
      return totalCompound(out, "dopamine") + totalCompound(out, "l_dopa");
    }
    const y0 = dopamineYield(0);
    const y25 = dopamineYield(0.25);
    const y50 = dopamineYield(0.5);
    const y75 = dopamineYield(0.75);
    const y100 = dopamineYield(1.0);

    // strictly non-increasing
    expect(y0).toBeGreaterThanOrEqual(y25 - 0.001);
    expect(y25).toBeGreaterThanOrEqual(y50 - 0.001);
    expect(y50).toBeGreaterThanOrEqual(y75 - 0.001);
    expect(y75).toBeGreaterThanOrEqual(y100 - 0.001);
    // and strictly less at full inhibition
    expect(y100).toBeLessThan(y0);
  });

  it("inhibitor strength stacks multiplicatively with enzyme activity level", () => {
    // partial activity (0.4) + 50% inhibitor should produce roughly half the
    // flux of partial activity alone
    function yield_(level: EnzymeActivityLevel, inh: number): number {
      const seed = freshState({
        enzymeActivity: { th: level },
        inhibitorStrength: { th: inh },
        conc: {
          tyrosine: { precursor: 500 },
          dopamine: { cytosol: 0, vesicle: 0 },
        },
      });
      const out = runFor(seed, 60, 0.5);
      return totalCompound(out, "dopamine") + totalCompound(out, "l_dopa");
    }
    const partialOnly = yield_("partial", 0);
    const partialPlusHalfInh = yield_("partial", 0.5);

    expect(partialPlusHalfInh).toBeLessThan(partialOnly);
    // ratio should be in roughly 0.4-0.7 range — multiplicative dampening,
    // not additive replacement
    const ratio = partialPlusHalfInh / Math.max(1e-6, partialOnly);
    expect(ratio).toBeGreaterThan(0.3);
    expect(ratio).toBeLessThan(0.85);
  });
});

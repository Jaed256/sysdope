import { describe, expect, it } from "vitest";
import { createInitialState, tick } from "@/lib/simulation/engine";
import { evaluateAlerts } from "@/lib/simulation/alerts";
import { isCatecholamineBreakdownFullyBlocked } from "@/lib/simulation/dopamineModulation";
import { SEED_ENZYMES } from "@/lib/pathway/seedEnzymes";
import { SEED_REACTIONS } from "@/lib/pathway/seedReactions";
import type { SimulationState } from "@/types/simulation";

describe("alerts", () => {
  it("raises an info alert when TH is fully inhibited but tyrosine stacks up", () => {
    const base = createInitialState({ enzymes: SEED_ENZYMES });
    const state: SimulationState = {
      ...base,
      time: 42,
      enzymeActivity: { ...base.enzymeActivity, th: "inhibit" },
      concentrations: {
        ...base.concentrations,
        tyrosine: { precursor: 160 },
        l_dopa: { cytosol: 2 },
      },
    };
    const alerts = evaluateAlerts(state);
    expect(alerts.some((a) => a.id === "th_fully_blocked")).toBe(true);
  });

  it("does not treat partial TH slowdown as fully blocked while explaining upstream rise", () => {
    const base = createInitialState({ enzymes: SEED_ENZYMES });
    const state: SimulationState = {
      ...base,
      time: 3,
      enzymeActivity: { ...base.enzymeActivity, th: "partial" },
      concentrations: {
        ...base.concentrations,
        tyrosine: { precursor: 120 },
        l_dopa: { cytosol: 40 },
      },
    };
    const alerts = evaluateAlerts(state);
    expect(alerts.every((a) => a.id !== "th_fully_blocked")).toBe(true);
  });
});

describe("oxidative auto-oxidation toy alert", () => {
  it("appears when MAO-A/B, COMT, and ALDH are fully off and dopamine pools are high", () => {
    const base = createInitialState({ enzymes: SEED_ENZYMES });
    let cur: SimulationState = {
      ...base,
      enzymeActivity: {
        ...base.enzymeActivity,
        mao_a: "inhibit",
        mao_b: "inhibit",
        comt: "inhibit",
        aldh: "inhibit",
        d1: "inhibit",
        d2: "inhibit",
        d3: "inhibit",
        d4: "inhibit",
        d5: "inhibit",
      },
      concentrations: {
        ...base.concentrations,
        dopamine: {
          ...(base.concentrations.dopamine ?? {}),
          cytosol: 90,
          synapse: 70,
          vesicle: 0,
        },
      },
    };
    expect(isCatecholamineBreakdownFullyBlocked(cur)).toBe(true);
    let sawOxidative = false;
    for (let i = 0; i < 40; i++) {
      cur = tick(cur, { reactions: SEED_REACTIONS, enzymes: SEED_ENZYMES, dt: 0.8 });
      if (cur.alerts.some((a) => a.id === "oxidative_stress_autooxidation")) {
        sawOxidative = true;
      }
    }
    expect(sawOxidative).toBe(true);
  });
});

describe("postsynaptic binding reactions", () => {
  it("consumes synaptic dopamine into postsynaptic drive pools while receptors stay active", () => {
    const base = createInitialState({ enzymes: SEED_ENZYMES });
    const state: SimulationState = {
      ...base,
      concentrations: {
        ...base.concentrations,
        dopamine: {
          ...(base.concentrations.dopamine ?? {}),
          cytosol: 0,
          vesicle: 0,
          synapse: 200,
        },
      },
      enzymeActivity: {
        ...base.enzymeActivity,
        d1: "overexpress",
        d2: "upregulate",
        dat: "inhibit",
        comt: "inhibit",
      },
    };
    let cur = state;
    for (let i = 0; i < 60; i++) {
      cur = tick(cur, { reactions: SEED_REACTIONS, enzymes: SEED_ENZYMES, dt: 0.5 });
    }
    const d1Drive = cur.concentrations.postsynaptic_d1?.synapse ?? 0;
    const synRemain = cur.concentrations.dopamine?.synapse ?? 0;
    expect(d1Drive).toBeGreaterThan(5);
    expect(synRemain).toBeLessThan(200);
  });
});

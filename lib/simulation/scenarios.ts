import type { CompartmentMap, EnzymeActivityLevel } from "@/types/simulation";

export type Scenario = {
  id: string;
  title: string;
  description: string;
  /** enzyme activity overrides relative to baseline ("normal") */
  enzymeActivity?: Partial<Record<string, EnzymeActivityLevel>>;
  /** absolute compound concentration overrides applied on top of baseline */
  concentrations?: Record<string, CompartmentMap>;
};

export const SCENARIOS: Scenario[] = [
  {
    id: "baseline",
    title: "Baseline",
    description: "All enzymes at normal activity. Use as a control.",
    enzymeActivity: {},
  },
  {
    id: "th_inhibition",
    title: "TH inhibition",
    description:
      "TH set to inhibit. Demonstrates the rate-limiting bottleneck — downstream dopamine collapses even when tyrosine is high.",
    enzymeActivity: { th: "inhibit" },
    concentrations: { tyrosine: { precursor: 1000 } },
  },
  {
    id: "ddc_inhibition",
    title: "DDC / AADC inhibition",
    description:
      "DDC inhibition causes L-DOPA to accumulate and dopamine production to fall.",
    enzymeActivity: { ddc: "inhibit" },
  },
  {
    id: "comt_inhibition",
    title: "COMT inhibition",
    description:
      "COMT inhibition reduces O-methylation. Expect lower 3-MT, normetanephrine, metanephrine, and HVA output.",
    enzymeActivity: { comt: "inhibit" },
  },
  {
    id: "mao_inhibition",
    title: "MAO inhibition",
    description:
      "MAO-A and MAO-B inhibited. Cytosolic dopamine accumulates; DOPAL formation falls; HVA output drops.",
    enzymeActivity: { mao_a: "inhibit", mao_b: "inhibit" },
  },
  {
    id: "aldh_inhibition",
    title: "ALDH inhibition (DOPAL buildup)",
    description:
      "ALDH inhibited so DOPAL is no longer cleared. Watch DOPAL rise and a toxicity alert appear.",
    enzymeActivity: { aldh: "inhibit" },
  },
  {
    id: "vmat2_inhibition",
    title: "VMAT2 inhibition",
    description:
      "Cytosolic dopamine accumulates because it is no longer sequestered into vesicles; vesicular dopamine drops.",
    enzymeActivity: { vmat2: "inhibit" },
  },
  {
    id: "dat_inhibition",
    title: "DAT inhibition",
    description:
      "Synaptic dopamine clearance slows. After a release event the cleft stays elevated for longer.",
    enzymeActivity: { dat: "inhibit" },
  },
  {
    id: "precursor_overload",
    title: "Precursor overload",
    description:
      "Bolus of phenylalanine and tyrosine. With normal TH activity, dopamine rises modestly — TH still throttles flux.",
    concentrations: {
      phenylalanine: { precursor: 800 },
      tyrosine: { precursor: 800 },
    },
  },
];

export function findScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

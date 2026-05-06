import type { Reaction } from "@/types/reaction";
import type { Citation } from "@/types/citation";
import { REACTION_KINETICS } from "@/lib/simulation/kineticsConfig";

const ACCESSED = "2026-05-05";

/**
 * NOTE — kinetic constants live in `lib/simulation/kineticsConfig.ts`. This
 * file owns the *graph* (substrates, products, compartments, equations) and
 * pulls the numbers from the central config so there is one place to
 * replace placeholders with source-backed values later.
 */
function placeholderCite(): Citation {
  return {
    sourceName: "SysDope seed",
    sourceType: "manual",
    title: "Educational placeholder kinetic constant",
    accessedAt: ACCESSED,
    confidence: "low",
  };
}

function k(reactionId: string): {
  km: number;
  vmax: number;
  baseRate: number;
} {
  const cfg = REACTION_KINETICS[reactionId];
  if (!cfg) {
    throw new Error(`Missing kinetic config for reaction ${reactionId}`);
  }
  return cfg;
}

export const SEED_REACTIONS: Reaction[] = [
  {
    id: "rx_pah",
    enzymeId: "pah",
    from: ["phenylalanine"],
    to: ["tyrosine"],
    fromCompartment: "precursor",
    toCompartment: "precursor",
    equation: "L-Phe + BH4 + O2 \u2192 L-Tyr + BH2 + H2O",
    equationLatex:
      "\\text{L-Phe} + \\mathrm{BH_4} + \\mathrm{O_2} \\rightarrow \\text{L-Tyr} + \\mathrm{BH_2} + \\mathrm{H_2O}",
    reversible: false,
    ...k("rx_pah"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_th",
    enzymeId: "th",
    from: ["tyrosine"],
    to: ["l_dopa"],
    fromCompartment: "precursor",
    toCompartment: "cytosol",
    equation: "L-Tyr + BH4 + O2 \u2192 L-DOPA + BH2 + H2O",
    equationLatex:
      "\\text{L-Tyr} + \\mathrm{BH_4} + \\mathrm{O_2} \\rightarrow \\text{L-DOPA} + \\mathrm{BH_2} + \\mathrm{H_2O}",
    reversible: false,
    ...k("rx_th"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_ddc",
    enzymeId: "ddc",
    from: ["l_dopa"],
    to: ["dopamine"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "L-DOPA \u2192 Dopamine + CO2",
    equationLatex:
      "\\text{L-DOPA} \\rightarrow \\text{dopamine} + \\mathrm{CO_2}",
    reversible: false,
    ...k("rx_ddc"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_vmat2_da",
    enzymeId: "vmat2",
    from: ["dopamine"],
    to: ["dopamine"],
    fromCompartment: "cytosol",
    toCompartment: "vesicle",
    equation: "Cytosolic dopamine \u2192 Vesicular dopamine (H+ antiport)",
    equationLatex:
      "\\text{Cytosolic dopamine} \\rightarrow \\text{Vesicular dopamine}~(\\mathrm{H}^+~\\text{antiport})",
    reversible: false,
    ...k("rx_vmat2_da"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_dbh",
    enzymeId: "dbh",
    from: ["dopamine"],
    to: ["norepinephrine"],
    fromCompartment: "vesicle",
    toCompartment: "vesicle",
    equation: "Dopamine + ascorbate + O2 \u2192 NE + dehydroascorbate + H2O",
    equationLatex:
      "\\text{Dopamine} + \\text{ascorbate} + \\mathrm{O_2} \\rightarrow \\text{NE} + \\text{dehydroascorbate} + \\mathrm{H_2O}",
    reversible: false,
    ...k("rx_dbh"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_pnmt",
    enzymeId: "pnmt",
    from: ["norepinephrine"],
    to: ["epinephrine"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "NE + SAM \u2192 Epi + SAH",
    equationLatex: "\\text{NE} + \\mathrm{SAM} \\rightarrow \\text{Epi} + \\mathrm{SAH}",
    reversible: false,
    ...k("rx_pnmt"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_comt_ne",
    enzymeId: "comt",
    from: ["norepinephrine"],
    to: ["normetanephrine"],
    fromCompartment: "extracellular",
    toCompartment: "extracellular",
    equation: "NE + SAM \u2192 Normetanephrine + SAH",
    equationLatex:
      "\\text{NE} + \\mathrm{SAM} \\rightarrow \\text{Normetanephrine} + \\mathrm{SAH}",
    reversible: false,
    ...k("rx_comt_ne"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_comt_epi",
    enzymeId: "comt",
    from: ["epinephrine"],
    to: ["metanephrine"],
    fromCompartment: "extracellular",
    toCompartment: "extracellular",
    equation: "Epi + SAM \u2192 Metanephrine + SAH",
    equationLatex:
      "\\text{Epi} + \\mathrm{SAM} \\rightarrow \\text{Metanephrine} + \\mathrm{SAH}",
    reversible: false,
    ...k("rx_comt_epi"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_comt_da_to_3mt",
    enzymeId: "comt",
    from: ["dopamine"],
    to: ["three_mt"],
    fromCompartment: "synapse",
    toCompartment: "extracellular",
    equation: "Dopamine + SAM \u2192 3-MT + SAH",
    equationLatex:
      "\\text{Dopamine} + \\mathrm{SAM} \\rightarrow \\text{3-MT} + \\mathrm{SAH}",
    reversible: false,
    ...k("rx_comt_da_to_3mt"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_mao_3mt",
    enzymeId: "mao_a",
    from: ["three_mt"],
    to: ["mhpa"],
    fromCompartment: "extracellular",
    toCompartment: "extracellular",
    equation: "3-MT + O2 + H2O \u2192 MHPA + NH3 + H2O2",
    equationLatex:
      "\\text{3-MT} + \\mathrm{O_2} + \\mathrm{H_2O} \\rightarrow \\text{MHPA} + \\mathrm{NH_3} + \\mathrm{H_2O_2}",
    reversible: false,
    ...k("rx_mao_3mt"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_aldh_mhpa",
    enzymeId: "aldh",
    from: ["mhpa"],
    to: ["hva"],
    fromCompartment: "extracellular",
    toCompartment: "extracellular",
    equation: "MHPA + NAD+ + H2O \u2192 HVA + NADH",
    equationLatex:
      "\\text{MHPA} + \\mathrm{NAD}^+ + \\mathrm{H_2O} \\rightarrow \\text{HVA} + \\mathrm{NADH}",
    reversible: false,
    ...k("rx_aldh_mhpa"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_mao_da",
    enzymeId: "mao_b",
    from: ["dopamine"],
    to: ["dopal"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "Dopamine + O2 + H2O \u2192 DOPAL + NH3 + H2O2",
    equationLatex:
      "\\text{Dopamine} + \\mathrm{O_2} + \\mathrm{H_2O} \\rightarrow \\text{DOPAL} + \\mathrm{NH_3} + \\mathrm{H_2O_2}",
    reversible: false,
    ...k("rx_mao_da"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_aldh_dopal",
    enzymeId: "aldh",
    from: ["dopal"],
    to: ["dopac"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "DOPAL + NAD+ + H2O \u2192 DOPAC + NADH",
    equationLatex:
      "\\text{DOPAL} + \\mathrm{NAD}^+ + \\mathrm{H_2O} \\rightarrow \\text{DOPAC} + \\mathrm{NADH}",
    reversible: false,
    ...k("rx_aldh_dopal"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_comt_dopac",
    enzymeId: "comt",
    from: ["dopac"],
    to: ["hva"],
    fromCompartment: "cytosol",
    toCompartment: "extracellular",
    equation: "DOPAC + SAM \u2192 HVA + SAH",
    equationLatex:
      "\\text{DOPAC} + \\mathrm{SAM} \\rightarrow \\text{HVA} + \\mathrm{SAH}",
    reversible: false,
    ...k("rx_comt_dopac"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_dat",
    enzymeId: "dat",
    from: ["dopamine"],
    to: ["dopamine"],
    fromCompartment: "synapse",
    toCompartment: "cytosol",
    equation: "Synaptic DA + Na+ + Cl- \u2192 Cytosolic DA",
    equationLatex:
      "\\text{Synaptic DA} + \\mathrm{Na}^+ + \\mathrm{Cl}^- \\rightarrow \\text{Cytosolic DA}",
    reversible: false,
    ...k("rx_dat"),
    citations: [placeholderCite()],
  },
  ...(
    [
      ["rx_postsynaptic_d1", "d1", "postsynaptic_d1", "DRD1"] as const,
      ["rx_postsynaptic_d2", "d2", "postsynaptic_d2", "DRD2"] as const,
      ["rx_postsynaptic_d3", "d3", "postsynaptic_d3", "DRD3"] as const,
      ["rx_postsynaptic_d4", "d4", "postsynaptic_d4", "DRD4"] as const,
      ["rx_postsynaptic_d5", "d5", "postsynaptic_d5", "DRD5"] as const,
    ] as const
  ).map(
    ([rxId, enzId, prodId, gene]): Reaction => ({
      id: rxId,
      enzymeId: enzId,
      from: ["dopamine"],
      to: [prodId],
      fromCompartment: "synapse",
      toCompartment: "synapse",
      equation: `Synaptic DA + ${gene} \u2192 postsynaptic drive (education; not conserved mass balance)`,
      reversible: false,
      ...k(rxId),
      citations: [placeholderCite()],
    }),
  ),
  {
    id: "rx_hva_excretion",
    from: ["hva"],
    to: ["hva"],
    fromCompartment: "extracellular",
    toCompartment: "urine",
    equation: "Extracellular HVA \u2192 Urinary HVA",
    equationLatex:
      "\\text{Extracellular HVA} \\rightarrow \\text{Urinary HVA}",
    reversible: false,
    ...k("rx_hva_excretion"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_tyr_ldopa",
    enzymeId: "tyr",
    from: ["l_dopa"],
    to: ["dopaquinone"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "L-DOPA + O2 \u2192 Dopaquinone + H2O",
    equationLatex:
      "\\text{L-DOPA} + \\mathrm{O_2} \\rightarrow \\text{Dopaquinone} + \\mathrm{H_2O}",
    reversible: false,
    ...k("rx_tyr_ldopa"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_dopachrome",
    from: ["dopaquinone"],
    to: ["dopachrome"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "Dopaquinone \u2192 Dopachrome",
    equationLatex: "\\text{Dopaquinone} \\rightarrow \\text{Dopachrome}",
    reversible: false,
    ...k("rx_dopachrome"),
    citations: [placeholderCite()],
  },
  {
    id: "rx_melanin",
    from: ["dopachrome"],
    to: ["melanin"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "Dopachrome \u2192 \u2026 \u2192 Melanin (lumped)",
    equationLatex:
      "\\text{Dopachrome} \\rightarrow \\cdots \\rightarrow \\text{Melanin}~(\\text{lumped})",
    reversible: false,
    ...k("rx_melanin"),
    citations: [placeholderCite()],
  },
];

export function findSeedReaction(id: string): Reaction | undefined {
  return SEED_REACTIONS.find((r) => r.id === id);
}

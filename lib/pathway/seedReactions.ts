import type { Reaction } from "@/types/reaction";
import type { Citation } from "@/types/citation";

const ACCESSED = "2026-05-05";

/**
 * NOTE — kinetic constants are *educational placeholders* tuned so the
 * teaching points emerge clearly:
 *   - TH has the lowest vmax of any enzyme on the dopamine path → it is the
 *     rate-limiting step.
 *   - VMAT2 has finite throughput so cytosolic dopamine can rise when MAO is
 *     inhibited.
 *   - DAT has a moderate vmax so synaptic clearance can be visibly modulated.
 * They are NOT serum or in-vitro values. Real values would require
 * literature citations and would replace these placeholders.
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

export const SEED_REACTIONS: Reaction[] = [
  // 1. Phenylalanine -> Tyrosine
  {
    id: "rx_pah",
    enzymeId: "pah",
    from: ["phenylalanine"],
    to: ["tyrosine"],
    fromCompartment: "precursor",
    toCompartment: "precursor",
    equation: "L-Phe + BH4 + O2 \u2192 L-Tyr + BH2 + H2O",
    reversible: false,
    baseRate: 0,
    km: 50,
    vmax: 4,
    citations: [placeholderCite()],
  },

  // 2. Tyrosine -> L-DOPA  (RATE-LIMITING)
  {
    id: "rx_th",
    enzymeId: "th",
    from: ["tyrosine"],
    to: ["l_dopa"],
    fromCompartment: "precursor",
    toCompartment: "cytosol",
    equation: "L-Tyr + BH4 + O2 \u2192 L-DOPA + BH2 + H2O",
    reversible: false,
    baseRate: 0,
    km: 30,
    vmax: 1.2,
    citations: [placeholderCite()],
  },

  // 3. L-DOPA -> Dopamine
  {
    id: "rx_ddc",
    enzymeId: "ddc",
    from: ["l_dopa"],
    to: ["dopamine"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "L-DOPA \u2192 Dopamine + CO2",
    reversible: false,
    baseRate: 0,
    km: 25,
    vmax: 8,
    citations: [placeholderCite()],
  },

  // 4. VMAT2: cytosolic DA -> vesicular DA
  {
    id: "rx_vmat2_da",
    enzymeId: "vmat2",
    from: ["dopamine"],
    to: ["dopamine"],
    fromCompartment: "cytosol",
    toCompartment: "vesicle",
    equation: "Cytosolic dopamine \u2192 Vesicular dopamine (H+ antiport)",
    reversible: false,
    baseRate: 0,
    km: 15,
    vmax: 6,
    citations: [placeholderCite()],
  },

  // 5. DBH: vesicular DA -> NE  (occurs inside the vesicle in noradrenergic neurons)
  {
    id: "rx_dbh",
    enzymeId: "dbh",
    from: ["dopamine"],
    to: ["norepinephrine"],
    fromCompartment: "vesicle",
    toCompartment: "vesicle",
    equation: "Dopamine + ascorbate + O2 \u2192 NE + dehydroascorbate + H2O",
    reversible: false,
    baseRate: 0,
    km: 20,
    vmax: 3,
    citations: [placeholderCite()],
  },

  // 6. PNMT: NE -> Epi  (cytosolic in adrenal medulla; modeled here as cytosol)
  {
    id: "rx_pnmt",
    enzymeId: "pnmt",
    from: ["norepinephrine"],
    to: ["epinephrine"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "NE + SAM \u2192 Epi + SAH",
    reversible: false,
    baseRate: 0,
    km: 25,
    vmax: 2.5,
    citations: [placeholderCite()],
  },

  // 7. NE -> Normetanephrine via COMT (extracellular)
  {
    id: "rx_comt_ne",
    enzymeId: "comt",
    from: ["norepinephrine"],
    to: ["normetanephrine"],
    fromCompartment: "extracellular",
    toCompartment: "extracellular",
    equation: "NE + SAM \u2192 Normetanephrine + SAH",
    reversible: false,
    baseRate: 0,
    km: 30,
    vmax: 2,
    citations: [placeholderCite()],
  },

  // 8. Epi -> Metanephrine via COMT (extracellular)
  {
    id: "rx_comt_epi",
    enzymeId: "comt",
    from: ["epinephrine"],
    to: ["metanephrine"],
    fromCompartment: "extracellular",
    toCompartment: "extracellular",
    equation: "Epi + SAM \u2192 Metanephrine + SAH",
    reversible: false,
    baseRate: 0,
    km: 30,
    vmax: 2,
    citations: [placeholderCite()],
  },

  // 9. Synaptic DA -> 3-MT via COMT
  {
    id: "rx_comt_da_to_3mt",
    enzymeId: "comt",
    from: ["dopamine"],
    to: ["three_mt"],
    fromCompartment: "synapse",
    toCompartment: "extracellular",
    equation: "Dopamine + SAM \u2192 3-MT + SAH",
    reversible: false,
    baseRate: 0,
    km: 20,
    vmax: 2.5,
    citations: [placeholderCite()],
  },

  // 10. 3-MT -> MHPA via MAO (use MAO-A as catalyst)
  {
    id: "rx_mao_3mt",
    enzymeId: "mao_a",
    from: ["three_mt"],
    to: ["mhpa"],
    fromCompartment: "extracellular",
    toCompartment: "extracellular",
    equation: "3-MT + O2 + H2O \u2192 MHPA + NH3 + H2O2",
    reversible: false,
    baseRate: 0,
    km: 40,
    vmax: 3,
    citations: [placeholderCite()],
  },

  // 11. MHPA -> HVA via ALDH
  {
    id: "rx_aldh_mhpa",
    enzymeId: "aldh",
    from: ["mhpa"],
    to: ["hva"],
    fromCompartment: "extracellular",
    toCompartment: "extracellular",
    equation: "MHPA + NAD+ + H2O \u2192 HVA + NADH",
    reversible: false,
    baseRate: 0,
    km: 30,
    vmax: 4,
    citations: [placeholderCite()],
  },

  // 12. Cytosolic DA -> DOPAL via MAO-B
  {
    id: "rx_mao_da",
    enzymeId: "mao_b",
    from: ["dopamine"],
    to: ["dopal"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "Dopamine + O2 + H2O \u2192 DOPAL + NH3 + H2O2",
    reversible: false,
    baseRate: 0,
    km: 35,
    vmax: 3,
    citations: [placeholderCite()],
  },

  // 13. DOPAL -> DOPAC via ALDH
  {
    id: "rx_aldh_dopal",
    enzymeId: "aldh",
    from: ["dopal"],
    to: ["dopac"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "DOPAL + NAD+ + H2O \u2192 DOPAC + NADH",
    reversible: false,
    baseRate: 0,
    km: 20,
    vmax: 6,
    citations: [placeholderCite()],
  },

  // 14. DOPAC -> HVA via COMT
  {
    id: "rx_comt_dopac",
    enzymeId: "comt",
    from: ["dopac"],
    to: ["hva"],
    fromCompartment: "cytosol",
    toCompartment: "extracellular",
    equation: "DOPAC + SAM \u2192 HVA + SAH",
    reversible: false,
    baseRate: 0,
    km: 25,
    vmax: 3,
    citations: [placeholderCite()],
  },

  // 15. DAT: synaptic DA -> cytosolic DA
  {
    id: "rx_dat",
    enzymeId: "dat",
    from: ["dopamine"],
    to: ["dopamine"],
    fromCompartment: "synapse",
    toCompartment: "cytosol",
    equation: "Synaptic DA + Na+ + Cl- \u2192 Cytosolic DA",
    reversible: false,
    baseRate: 0,
    km: 5,
    vmax: 8,
    citations: [placeholderCite()],
  },

  // 16. HVA exits to urine (passive sink)
  {
    id: "rx_hva_excretion",
    from: ["hva"],
    to: ["hva"],
    fromCompartment: "extracellular",
    toCompartment: "urine",
    equation: "Extracellular HVA \u2192 Urinary HVA",
    reversible: false,
    baseRate: 0.05,
    km: 1,
    vmax: 0,
    citations: [placeholderCite()],
  },

  // 17. Tyrosinase: L-DOPA -> Dopaquinone
  {
    id: "rx_tyr_ldopa",
    enzymeId: "tyr",
    from: ["l_dopa"],
    to: ["dopaquinone"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "L-DOPA + O2 \u2192 Dopaquinone + H2O",
    reversible: false,
    baseRate: 0,
    km: 50,
    vmax: 0.4,
    citations: [placeholderCite()],
  },

  // 18. Dopaquinone -> Dopachrome (spontaneous)
  {
    id: "rx_dopachrome",
    from: ["dopaquinone"],
    to: ["dopachrome"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "Dopaquinone \u2192 Dopachrome",
    reversible: false,
    baseRate: 0.2,
    km: 1,
    vmax: 0,
    citations: [placeholderCite()],
  },

  // 19. Dopachrome -> Melanin (multi-step lumped)
  {
    id: "rx_melanin",
    from: ["dopachrome"],
    to: ["melanin"],
    fromCompartment: "cytosol",
    toCompartment: "cytosol",
    equation: "Dopachrome \u2192 \u2026 \u2192 Melanin (lumped)",
    reversible: false,
    baseRate: 0.1,
    km: 1,
    vmax: 0,
    citations: [placeholderCite()],
  },
];

export function findSeedReaction(id: string): Reaction | undefined {
  return SEED_REACTIONS.find((r) => r.id === id);
}

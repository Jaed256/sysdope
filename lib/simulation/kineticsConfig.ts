import type { Citation } from "@/types/citation";

/**
 * KINETIC CONSTANTS — single source of truth for the educational simulator.
 *
 * Every constant in this file is an *educational placeholder* tuned so the
 * teaching points emerge clearly:
 *   - TH has the lowest vmax of any enzyme on the dopamine path → it is the
 *     rate-limiting step.
 *   - VMAT2 has finite vmax and the vesicle compartment has a hard capacity
 *     so cytosolic dopamine can rise when MAO is inhibited.
 *   - A schematic dopamine auto-oxidation sink is controlled separately via
 *     `AUTOOXIDATION_*` constants with literature anchors in
 *     `AUTOOXIDATION_LITERATURE` (qualitative chemistry context only).
 *
 * These are NOT serum or in-vitro values. Replacing any of them with a
 * source-backed value requires adding the corresponding citation in the
 * `KINETIC_CITATIONS` table below and updating the `confidence` field.
 *
 * DO NOT remove or change the structure of this file without updating
 * `lib/pathway/seedReactions.ts`, `lib/simulation/engine.ts`, and the tests
 * in `tests/simulation.test.ts`.
 */

export const SIMULATION_TICK_DT = 0.5; // simulated seconds per tick
export const SIMULATION_REFRESH_MS = 100; // wall-clock ms between scheduled ticks

export const VESICLE_MAX_CAPACITY = 300;
export const DEFAULT_RELEASE_QUANTUM = 30;
export const DEFAULT_SYNAPTIC_DIFFUSION = 0.04;

/**
 * Substepping config. When the largest computed flux per tick exceeds
 * `SUBSTEP_FLUX_THRESHOLD`, the engine splits the tick into up to
 * `MAX_SUBSTEPS` smaller integration steps for numerical stability.
 */
export const SUBSTEP_FLUX_THRESHOLD = 8;
export const MAX_SUBSTEPS = 8;

/**
 * Dimensionless parameters for the *schematic* dopamine auto-oxidation sink.
 * The simulator does not use molar concentrations; these weights scale how
 * strongly effective MAO-B / COMT / MAO-A / ALDH activity (from sliders)
 * suppress the extra sink relative to the toy vmax table in `REACTION_KINETICS`.
 *
 * Literature anchors (aqueous chemistry / pH dependence — not calibrated to
 * this toy’s “relative simulation units”): see `AUTOOXIDATION_LITERATURE`.
 */
export const AUTOOXIDATION_SHIELD_REF = 14;
/** Tuned so high cytosolic + synaptic loads produce a visible toy flux at normal clearance. */
export const AUTOOXIDATION_K_REL = 0.00105;
export const AUTOOXIDATION_POOL_MIN = 10;
export const AUTOOXIDATION_MAX_FRACTION_PER_TICK = 0.11;

export const AUTOOXIDATION_LITERATURE: Citation[] = [
  {
    sourceName: "Journal of the Chemical Society, Perkin Transactions 2",
    sourceType: "paper",
    title:
      "Spontaneous autoxidation of dopamine: aqueous kinetics and O₂ involvement (context for non-enzymatic oxidation)",
    doi: "10.1039/P29950000259",
    url: "https://doi.org/10.1039/P29950000259",
    accessedAt: "2026-05-06",
    confidence: "high",
  },
  {
    sourceName: "Frontiers in Molecular Neuroscience",
    sourceType: "paper",
    title: "Dopamine autoxidation is controlled by acidic pH (mechanistic context)",
    doi: "10.3389/fnmol.2018.00467",
    url: "https://doi.org/10.3389/fnmol.2018.00467",
    accessedAt: "2026-05-06",
    confidence: "high",
  },
];

/**
 * Qualitative anchors for the *schematic* homeostasis loops (DAT/TH tone +
 * postsynaptic gain). These citations support biological concepts, not numeric
 * calibration of the toy rates.
 */
export const HOMEOSTASIS_LITERATURE: Citation[] = [
  {
    sourceName: "UniProt",
    sourceType: "database",
    title: "SLC6A3 — sodium-dependent dopamine transporter (DAT)",
    url: "https://www.uniprot.org/uniprotkb/Q01959/entry",
    accessedAt: "2026-05-06",
    confidence: "low",
  },
  {
    sourceName: "UniProt",
    sourceType: "database",
    title: "DRD2 — dopamine D2 receptor",
    url: "https://www.uniprot.org/uniprotkb/P14416/entry",
    accessedAt: "2026-05-06",
    confidence: "low",
  },
  {
    sourceName: "UniProt",
    sourceType: "database",
    title: "TH — tyrosine 3-monooxygenase (dopamine synthesis)",
    url: "https://www.uniprot.org/uniprotkb/P07101/entry",
    accessedAt: "2026-05-06",
    confidence: "low",
  },
];

const VMAX_REF_FOR_ANIM = 4.5;

/**
 * Wall-clock seconds for one full flux-dot transit along an edge when
 * `simulation speed = 1`. Lower toy vmax → slower dot (teaching: TH is slow,
 * DDC is faster). This intentionally does **not** chase instantaneous flux so
 * SVG motion stays stable when sliders change.
 */
export function reactionAnimTransitSeconds(reactionId: string): number {
  const row = REACTION_KINETICS[reactionId];
  if (!row) return 3.4;
  if (row.vmax > 0) {
    const sec = 2.15 * (VMAX_REF_FOR_ANIM / Math.max(0.45, row.vmax));
    return Math.min(11, Math.max(1.15, sec));
  }
  if (row.baseRate > 0) {
    const sec = 6.2 / Math.max(0.08, row.baseRate);
    return Math.min(12, Math.max(2.2, sec));
  }
  return 3.4;
}

export type ReactionKineticConfig = {
  /** Michaelis constant — substrate concentration at half-vmax. */
  km: number;
  /** Maximum velocity at activity = 1, in concentration-units / time-unit. */
  vmax: number;
  /** First-order base rate for passive transitions (no enzyme). */
  baseRate: number;
};

/**
 * Per-reaction kinetics indexed by reaction id (matches the ids in
 * `lib/pathway/seedReactions.ts`). Edit values here, not in the seed.
 */
export const REACTION_KINETICS: Record<string, ReactionKineticConfig> = {
  // 1. PAH: L-Phe -> L-Tyr
  rx_pah: { km: 50, vmax: 4, baseRate: 0 },
  // 2. TH: L-Tyr -> L-DOPA  (RATE-LIMITING)
  rx_th: { km: 30, vmax: 1.2, baseRate: 0 },
  // 3. DDC: L-DOPA -> Dopamine
  rx_ddc: { km: 25, vmax: 8, baseRate: 0 },
  // 4. VMAT2: cytosolic DA -> vesicular DA
  rx_vmat2_da: { km: 15, vmax: 6, baseRate: 0 },
  // 5. DBH: vesicular DA -> NE
  rx_dbh: { km: 20, vmax: 3, baseRate: 0 },
  // 6. PNMT: NE -> Epi
  rx_pnmt: { km: 25, vmax: 2.5, baseRate: 0 },
  // 7. COMT: NE -> Normetanephrine (extracellular)
  rx_comt_ne: { km: 30, vmax: 2, baseRate: 0 },
  // 8. COMT: Epi -> Metanephrine (extracellular)
  rx_comt_epi: { km: 30, vmax: 2, baseRate: 0 },
  // 9. COMT: synaptic DA -> 3-MT (extracellular)
  rx_comt_da_to_3mt: { km: 20, vmax: 2.5, baseRate: 0 },
  // 10. MAO: 3-MT -> MHPA
  rx_mao_3mt: { km: 40, vmax: 3, baseRate: 0 },
  // 11. ALDH: MHPA -> HVA
  rx_aldh_mhpa: { km: 30, vmax: 4, baseRate: 0 },
  // 12. MAO-B: cytosolic DA -> DOPAL
  rx_mao_da: { km: 35, vmax: 3, baseRate: 0 },
  // 13. ALDH: DOPAL -> DOPAC
  rx_aldh_dopal: { km: 20, vmax: 6, baseRate: 0 },
  // 14. COMT: DOPAC -> HVA (cytosol -> extracellular)
  rx_comt_dopac: { km: 25, vmax: 3, baseRate: 0 },
  // 15. DAT: synaptic DA -> cytosolic DA (tuned so cleft clearance is obvious)
  rx_dat: { km: 3.5, vmax: 14, baseRate: 0 },
  /* 15b — Postsynaptic D1-D5 dopamine-binding representation (education only). */
  rx_postsynaptic_d1: { km: 18, vmax: 2.6, baseRate: 0 },
  rx_postsynaptic_d2: { km: 16, vmax: 2.4, baseRate: 0 },
  rx_postsynaptic_d3: { km: 20, vmax: 2.0, baseRate: 0 },
  rx_postsynaptic_d4: { km: 22, vmax: 1.6, baseRate: 0 },
  rx_postsynaptic_d5: { km: 18, vmax: 1.9, baseRate: 0 },
  // 16. HVA -> urine (passive sink)
  rx_hva_excretion: { km: 1, vmax: 0, baseRate: 0.05 },
  // 17. TYR: L-DOPA -> dopaquinone
  rx_tyr_ldopa: { km: 50, vmax: 0.4, baseRate: 0 },
  // 18. dopaquinone -> dopachrome (spontaneous)
  rx_dopachrome: { km: 1, vmax: 0, baseRate: 0.2 },
  // 19. dopachrome -> melanin (lumped, spontaneous)
  rx_melanin: { km: 1, vmax: 0, baseRate: 0.1 },
};

export type CofactorId = "BH4" | "SAM" | "NAD+";

/**
 * Cofactor pools live in their own compartment-agnostic store and act as
 * multiplicative throttles on enzymes that depend on them.
 *
 *   modulator(cofactor) = pool / (Km_cofactor + pool)
 *
 * A reaction that requires BH4 multiplies its flux by `modulator(BH4)` etc.
 * Cofactors deplete proportional to flux through their dependent reactions
 * and regenerate at a constant first-order rate toward `replenishTarget`.
 */
export type CofactorConfig = {
  /** Starting (and replenish target) pool size in relative units. */
  replenishTarget: number;
  /** Per-second regeneration rate (toward replenishTarget). */
  regenRate: number;
  /** Pool concentration at half maximal modulation. */
  km: number;
  /** Per-reaction-flux consumption coefficient. */
  consumption: number;
  /**
   * Reaction ids that consume / depend on this cofactor.
   * Keep this aligned with `seedReactions.ts` and `seedEnzymes.ts`.
   */
  reactions: string[];
};

export const COFACTORS: Record<CofactorId, CofactorConfig> = {
  BH4: {
    replenishTarget: 100,
    regenRate: 1.5,
    km: 20,
    consumption: 0.6,
    reactions: ["rx_pah", "rx_th"],
  },
  SAM: {
    replenishTarget: 100,
    regenRate: 1.8,
    km: 18,
    consumption: 0.4,
    reactions: ["rx_pnmt", "rx_comt_ne", "rx_comt_epi", "rx_comt_da_to_3mt", "rx_comt_dopac"],
  },
  "NAD+": {
    replenishTarget: 120,
    regenRate: 2.4,
    km: 15,
    consumption: 0.3,
    reactions: ["rx_aldh_mhpa", "rx_aldh_dopal"],
  },
};

/**
 * Citations table for the kinetic constants. Currently empty: each entry
 * would map a reaction id to a `Citation` for its km/vmax pair. Until then
 * the UI shows the SysDope seed citation marked `confidence: low`.
 */
export const KINETIC_CITATIONS: Record<string, Citation[]> = {};

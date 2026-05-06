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
 *   - DAT has a low km and moderate vmax so synaptic dopamine clearance is
 *     visibly modulated.
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
  // 15. DAT: synaptic DA -> cytosolic DA
  rx_dat: { km: 5, vmax: 8, baseRate: 0 },
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

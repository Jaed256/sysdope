import type { CompartmentMap, SimulationState } from "@/types/simulation";
import { ACTIVITY_MULTIPLIER } from "@/types/simulation";
import type { Compartment } from "@/types/reaction";
import {
  AUTOOXIDATION_K_REL,
  AUTOOXIDATION_MAX_FRACTION_PER_TICK,
  AUTOOXIDATION_POOL_MIN,
  AUTOOXIDATION_SHIELD_REF,
  REACTION_KINETICS,
} from "./kineticsConfig";

function writeConc(
  acc: Record<string, CompartmentMap>,
  compoundId: string,
  compartment: Compartment,
  delta: number,
): void {
  const existing = acc[compoundId] ?? {};
  const prev = existing[compartment] ?? 0;
  const next = Math.max(0, prev + delta);
  acc[compoundId] = { ...existing, [compartment]: next };
}

export function enzymeEffectiveMultiplier(
  state: SimulationState,
  enzymeId: string,
): number {
  const lvl = state.enzymeActivity[enzymeId] ?? "normal";
  const inh = Math.min(1, Math.max(0, state.inhibitorStrength[enzymeId] ?? 0));
  return ACTIVITY_MULTIPLIER[lvl] * (1 - inh);
}

/**
 * Non-dimensional “shield” summarising how much *modelled* enzymatic capacity
 * competes with the schematic auto-oxidation sink. Uses the same vmax weights
 * as the integrator (not calibrated SI rates).
 *
 * MAO-B clears cytosolic dopamine in this graph; COMT clears synaptic dopamine;
 * ALDH drains DOPAL (downstream of MAO-B); MAO-A is weighted lightly here
 * because it does not consume dopamine directly in `seedReactions.ts`, but it
 * still reflects overall mitochondrial amine oxidase capacity in the toy.
 */
export function dopamineEnzymaticOxidationShield(state: SimulationState): number {
  const k = REACTION_KINETICS;
  const mB = enzymeEffectiveMultiplier(state, "mao_b");
  const mA = enzymeEffectiveMultiplier(state, "mao_a");
  const comt = enzymeEffectiveMultiplier(state, "comt");
  const aldh = enzymeEffectiveMultiplier(state, "aldh");
  return (
    mB * k.rx_mao_da.vmax +
    comt * k.rx_comt_da_to_3mt.vmax +
    aldh * k.rx_aldh_dopal.vmax * 0.22 +
    mA * k.rx_mao_3mt.vmax * 0.06
  );
}

/**
 * How much dopamine (cytosol + synapse) the schematic autoxidation sink would
 * remove in one integration step, **without mutating** concentrations. Use for
 * UI when the clock is paused so the flux readout still matches sliders.
 */
export function estimateDopamineAutoOxidationFlux(
  state: SimulationState,
  dt: number,
): number {
  const cyt = state.concentrations.dopamine?.cytosol ?? 0;
  const syn = state.concentrations.dopamine?.synapse ?? 0;
  return computeDopamineAutoOxidationRemoval(state, cyt, syn, dt);
}

function computeDopamineAutoOxidationRemoval(
  state: SimulationState,
  cyt: number,
  syn: number,
  dt: number,
): number {
  const pool = cyt + syn;
  if (pool < AUTOOXIDATION_POOL_MIN) return 0;

  const shield = dopamineEnzymaticOxidationShield(state);
  const burden = (pool * pool) / (80 + pool);
  const inhibitionFactor =
    AUTOOXIDATION_SHIELD_REF / (AUTOOXIDATION_SHIELD_REF + shield);
  const raw = AUTOOXIDATION_K_REL * burden * inhibitionFactor * dt;
  const cap = pool * (1 - Math.exp(-0.28 * dt));
  const removed = Math.min(
    pool * AUTOOXIDATION_MAX_FRACTION_PER_TICK,
    raw,
    cap,
  );
  return removed <= 1e-6 ? 0 : removed;
}

/** @deprecated Prefer {@link dopamineEnzymaticOxidationShield}; kept for tests. */
export function isCatecholamineBreakdownFullyBlocked(state: SimulationState): boolean {
  return (
    enzymeEffectiveMultiplier(state, "mao_a") < 1e-4 &&
    enzymeEffectiveMultiplier(state, "mao_b") < 1e-4 &&
    enzymeEffectiveMultiplier(state, "comt") < 1e-4 &&
    enzymeEffectiveMultiplier(state, "aldh") < 1e-4
  );
}

/**
 * Schematic non-enzymatic dopamine loss toward dopaquinone-like species.
 *
 * The *shape* is informed by published aqueous autoxidation work (O₂- and
 * pH-dependent chemistry; see `AUTOOXIDATION_LITERATURE` in `kineticsConfig.ts`)
 * but the coefficients are dimensionless fits to this toy’s relative pools,
 * not a literal translation of mol L⁻¹ s⁻¹ constants into the simulator.
 */
export function applyDopamineAutoOxidation(
  state: SimulationState,
  acc: Record<string, CompartmentMap>,
  dt: number,
): { oxFlux: number } {
  const cyt = acc.dopamine?.cytosol ?? 0;
  const syn = acc.dopamine?.synapse ?? 0;
  const removed = computeDopamineAutoOxidationRemoval(state, cyt, syn, dt);
  if (removed <= 1e-6) return { oxFlux: 0 };

  const pool = cyt + syn;
  const fSyn = syn / (pool + 1e-12);
  writeConc(acc, "dopamine", "synapse", -removed * fSyn);
  writeConc(acc, "dopamine", "cytosol", -removed * (1 - fSyn));
  writeConc(acc, "dopaquinone", "cytosol", removed * 0.88);
  return { oxFlux: removed };
}

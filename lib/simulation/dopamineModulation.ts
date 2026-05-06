import type { CompartmentMap, SimulationState } from "@/types/simulation";
import { ACTIVITY_MULTIPLIER } from "@/types/simulation";
import type { Compartment } from "@/types/reaction";

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

export function isCatecholamineBreakdownFullyBlocked(state: SimulationState): boolean {
  return (
    enzymeEffectiveMultiplier(state, "mao_a") < 1e-4 &&
    enzymeEffectiveMultiplier(state, "mao_b") < 1e-4 &&
    enzymeEffectiveMultiplier(state, "comt") < 1e-4 &&
    enzymeEffectiveMultiplier(state, "aldh") < 1e-4
  );
}

/**
 * Educational lump: when all major enzymatic clearance arms are off, dopamine
 * in cytosol + synapse is slowly converted toward dopaquinone-like species to
 * mimic non-enzymatic auto-oxidation / ROS chemistry at high catechol load.
 */
export function applyDopamineAutoOxidation(
  state: SimulationState,
  acc: Record<string, CompartmentMap>,
  dt: number,
): { oxFlux: number } {
  if (!isCatecholamineBreakdownFullyBlocked(state)) return { oxFlux: 0 };

  const cyt = acc.dopamine?.cytosol ?? 0;
  const syn = acc.dopamine?.synapse ?? 0;
  const pool = cyt + syn;
  if (pool < 12) return { oxFlux: 0 };

  const k = 0.032;
  const maxRemove = pool * (1 - Math.exp(-k * dt));
  const removed = Math.min(pool * 0.22, maxRemove);
  if (removed <= 1e-6) return { oxFlux: 0 };

  const fSyn = syn / (pool + 1e-12);
  writeConc(acc, "dopamine", "synapse", -removed * fSyn);
  writeConc(acc, "dopamine", "cytosol", -removed * (1 - fSyn));
  writeConc(acc, "dopaquinone", "cytosol", removed * 0.88);
  return { oxFlux: removed };
}

import { ACTIVITY_MULTIPLIER } from "@/types/simulation";
import type { SimulationState } from "@/types/simulation";

const CATABOLIC_ENZYMES = ["mao_a", "mao_b", "comt", "aldh"] as const;

/**
 * True when MAO-A, MAO-B, COMT, and ALDH are all effectively shut off
 * (activity × (1 − inhibitor) ≈ 0). Used for the educational dopamine
 * auto-oxidation pathway.
 */
export function isCatabolicArmFullyOff(state: SimulationState): boolean {
  return CATABOLIC_ENZYMES.every((id) => {
    const lvl = state.enzymeActivity[id] ?? "normal";
    const inh = Math.min(1, Math.max(0, state.inhibitorStrength[id] ?? 0));
    const m = ACTIVITY_MULTIPLIER[lvl] * (1 - inh);
    return m < 1e-6;
  });
}

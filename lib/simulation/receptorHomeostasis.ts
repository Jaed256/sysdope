import type { SimulationState } from "@/types/simulation";

const RECEPTOR_IDS = ["d1", "d2", "d3", "d4", "d5"] as const;

export function defaultReceptorHomeostaticFactors(): Record<string, number> {
  return Object.fromEntries(RECEPTOR_IDS.map((id) => [id, 1]));
}

/**
 * Simple homeostatic retuning of postsynaptic receptor "gain" from combined
 * cytosolic + synaptic dopamine exposure. Educational only — not a calibrated
 * in-vivo model.
 */
export function stepReceptorHomeostasis(
  state: Pick<SimulationState, "concentrations" | "receptorHomeostaticFactor">,
  dt: number,
): Record<string, number> {
  const syn = state.concentrations.dopamine?.synapse ?? 0;
  const cyt = state.concentrations.dopamine?.cytosol ?? 0;
  const exposure = syn * 0.62 + cyt * 0.38;
  const setpoint = 48;
  const err = exposure - setpoint;
  const k = 0.035 * Math.min(2, dt);

  const out: Record<string, number> = { ...(state.receptorHomeostaticFactor ?? {}) };
  for (const id of RECEPTOR_IDS) {
    if (out[id] === undefined) out[id] = 1;
  }

  for (const id of ["d2", "d3"] as const) {
    const cur = out[id] ?? 1;
    out[id] = clamp(cur - k * err * 0.014, 0.32, 1.78);
  }
  for (const id of ["d1", "d5"] as const) {
    const cur = out[id] ?? 1;
    out[id] = clamp(cur + k * err * 0.009, 0.38, 1.85);
  }
  out.d4 = clamp((out.d4 ?? 1) - k * err * 0.007, 0.35, 1.7);

  return out;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

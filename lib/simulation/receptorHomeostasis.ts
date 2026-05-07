import type { SimulationState } from "@/types/simulation";

const RECEPTOR_IDS = ["d1", "d2", "d3", "d4", "d5"] as const;

export function defaultReceptorHomeostaticFactors(): Record<string, number> {
  return Object.fromEntries(RECEPTOR_IDS.map((id) => [id, 1]));
}

/** Instant dopamine tone signal feeding the slow EMA (relative simulation units). */
export function dopamineInstantTone(conc: SimulationState["concentrations"]): number {
  const syn = conc.dopamine?.synapse ?? 0;
  const cyt = conc.dopamine?.cytosol ?? 0;
  return syn + cyt * 0.42;
}

export type HomeostasisSlice = Pick<
  SimulationState,
  | "concentrations"
  | "receptorHomeostaticFactor"
  | "synapticToneEma"
  | "datHomeostaticFactor"
  | "thTonicFactor"
>;

export type HomeostasisStepResult = {
  receptorHomeostaticFactor: Record<string, number>;
  synapticToneEma: number;
  datHomeostaticFactor: number;
  thTonicFactor: number;
};

/**
 * Slow compensatory regulation from low-passed dopamine tone:
 * - postsynaptic D2/D3 “gain” drifts down after sustained high tone
 * - D1/D5 drift up (caricature supersensitivity)
 * - DAT capacity rises (faster reuptake) after sustained high synaptic load
 * - TH is throttled (tonic autoinhibition caricature)
 *
 * Educational schematic only — not a calibrated in-vivo integrator.
 */
export function stepHomeostaticRegulation(
  state: HomeostasisSlice,
  dt: number,
): HomeostasisStepResult {
  const dtClamped = Math.min(2.5, Math.max(0, dt));
  const instant = dopamineInstantTone(state.concentrations);
  const prevEma = state.synapticToneEma ?? instant;
  const tauEma = 9; // simulated seconds
  const alphaEma = 1 - Math.exp(-dtClamped / tauEma);
  const synapticToneEma = prevEma + alphaEma * (instant - prevEma);

  /** Resting tone the toy model tries to track (relative simulation units). */
  const setpoint = 12;
  const err = synapticToneEma - setpoint;
  const k = 0.034 * Math.min(2.4, dtClamped);

  const out: Record<string, number> = { ...(state.receptorHomeostaticFactor ?? {}) };
  for (const id of RECEPTOR_IDS) {
    if (out[id] === undefined) out[id] = 1;
  }

  for (const id of ["d2", "d3"] as const) {
    const cur = out[id] ?? 1;
    out[id] = clamp(cur - k * err * 0.015, 0.28, 1.86);
  }
  for (const id of ["d1", "d5"] as const) {
    const cur = out[id] ?? 1;
    out[id] = clamp(cur + k * err * 0.011, 0.32, 1.9);
  }
  out.d4 = clamp((out.d4 ?? 1) - k * err * 0.008, 0.3, 1.75);

  const prevDat = state.datHomeostaticFactor ?? 1;
  const datTarget = clamp(1 + Math.max(0, err) * 0.0115, 0.72, 1.58);
  const datHomeostaticFactor = prevDat + (datTarget - prevDat) * Math.min(1, dtClamped * 0.26);

  const prevTh = state.thTonicFactor ?? 1;
  const thTarget = clamp(1 / (1 + Math.max(0, err) * 0.0048), 0.46, 1);
  const thTonicFactor = prevTh + (thTarget - prevTh) * Math.min(1, dtClamped * 0.2);

  return {
    receptorHomeostaticFactor: out,
    synapticToneEma,
    datHomeostaticFactor,
    thTonicFactor,
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

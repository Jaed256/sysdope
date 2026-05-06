import type { SimulationAlert, SimulationState } from "@/types/simulation";
import { ACTIVITY_MULTIPLIER } from "@/types/simulation";
import { VESICLE_MAX_CAPACITY as CAPACITY } from "./kineticsConfig";

export const ALERT_THRESHOLDS = {
  thBottleneckTyrosine: 200,
  thBottleneckRatio: 0.05, // L-DOPA/Tyr below this with high Tyr -> bottleneck
  /** When TH is hard-inhibited, L-DOPA should stay small relative to Tyr. */
  thBlockedLdopaRatio: 0.15,
  vesicleSaturation: 250,
  cytosolicDopamineOverflow: 100,
  dopalToxicity: 80,
  synapticOverflow: 120,
  hvaUrineHigh: 200,
  cofactorDepleted: 30,
};

const VESICLE_CAPACITY = CAPACITY;

function get(state: SimulationState, compound: string, compartment: string): number {
  const compartments = state.concentrations[compound];
  if (!compartments) return 0;
  return compartments[compartment as keyof typeof compartments] ?? 0;
}

/**
 * Recompute the active-alerts list from a fresh `SimulationState`. Pure
 * function — does not mutate. Each alert id is stable across ticks so the UI
 * can dedupe toasts.
 */
export function evaluateAlerts(state: SimulationState): SimulationAlert[] {
  const out: SimulationAlert[] = [];
  const tick = state.time;

  const tyr = get(state, "tyrosine", "precursor");
  const lDopa = get(state, "l_dopa", "cytosol");
  const thLvl = state.enzymeActivity["th"] ?? "normal";
  const thMult = ACTIVITY_MULTIPLIER[thLvl] ?? 1;
  const thInh = Math.min(1, Math.max(0, state.inhibitorStrength["th"] ?? 0));
  const thEffective = thMult * (1 - thInh);
  if (
    tyr > 35 &&
    thEffective < 1e-6 &&
    lDopa < tyr * ALERT_THRESHOLDS.thBlockedLdopaRatio
  ) {
    out.push({
      id: "th_fully_blocked",
      severity: "info",
      title: "TH is fully blocked — upstream pools rise",
      message:
        "Tyrosine cannot become L-DOPA while tyrosine hydroxylase is completely inhibited. Watch precursor L-Tyr climb in Live levels while L-DOPA and downstream dopamine flatline; this illustrates the bottleneck, not a frozen simulation.",
      raisedAtTick: tick,
    });
  }
  if (
    thEffective > 1e-6 &&
    tyr > ALERT_THRESHOLDS.thBottleneckTyrosine &&
    lDopa / Math.max(1, tyr) < ALERT_THRESHOLDS.thBottleneckRatio
  ) {
    out.push({
      id: "th_bottleneck",
      severity: "warning",
      title: "TH bottleneck",
      message:
        "Substrate is accumulating upstream of tyrosine hydroxylase. TH is the rate-limiting step and downstream dopamine synthesis cannot keep up.",
      raisedAtTick: tick,
    });
  }

  const vesDA = get(state, "dopamine", "vesicle");
  if (vesDA > VESICLE_CAPACITY * 0.85) {
    out.push({
      id: "vesicle_saturation",
      severity: "warning",
      title: "Vesicle saturation",
      message: "VMAT2 capacity exceeded. Vesicular dopamine is near maximum and additional cytosolic dopamine cannot be sequestered.",
      raisedAtTick: tick,
    });
  }

  const cytDA = get(state, "dopamine", "cytosol");
  if (cytDA > ALERT_THRESHOLDS.cytosolicDopamineOverflow) {
    out.push({
      id: "cytosol_da_overflow",
      severity: "danger",
      title: "Cytosolic dopamine overflow",
      message:
        "Cytosolic dopamine is high. Without VMAT2 sequestration, cytosolic dopamine is exposed to MAO and contributes to DOPAL formation.",
      raisedAtTick: tick,
    });
  }

  const dopal = get(state, "dopal", "cytosol");
  if (dopal > ALERT_THRESHOLDS.dopalToxicity) {
    out.push({
      id: "dopal_toxicity",
      severity: "danger",
      title: "DOPAL toxicity risk",
      message:
        "DOPAL is accumulating. ALDH clearance is too low; the literature associates persistent DOPAL exposure with dopaminergic neuronal stress.",
      raisedAtTick: tick,
    });
  }

  const synDA = get(state, "dopamine", "synapse");
  if (synDA > ALERT_THRESHOLDS.synapticOverflow) {
    out.push({
      id: "synaptic_overflow",
      severity: "warning",
      title: "Synaptic dopamine overflow",
      message:
        "Synaptic dopamine is elevated. Reuptake by DAT and metabolism by COMT/MAO cannot keep up with release.",
      raisedAtTick: tick,
    });
  }

  const hvaUrine = get(state, "hva", "urine");
  if (hvaUrine > ALERT_THRESHOLDS.hvaUrineHigh) {
    out.push({
      id: "hva_urine_high",
      severity: "info",
      title: "HVA urinary output increased",
      message:
        "Sustained MAO + COMT + ALDH degradation is shunting dopamine through HVA into the urine compartment.",
      raisedAtTick: tick,
    });
  }

  for (const [name, level] of Object.entries(state.cofactors ?? {})) {
    if (level < ALERT_THRESHOLDS.cofactorDepleted) {
      out.push({
        id: `cofactor_${name}_low`,
        severity: "warning",
        title: `${name} cofactor low`,
        message: `${name} pool is depleted. Reactions that depend on ${name} are throttled until the pool regenerates.`,
        raisedAtTick: tick,
      });
    }
  }

  return out;
}

export const VESICLE_MAX_CAPACITY = VESICLE_CAPACITY;

import type {
  CompartmentMap,
  EnzymeActivityLevel,
  SimulationAlert,
  SimulationState,
} from "@/types/simulation";
import { ACTIVITY_MULTIPLIER } from "@/types/simulation";
import type { Compartment, Reaction } from "@/types/reaction";
import type { Enzyme } from "@/types/enzyme";
import { firstOrderRate, mmRate } from "./kinetics";
import { evaluateAlerts } from "./alerts";
import {
  applyDopamineAutoOxidation,
  enzymeEffectiveMultiplier,
} from "./dopamineModulation";
import {
  defaultReceptorHomeostaticFactors,
  stepReceptorHomeostasis,
} from "./receptorHomeostasis";
import {
  COFACTORS,
  DEFAULT_RELEASE_QUANTUM,
  DEFAULT_SYNAPTIC_DIFFUSION,
  MAX_SUBSTEPS,
  SUBSTEP_FLUX_THRESHOLD,
  VESICLE_MAX_CAPACITY,
  type CofactorId,
} from "./kineticsConfig";

const HISTORY_BUFFER_LEN = 120;

function appendCompoundHistory(
  history: SimulationState["history"],
  conc: Record<string, CompartmentMap>,
): SimulationState["history"] {
  const next = { ...history };
  const trackedCompounds = new Set<string>([
    ...Object.keys(next),
    ...Object.keys(conc),
  ]);
  for (const cid of trackedCompounds) {
    const totalAcrossCompartments = Object.values(conc[cid] ?? {}).reduce(
      (sum, v) => sum + (v ?? 0),
      0,
    );
    const buf = (next[cid] ?? []).concat(totalAcrossCompartments);
    if (buf.length > HISTORY_BUFFER_LEN) {
      buf.splice(0, buf.length - HISTORY_BUFFER_LEN);
    }
    next[cid] = buf;
  }
  return next;
}

/**
 * Apply vesicle → cleft (DA) and vesicle → extracellular (NE) transfer
 * immediately. Used by the UI release control so it works while the clock is
 * paused; does not advance simulated time or recompute `lastFlux` (avoids
 * blanking edge animations between ticks).
 */
export function applyVesicleReleaseDirect(
  state: SimulationState,
  releases: number,
  inputs?: { releaseQuantum?: number },
): SimulationState {
  const n = Math.max(0, Math.floor(releases));
  if (n <= 0) return state;

  const releaseQuantum = inputs?.releaseQuantum ?? DEFAULT_RELEASE_QUANTUM;
  const acc: Record<string, CompartmentMap> = {};
  for (const [id, map] of Object.entries(state.concentrations)) {
    acc[id] = { ...map };
  }

  const vesDA = acc.dopamine?.vesicle ?? 0;
  const releasedDA = Math.min(vesDA, n * releaseQuantum);
  if (releasedDA > 0) {
    writeConc(acc, "dopamine", "vesicle", -releasedDA);
    writeConc(acc, "dopamine", "synapse", releasedDA);
  }
  const vesNE = acc.norepinephrine?.vesicle ?? 0;
  const releasedNE = Math.min(vesNE, n * releaseQuantum * 0.4);
  if (releasedNE > 0) {
    writeConc(acc, "norepinephrine", "vesicle", -releasedNE);
    writeConc(acc, "norepinephrine", "extracellular", releasedNE);
  }

  const history = appendCompoundHistory(state.history, acc);

  return {
    ...state,
    concentrations: acc,
    history,
    pendingReleases: 0,
    eventLog: [
      ...state.eventLog,
      `t=${state.time} manual vesicle release ×${n}`,
    ].slice(-200),
  };
}

export type TickInputs = {
  reactions: Reaction[];
  enzymes: Enzyme[];
  /** seconds of simulated time per tick (NOT wall-clock) */
  dt: number;
  /** how much dopamine moves vesicle -> synapse per release event */
  releaseQuantum?: number;
  /** baseline diffusion of synaptic dopamine to extracellular per tick */
  synapticDiffusion?: number;
};

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

/**
 * Cofactor modulator: pool / (km + pool). Returns 1 when the reaction has no
 * dependent cofactor.
 */
function cofactorModulator(
  reactionId: string,
  cofactors: Record<string, number>,
): { factor: number; consumers: { id: CofactorId; consumption: number }[] } {
  let factor = 1;
  const consumers: { id: CofactorId; consumption: number }[] = [];
  for (const [id, cfg] of Object.entries(COFACTORS) as [
    CofactorId,
    (typeof COFACTORS)[CofactorId],
  ][]) {
    if (!cfg.reactions.includes(reactionId)) continue;
    const pool = Math.max(0, cofactors[id] ?? cfg.replenishTarget);
    const m = pool / Math.max(1e-6, cfg.km + pool);
    factor *= m;
    consumers.push({ id, consumption: cfg.consumption });
  }
  return { factor, consumers };
}

type StepResult = {
  concentrations: Record<string, CompartmentMap>;
  cofactors: Record<string, number>;
  flux: Record<string, number>;
  maxFluxThisStep: number;
};

/**
 * Apply one (sub)tick of integration. Pure: returns a new accumulator,
 * does not mutate `state`.
 */
function integrate(
  state: SimulationState,
  inputs: TickInputs,
  dt: number,
  carryConcentrations: Record<string, CompartmentMap>,
  carryCofactors: Record<string, number>,
): StepResult {
  const next: Record<string, CompartmentMap> = {};
  for (const [id, map] of Object.entries(carryConcentrations)) {
    next[id] = { ...map };
  }
  const cofactors = { ...carryCofactors };
  const flux: Record<string, number> = {};
  let maxFluxThisStep = 0;

  for (const r of inputs.reactions) {
    let effectiveActivity = 1;
    if (r.enzymeId) {
      effectiveActivity = enzymeEffectiveMultiplier(state, r.enzymeId);
      if (/^d[1-5]$/.test(r.enzymeId)) {
        effectiveActivity *= state.receptorHomeostaticFactor?.[r.enzymeId] ?? 1;
      }
    }

    const cofactorInfo = cofactorModulator(r.id, cofactors);

    let substrate = 0;
    for (const s of r.from) {
      const map = next[s];
      if (!map) continue;
      substrate += map[r.fromCompartment] ?? 0;
    }

    let rate = 0;
    if (r.enzymeId && r.vmax > 0) {
      rate = mmRate(r.vmax, effectiveActivity * cofactorInfo.factor, 0, substrate, r.km);
    } else if (r.baseRate > 0) {
      rate = firstOrderRate(r.baseRate, substrate);
    }

    let amount = rate * dt;
    if (amount <= 0) {
      flux[r.id] = (flux[r.id] ?? 0) + 0;
      continue;
    }

    const availableInAcc = r.from.reduce(
      (sum, s) => sum + (next[s]?.[r.fromCompartment] ?? 0),
      0,
    );
    if (amount > availableInAcc) amount = availableInAcc;

    if (r.enzymeId === "vmat2" && r.toCompartment === "vesicle") {
      const currentVesDA =
        (next.dopamine?.vesicle ?? 0) + (next.norepinephrine?.vesicle ?? 0);
      const headroom = Math.max(0, VESICLE_MAX_CAPACITY - currentVesDA);
      if (amount > headroom) amount = headroom;
    }

    if (amount <= 0) {
      flux[r.id] = (flux[r.id] ?? 0) + 0;
      continue;
    }

    if (r.from.length === 1) {
      writeConc(next, r.from[0]!, r.fromCompartment, -amount);
    } else {
      const each = amount / r.from.length;
      for (const s of r.from) writeConc(next, s, r.fromCompartment, -each);
    }

    if (r.to.length === 1) {
      writeConc(next, r.to[0]!, r.toCompartment, amount);
    } else {
      const each = amount / r.to.length;
      for (const p of r.to) writeConc(next, p, r.toCompartment, each);
    }

    flux[r.id] = (flux[r.id] ?? 0) + amount;
    if (amount > maxFluxThisStep) maxFluxThisStep = amount;

    for (const cons of cofactorInfo.consumers) {
      const usage = amount * cons.consumption;
      cofactors[cons.id] = Math.max(
        0,
        (cofactors[cons.id] ?? COFACTORS[cons.id].replenishTarget) - usage,
      );
    }
  }

  // Cofactor regeneration toward replenishTarget (first-order, per dt)
  for (const [id, cfg] of Object.entries(COFACTORS) as [
    CofactorId,
    (typeof COFACTORS)[CofactorId],
  ][]) {
    const cur = cofactors[id] ?? cfg.replenishTarget;
    const delta = cfg.regenRate * dt * (cfg.replenishTarget - cur) / cfg.replenishTarget;
    cofactors[id] = Math.min(cfg.replenishTarget, Math.max(0, cur + delta));
  }

  // synaptic diffusion sink
  const synapticDiffusion = inputs.synapticDiffusion ?? DEFAULT_SYNAPTIC_DIFFUSION;
  const synDA = next.dopamine?.synapse ?? 0;
  if (synDA > 0) {
    const drift = synDA * synapticDiffusion * dt;
    if (drift > 0) {
      writeConc(next, "dopamine", "synapse", -drift);
      writeConc(next, "dopamine", "extracellular", drift);
    }
  }

  return { concentrations: next, cofactors, flux, maxFluxThisStep };
}

/**
 * Pure tick: advances `state` by `dt` simulated seconds. Internally splits
 * `dt` into up to MAX_SUBSTEPS smaller sub-ticks if any reaction would push
 * more than SUBSTEP_FLUX_THRESHOLD units in a single step. This keeps
 * concentrations stable when vmax×activity×dt is large.
 */
export function tick(state: SimulationState, inputs: TickInputs): SimulationState {
  const dt = inputs.dt;
  const releaseQuantum = inputs.releaseQuantum ?? DEFAULT_RELEASE_QUANTUM;

  // Apply pending releases up-front (only once per tick, regardless of substepping)
  let acc: Record<string, CompartmentMap> = {};
  for (const [id, map] of Object.entries(state.concentrations)) {
    acc[id] = { ...map };
  }
  let cofactorsAcc = { ...state.cofactors };

  if (state.pendingReleases > 0) {
    const releases = state.pendingReleases;
    const vesDA = acc.dopamine?.vesicle ?? 0;
    const releasedDA = Math.min(vesDA, releases * releaseQuantum);
    if (releasedDA > 0) {
      writeConc(acc, "dopamine", "vesicle", -releasedDA);
      writeConc(acc, "dopamine", "synapse", releasedDA);
    }
    const vesNE = acc.norepinephrine?.vesicle ?? 0;
    const releasedNE = Math.min(vesNE, releases * releaseQuantum * 0.4);
    if (releasedNE > 0) {
      writeConc(acc, "norepinephrine", "vesicle", -releasedNE);
      writeConc(acc, "norepinephrine", "extracellular", releasedNE);
    }
  }

  // First trial step at full dt to discover flux magnitude
  const trial = integrate(state, inputs, dt, acc, cofactorsAcc);

  let totalFlux: Record<string, number>;
  if (trial.maxFluxThisStep > SUBSTEP_FLUX_THRESHOLD) {
    const steps = Math.min(
      MAX_SUBSTEPS,
      Math.ceil(trial.maxFluxThisStep / SUBSTEP_FLUX_THRESHOLD),
    );
    const subDt = dt / steps;
    totalFlux = {};
    for (let i = 0; i < steps; i++) {
      const r = integrate(state, inputs, subDt, acc, cofactorsAcc);
      acc = r.concentrations;
      cofactorsAcc = r.cofactors;
      for (const [k, v] of Object.entries(r.flux)) {
        totalFlux[k] = (totalFlux[k] ?? 0) + v;
      }
    }
  } else {
    acc = trial.concentrations;
    cofactorsAcc = trial.cofactors;
    totalFlux = trial.flux;
  }

  const { oxFlux } = applyDopamineAutoOxidation(state, acc, dt);
  const receptorHomeostaticFactor = stepReceptorHomeostasis(
    {
      concentrations: acc,
      receptorHomeostaticFactor:
        state.receptorHomeostaticFactor ?? defaultReceptorHomeostaticFactors(),
    },
    dt,
  );

  const intermediate: SimulationState = {
    ...state,
    time: state.time + 1,
    wallMs: state.wallMs + dt * 1000,
    pendingReleases: 0,
    concentrations: acc,
    cofactors: cofactorsAcc,
    lastFlux: totalFlux,
    lastAutoOxidationFlux: oxFlux,
    receptorHomeostaticFactor,
    alertDismissedUntil: state.alertDismissedUntil ?? {},
  };

  const rawAlerts = evaluateAlerts(intermediate);
  const dismissed = intermediate.alertDismissedUntil;
  const freshAlerts = rawAlerts.filter(
    (a) => intermediate.time >= (dismissed[a.id] ?? 0),
  );
  const previousIds = new Set(state.alerts.map((a) => a.id));
  const newlyRaised = freshAlerts.filter((a) => !previousIds.has(a.id));

  const eventLog = [...state.eventLog];
  for (const a of newlyRaised) {
    eventLog.push(`t=${intermediate.time} [${a.severity}] ${a.title}: ${a.message}`);
  }
  if (eventLog.length > 200) eventLog.splice(0, eventLog.length - 200);

  const history = appendCompoundHistory(
    state.history,
    intermediate.concentrations,
  );

  return {
    ...intermediate,
    alerts: freshAlerts,
    eventLog,
    history,
  };
}

export type CreateInitialStateInput = {
  enzymes: Enzyme[];
  initialConcentrations?: Record<string, CompartmentMap>;
};

export function createInitialState(input: CreateInitialStateInput): SimulationState {
  const enzymeActivity: Record<string, EnzymeActivityLevel> = {};
  const inhibitorStrength: Record<string, number> = {};
  for (const e of input.enzymes) {
    enzymeActivity[e.id] = "normal";
    inhibitorStrength[e.id] = 0;
  }

  const concentrations: Record<string, CompartmentMap> = {
    phenylalanine: { precursor: 50 },
    tyrosine: { precursor: 50 },
    l_dopa: { cytosol: 5 },
    dopamine: { cytosol: 5, vesicle: 30, synapse: 0, extracellular: 0 },
    norepinephrine: { vesicle: 5, cytosol: 0 },
    epinephrine: { cytosol: 0 },
    dopal: { cytosol: 0 },
    dopac: { cytosol: 0 },
    three_mt: { extracellular: 0 },
    mhpa: { extracellular: 0 },
    hva: { extracellular: 0, urine: 0 },
    normetanephrine: { extracellular: 0 },
    metanephrine: { extracellular: 0 },
    dopaquinone: { cytosol: 0 },
    dopachrome: { cytosol: 0 },
    melanin: { cytosol: 0 },
    postsynaptic_d1: { synapse: 0 },
    postsynaptic_d2: { synapse: 0 },
    postsynaptic_d3: { synapse: 0 },
    postsynaptic_d4: { synapse: 0 },
    postsynaptic_d5: { synapse: 0 },
    ...(input.initialConcentrations ?? {}),
  };

  const cofactors: Record<string, number> = {};
  for (const [id, cfg] of Object.entries(COFACTORS)) {
    cofactors[id] = cfg.replenishTarget;
  }

  return {
    time: 0,
    wallMs: 0,
    paused: false,
    speed: 1,
    concentrations,
    enzymeActivity,
    inhibitorStrength,
    cofactors,
    pendingReleases: 0,
    alerts: [],
    eventLog: ["t=0 simulation initialized"],
    history: {},
    lastFlux: {},
    receptorHomeostaticFactor: defaultReceptorHomeostaticFactors(),
    alertDismissedUntil: {},
    lastAutoOxidationFlux: 0,
  };
}

export function getActivityMultiplier(level: EnzymeActivityLevel): number {
  return ACTIVITY_MULTIPLIER[level];
}

export type { Reaction, Enzyme, SimulationAlert };

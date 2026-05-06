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
import { evaluateAlerts, VESICLE_MAX_CAPACITY } from "./alerts";

const HISTORY_BUFFER_LEN = 120;

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

const DEFAULT_RELEASE_QUANTUM = 30;
const DEFAULT_SYNAPTIC_DIFFUSION = 0.04;

function readConc(
  state: SimulationState,
  compoundId: string,
  compartment: Compartment,
): number {
  const map = state.concentrations[compoundId];
  if (!map) return 0;
  return map[compartment] ?? 0;
}

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

function ensureActivity(
  state: SimulationState,
  enzymeId: string | undefined,
): EnzymeActivityLevel {
  if (!enzymeId) return "normal";
  return state.enzymeActivity[enzymeId] ?? "normal";
}

/**
 * Pure tick function: takes a SimulationState + reactions + dt and returns a
 * fresh SimulationState. Never mutates input. The simulator never uses
 * negative concentrations.
 *
 * Algorithm per tick:
 *   1. Snapshot current concentrations.
 *   2. Process pending vesicle releases (vesicle DA -> synapse DA).
 *   3. For each reaction, compute MM flux from the snapshot, debit source,
 *      credit destination — applying VMAT2 vesicle-capacity rules.
 *   4. Apply small synaptic diffusion (synapse -> extracellular) so dopamine
 *      released into the cleft eventually gets out even if DAT/COMT are off.
 *   5. Recompute alerts and append to event log when new ones appear.
 *   6. Update history buffers + tick counter.
 */
export function tick(state: SimulationState, inputs: TickInputs): SimulationState {
  const dt = inputs.dt;
  const releaseQuantum = inputs.releaseQuantum ?? DEFAULT_RELEASE_QUANTUM;
  const synapticDiffusion = inputs.synapticDiffusion ?? DEFAULT_SYNAPTIC_DIFFUSION;

  // Start a fresh accumulator from a deep copy of concentrations.
  const next: Record<string, CompartmentMap> = {};
  for (const [id, map] of Object.entries(state.concentrations)) {
    next[id] = { ...map };
  }

  // 1. process vesicle releases (vesicle DA -> synapse DA, vesicle NE -> extracellular)
  if (state.pendingReleases > 0) {
    const releases = state.pendingReleases;
    const vesDA = next.dopamine?.vesicle ?? 0;
    const releasedDA = Math.min(vesDA, releases * releaseQuantum);
    if (releasedDA > 0) {
      writeConc(next, "dopamine", "vesicle", -releasedDA);
      writeConc(next, "dopamine", "synapse", releasedDA);
    }
    const vesNE = next.norepinephrine?.vesicle ?? 0;
    const releasedNE = Math.min(vesNE, releases * releaseQuantum * 0.4);
    if (releasedNE > 0) {
      writeConc(next, "norepinephrine", "vesicle", -releasedNE);
      writeConc(next, "norepinephrine", "extracellular", releasedNE);
    }
  }

  const flux: Record<string, number> = {};

  // 2. iterate reactions using the *pre-tick* snapshot for MM math.
  for (const r of inputs.reactions) {
    const activityLevel = ensureActivity(state, r.enzymeId);
    const activity = ACTIVITY_MULTIPLIER[activityLevel];

    // collect total substrate concentration (all substrates in fromCompartment)
    let substrate = 0;
    for (const s of r.from) substrate += readConc(state, s, r.fromCompartment);

    let rate = 0;
    if (r.enzymeId && r.vmax > 0) {
      rate = mmRate(r.vmax, activity, 0, substrate, r.km);
    } else if (r.baseRate > 0) {
      rate = firstOrderRate(r.baseRate, substrate);
    }

    let amount = rate * dt;
    if (amount <= 0) {
      flux[r.id] = 0;
      continue;
    }

    // can't drain more than what's actually in the source pool
    const availableInAcc = r.from.reduce(
      (sum, s) => sum + (next[s]?.[r.fromCompartment] ?? 0),
      0,
    );
    if (amount > availableInAcc) amount = availableInAcc;

    // VMAT2 vesicle-capacity rule: cap inflow to vesicle compartment
    if (r.enzymeId === "vmat2" && r.toCompartment === "vesicle") {
      const currentVesDA =
        (next.dopamine?.vesicle ?? 0) + (next.norepinephrine?.vesicle ?? 0);
      const headroom = Math.max(0, VESICLE_MAX_CAPACITY - currentVesDA);
      if (amount > headroom) amount = headroom;
    }

    if (amount <= 0) {
      flux[r.id] = 0;
      continue;
    }

    // debit substrates proportionally
    if (r.from.length === 1) {
      writeConc(next, r.from[0]!, r.fromCompartment, -amount);
    } else {
      const each = amount / r.from.length;
      for (const s of r.from) writeConc(next, s, r.fromCompartment, -each);
    }

    // credit products
    if (r.to.length === 1) {
      writeConc(next, r.to[0]!, r.toCompartment, amount);
    } else {
      const each = amount / r.to.length;
      for (const p of r.to) writeConc(next, p, r.toCompartment, each);
    }

    flux[r.id] = amount;
  }

  // 3. small passive synaptic diffusion to extracellular (so the cleft
  //    eventually clears even when DAT/COMT are inhibited).
  const synDA = next.dopamine?.synapse ?? 0;
  if (synDA > 0) {
    const drift = synDA * synapticDiffusion * dt;
    if (drift > 0) {
      writeConc(next, "dopamine", "synapse", -drift);
      writeConc(next, "dopamine", "extracellular", drift);
    }
  }

  // 4. compute new state
  const intermediate: SimulationState = {
    ...state,
    time: state.time + 1,
    wallMs: state.wallMs + dt * 1000,
    pendingReleases: 0,
    concentrations: next,
    lastFlux: flux,
  };

  // 5. recompute alerts; preserve event log additions for *new* alert ids.
  const freshAlerts = evaluateAlerts(intermediate);
  const previousIds = new Set(state.alerts.map((a) => a.id));
  const newlyRaised = freshAlerts.filter((a) => !previousIds.has(a.id));

  const eventLog = [...state.eventLog];
  for (const a of newlyRaised) {
    eventLog.push(`t=${intermediate.time} [${a.severity}] ${a.title}: ${a.message}`);
  }
  if (eventLog.length > 200) eventLog.splice(0, eventLog.length - 200);

  // 6. update sparkline history (one value per tracked compound per tick)
  const history = { ...state.history };
  const trackedCompounds = new Set<string>([
    ...Object.keys(state.history),
    ...Object.keys(intermediate.concentrations),
  ]);
  for (const cid of trackedCompounds) {
    const totalAcrossCompartments = Object.values(
      intermediate.concentrations[cid] ?? {},
    ).reduce((sum, v) => sum + (v ?? 0), 0);
    const buf = (history[cid] ?? []).concat(totalAcrossCompartments);
    if (buf.length > HISTORY_BUFFER_LEN) buf.splice(0, buf.length - HISTORY_BUFFER_LEN);
    history[cid] = buf;
  }

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
  for (const e of input.enzymes) enzymeActivity[e.id] = "normal";

  const concentrations: Record<string, CompartmentMap> = {
    phenylalanine: { precursor: 50 },
    tyrosine: { precursor: 50 },
    l_dopa: { cytosol: 5 },
    dopamine: { cytosol: 5, vesicle: 30, synapse: 0 },
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
    ...(input.initialConcentrations ?? {}),
  };

  return {
    time: 0,
    wallMs: 0,
    paused: false,
    speed: 1,
    concentrations,
    enzymeActivity,
    pendingReleases: 0,
    alerts: [],
    eventLog: ["t=0 simulation initialized"],
    history: {},
    lastFlux: {},
  };
}

export function getActivityMultiplier(level: EnzymeActivityLevel): number {
  return ACTIVITY_MULTIPLIER[level];
}

export type { Reaction, Enzyme, SimulationAlert };

import type { Compartment } from "./reaction";

/**
 * 5-state activity control mapped to a multiplier.
 * inhibit=0, partial=0.5, normal=1, upregulate=1.5, overexpress=2.
 */
export type EnzymeActivityLevel =
  | "inhibit"
  | "partial"
  | "normal"
  | "upregulate"
  | "overexpress";

export const ACTIVITY_MULTIPLIER: Record<EnzymeActivityLevel, number> = {
  inhibit: 0,
  partial: 0.5,
  normal: 1,
  upregulate: 1.5,
  overexpress: 2,
};

export type AlertSeverity = "info" | "warning" | "danger";

export type SimulationAlert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  /** monotonic tick number when this alert was raised */
  raisedAtTick: number;
};

/**
 * concentrations[compoundId][compartment] = relative simulation units.
 * Compounds that don't exist in a compartment are simply absent.
 */
export type CompartmentMap = Partial<Record<Compartment, number>>;

export type SimulationState = {
  /** tick counter, monotonic */
  time: number;
  /** wall-clock ms accumulator (for time-based UX, not physics) */
  wallMs: number;
  paused: boolean;
  /** simulation speed multiplier; 1.0 = real-time-ish */
  speed: number;
  /** concentrations per compound per compartment, in relative units */
  concentrations: Record<string, CompartmentMap>;
  /** activity level per enzyme/transporter/receptor id */
  enzymeActivity: Record<string, EnzymeActivityLevel>;
  /** vesicle release events queued for next tick (number of "releases") */
  pendingReleases: number;
  /** active alert objects */
  alerts: SimulationAlert[];
  /** human-readable event log */
  eventLog: string[];
  /** rolling history per compound for sparklines */
  history: Record<string, number[]>;
  /** computed flux per reaction id from the last tick (for visualization) */
  lastFlux: Record<string, number>;
};

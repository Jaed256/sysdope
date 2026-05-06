import type { Citation } from "./citation";

/**
 * A Compartment is a logical pool tracked by the simulation engine.
 * Compounds live in a specific compartment; transporters move them between
 * compartments. Each Reaction declares which compartment its substrates and
 * products belong to (most reactions are intra-compartment; transporters are
 * cross-compartment).
 */
export type Compartment =
  | "precursor"
  | "cytosol"
  | "vesicle"
  | "synapse"
  | "extracellular"
  | "urine";

export type Reaction = {
  id: string;
  /** ids of substrate compounds (debited) */
  from: string[];
  /** ids of product compounds (credited) */
  to: string[];
  /** id of the catalyzing enzyme/transporter, if any */
  enzymeId?: string;
  /** compartment for the substrate side of this reaction */
  fromCompartment: Compartment;
  /** compartment for the product side of this reaction */
  toCompartment: Compartment;
  equation?: string;
  /** Optional KaTeX companion for `equation` (ASCII / Unicode fallback when unset). */
  equationLatex?: string;
  reversible: boolean;
  /** baseline rate constant used when no enzyme is involved */
  baseRate: number;
  /** Michaelis constant — substrate concentration at half-vmax */
  km: number;
  /** maximum velocity at activity = 1, in concentration-units / time-unit */
  vmax: number;
  citations: Citation[];
};

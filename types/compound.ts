import type { Citation } from "./citation";

export type CompoundClass =
  | "amino_acid"
  | "catecholamine"
  | "metabolite"
  | "pigment_precursor"
  | "pigment"
  | "neurotransmitter"
  /** Non-chemical simulation state node (labeled as relative units in UI). */
  | "simulation_state";

export type NaturalOccurrence = {
  label: string;
  evidence: string;
  citations: Citation[];
};

export type ClaimEntry = {
  claim: string;
  citations: Citation[];
};

export type Compound = {
  id: string;
  name: string;
  aliases: string[];
  compoundClass: CompoundClass;
  pubchemCid?: string;
  chebiId?: string;
  hmdbId?: string;
  iupacName?: string;
  molecularFormula?: string;
  molecularWeight?: number;
  canonicalSmiles?: string;
  inchiKey?: string;
  structure2dUrl?: string;
  endogenousRole?: string;
  naturalOccurrence?: NaturalOccurrence[];
  benefits?: ClaimEntry[];
  cautions?: ClaimEntry[];
  citations: Citation[];
};

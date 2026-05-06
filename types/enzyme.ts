import type { Citation } from "./citation";

export type EnzymeKind = "enzyme" | "transporter" | "receptor";

export type DiseaseAssociation = {
  name: string;
  relationship: string;
  citations: Citation[];
};

/** Source-backed note linking common drug classes to the protein (education). */
export type PharmacologyNote = {
  summary: string;
  citations: Citation[];
};

export type Enzyme = {
  id: string;
  name: string;
  shortName?: string;
  kind: EnzymeKind;
  geneSymbol?: string;
  proteinName?: string;
  uniprotId?: string;
  ecNumber?: string;
  cofactors?: string[];
  subcellularLocation?: string;
  reactionEquation?: string;
  /** Optional companion LaTeX line for the same net transformation (ASCII-only UI may show Unicode instead). */
  reactionEquationLatex?: string;
  diseases?: DiseaseAssociation[];
  inhibitionEffect?: string;
  upregulationEffect?: string;
  /** Optional: medications / drug classes that modulate this target (with citations). */
  pharmacologyNotes?: PharmacologyNote[];
  /**
   * Multi-paragraph educational narrative (plain text; separate paragraphs with
   * blank lines). Not clinical advice; see `overviewCitations` for sources.
   */
  educationalOverview?: string;
  /** Citations supporting factual claims in `educationalOverview`. */
  overviewCitations?: Citation[];
  citations: Citation[];
};

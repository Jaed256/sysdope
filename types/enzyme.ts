import type { Citation } from "./citation";

export type EnzymeKind = "enzyme" | "transporter" | "receptor";

export type DiseaseAssociation = {
  name: string;
  relationship: string;
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
  diseases?: DiseaseAssociation[];
  inhibitionEffect?: string;
  upregulationEffect?: string;
  citations: Citation[];
};

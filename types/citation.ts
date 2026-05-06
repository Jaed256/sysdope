/**
 * Citation describes where a piece of scientific information comes from.
 * Every Compound, Enzyme, Reaction, DiseaseAssociation, and natural-source row
 * displayed in the UI MUST include at least one Citation.
 *
 * Confidence ranking guideline:
 *   high   = expert-curated database entry that exactly covers the claim
 *            (Rhea, UniProt, ChEBI, HMDB, peer-reviewed paper).
 *   medium = chemistry database (PubChem) or government dataset (USDA).
 *   low    = manually curated placeholder; needs review before being treated
 *            as a verified fact.
 */
export type Citation = {
  sourceName: string;
  sourceType: "database" | "paper" | "government" | "manual";
  title?: string;
  url?: string;
  doi?: string;
  pmid?: string;
  accessedAt: string;
  confidence: "high" | "medium" | "low";
};

export type Sourced<T> = {
  value: T;
  citations: Citation[];
};

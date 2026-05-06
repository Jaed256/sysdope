import type { Citation } from "@/types/citation";

/**
 * Source ranking from highest-confidence to lowest:
 *   1. Expert-curated biological databases: Rhea, UniProt, ChEBI, HMDB
 *   2. Chemistry databases: PubChem
 *   3. Government / open food databases (USDA, FoodData Central, FooDB)
 *   4. Peer-reviewed papers
 *   5. Manually curated fallback JSON
 *
 * `rankCitations` returns a stable-sorted copy with the most authoritative
 * sources first. `bestCitation` returns the top-ranked citation, or undefined
 * if the array is empty.
 */
const PRIMARY_DBS = new Set([
  "rhea",
  "uniprot",
  "chebi",
  "hmdb",
]);

const CHEMISTRY_DBS = new Set([
  "pubchem",
]);

const GOV_FOOD = new Set([
  "usda",
  "fooddata central",
  "foodb",
]);

function tier(citation: Citation): number {
  const lower = citation.sourceName.toLowerCase();
  if (PRIMARY_DBS.has(lower) || [...PRIMARY_DBS].some((db) => lower.includes(db))) {
    return 1;
  }
  if (CHEMISTRY_DBS.has(lower) || [...CHEMISTRY_DBS].some((db) => lower.includes(db))) {
    return 2;
  }
  if (citation.sourceType === "government" || [...GOV_FOOD].some((db) => lower.includes(db))) {
    return 3;
  }
  if (citation.sourceType === "paper" || citation.doi || citation.pmid) {
    return 4;
  }
  return 5;
}

const CONFIDENCE_RANK: Record<Citation["confidence"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function rankCitations(citations: readonly Citation[]): Citation[] {
  return [...citations].sort((a, b) => {
    const t = tier(a) - tier(b);
    if (t !== 0) return t;
    return CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence];
  });
}

export function bestCitation(citations: readonly Citation[]): Citation | undefined {
  return rankCitations(citations)[0];
}

/**
 * Returns true if at least one citation in the array is high-confidence and
 * comes from an expert-curated DB or a peer-reviewed paper.
 */
export function isHighConfidence(citations: readonly Citation[]): boolean {
  return citations.some(
    (c) => c.confidence === "high" && (tier(c) === 1 || tier(c) === 4),
  );
}

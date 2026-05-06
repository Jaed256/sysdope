import type { Compound } from "@/types/compound";
import type { Citation } from "@/types/citation";
import { rankCitations } from "@/lib/citations/sourceRanking";
import type { PubChemProperties } from "./pubchem";

/**
 * Merge a seed `Compound` with live PubChem properties.
 *
 * Rules:
 *   - SEED wins for hand-curated narrative fields (endogenousRole, benefits,
 *     cautions, naturalOccurrence, aliases, name).
 *   - PUBCHEM wins for chem-identifier fields (formula, MW, SMILES, InChIKey,
 *     IUPACName, structure2dUrl) when present, since the live database is
 *     more authoritative for those.
 *   - Citations are concatenated, deduped by (sourceName, url), and ranked.
 */
export function mergeSeedWithPubChem(
  seed: Compound,
  live: PubChemProperties | null,
): Compound {
  if (!live) return seed;

  const mergedCitations = dedupeCitations([...seed.citations, live.citation]);

  return {
    ...seed,
    iupacName: live.iupacName ?? seed.iupacName,
    molecularFormula: live.molecularFormula ?? seed.molecularFormula,
    molecularWeight: live.molecularWeight ?? seed.molecularWeight,
    canonicalSmiles: live.canonicalSmiles ?? seed.canonicalSmiles,
    inchiKey: live.inchiKey ?? seed.inchiKey,
    structure2dUrl: live.structure2dUrl ?? seed.structure2dUrl,
    aliases: dedupeStrings([
      ...seed.aliases,
      ...(live.synonyms ?? []),
    ]),
    citations: rankCitations(mergedCitations),
  };
}

function dedupeCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const c of citations) {
    const key = `${c.sourceName}|${c.url ?? ""}|${c.title ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

function dedupeStrings(strs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of strs) {
    if (!s) continue;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

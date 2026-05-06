import type { Compound } from "@/types/compound";
import type { Enzyme } from "@/types/enzyme";
import type { Citation } from "@/types/citation";
import { rankCitations } from "@/lib/citations/sourceRanking";
import { pubchem2dPngUrl } from "@/lib/data/pubchem";
import type { PubChemProperties } from "./pubchem";
import type { ChebiEntry } from "./chebi";
import type { UniProtEntry } from "./uniprot";
import type { RheaReaction } from "./rhea";

/**
 * Merge a seed `Compound` with live PubChem and (optionally) live ChEBI
 * properties.
 *
 * Rules:
 *   - SEED wins for hand-curated narrative fields (endogenousRole, benefits,
 *     cautions, naturalOccurrence, aliases, name).
 *   - PUBCHEM wins for chem-identifier fields (formula, MW, SMILES, InChIKey,
 *     IUPACName, structure2dUrl) when present.
 *   - CHEBI fills in any chem-identifier field PubChem did not provide and
 *     contributes a high-confidence citation. ChEBI's text definition is
 *     surfaced as `endogenousRole` only when seed has none.
 *   - Citations are concatenated, deduped by (sourceName, url, title), and
 *     ranked by source tier.
 */
export function mergeCompoundSources(
  seed: Compound,
  pubchem: PubChemProperties | null,
  chebi: ChebiEntry | null,
): Compound {
  let out = seed;

  if (pubchem) {
    out = {
      ...out,
      iupacName: pubchem.iupacName ?? out.iupacName,
      molecularFormula: pubchem.molecularFormula ?? out.molecularFormula,
      molecularWeight: pubchem.molecularWeight ?? out.molecularWeight,
      canonicalSmiles: pubchem.canonicalSmiles ?? out.canonicalSmiles,
      inchiKey: pubchem.inchiKey ?? out.inchiKey,
      structure2dUrl: pubchem.structure2dUrl ?? out.structure2dUrl,
      aliases: dedupeStrings([...out.aliases, ...(pubchem.synonyms ?? [])]),
      citations: dedupeCitations([...out.citations, pubchem.citation]),
    };
  }

  if (chebi) {
    out = {
      ...out,
      iupacName: out.iupacName ?? chebi.iupacName,
      molecularFormula: out.molecularFormula ?? chebi.formula,
      canonicalSmiles: out.canonicalSmiles ?? chebi.smiles,
      endogenousRole: out.endogenousRole ?? chebi.definition,
      citations: dedupeCitations([...out.citations, chebi.citation]),
    };
  }

  let merged: Compound = { ...out, citations: rankCitations(out.citations) };
  if (
    merged.pubchemCid != null &&
    merged.pubchemCid !== "" &&
    !merged.structure2dUrl
  ) {
    merged = {
      ...merged,
      structure2dUrl: pubchem2dPngUrl(merged.pubchemCid),
    };
  }

  return merged;
}

/**
 * @deprecated Use {@link mergeCompoundSources}. Kept for back-compat with
 * the Phase 1 route handler signature.
 */
export function mergeSeedWithPubChem(
  seed: Compound,
  live: PubChemProperties | null,
): Compound {
  return mergeCompoundSources(seed, live, null);
}

/**
 * Merge a seed `Enzyme` with live UniProt data and (optionally) Rhea
 * reactions discovered for its EC number.
 *
 * Rules:
 *   - SEED wins for inhibition/upregulation prose (those are SysDope
 *     interpretations, not UniProt facts).
 *   - UNIPROT fills in `proteinName`, `geneSymbol`, `ecNumber`,
 *     `subcellularLocation`, and `diseases` if seed left them empty.
 *   - UNIPROT's first catalytic-activity entry overrides
 *     `reactionEquation` when seed has none.
 *   - RHEA reactions are appended to a new `relatedReactions` field for the
 *     enzyme drawer.
 *   - Citations from UniProt and Rhea are merged + ranked. UniProt is
 *     `confidence: high` so it sorts above the seed placeholder.
 */
export type EnzymeWithSources = Enzyme & {
  relatedReactions?: { equation?: string; rheaId: string; ecNumbers: string[] }[];
  catalyticActivities?: { name: string; ecNumber?: string; rheaId?: string }[];
};

export function mergeEnzymeSources(
  seed: Enzyme,
  uniprot: UniProtEntry | null,
  rhea: RheaReaction[] = [],
): EnzymeWithSources {
  let out: EnzymeWithSources = { ...seed };

  if (uniprot) {
    out = {
      ...out,
      proteinName: out.proteinName ?? uniprot.proteinName,
      geneSymbol: out.geneSymbol ?? uniprot.geneSymbol,
      ecNumber: out.ecNumber ?? uniprot.ecNumber,
      subcellularLocation:
        out.subcellularLocation ?? uniprot.subcellularLocations.join("; "),
      reactionEquation:
        out.reactionEquation ?? uniprot.catalyticActivities[0]?.name,
      diseases: mergeDiseases(out.diseases ?? [], uniprot),
      catalyticActivities: uniprot.catalyticActivities,
      citations: dedupeCitations([...out.citations, uniprot.citation]),
    };
  }

  if (rhea.length > 0) {
    out = {
      ...out,
      relatedReactions: rhea.map((r) => ({
        rheaId: r.rheaId,
        equation: r.equation,
        ecNumbers: r.ecNumbers,
      })),
      citations: dedupeCitations([...out.citations, ...rhea.map((r) => r.citation)]),
    };
  }

  return {
    ...out,
    reactionEquationLatex: seed.reactionEquationLatex ?? out.reactionEquationLatex,
    citations: rankCitations(out.citations),
  };
}

function mergeDiseases(
  existing: NonNullable<Enzyme["diseases"]>,
  uniprot: UniProtEntry,
): NonNullable<Enzyme["diseases"]> {
  if (uniprot.diseases.length === 0) return existing;
  const seen = new Set(existing.map((d) => d.name.toLowerCase()));
  const out = [...existing];
  for (const d of uniprot.diseases) {
    if (seen.has(d.name.toLowerCase())) continue;
    seen.add(d.name.toLowerCase());
    out.push({
      name: d.name,
      relationship: d.description ?? "Associated disease (UniProt)",
      citations: [uniprot.citation],
    });
  }
  return out;
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

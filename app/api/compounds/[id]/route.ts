import { NextResponse } from "next/server";
import { findSeedCompound } from "@/lib/pathway/seedCompounds";
import { getCompoundPropertiesByCid, pubchem2dPngUrl } from "@/lib/data/pubchem";
import { getChebiEntry } from "@/lib/data/chebi";
import { mergeCompoundSources } from "@/lib/data/normalize";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/**
 * Returns a compound enriched in parallel from PubChem (chem identifiers) and
 * ChEBI (definition + redundant chem identifiers used as fallback). Both
 * external calls are independently graceful: if either is unreachable or
 * schema-mismatched the response still returns the seed compound and reports
 * `sources.{pubchem,chebi}: false`.
 */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const seed = findSeedCompound(id);
  if (!seed) {
    return NextResponse.json(
      { error: "compound_not_found", id },
      { status: 404 },
    );
  }

  const [pubchem, chebi] = await Promise.all([
    seed.pubchemCid ? getCompoundPropertiesByCid(seed.pubchemCid) : Promise.resolve(null),
    seed.chebiId ? getChebiEntry(seed.chebiId) : Promise.resolve(null),
  ]);

  const merged = mergeCompoundSources(seed, pubchem, chebi);
  const compound =
    merged.pubchemCid != null && merged.pubchemCid !== ""
      ? {
          ...merged,
          structure2dUrl:
            merged.structure2dUrl ?? pubchem2dPngUrl(merged.pubchemCid),
        }
      : merged;

  return NextResponse.json({
    compound,
    sources: {
      seed: true,
      pubchem: pubchem !== null,
      chebi: chebi !== null,
      hmdb: false,
    },
  });
}

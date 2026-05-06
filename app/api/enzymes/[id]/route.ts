import { NextResponse } from "next/server";
import { findSeedEnzyme } from "@/lib/pathway/seedEnzymes";
import { getUniProtEntry } from "@/lib/data/uniprot";
import { getRheaReactionsByEc } from "@/lib/data/rhea";
import { mergeEnzymeSources } from "@/lib/data/normalize";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/**
 * Returns a seed enzyme merged with live UniProt KB metadata and any Rhea
 * reactions matching its EC number. Both external sources are independently
 * graceful: if UniProt or Rhea is unreachable the response still includes
 * the seed payload and reports `sources.{uniprot,rhea}: false`.
 */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const enzyme = findSeedEnzyme(id);
  if (!enzyme) {
    return NextResponse.json({ error: "enzyme_not_found", id }, { status: 404 });
  }

  const [uniprot, rheaReactions] = await Promise.all([
    enzyme.uniprotId ? getUniProtEntry(enzyme.uniprotId) : Promise.resolve(null),
    enzyme.ecNumber
      ? getRheaReactionsByEc(enzyme.ecNumber, 5)
      : Promise.resolve([]),
  ]);

  const merged = mergeEnzymeSources(enzyme, uniprot, rheaReactions);

  return NextResponse.json({
    enzyme: merged,
    sources: {
      seed: true,
      uniprot: uniprot !== null,
      rhea: rheaReactions.length > 0,
    },
  });
}

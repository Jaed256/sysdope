import { NextResponse } from "next/server";
import { findSeedCompound } from "@/lib/pathway/seedCompounds";
import { getCompoundPropertiesByCid } from "@/lib/data/pubchem";
import { mergeSeedWithPubChem } from "@/lib/data/normalize";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const seed = findSeedCompound(id);
  if (!seed) {
    return NextResponse.json(
      { error: "compound_not_found", id },
      { status: 404 },
    );
  }

  let merged = seed;
  let pubchemOk = false;
  if (seed.pubchemCid) {
    const live = await getCompoundPropertiesByCid(seed.pubchemCid);
    if (live) {
      merged = mergeSeedWithPubChem(seed, live);
      pubchemOk = true;
    }
  }

  return NextResponse.json({
    compound: merged,
    sources: {
      seed: true,
      pubchem: pubchemOk,
      chebi: false,
      hmdb: false,
    },
  });
}

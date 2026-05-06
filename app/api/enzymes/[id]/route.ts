import { NextResponse } from "next/server";
import { findSeedEnzyme } from "@/lib/pathway/seedEnzymes";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const enzyme = findSeedEnzyme(id);
  if (!enzyme) {
    return NextResponse.json({ error: "enzyme_not_found", id }, { status: 404 });
  }
  // UniProt / Rhea adapters are stubs in Phase 1 → return seed.
  return NextResponse.json({
    enzyme,
    sources: { seed: true, uniprot: false, rhea: false },
  });
}

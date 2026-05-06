import { NextResponse } from "next/server";
import { SEED_COMPOUNDS } from "@/lib/pathway/seedCompounds";
import { SEED_ENZYMES } from "@/lib/pathway/seedEnzymes";
import { SEED_REACTIONS } from "@/lib/pathway/seedReactions";
import { buildPathwayGraph } from "@/lib/pathway/graph";

export const runtime = "nodejs";

export async function GET() {
  const { nodes, edges } = buildPathwayGraph();
  return NextResponse.json({
    compounds: SEED_COMPOUNDS,
    enzymes: SEED_ENZYMES,
    reactions: SEED_REACTIONS,
    nodes,
    edges,
  });
}

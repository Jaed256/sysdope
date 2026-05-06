import { NextResponse } from "next/server";
import { findSeedReaction } from "@/lib/pathway/seedReactions";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const reaction = findSeedReaction(id);
  if (!reaction) {
    return NextResponse.json({ error: "reaction_not_found", id }, { status: 404 });
  }
  return NextResponse.json({
    reaction,
    sources: { seed: true, rhea: false },
  });
}

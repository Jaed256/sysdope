import { NextResponse } from "next/server";
import { findSeedReaction } from "@/lib/pathway/seedReactions";
import { findSeedEnzyme } from "@/lib/pathway/seedEnzymes";
import { getRheaReactionsByEc } from "@/lib/data/rhea";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/**
 * Returns a seed reaction. When the reaction has an enzyme with a known EC
 * number, also looks up matching Rhea reactions for the enzyme drawer.
 */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const reaction = findSeedReaction(id);
  if (!reaction) {
    return NextResponse.json({ error: "reaction_not_found", id }, { status: 404 });
  }

  const enzyme = reaction.enzymeId ? findSeedEnzyme(reaction.enzymeId) : undefined;
  const rheaReactions = enzyme?.ecNumber
    ? await getRheaReactionsByEc(enzyme.ecNumber, 3)
    : [];

  return NextResponse.json({
    reaction,
    rheaReactions,
    sources: {
      seed: true,
      rhea: rheaReactions.length > 0,
    },
  });
}

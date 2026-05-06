import { NextResponse } from "next/server";
import { searchLiterature } from "@/lib/data/literature";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (!q) {
    return NextResponse.json(
      { error: "missing_query", note: "Provide ?q=" },
      { status: 400 },
    );
  }
  const results = await searchLiterature(q, { limit: 10 });
  return NextResponse.json({
    results,
    note:
      results.length === 0
        ? "literature adapter is a Phase 1 stub; wire Europe PMC / PubMed E-utilities to enable"
        : undefined,
  });
}

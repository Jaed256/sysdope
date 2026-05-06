import { NextResponse } from "next/server";
import { searchLiterature } from "@/lib/data/literature";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Math.min(25, Math.max(1, Number(limitRaw))) : 10;

  if (!q.trim()) {
    return NextResponse.json(
      { error: "missing_query", note: "Provide ?q=<terms>&limit=<1-25>" },
      { status: 400 },
    );
  }

  const results = await searchLiterature(q, { limit });
  return NextResponse.json({
    query: q,
    count: results.length,
    results,
    source: "Europe PMC",
  });
}

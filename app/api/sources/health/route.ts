import { NextResponse } from "next/server";
import { pubchemHealth } from "@/lib/data/pubchem";
import { rheaHealth } from "@/lib/data/rhea";
import { uniprotHealth } from "@/lib/data/uniprot";
import { chebiHealth } from "@/lib/data/chebi";
import { hmdbHealth } from "@/lib/data/hmdb";
import { literatureHealth } from "@/lib/data/literature";
import { foodSourcesHealth } from "@/lib/data/foodSources";

export const runtime = "nodejs";

type HealthEntry = { source: string; ok: boolean; latencyMs: number };

export async function GET() {
  const checks = await Promise.all([
    pubchemHealth().then((r) => ({ source: "pubchem", ...r })),
    rheaHealth().then((r) => ({ source: "rhea", ...r })),
    uniprotHealth().then((r) => ({ source: "uniprot", ...r })),
    chebiHealth().then((r) => ({ source: "chebi", ...r })),
    hmdbHealth().then((r) => ({ source: "hmdb", ...r })),
    literatureHealth().then((r) => ({ source: "literature", ...r })),
    foodSourcesHealth().then((r) => ({ source: "foodSources", ...r })),
  ]);
  const sources: HealthEntry[] = checks;
  return NextResponse.json({ sources, checkedAt: new Date().toISOString() });
}

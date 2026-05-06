import { NextResponse } from "next/server";
import { pubchemHealth } from "@/lib/data/pubchem";
import { rheaHealth } from "@/lib/data/rhea";
import { uniprotHealth } from "@/lib/data/uniprot";
import { chebiHealth } from "@/lib/data/chebi";
import { hmdbHealth } from "@/lib/data/hmdb";
import { literatureHealth } from "@/lib/data/literature";
import { foodSourcesHealth } from "@/lib/data/foodSources";

export const runtime = "nodejs";

type AdapterStatus = "live" | "stub";

type HealthEntry = {
  source: string;
  status: AdapterStatus;
  ok: boolean;
  latencyMs: number;
  note?: string;
};

const ADAPTERS: {
  source: string;
  status: AdapterStatus;
  check: () => Promise<{ ok: boolean; latencyMs: number }>;
  note?: string;
}[] = [
  { source: "pubchem", status: "live", check: pubchemHealth },
  { source: "uniprot", status: "live", check: uniprotHealth },
  { source: "rhea", status: "live", check: rheaHealth },
  { source: "chebi", status: "live", check: chebiHealth },
  { source: "literature", status: "live", check: literatureHealth },
  {
    source: "hmdb",
    status: "stub",
    check: hmdbHealth,
    note: "no public JSON REST; stays a stub until bulk import is wired in Phase 4",
  },
  {
    source: "foodSources",
    status: "stub",
    check: foodSourcesHealth,
    note: "USDA FoodData Central requires an API key; stub until provisioned",
  },
];

export async function GET() {
  const sources: HealthEntry[] = await Promise.all(
    ADAPTERS.map(async (a) => {
      const r = await a.check();
      return {
        source: a.source,
        status: a.status,
        ok: r.ok,
        latencyMs: r.latencyMs,
        ...(a.note ? { note: a.note } : {}),
      };
    }),
  );
  return NextResponse.json({ sources, checkedAt: new Date().toISOString() });
}

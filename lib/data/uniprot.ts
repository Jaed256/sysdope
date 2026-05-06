import type { Citation } from "@/types/citation";

export type UniProtEntry = {
  uniprotId: string;
  geneSymbol?: string;
  proteinName?: string;
  ecNumber?: string;
  catalyticActivity?: string;
  diseaseComments?: string[];
  citation: Citation;
};

/**
 * STUB — replace with a `https://rest.uniprot.org/uniprotkb/<id>.json`
 * fetch + Zod validation when wiring real data. Returns null so the API
 * route can fall back to seed enzyme data.
 */
export async function getUniProtEntry(
  uniprotId: string,
): Promise<UniProtEntry | null> {
  console.info(`[uniprot] adapter stub called for ${uniprotId} — returning null`);
  return null;
}

export async function uniprotHealth(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch("https://rest.uniprot.org/uniprotkb/P00439.json", {
      next: { revalidate: 60 },
    });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

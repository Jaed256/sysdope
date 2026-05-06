import type { Citation } from "@/types/citation";

export type ChebiEntry = {
  chebiId: string;
  name?: string;
  definition?: string;
  formula?: string;
  citation: Citation;
};

/**
 * STUB — replace with a ChEBI fetch (REST or SPARQL) + Zod validation when
 * wiring real data.
 *
 * @see https://www.ebi.ac.uk/chebi/webServices.do
 */
export async function getChebiEntry(
  chebiId: string,
): Promise<ChebiEntry | null> {
  console.info(`[chebi] adapter stub called for ${chebiId} — returning null`);
  return null;
}

export async function chebiHealth(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch(
      "https://www.ebi.ac.uk/ols4/api/ontologies/chebi",
      { next: { revalidate: 60 } },
    );
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

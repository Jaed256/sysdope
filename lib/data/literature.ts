import type { Citation } from "@/types/citation";

export type LiteratureResult = {
  id: string;
  title: string;
  abstract?: string;
  doi?: string;
  pmid?: string;
  year?: number;
  citation: Citation;
};

/**
 * STUB — replace with Europe PMC / PubMed E-utilities / Semantic Scholar /
 * OpenAlex search + Zod validation.
 *
 * @see https://europepmc.org/RestfulWebService
 * @see https://www.ncbi.nlm.nih.gov/books/NBK25500/
 */
export async function searchLiterature(
  _query: string,
  _opts?: { limit?: number },
): Promise<LiteratureResult[]> {
  console.info(`[literature] adapter stub called with query — returning []`);
  return [];
}

export async function literatureHealth(): Promise<{
  ok: boolean;
  latencyMs: number;
}> {
  const start = Date.now();
  try {
    const res = await fetch(
      "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=dopamine&format=json&pageSize=1",
      { next: { revalidate: 60 } },
    );
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

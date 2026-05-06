import { z } from "zod";
import type { Citation } from "@/types/citation";

/**
 * Europe PMC literature search adapter.
 *
 * Endpoint: https://www.ebi.ac.uk/europepmc/webservices/rest/search
 *
 * Free, no API key, generous rate limits (~10 rps documented). Returns up
 * to `limit` peer-reviewed/preprint hits with PMID/DOI when available.
 *
 * @see https://europepmc.org/RestfulWebService
 */

const REVALIDATE_SECONDS = 60 * 60 * 6; // refresh every 6h
const TIMEOUT_MS = 7000;

const FullTextUrlSchema = z.object({
  url: z.string().optional(),
  documentStyle: z.string().optional(),
  site: z.string().optional(),
});

const ResultSchema = z.object({
  id: z.string().optional(),
  source: z.string().optional(),
  pmid: z.string().optional(),
  pmcid: z.string().optional(),
  doi: z.string().optional(),
  title: z.string().optional(),
  abstractText: z.string().optional(),
  authorString: z.string().optional(),
  journalTitle: z.string().optional(),
  pubYear: z.string().optional(),
  fullTextUrlList: z
    .object({
      fullTextUrl: z.array(FullTextUrlSchema).optional(),
    })
    .optional(),
});

const SearchResponseSchema = z.object({
  hitCount: z.number().optional(),
  resultList: z
    .object({
      result: z.array(ResultSchema).optional(),
    })
    .optional(),
});

export type LiteratureResult = {
  id: string;
  title: string;
  abstract?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  journal?: string;
  authors?: string;
  year?: number;
  url?: string;
  citation: Citation;
};

function epmcUrl(r: { id?: string; source?: string; pmid?: string }): string {
  if (r.pmid) return `https://europepmc.org/article/MED/${r.pmid}`;
  if (r.id && r.source) return `https://europepmc.org/article/${r.source}/${r.id}`;
  return "https://europepmc.org/";
}

function makeCitation(r: {
  id?: string;
  source?: string;
  pmid?: string;
  doi?: string;
  title?: string;
  pubYear?: string;
}): Citation {
  return {
    sourceName: "Europe PMC",
    sourceType: "paper",
    title: r.title,
    url: epmcUrl(r),
    doi: r.doi,
    pmid: r.pmid,
    accessedAt: new Date().toISOString().slice(0, 10),
    confidence: "medium",
  };
}

async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS, tags: ["literature"] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`[europepmc] non-ok ${res.status} for ${url}`);
      return null;
    }
    const json: unknown = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.warn(`[europepmc] schema mismatch:`, parsed.error.message);
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.warn(`[europepmc] fetch failed:`, (err as Error).message);
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function searchLiterature(
  query: string,
  opts?: { limit?: number },
): Promise<LiteratureResult[]> {
  const limit = Math.min(25, Math.max(1, opts?.limit ?? 10));
  if (!query || !query.trim()) return [];
  const params = new URLSearchParams({
    query: query.trim(),
    format: "json",
    pageSize: String(limit),
    resultType: "lite",
    sort: "P_PDATE_D desc",
  });
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?${params.toString()}`;
  const data = await fetchJson(url, SearchResponseSchema);
  const results = data?.resultList?.result ?? [];

  return results.flatMap<LiteratureResult>((r) => {
    if (!r.title) return [];
    const yearNum = r.pubYear ? Number(r.pubYear) : undefined;
    const fullText = r.fullTextUrlList?.fullTextUrl?.[0]?.url;
    return [{
      id: r.id ?? r.pmid ?? r.doi ?? r.title,
      title: r.title,
      abstract: r.abstractText,
      doi: r.doi,
      pmid: r.pmid,
      pmcid: r.pmcid,
      journal: r.journalTitle,
      authors: r.authorString,
      year: Number.isFinite(yearNum) ? yearNum : undefined,
      url: fullText ?? epmcUrl(r),
      citation: makeCitation(r),
    }];
  });
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

import { z } from "zod";
import type { Citation } from "@/types/citation";

/**
 * Rhea live adapter.
 *
 * Endpoint: https://www.rhea-db.org/rhea/?query={query}&format=json&fields=...
 *
 * @see https://www.rhea-db.org/help/rest-api
 */

const REVALIDATE_SECONDS = 60 * 60 * 24;
const TIMEOUT_MS = 6500;

const RheaResultSchema = z.object({
  id: z.union([z.number(), z.string()]).transform((v) => String(v)),
  equation: z.string().optional(),
  ec: z.array(z.string()).optional(),
  htmlequation: z.string().optional(),
  citations: z.array(z.string()).optional(),
});

const RheaResponseSchema = z.object({
  count: z.number().optional(),
  results: z.array(RheaResultSchema).optional(),
});

export type RheaReaction = {
  rheaId: string;
  equation?: string;
  ecNumbers: string[];
  citation: Citation;
};

function rheaUrl(rheaId: string): string {
  return `https://www.rhea-db.org/rhea/${rheaId}`;
}

function makeCitation(rheaId: string): Citation {
  return {
    sourceName: "Rhea",
    sourceType: "database",
    title: `Rhea reaction ${rheaId}`,
    url: rheaUrl(rheaId),
    accessedAt: new Date().toISOString().slice(0, 10),
    confidence: "high",
  };
}

/**
 * Common User-Agent header. Several EBI/SIB endpoints either rate-limit or
 * outright reject requests with no UA (which is what Vercel's serverless
 * runtime sends by default for `fetch`). Identifying ourselves keeps the
 * service operators happy and avoids 4xx responses observed in production.
 */
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "SysDope/1.0 (+https://sysdope.vercel.app; educational sim)",
} as const;

async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS, tags: ["rhea"] },
      headers: HEADERS,
    });
    if (!res.ok) {
      const snippet = await res.text().then((t) => t.slice(0, 200)).catch(() => "");
      console.warn(`[rhea] non-ok ${res.status} for ${url} :: ${snippet}`);
      return null;
    }
    const json: unknown = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.warn(`[rhea] schema mismatch for ${url}:`, parsed.error.message);
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.warn(`[rhea] fetch failed for ${url}:`, (err as Error).message);
    return null;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Build a Rhea search URL. Note: the Rhea backend treats colons inside the
 * query value as significant, but it accepts both `:` and `%3A`. We do NOT
 * URL-encode the colon explicitly — `URLSearchParams` will percent-encode
 * `:` as `%3A` which still works.
 */
function buildUrl(query: string, size = 5): string {
  const params = new URLSearchParams({
    query,
    fields: "rhea-id,equation,ec",
    format: "json",
    size: String(size),
  });
  return `https://www.rhea-db.org/rhea?${params.toString()}`;
}

export async function getRheaReaction(rheaId: string): Promise<RheaReaction | null> {
  const numeric = rheaId.replace(/^rhea:?/i, "");
  const data = await fetchJson(buildUrl(`rhea:${numeric}`, 1), RheaResponseSchema);
  const first = data?.results?.[0];
  if (!first) return null;
  return {
    rheaId: first.id,
    equation: first.equation,
    ecNumbers: first.ec ?? [],
    citation: makeCitation(first.id),
  };
}

/**
 * Look up canonical Rhea reactions by EC number. Useful when the seed enzyme
 * carries an EC but no Rhea ID. Returns up to `limit` reactions.
 */
export async function getRheaReactionsByEc(
  ecNumber: string,
  limit = 5,
): Promise<RheaReaction[]> {
  const data = await fetchJson(buildUrl(`ec:${ecNumber}`, limit), RheaResponseSchema);
  if (!data?.results) return [];
  return data.results.map((r) => ({
    rheaId: r.id,
    equation: r.equation,
    ecNumbers: r.ec ?? [],
    citation: makeCitation(r.id),
  }));
}

export async function rheaHealth(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch(buildUrl("rhea:10000", 1), {
      next: { revalidate: 60 },
      headers: HEADERS,
    });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

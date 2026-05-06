import { z } from "zod";
import type { Citation } from "@/types/citation";

/**
 * UniProt KB live adapter.
 *
 * Endpoint: https://rest.uniprot.org/uniprotkb/<accession>.json
 *
 * Caching: 24h via Next fetch revalidate (`uniprot` tag). UniProt is
 * gracefully tolerant of polite traffic (no API key required, generous
 * rate limit). Schema-mismatched payloads return null so the caller can
 * fall back to seed data.
 *
 * @see https://www.uniprot.org/help/api
 */

const REVALIDATE_SECONDS = 60 * 60 * 24;
const TIMEOUT_MS = 6500;

const TextSchema = z
  .object({ value: z.string() })
  .or(z.string().transform((value) => ({ value })));

const RecommendedNameSchema = z.object({
  fullName: TextSchema.optional(),
  shortNames: z.array(TextSchema).optional(),
  ecNumbers: z.array(TextSchema).optional(),
});

const GeneNameSchema = z.object({
  geneName: TextSchema.optional(),
  synonyms: z.array(TextSchema).optional(),
});

/**
 * UniProt's comment array is heterogeneous and has dozens of types. Rather
 * than enumerating every shape with a discriminated union, accept a flat
 * superset where every per-type field is optional and we narrow at the use
 * site by checking `commentType`.
 */
const CommentSchema = z.object({
  commentType: z.string(),
  texts: z.array(TextSchema).optional(),
  reaction: z
    .object({
      name: z.string().optional(),
      ecNumber: z.string().optional(),
      reactionCrossReferences: z
        .array(
          z.object({
            database: z.string().optional(),
            id: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  subcellularLocations: z
    .array(
      z.object({
        location: TextSchema.optional(),
      }),
    )
    .optional(),
  disease: z
    .object({
      diseaseId: z.string().optional(),
      diseaseAccession: z.string().optional(),
      acronym: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

const UniProtResponseSchema = z.object({
  primaryAccession: z.string(),
  proteinDescription: z
    .object({
      recommendedName: RecommendedNameSchema.optional(),
    })
    .optional(),
  genes: z.array(GeneNameSchema).optional(),
  comments: z.array(CommentSchema).optional(),
});

export type UniProtEntry = {
  uniprotId: string;
  geneSymbol?: string;
  proteinName?: string;
  ecNumber?: string;
  function?: string;
  catalyticActivities: { name: string; ecNumber?: string; rheaId?: string }[];
  subcellularLocations: string[];
  diseases: { name: string; description?: string }[];
  citation: Citation;
};

function uniprotUrl(accession: string): string {
  return `https://www.uniprot.org/uniprotkb/${accession}/entry`;
}

function makeCitation(accession: string): Citation {
  return {
    sourceName: "UniProt",
    sourceType: "database",
    title: `UniProt ${accession}`,
    url: uniprotUrl(accession),
    accessedAt: new Date().toISOString().slice(0, 10),
    confidence: "high",
  };
}

async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS, tags: ["uniprot"] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`[uniprot] non-ok ${res.status} for ${url}`);
      return null;
    }
    const json: unknown = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.warn(`[uniprot] schema mismatch for ${url}:`, parsed.error.message);
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.warn(`[uniprot] fetch failed for ${url}:`, (err as Error).message);
    return null;
  } finally {
    clearTimeout(t);
  }
}

function pickText(t: { value: string } | undefined | null): string | undefined {
  return t?.value ?? undefined;
}

function findRheaCrossRef(
  refs?: { database?: string; id?: string }[],
): string | undefined {
  return refs?.find((r) => r.database === "Rhea" && r.id)?.id ?? undefined;
}

export async function getUniProtEntry(
  accession: string,
): Promise<UniProtEntry | null> {
  const url = `https://rest.uniprot.org/uniprotkb/${encodeURIComponent(accession)}.json`;
  const data = await fetchJson(url, UniProtResponseSchema);
  if (!data) return null;

  const recommended = data.proteinDescription?.recommendedName;
  const proteinName = pickText(recommended?.fullName);
  const ecNumber = pickText(recommended?.ecNumbers?.[0]);
  const geneSymbol = pickText(data.genes?.[0]?.geneName);

  let functionText: string | undefined;
  const catalyticActivities: UniProtEntry["catalyticActivities"] = [];
  const subcellularLocations: string[] = [];
  const diseases: UniProtEntry["diseases"] = [];

  for (const c of data.comments ?? []) {
    if (c.commentType === "FUNCTION") {
      const text = c.texts?.map((t) => t.value).join(" ");
      if (text && !functionText) functionText = text;
    } else if (c.commentType === "CATALYTIC ACTIVITY") {
      const r = c.reaction;
      if (r?.name) {
        catalyticActivities.push({
          name: r.name,
          ecNumber: r.ecNumber,
          rheaId: findRheaCrossRef(r.reactionCrossReferences),
        });
      }
    } else if (c.commentType === "SUBCELLULAR LOCATION") {
      for (const loc of c.subcellularLocations ?? []) {
        const v = pickText(loc.location);
        if (v) subcellularLocations.push(v);
      }
    } else if (c.commentType === "DISEASE") {
      const name =
        c.disease?.diseaseId ??
        c.disease?.acronym ??
        c.disease?.diseaseAccession;
      if (name) {
        diseases.push({
          name,
          description: c.disease?.description,
        });
      }
    }
  }

  return {
    uniprotId: data.primaryAccession,
    geneSymbol,
    proteinName,
    ecNumber,
    function: functionText,
    catalyticActivities,
    subcellularLocations,
    diseases,
    citation: makeCitation(data.primaryAccession),
  };
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

import { z } from "zod";
import type { Citation } from "@/types/citation";

/**
 * ChEBI live adapter via the EBI OLS4 API.
 *
 * Endpoint: https://www.ebi.ac.uk/ols4/api/ontologies/chebi/terms?obo_id=CHEBI:<id>
 *
 * OLS exposes ChEBI as a structured ontology with definitions and a small
 * annotation map (formula, SMILES, InChI). We extract just what's useful
 * for a compound side drawer.
 *
 * @see https://www.ebi.ac.uk/ols4/help
 */

const REVALIDATE_SECONDS = 60 * 60 * 24;
const TIMEOUT_MS = 6500;

const TermSchema = z.object({
  obo_id: z.string().optional(),
  label: z.string().optional(),
  description: z.array(z.string()).optional(),
  iri: z.string().optional(),
  annotation: z.record(z.string(), z.array(z.unknown())).optional(),
});

const OlsResponseSchema = z.object({
  _embedded: z
    .object({
      terms: z.array(TermSchema).optional(),
    })
    .optional(),
});

export type ChebiEntry = {
  chebiId: string;
  name?: string;
  definition?: string;
  formula?: string;
  smiles?: string;
  inchi?: string;
  iupacName?: string;
  citation: Citation;
};

function chebiUrl(chebiId: string): string {
  return `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${chebiId}`;
}

function makeCitation(chebiId: string): Citation {
  return {
    sourceName: "ChEBI",
    sourceType: "database",
    title: chebiId,
    url: chebiUrl(chebiId),
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
      next: { revalidate: REVALIDATE_SECONDS, tags: ["chebi"] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`[chebi] non-ok ${res.status} for ${url}`);
      return null;
    }
    const json: unknown = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.warn(`[chebi] schema mismatch for ${url}:`, parsed.error.message);
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.warn(`[chebi] fetch failed for ${url}:`, (err as Error).message);
    return null;
  } finally {
    clearTimeout(t);
  }
}

function firstString(v: unknown[] | undefined): string | undefined {
  if (!v || v.length === 0) return undefined;
  const head = v[0];
  if (typeof head === "string") return head;
  if (head && typeof head === "object" && "value" in head) {
    const value = (head as { value?: unknown }).value;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

export async function getChebiEntry(chebiId: string): Promise<ChebiEntry | null> {
  // Accept both raw numeric ("18243") and prefixed ("CHEBI:18243") IDs.
  const normalized = chebiId.toUpperCase().startsWith("CHEBI:")
    ? chebiId.toUpperCase()
    : `CHEBI:${chebiId}`;
  const url = `https://www.ebi.ac.uk/ols4/api/ontologies/chebi/terms?obo_id=${encodeURIComponent(normalized)}`;
  const data = await fetchJson(url, OlsResponseSchema);
  const term = data?._embedded?.terms?.[0];
  if (!term) return null;

  const annotations = term.annotation ?? {};
  return {
    chebiId: term.obo_id ?? normalized,
    name: term.label,
    definition: term.description?.[0],
    formula: firstString(annotations.formula),
    smiles: firstString(annotations.smiles),
    inchi: firstString(annotations.inchi),
    iupacName: firstString(annotations["IUPAC name"]),
    citation: makeCitation(term.obo_id ?? normalized),
  };
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

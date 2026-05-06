import { z } from "zod";
import type { Citation } from "@/types/citation";

const PROPS = [
  "MolecularFormula",
  "MolecularWeight",
  "CanonicalSMILES",
  "InChIKey",
  "IUPACName",
] as const;

const PropertyTableSchema = z.object({
  PropertyTable: z.object({
    Properties: z
      .array(
        z.object({
          CID: z.number().optional(),
          MolecularFormula: z.string().optional(),
          MolecularWeight: z.union([z.number(), z.string()]).optional(),
          CanonicalSMILES: z.string().optional(),
          InChIKey: z.string().optional(),
          IUPACName: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

const SynonymsSchema = z.object({
  InformationList: z.object({
    Information: z.array(
      z.object({
        CID: z.number().optional(),
        Synonym: z.array(z.string()).optional(),
      }),
    ),
  }),
});

export type PubChemProperties = {
  cid: string;
  molecularFormula?: string;
  molecularWeight?: number;
  canonicalSmiles?: string;
  inchiKey?: string;
  iupacName?: string;
  synonyms?: string[];
  structure2dUrl: string;
  citation: Citation;
};

const BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
/** Per PubChem usage policy: <= 5 requests/sec; we cache 24h to be polite. */
const REVALIDATE_SECONDS = 60 * 60 * 24;
const TIMEOUT_MS = 6000;

function pubchemUrl(cid: string): string {
  return `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
}

function imageUrl(cid: string): string {
  return `https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=${cid}&t=l`;
}

function makeCitation(cid: string): Citation {
  return {
    sourceName: "PubChem",
    sourceType: "database",
    title: `PubChem CID ${cid}`,
    url: pubchemUrl(cid),
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
      next: { revalidate: REVALIDATE_SECONDS, tags: ["pubchem"] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`[pubchem] non-ok ${res.status} for ${url}`);
      return null;
    }
    const json: unknown = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.warn(`[pubchem] schema mismatch for ${url}:`, parsed.error.message);
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.warn(`[pubchem] fetch failed for ${url}:`, (err as Error).message);
    return null;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Look up canonical chem-identifier properties on PubChem by CID. Returns
 * `null` when PubChem is unreachable, returns a non-OK status, or returns a
 * payload that does not match the expected schema. Callers should fall back
 * to seed data on `null`.
 */
export async function getCompoundPropertiesByCid(
  cid: string,
): Promise<PubChemProperties | null> {
  const propUrl = `${BASE}/compound/cid/${cid}/property/${PROPS.join(",")}/JSON`;
  const props = await fetchJson(propUrl, PropertyTableSchema);
  if (!props) return null;
  const first = props.PropertyTable.Properties[0]!;
  const synUrl = `${BASE}/compound/cid/${cid}/synonyms/JSON`;
  const synData = await fetchJson(synUrl, SynonymsSchema);
  const synonyms = synData?.InformationList.Information[0]?.Synonym?.slice(0, 8);

  let mw: number | undefined;
  if (typeof first.MolecularWeight === "number") mw = first.MolecularWeight;
  else if (typeof first.MolecularWeight === "string") {
    const parsed = Number(first.MolecularWeight);
    mw = Number.isFinite(parsed) ? parsed : undefined;
  }

  return {
    cid,
    molecularFormula: first.MolecularFormula,
    molecularWeight: mw,
    canonicalSmiles: first.CanonicalSMILES,
    inchiKey: first.InChIKey,
    iupacName: first.IUPACName,
    synonyms,
    structure2dUrl: imageUrl(cid),
    citation: makeCitation(cid),
  };
}

export async function pubchemHealth(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}/compound/cid/681/property/MolecularFormula/JSON`, {
      next: { revalidate: 60 },
    });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

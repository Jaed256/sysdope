import type { Citation } from "@/types/citation";

export type HmdbEntry = {
  hmdbId: string;
  name?: string;
  description?: string;
  biospecimens?: string[];
  citation: Citation;
};

/**
 * STUB — HMDB does not expose a stable JSON REST API for free; full data
 * requires a downloaded XML dump under their license. For Phase 1 we link
 * to landing pages only.
 *
 * @see https://hmdb.ca/about
 */
export async function getHmdbEntry(
  hmdbId: string,
): Promise<HmdbEntry | null> {
  console.info(`[hmdb] adapter stub called for ${hmdbId} — returning null`);
  return null;
}

export async function hmdbHealth(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch("https://hmdb.ca/", { next: { revalidate: 60 } });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

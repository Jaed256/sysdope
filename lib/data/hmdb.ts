import type { Citation } from "@/types/citation";

/**
 * HMDB adapter — currently a documented STUB.
 *
 * Why no live calls?
 * ------------------
 * The Human Metabolome Database does not expose a free, public JSON REST API
 * for per-metabolite lookup. The only programmatic options are:
 *
 *   1. Per-metabolite XML files (e.g. https://hmdb.ca/metabolites/HMDB0000073.xml).
 *      These are large, would require an XML parser, and HMDB explicitly
 *      requests that automated traffic use the bulk download instead.
 *   2. The bulk dataset download (~hundreds of MB unzipped). This is the
 *      sanctioned path for production integrations and would be the right
 *      Phase 4+ approach: download once at build time, transform into a
 *      compact JSON index, and serve from a static asset.
 *   3. The HMDB MetaboAnalyst REST is for analytics, not lookup.
 *
 * Until Phase 4 implements the bulk-import path, callers receive `null` and
 * the API route falls back to seed data. The compound side drawer still
 * shows the seed HMDB id and a citation linking to the public web entry.
 *
 * @see https://hmdb.ca/about
 * @see https://hmdb.ca/downloads
 */

export type HmdbEntry = {
  hmdbId: string;
  name?: string;
  description?: string;
  formula?: string;
  citation: Citation;
};

export async function getHmdbEntry(hmdbId: string): Promise<HmdbEntry | null> {
  console.info(
    `[hmdb] adapter STUB called for ${hmdbId} — HMDB has no public JSON REST. ` +
      `Falling back to seed data; see lib/data/hmdb.ts header comment.`,
  );
  return null;
}

export async function hmdbHealth(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    // Liveness ping against the public landing page; HMDB will return HTML.
    const res = await fetch("https://hmdb.ca/", {
      method: "HEAD",
      next: { revalidate: 60 },
    });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

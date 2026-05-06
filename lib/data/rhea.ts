import type { Citation } from "@/types/citation";

export type RheaReaction = {
  rheaId: string;
  equation?: string;
  ecNumber?: string;
  citation: Citation;
};

/**
 * STUB — not yet implemented. Returns null + a low-confidence citation
 * placeholder so the UI knows to fall back to seed data. Wiring is
 * mechanical: replace this body with a Rhea API fetch + Zod validation.
 *
 * @see https://www.rhea-db.org/help/rest-api
 */
export async function getRheaReaction(
  rheaId: string,
): Promise<RheaReaction | null> {
  console.info(`[rhea] adapter stub called for ${rheaId} — returning null`);
  return null;
}

export async function rheaHealth(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch("https://www.rhea-db.org/rhea/?format=json&limit=1", {
      next: { revalidate: 60 },
    });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

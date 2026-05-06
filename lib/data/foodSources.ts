import type { Citation } from "@/types/citation";

export type FoodOccurrence = {
  foodName: string;
  amount?: string;
  unit?: string;
  citation: Citation;
};

/**
 * STUB — replace with USDA FoodData Central API / FooDB lookup. For Phase 1
 * the UI shows only verified seed claims (none yet) and clearly marks the
 * "natural sources" section as needing review.
 *
 * @see https://fdc.nal.usda.gov/api-guide.html
 */
export async function getFoodOccurrences(
  _compoundId: string,
): Promise<FoodOccurrence[]> {
  console.info(`[foodSources] adapter stub called — returning []`);
  return [];
}

export async function foodSourcesHealth(): Promise<{
  ok: boolean;
  latencyMs: number;
}> {
  const start = Date.now();
  try {
    const res = await fetch("https://fdc.nal.usda.gov/", {
      next: { revalidate: 60 },
    });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

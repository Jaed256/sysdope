import { describe, expect, it } from "vitest";
import { LESSONS, findLesson } from "@/lib/knowledge/lessons";
import { COFACTOR_KNOWLEDGE, findCofactor } from "@/lib/knowledge/cofactors";
import { SCENARIOS } from "@/lib/simulation/scenarios";
import { SEED_ENZYMES } from "@/lib/pathway/seedEnzymes";

const SCENARIO_IDS = new Set(SCENARIOS.map((s) => s.id));
const ENZYME_IDS = new Set(SEED_ENZYMES.map((e) => e.id));

describe("Phase 4 — lesson catalog", () => {
  it("ships the 6 canonical lessons from the SysDope spec", () => {
    expect(LESSONS).toHaveLength(6);
    const titles = LESSONS.map((l) => l.id);
    for (const id of [
      "th_bottleneck",
      "mao_inhibition",
      "aldh_dopal",
      "vmat2",
      "dat",
      "comt_hva",
    ]) {
      expect(titles).toContain(id);
    }
  });

  it("every lesson has body, watchFor, and at least one citation", () => {
    for (const l of LESSONS) {
      expect(l.title.length).toBeGreaterThan(5);
      expect(l.body.length).toBeGreaterThanOrEqual(2);
      for (const p of l.body) {
        expect(p.length).toBeGreaterThan(50);
      }
      expect(l.watchFor.length).toBeGreaterThanOrEqual(2);
      expect(l.citations.length).toBeGreaterThanOrEqual(1);
      for (const c of l.citations) {
        expect(c.sourceName).toBeTruthy();
        expect(c.url).toMatch(/^https?:\/\//);
        expect(c.confidence).toMatch(/^(high|medium|low)$/);
      }
    }
  });

  it("every lesson scenario id, when present, exists in SCENARIOS", () => {
    for (const l of LESSONS) {
      if (!l.scenarioId) continue;
      expect(SCENARIO_IDS.has(l.scenarioId)).toBe(true);
    }
  });

  it("findLesson resolves by id and returns undefined for unknowns", () => {
    expect(findLesson("th_bottleneck")?.id).toBe("th_bottleneck");
    expect(findLesson("nope")).toBeUndefined();
  });
});

describe("Phase 4 — cofactor knowledge base", () => {
  it("covers every cofactor mentioned by name in the SysDope brief", () => {
    const required = ["BH4", "Fe2", "PLP", "ascorbate", "Cu2", "O2", "FAD", "SAM", "NAD"];
    const ids = new Set(COFACTOR_KNOWLEDGE.map((c) => c.id));
    for (const r of required) expect(ids.has(r)).toBe(true);
  });

  it("every cofactor entry has at least one citation and a non-empty role", () => {
    for (const c of COFACTOR_KNOWLEDGE) {
      expect(c.role.length).toBeGreaterThan(40);
      expect(c.citations.length).toBeGreaterThanOrEqual(1);
      for (const cit of c.citations) {
        expect(cit.sourceName).toBeTruthy();
        expect(cit.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it("every cofactor.enzymes id corresponds to a real seed enzyme", () => {
    for (const c of COFACTOR_KNOWLEDGE) {
      for (const eid of c.enzymes) {
        expect(ENZYME_IDS.has(eid)).toBe(true);
      }
    }
  });

  it("findCofactor matches by id, alias (case-insensitive), and prefix", () => {
    expect(findCofactor("BH4")?.id).toBe("BH4");
    expect(findCofactor("tetrahydrobiopterin")?.id).toBe("BH4");
    expect(findCofactor("Pyridoxal 5'-phosphate")?.id).toBe("PLP");
    expect(findCofactor("vitamin b6")?.id).toBe("PLP");
    expect(findCofactor("BH4 (tetrahydrobiopterin)")?.id).toBe("BH4");
    expect(findCofactor("not a cofactor")).toBeUndefined();
  });

  it("seed enzyme cofactor strings resolve to known knowledge entries where applicable", () => {
    const knownAliases = COFACTOR_KNOWLEDGE.flatMap((c) => c.aliases.map((a) => a.toLowerCase()));
    let resolved = 0;
    let total = 0;
    for (const e of SEED_ENZYMES) {
      for (const c of e.cofactors ?? []) {
        total += 1;
        const lower = c.toLowerCase();
        if (
          knownAliases.some((a) => lower === a || lower.startsWith(a))
        ) {
          resolved += 1;
        }
      }
    }
    // We don't require 100% (e.g. compound descriptors like "BH4 (tetrahydrobiopterin)"
    // resolve via prefix). Require ≥ 80%.
    expect(resolved / Math.max(1, total)).toBeGreaterThan(0.8);
  });
});

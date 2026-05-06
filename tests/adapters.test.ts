import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getUniProtEntry } from "@/lib/data/uniprot";
import { getRheaReactionsByEc } from "@/lib/data/rhea";
import { getChebiEntry } from "@/lib/data/chebi";
import { searchLiterature } from "@/lib/data/literature";

type FetchInit = RequestInit & { signal?: AbortSignal };

function mockFetch(handler: (url: string, init?: FetchInit) => Response | Promise<Response>) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(((input: RequestInfo | URL, init?: FetchInit) => {
      const url = typeof input === "string" ? input : input.toString();
      return Promise.resolve(handler(url, init));
    }) as typeof fetch);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UniProt adapter", () => {
  it("parses a typical UniProt entry into the normalized shape", async () => {
    mockFetch((url) => {
      expect(url).toContain("rest.uniprot.org/uniprotkb/P00439.json");
      return jsonResponse({
        primaryAccession: "P00439",
        proteinDescription: {
          recommendedName: {
            fullName: { value: "Phenylalanine-4-hydroxylase" },
            ecNumbers: [{ value: "1.14.16.1" }],
          },
        },
        genes: [{ geneName: { value: "PAH" } }],
        comments: [
          {
            commentType: "FUNCTION",
            texts: [{ value: "Catalyzes the conversion of L-Phe to L-Tyr." }],
          },
          {
            commentType: "CATALYTIC ACTIVITY",
            reaction: {
              name: "L-phenylalanine + O2 + (6R)-6-(L-erythro-1,2-dihydroxypropyl)-5,6,7,8-tetrahydropterin = L-tyrosine + 6-(L-erythro-1,2-dihydroxypropyl)-7,8-dihydropterin + H2O",
              ecNumber: "1.14.16.1",
              reactionCrossReferences: [
                { database: "Rhea", id: "RHEA:20273" },
              ],
            },
          },
          {
            commentType: "SUBCELLULAR LOCATION",
            subcellularLocations: [{ location: { value: "Cytoplasm" } }],
          },
          {
            commentType: "DISEASE",
            disease: {
              diseaseId: "Phenylketonuria",
              acronym: "PKU",
              description: "Autosomal recessive disorder.",
            },
          },
        ],
      });
    });

    const entry = await getUniProtEntry("P00439");
    expect(entry).not.toBeNull();
    expect(entry!.uniprotId).toBe("P00439");
    expect(entry!.proteinName).toBe("Phenylalanine-4-hydroxylase");
    expect(entry!.geneSymbol).toBe("PAH");
    expect(entry!.ecNumber).toBe("1.14.16.1");
    expect(entry!.function).toContain("L-Phe to L-Tyr");
    expect(entry!.subcellularLocations).toEqual(["Cytoplasm"]);
    expect(entry!.diseases).toHaveLength(1);
    expect(entry!.diseases[0]!.name).toBe("Phenylketonuria");
    expect(entry!.catalyticActivities).toHaveLength(1);
    expect(entry!.catalyticActivities[0]!.rheaId).toBe("RHEA:20273");
    expect(entry!.citation.confidence).toBe("high");
    expect(entry!.citation.url).toContain("uniprot.org");
  });

  it("returns null on schema mismatch", async () => {
    mockFetch(() => jsonResponse({ unexpected: "shape" }));
    const entry = await getUniProtEntry("P00439");
    expect(entry).toBeNull();
  });

  it("returns null on network error", async () => {
    mockFetch(() => {
      throw new Error("ECONNREFUSED");
    });
    const entry = await getUniProtEntry("P00439");
    expect(entry).toBeNull();
  });

  it("returns null on non-2xx", async () => {
    mockFetch(() => jsonResponse({}, 500));
    const entry = await getUniProtEntry("P00439");
    expect(entry).toBeNull();
  });
});

describe("Rhea adapter", () => {
  it("parses by-EC search results", async () => {
    const spy = mockFetch(() =>
      jsonResponse({
        count: 1,
        results: [
          {
            id: 18661,
            equation: "L-tyrosine + O2 + BH4 = L-DOPA + BH2 + H2O",
            ec: ["1.14.16.2"],
          },
        ],
      }),
    );

    const out = await getRheaReactionsByEc("1.14.16.2", 5);
    expect(spy).toHaveBeenCalledOnce();
    const calledUrl = (spy.mock.calls[0]![0] as string | URL).toString();
    expect(decodeURIComponent(calledUrl)).toContain("ec:1.14.16.2");
    expect(out).toHaveLength(1);
    expect(out[0]!.rheaId).toBe("18661");
    expect(out[0]!.equation).toContain("L-DOPA");
    expect(out[0]!.ecNumbers).toEqual(["1.14.16.2"]);
    expect(out[0]!.citation.url).toContain("rhea-db.org/rhea/18661");
  });

  it("returns empty array when API returns no results", async () => {
    mockFetch(() => jsonResponse({ count: 0, results: [] }));
    const out = await getRheaReactionsByEc("9.99.99.99");
    expect(out).toEqual([]);
  });

  it("returns empty array on schema mismatch", async () => {
    mockFetch(() => jsonResponse("not an object"));
    const out = await getRheaReactionsByEc("1.14.16.2");
    expect(out).toEqual([]);
  });
});

describe("ChEBI adapter", () => {
  it("parses an OLS term response", async () => {
    mockFetch((url) => {
      expect(url).toContain("ols4/api/ontologies/chebi/terms");
      expect(url).toContain("CHEBI%3A18243");
      return jsonResponse({
        _embedded: {
          terms: [
            {
              obo_id: "CHEBI:18243",
              label: "dopamine",
              description: ["A catecholamine neurotransmitter."],
              annotation: {
                formula: ["C8H11NO2"],
                smiles: ["C1=CC(=C(C=C1CCN)O)O"],
              },
            },
          ],
        },
      });
    });

    const out = await getChebiEntry("18243");
    expect(out).not.toBeNull();
    expect(out!.chebiId).toBe("CHEBI:18243");
    expect(out!.name).toBe("dopamine");
    expect(out!.formula).toBe("C8H11NO2");
    expect(out!.smiles).toContain("CCN");
    expect(out!.citation.confidence).toBe("high");
  });

  it("accepts both prefixed and bare ChEBI IDs", async () => {
    let observedUrl = "";
    mockFetch((url) => {
      observedUrl = url;
      return jsonResponse({ _embedded: { terms: [] } });
    });
    await getChebiEntry("CHEBI:18243");
    expect(observedUrl).toContain("CHEBI%3A18243");
  });

  it("returns null when no terms are found", async () => {
    mockFetch(() => jsonResponse({ _embedded: { terms: [] } }));
    const out = await getChebiEntry("999999999");
    expect(out).toBeNull();
  });
});

describe("Literature adapter (Europe PMC)", () => {
  it("normalizes a typical search response", async () => {
    const spy = mockFetch(() =>
      jsonResponse({
        hitCount: 2,
        resultList: {
          result: [
            {
              id: "12345678",
              source: "MED",
              pmid: "12345678",
              doi: "10.1234/example",
              title: "Tyrosine hydroxylase rate-limiting step",
              abstractText: "We show that TH is rate-limiting...",
              authorString: "Smith J, Doe A.",
              journalTitle: "J Neurosci",
              pubYear: "2024",
            },
            {
              id: "1",
              title: "second hit with no abstract",
            },
          ],
        },
      }),
    );

    const out = await searchLiterature("tyrosine hydroxylase");
    expect(spy).toHaveBeenCalledOnce();
    const calledUrl = (spy.mock.calls[0]![0] as string | URL).toString();
    expect(calledUrl).toContain("/europepmc/webservices/rest/search");
    expect(calledUrl).toContain("query=tyrosine+hydroxylase");
    expect(out).toHaveLength(2);
    expect(out[0]!.pmid).toBe("12345678");
    expect(out[0]!.year).toBe(2024);
    expect(out[0]!.url).toContain("europepmc.org/article/MED/12345678");
    expect(out[0]!.citation.sourceType).toBe("paper");
    expect(out[0]!.citation.pmid).toBe("12345678");
  });

  it("returns empty array for empty query", async () => {
    const spy = mockFetch(() => jsonResponse({}));
    const out = await searchLiterature("   ");
    expect(out).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("clamps the limit to 25", async () => {
    let observedUrl = "";
    mockFetch((url) => {
      observedUrl = url;
      return jsonResponse({ resultList: { result: [] } });
    });
    await searchLiterature("dopamine", { limit: 9999 });
    expect(observedUrl).toContain("pageSize=25");
  });

  it("survives non-2xx responses", async () => {
    mockFetch(() => jsonResponse({ error: "rate limited" }, 429));
    const out = await searchLiterature("anything");
    expect(out).toEqual([]);
  });
});

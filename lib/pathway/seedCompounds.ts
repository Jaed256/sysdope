import type { Compound } from "@/types/compound";
import type { Citation } from "@/types/citation";

/**
 * SEED COMPOUND DATA — Phase 1.
 *
 * Every compound includes one or more `Citation` placeholders pointing at the
 * relevant PubChem / HMDB landing page. Confidence is `low` because the
 * specific values shown in the UI (formulas, weights, IUPAC names) should be
 * fetched from the live PubChem adapter and merged on top of the seed via
 * `lib/data/normalize.ts`. Until that happens the UI must show citations.
 */

const ACCESSED = "2026-05-05";

function pubchemCite(cid: string): Citation {
  return {
    sourceName: "PubChem",
    sourceType: "database",
    title: `PubChem CID ${cid}`,
    url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
    accessedAt: ACCESSED,
    confidence: "low",
  };
}

function hmdbCite(hmdbId: string): Citation {
  return {
    sourceName: "HMDB",
    sourceType: "database",
    title: `HMDB ${hmdbId}`,
    url: `https://hmdb.ca/metabolites/${hmdbId}`,
    accessedAt: ACCESSED,
    confidence: "low",
  };
}

function chebiCite(chebiId: string): Citation {
  return {
    sourceName: "ChEBI",
    sourceType: "database",
    title: `ChEBI:${chebiId}`,
    url: `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:${chebiId}`,
    accessedAt: ACCESSED,
    confidence: "low",
  };
}

/** Low-confidence note for simulated graph nodes — not PubChem/ChEBI chemical entities. */
function educationalNodeCite(label: string): Citation {
  return {
    sourceName: "SysDope authoring",
    sourceType: "manual",
    title: `${label} — pedagogical abstraction`,
    accessedAt: ACCESSED,
    confidence: "low",
  };
}

export const SEED_COMPOUNDS: Compound[] = [
  {
    id: "phenylalanine",
    name: "L-Phenylalanine",
    aliases: ["Phe", "F"],
    compoundClass: "amino_acid",
    pubchemCid: "6140",
    hmdbId: "HMDB0000159",
    chebiId: "17295",
    endogenousRole:
      "Essential aromatic amino acid; precursor to tyrosine via PAH and to multiple catecholamines downstream.",
    citations: [
      pubchemCite("6140"),
      hmdbCite("HMDB0000159"),
      chebiCite("17295"),
    ],
  },
  {
    id: "tyrosine",
    name: "L-Tyrosine",
    aliases: ["Tyr", "Y"],
    compoundClass: "amino_acid",
    pubchemCid: "6057",
    hmdbId: "HMDB0000158",
    chebiId: "17895",
    endogenousRole:
      "Conditionally essential aromatic amino acid; direct substrate of tyrosine hydroxylase (TH) on the catecholamine pathway.",
    citations: [
      pubchemCite("6057"),
      hmdbCite("HMDB0000158"),
      chebiCite("17895"),
    ],
  },
  {
    id: "l_dopa",
    name: "L-DOPA",
    aliases: ["Levodopa", "L-3,4-dihydroxyphenylalanine"],
    compoundClass: "amino_acid",
    pubchemCid: "6047",
    hmdbId: "HMDB0000181",
    chebiId: "15765",
    endogenousRole:
      "Direct precursor of dopamine; product of TH on tyrosine.",
    citations: [
      pubchemCite("6047"),
      hmdbCite("HMDB0000181"),
      chebiCite("15765"),
    ],
  },
  {
    id: "dopamine",
    name: "Dopamine",
    aliases: ["DA", "3,4-dihydroxyphenethylamine"],
    compoundClass: "neurotransmitter",
    pubchemCid: "681",
    hmdbId: "HMDB0000073",
    chebiId: "18243",
    endogenousRole:
      "Catecholamine neurotransmitter; signals via D1–D5 receptors and is the immediate precursor of norepinephrine.",
    citations: [
      pubchemCite("681"),
      hmdbCite("HMDB0000073"),
      chebiCite("18243"),
    ],
  },
  {
    id: "norepinephrine",
    name: "Norepinephrine",
    aliases: ["NE", "Noradrenaline"],
    compoundClass: "catecholamine",
    pubchemCid: "439260",
    hmdbId: "HMDB0000216",
    chebiId: "18357",
    endogenousRole:
      "Catecholamine neurotransmitter and hormone; β-hydroxylated product of dopamine via DBH.",
    citations: [
      pubchemCite("439260"),
      hmdbCite("HMDB0000216"),
      chebiCite("18357"),
    ],
  },
  {
    id: "epinephrine",
    name: "Epinephrine",
    aliases: ["Epi", "Adrenaline"],
    compoundClass: "catecholamine",
    pubchemCid: "5816",
    hmdbId: "HMDB0000068",
    chebiId: "28918",
    endogenousRole:
      "N-methylated catecholamine produced from norepinephrine by PNMT.",
    citations: [
      pubchemCite("5816"),
      hmdbCite("HMDB0000068"),
      chebiCite("28918"),
    ],
  },
  {
    id: "dopal",
    name: "DOPAL",
    aliases: ["3,4-Dihydroxyphenylacetaldehyde"],
    compoundClass: "metabolite",
    pubchemCid: "119219",
    hmdbId: "HMDB0003791",
    endogenousRole:
      "Reactive aldehyde intermediate produced when MAO oxidizes cytosolic dopamine; rapidly cleared by ALDH to DOPAC under healthy conditions.",
    citations: [
      pubchemCite("119219"),
      hmdbCite("HMDB0003791"),
    ],
  },
  {
    id: "dopac",
    name: "DOPAC",
    aliases: ["3,4-Dihydroxyphenylacetic acid"],
    compoundClass: "metabolite",
    pubchemCid: "547",
    hmdbId: "HMDB0001336",
    chebiId: "41941",
    endogenousRole:
      "Major intracellular dopamine metabolite; ALDH product of DOPAL, further methylated by COMT to HVA.",
    citations: [
      pubchemCite("547"),
      hmdbCite("HMDB0001336"),
      chebiCite("41941"),
    ],
  },
  {
    id: "three_mt",
    name: "3-Methoxytyramine",
    aliases: ["3-MT"],
    compoundClass: "metabolite",
    pubchemCid: "1666",
    hmdbId: "HMDB0001456",
    chebiId: "1582",
    endogenousRole:
      "Extracellular dopamine metabolite produced by COMT; substrate for MAO downstream.",
    citations: [
      pubchemCite("1666"),
      hmdbCite("HMDB0001456"),
      chebiCite("1582"),
    ],
  },
  {
    id: "mhpa",
    name: "MHPA / 3-MOPET aldehyde",
    aliases: [
      "3-Methoxy-4-hydroxyphenylacetaldehyde",
      "3-MOPET aldehyde",
    ],
    compoundClass: "metabolite",
    hmdbId: "HMDB0004074",
    endogenousRole:
      "Aldehyde intermediate on the COMT/MAO route from 3-MT to homovanillic acid; rapidly oxidized by ALDH.",
    citations: [hmdbCite("HMDB0004074")],
  },
  {
    id: "hva",
    name: "Homovanillic acid",
    aliases: ["HVA", "4-Hydroxy-3-methoxyphenylacetic acid"],
    compoundClass: "metabolite",
    pubchemCid: "1738",
    hmdbId: "HMDB0000118",
    chebiId: "545959",
    endogenousRole:
      "Terminal urinary metabolite of dopamine; reflects combined MAO + COMT degradation flux.",
    citations: [
      pubchemCite("1738"),
      hmdbCite("HMDB0000118"),
      chebiCite("545959"),
    ],
  },
  {
    id: "normetanephrine",
    name: "Normetanephrine",
    aliases: ["NMN"],
    compoundClass: "metabolite",
    pubchemCid: "12012",
    hmdbId: "HMDB0000819",
    chebiId: "7634",
    endogenousRole:
      "O-methylated metabolite of norepinephrine produced by COMT.",
    citations: [
      pubchemCite("12012"),
      hmdbCite("HMDB0000819"),
      chebiCite("7634"),
    ],
  },
  {
    id: "metanephrine",
    name: "Metanephrine",
    aliases: ["MN"],
    compoundClass: "metabolite",
    pubchemCid: "5917",
    hmdbId: "HMDB0004063",
    chebiId: "67163",
    endogenousRole:
      "O-methylated metabolite of epinephrine produced by COMT.",
    citations: [
      pubchemCite("5917"),
      hmdbCite("HMDB0004063"),
      chebiCite("67163"),
    ],
  },
  {
    id: "dopaquinone",
    name: "Dopaquinone",
    aliases: ["L-Dopaquinone"],
    compoundClass: "pigment_precursor",
    pubchemCid: "439316",
    chebiId: "57812",
    endogenousRole:
      "Reactive ortho-quinone produced when tyrosinase oxidizes L-DOPA in melanocytes; precursor of dopachrome and downstream melanins.",
    citations: [
      pubchemCite("439316"),
      chebiCite("57812"),
    ],
  },
  {
    id: "dopachrome",
    name: "Dopachrome",
    aliases: ["Indol-5,6-quinone-2-carboxylic acid"],
    compoundClass: "pigment_precursor",
    pubchemCid: "440773",
    chebiId: "30838",
    endogenousRole:
      "Cyclized intermediate downstream of dopaquinone in melanin biosynthesis.",
    citations: [
      pubchemCite("440773"),
      chebiCite("30838"),
    ],
  },
  {
    id: "melanin",
    name: "Melanin",
    aliases: ["Eumelanin"],
    compoundClass: "pigment",
    pubchemCid: "6325610",
    endogenousRole:
      "Polymeric pigment produced from catechol intermediates via tyrosinase in melanocytes.",
    citations: [pubchemCite("6325610")],
  },
  ...(
    [
      ["postsynaptic_d1", "D1 pathway drive", "DRD1", "P21728"] as const,
      ["postsynaptic_d2", "D2 pathway drive", "DRD2", "P14416"] as const,
      ["postsynaptic_d3", "D3 pathway drive", "DRD3", "P35462"] as const,
      ["postsynaptic_d4", "D4 pathway drive", "DRD4", "P21917"] as const,
      ["postsynaptic_d5", "D5 pathway drive", "DRD5", "P21918"] as const,
    ] as const
  ).map(
    ([id, title, gene, acc]): Compound => ({
      id,
      name: `${title} (relative simulation units)`,
      aliases: [`${gene} activation`, "postsynaptic drive"],
      compoundClass: "simulation_state",
      endogenousRole:
        "Pedagogical graph node summarizing dopamine-dependent postsynaptic engagement with " +
        `${gene}: it aggregates signaling visually and intentionally does not conserve ` +
        "dopamine mass (real binding is reversible and coupled to downstream effectors). " +
        `Receptor biology: UniProt ${acc}.`,
      citations: [
        educationalNodeCite(title),
        {
          sourceName: "UniProt",
          sourceType: "database",
          title: `${gene} dopamine receptor`,
          url: `https://www.uniprot.org/uniprotkb/${acc}/entry`,
          accessedAt: ACCESSED,
          confidence: "high",
        } satisfies Citation,
      ],
    }),
  ),
];

export function findSeedCompound(id: string): Compound | undefined {
  return SEED_COMPOUNDS.find((c) => c.id === id);
}

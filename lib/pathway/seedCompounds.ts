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

function usdaFoodDataCentralCite(): Citation {
  return {
    sourceName: "USDA FoodData Central",
    sourceType: "government",
    title: "USDA FoodData Central — national nutrient and food composition browser",
    url: "https://fdc.nal.usda.gov/",
    accessedAt: ACCESSED,
    confidence: "medium",
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
      "Essential aromatic amino acid imported from diet; in hepatocytes PAH uses (6R)-BH₄ and O₂ to hydroxylate the phenyl ring, producing L-tyrosine as the gateway to catecholamine biosynthesis in other tissues.",
    citations: [
      pubchemCite("6140"),
      hmdbCite("HMDB0000159"),
      chebiCite("17295"),
    ],
    naturalOccurrence: [
      {
        label: "Protein-rich foods (examples: legumes, nuts, eggs, dairy, meats)",
        dietaryRole:
          "Indispensable amino acid incorporated into proteins; in the liver, PAH also uses dietary phenylalanine as substrate for hydroxylation to tyrosine.",
        evidence:
          "Phenylalanine density varies widely by food and preparation. Look up specific commodities in USDA FoodData Central rather than assuming a single canonical concentration.",
        citations: [usdaFoodDataCentralCite()],
      },
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
      "Aromatic amino acid made from phenylalanine (PAH) or taken up from diet; tyrosine hydroxylase (TH) is the committed step that installs the catechol ring of L-DOPA using (6R)-BH₄ and O₂, so tyrosine availability and BH₄ pools jointly gate dopamine synthesis.",
    citations: [
      pubchemCite("6057"),
      hmdbCite("HMDB0000158"),
      chebiCite("17895"),
    ],
    naturalOccurrence: [
      {
        label: "Dietary protein sources (similar spread to other amino acids)",
        dietaryRole:
          "Tyrosine can be supplied fully from diet or spared when phenylalanine is adequate (PAH makes tyrosine from phenylalanine); it is the direct amino-acid substrate pool for TH in catecholamine neurons.",
        evidence:
          "Use FoodData Central to compare tyrosine content across branded foods; values are not interchangeable between products.",
        citations: [usdaFoodDataCentralCite()],
      },
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
      "L-DOPA (levodopa) is the immediate biochemical precursor to dopamine: aromatic L-amino-acid decarboxylase (DDC / AADC) removes the carboxyl group to form dopamine. " +
      "In Parkinson disease, oral levodopa (almost always combined with a peripheral DDC inhibitor such as carbidopa or benserazide) is a mainstay symptomatic therapy because it augments substrate delivery for the remaining AADC activity even when endogenous TH-dependent L-DOPA synthesis falls; clinical dosing, motor complications, and contraindications are outside this toy model—see StatPearls and product labels.",
    citations: [
      pubchemCite("6047"),
      hmdbCite("HMDB0000181"),
      chebiCite("15765"),
      {
        sourceName: "NCBI Bookshelf",
        sourceType: "database",
        title: "StatPearls — Parkinson disease (levodopa therapy overview)",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK536722/",
        accessedAt: ACCESSED,
        confidence: "low",
      },
    ],
    naturalOccurrence: [
      {
        label: "Mucuna and other legumes (historical / complementary contexts)",
        dietaryRole:
          "Levodopa is the immediate precursor to dopamine in AADC-expressing tissues; oral levodopa (almost always with a peripheral DDC inhibitor in modern therapy) is the pharmacologic standard, distinct from uncontrolled dietary sources.",
        evidence:
          "Some legumes contain L-DOPA as a natural product, but content is variable and not a substitute for regulated drug products; see StatPearls for clinical context and use FoodData Central only for commodity-specific composition questions.",
        citations: [usdaFoodDataCentralCite(), pubchemCite("6047")],
      },
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
      "Catecholamine neurotransmitter packaged in vesicles (VMAT2), released into the synaptic cleft, acting on D1–D5 receptors, and cleared by reuptake (DAT) plus COMT/MAO catabolism. " +
      "At neutral-to-basic pH in aqueous media, dopamine can also undergo metal-free or metal-catalysed autoxidation toward quinones and ROS co-products; in SysDope that chemistry is represented only as a *schematic* extra sink competing with enzymatic clearance (relative simulation units), informed qualitatively by autoxidation literature—not as a calibrated brain concentration model.",
    citations: [
      pubchemCite("681"),
      hmdbCite("HMDB0000073"),
      chebiCite("18243"),
      {
        sourceName: "Journal of the Chemical Society, Perkin Transactions 2",
        sourceType: "paper",
        title: "Aqueous dopamine autoxidation / O₂ chemistry (qualitative context for ROS teaching)",
        doi: "10.1039/P29950000259",
        url: "https://doi.org/10.1039/P29950000259",
        accessedAt: ACCESSED,
        confidence: "high",
      },
      {
        sourceName: "Frontiers in Molecular Neuroscience",
        sourceType: "paper",
        title: "pH dependence of dopamine autoxidation (mechanistic context)",
        doi: "10.3389/fnmol.2018.00467",
        url: "https://doi.org/10.3389/fnmol.2018.00467",
        accessedAt: ACCESSED,
        confidence: "high",
      },
    ],
    naturalOccurrence: [
      {
        label: "Trace biogenic amines in plant or fermented foods (qualitative)",
        dietaryRole:
          "Dopamine can appear at trace levels in certain foods, but meaningful CNS dopaminergic signaling is not achieved by diet alone; peripheral metabolism and the blood–brain barrier limit dietary relevance compared with L-DOPA therapy.",
        evidence:
          "Treat any single food concentration as non-authoritative here—use FoodData Central for commodity-specific queries and primary literature for mechanism.",
        citations: [usdaFoodDataCentralCite(), pubchemCite("681")],
      },
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
      "β-Hydroxylated catecholamine: DBH converts dopamine to norepinephrine inside vesicles using O₂, Cu(II), and ascorbate as reductant; NE is released, acts on adrenergic receptors, and is methylated by COMT to normetanephrine extracellularly.",
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
      "Adrenal medulla and selected CNS neurons use PNMT to N-methylate norepinephrine with SAM, yielding epinephrine; COMT converts extracellular epinephrine to metanephrine for clearance.",
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
      "Reactive o-quinone formed enzymatically from L-DOPA or L-tyrosine by tyrosinase in melanocytes (melanin branch). Dopamine can also be oxidised to aminochrome / quinone chemistry under autoxidation or metal-catalysed pathways in vitro; SysDope lumps non-enzymatic dopamine loss into this node for teaching only.",
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
  {
    id: "da_autooxidation_stress",
    name: "Dopamine auto-oxidation load (relative simulation units)",
    aliases: ["oxidative tone", "quinone load"],
    compoundClass: "simulation_state",
    endogenousRole:
      "Pedagogical aggregate: SysDope routes a small fraction of cytosolic + synaptic dopamine toward a dopaquinone-like pool whenever the *modelled* enzymatic clearance capacity (MAO-B, COMT, plus ALDH/MAO-A weights in `dopamineModulation.ts`) is low relative to dopamine burden. " +
      "The functional form is inspired by aqueous autoxidation studies reporting O₂-dependent oxidation and strong pH sensitivity (see DOIs on the dopamine compound card), but numeric outputs remain arbitrary relative simulation units—not moles, ng/mL, or patient-specific predictions.",
    citations: [
      educationalNodeCite("Auto-oxidation load"),
      {
        sourceName: "Journal of the Chemical Society, Perkin Transactions 2",
        sourceType: "paper",
        title: "Spontaneous autoxidation of dopamine (kinetic context)",
        doi: "10.1039/P29950000259",
        url: "https://doi.org/10.1039/P29950000259",
        accessedAt: ACCESSED,
        confidence: "high",
      },
      {
        sourceName: "Frontiers in Molecular Neuroscience",
        sourceType: "paper",
        title: "Dopamine autoxidation is controlled by acidic pH",
        doi: "10.3389/fnmol.2018.00467",
        url: "https://doi.org/10.3389/fnmol.2018.00467",
        accessedAt: ACCESSED,
        confidence: "high",
      },
    ],
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

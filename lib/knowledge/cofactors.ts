import type { Citation } from "@/types/citation";

const ACCESSED = "2026-05-05";

function pubchem(cid: string, title: string): Citation {
  return {
    sourceName: "PubChem",
    sourceType: "database",
    title,
    url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
    accessedAt: ACCESSED,
    confidence: "high",
  };
}

function chebi(id: string, title: string): Citation {
  return {
    sourceName: "ChEBI",
    sourceType: "database",
    title,
    url: `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:${id}`,
    accessedAt: ACCESSED,
    confidence: "high",
  };
}

export type CofactorEntry = {
  /** Stable internal id used by the UI for tooltip lookup. */
  id: string;
  /** Aliases that may appear in `Enzyme.cofactors` strings. */
  aliases: string[];
  /** Human-readable display name. */
  name: string;
  /** Short scientific role description. Plain prose, no marketing. */
  role: string;
  /** Pathway-relevant enzymes that depend on this cofactor (seed enzyme ids). */
  enzymes: string[];
  /** Where the cofactor is regenerated or where the cell takes it from. */
  regeneration?: string;
  pubchemCid?: string;
  chebiId?: string;
  citations: Citation[];
};

export const COFACTOR_KNOWLEDGE: CofactorEntry[] = [
  {
    id: "BH4",
    aliases: ["BH4", "tetrahydrobiopterin", "(6R)-6-(L-erythro-1,2-dihydroxypropyl)-5,6,7,8-tetrahydropterin"],
    name: "Tetrahydrobiopterin (BH4)",
    role:
      "Hydroxyl-group-providing electron donor for the aromatic amino acid hydroxylases. " +
      "PAH (Phe → Tyr) and TH (Tyr → L-DOPA) both consume BH4 stoichiometrically and yield BH2 (q-dihydrobiopterin), which is reduced back to BH4 by dihydropteridine reductase (QDPR).",
    enzymes: ["pah", "th"],
    regeneration: "QDPR-catalysed reduction of BH2 with NADH.",
    pubchemCid: "1126",
    chebiId: "15642",
    citations: [
      pubchem("1126", "PubChem CID 1126 — tetrahydrobiopterin"),
      chebi("15642", "ChEBI:15642 — (6R)-tetrahydrobiopterin"),
    ],
  },
  {
    id: "Fe2",
    aliases: ["Fe(II)", "iron", "Fe2+", "ferrous iron"],
    name: "Iron (Fe(II))",
    role:
      "Catalytic non-heme iron centre in PAH and TH active sites. The Fe(II) ion binds O2 and helps form the hydroxylating intermediate in concert with BH4.",
    enzymes: ["pah", "th"],
    regeneration: "Recovered locally inside the active site; cellular pool fed by transferrin / labile iron pool.",
    pubchemCid: "27284",
    chebiId: "29033",
    citations: [
      pubchem("27284", "PubChem CID 27284 — iron(II) cation"),
      chebi("29033", "ChEBI:29033 — iron(2+)"),
    ],
  },
  {
    id: "PLP",
    aliases: ["PLP", "pyridoxal 5'-phosphate", "pyridoxal-5-phosphate", "vitamin B6", "B6"],
    name: "Pyridoxal 5′-phosphate (PLP, vitamin B6)",
    role:
      "Schiff-base-forming cofactor for DDC / AADC. PLP holds the substrate's α-amino group via an aldimine while DDC removes the carboxyl group to make dopamine from L-DOPA.",
    enzymes: ["ddc"],
    regeneration: "Regenerated each catalytic cycle; cellular PLP pool is fed by dietary B6 (pyridoxine).",
    pubchemCid: "1051",
    chebiId: "18405",
    citations: [
      pubchem("1051", "PubChem CID 1051 — pyridoxal 5′-phosphate"),
      chebi("18405", "ChEBI:18405 — pyridoxal 5′-phosphate"),
    ],
  },
  {
    id: "ascorbate",
    aliases: ["ascorbate", "ascorbic acid", "vitamin C"],
    name: "Ascorbate (vitamin C)",
    role:
      "Two-electron reductant for DBH. DBH oxidises dopamine to noradrenaline using O2 and copper, and ascorbate is the physiological electron donor that re-reduces the active-site copper between catalytic cycles.",
    enzymes: ["dbh"],
    regeneration: "Vesicular ascorbate is replenished from the cytosolic pool, which depends on dietary intake.",
    pubchemCid: "54670067",
    chebiId: "29073",
    citations: [
      pubchem("54670067", "PubChem CID 54670067 — L-ascorbic acid"),
      chebi("29073", "ChEBI:29073 — L-ascorbate"),
    ],
  },
  {
    id: "Cu2",
    aliases: ["Cu(II)", "copper", "Cu2+"],
    name: "Copper (Cu(II))",
    role:
      "Active-site catalytic copper ion in DBH and tyrosinase (TYR). The copper centre activates O2 for the catechol/aromatic hydroxylation steps.",
    enzymes: ["dbh", "tyr"],
    regeneration: "Tightly bound to the protein; cellular Cu pool maintained by chaperones (ATOX1/CCS).",
    pubchemCid: "27099",
    chebiId: "29036",
    citations: [
      pubchem("27099", "PubChem CID 27099 — copper(II) cation"),
      chebi("29036", "ChEBI:29036 — copper(2+)"),
    ],
  },
  {
    id: "O2",
    aliases: ["O2", "molecular oxygen", "dioxygen"],
    name: "Molecular oxygen (O2)",
    role:
      "Co-substrate for every monooxygenase / oxidase on the catecholamine pathway: PAH, TH, DBH, MAO-A, MAO-B, and TYR all consume O2.",
    enzymes: ["pah", "th", "dbh", "mao_a", "mao_b", "tyr"],
    regeneration: "Atmospheric / haemoglobin-delivered.",
    pubchemCid: "977",
    chebiId: "15379",
    citations: [
      pubchem("977", "PubChem CID 977 — O2"),
      chebi("15379", "ChEBI:15379 — dioxygen"),
    ],
  },
  {
    id: "FAD",
    aliases: ["FAD", "flavin adenine dinucleotide"],
    name: "Flavin adenine dinucleotide (FAD)",
    role:
      "Tightly bound prosthetic group for MAO-A and MAO-B. The flavin accepts electrons from the substrate amine during oxidative deamination; H2O2 is released as a by-product.",
    enzymes: ["mao_a", "mao_b"],
    regeneration: "Re-oxidised in situ by O2 within each catalytic cycle.",
    pubchemCid: "643975",
    chebiId: "16238",
    citations: [
      pubchem("643975", "PubChem CID 643975 — FAD"),
      chebi("16238", "ChEBI:16238 — FAD"),
    ],
  },
  {
    id: "SAM",
    aliases: ["SAM", "S-adenosyl-L-methionine", "S-adenosyl methionine", "AdoMet"],
    name: "S-adenosyl-L-methionine (SAM)",
    role:
      "Methyl-group donor for COMT (catechol-O-methylation) and PNMT (norepinephrine → epinephrine). Each transfer leaves S-adenosyl-L-homocysteine (SAH) behind.",
    enzymes: ["comt", "pnmt"],
    regeneration: "SAH → homocysteine → methionine cycle (methionine synthase, B12, folate-dependent).",
    pubchemCid: "34755",
    chebiId: "15414",
    citations: [
      pubchem("34755", "PubChem CID 34755 — S-adenosyl-L-methionine"),
      chebi("15414", "ChEBI:15414 — S-adenosyl-L-methionine"),
    ],
  },
  {
    id: "NAD",
    aliases: ["NAD+", "NAD", "nicotinamide adenine dinucleotide"],
    name: "Nicotinamide adenine dinucleotide (NAD+)",
    role:
      "Hydride acceptor for ALDH-catalysed oxidation of DOPAL → DOPAC and MHPA → HVA. NAD+ is consumed and NADH is released.",
    enzymes: ["aldh"],
    regeneration: "Regenerated by mitochondrial respiration (electron transport chain) and salvage pathways.",
    pubchemCid: "5893",
    chebiId: "15846",
    citations: [
      pubchem("5893", "PubChem CID 5893 — NAD+"),
      chebi("15846", "ChEBI:15846 — NAD+"),
    ],
  },
  {
    id: "Mg2",
    aliases: ["Mg(II)", "magnesium", "Mg2+"],
    name: "Magnesium (Mg(II))",
    role:
      "Stabilising divalent cation in the COMT active site. COMT activity is strongly Mg2+ dependent in vitro.",
    enzymes: ["comt"],
    pubchemCid: "888",
    chebiId: "18420",
    citations: [
      pubchem("888", "PubChem CID 888 — magnesium cation"),
      chebi("18420", "ChEBI:18420 — magnesium(2+)"),
    ],
  },
  {
    id: "H_gradient",
    aliases: ["H+", "proton gradient", "Proton gradient (H+)"],
    name: "Vesicular H+ gradient",
    role:
      "VMAT2 is a proton-coupled antiporter: it loads cytosolic monoamines into the vesicle in exchange for two protons that flow out down their gradient. The gradient is set up by V-ATPase.",
    enzymes: ["vmat2"],
    regeneration: "Maintained by the vesicular V-type H+-ATPase consuming ATP.",
    citations: [
      pubchem("1038", "PubChem CID 1038 — hydron"),
    ],
  },
  {
    id: "NaCl_gradient",
    aliases: ["Na+ / Cl- gradient", "Na+/Cl-", "sodium gradient"],
    name: "Plasma membrane Na+/Cl− gradient",
    role:
      "DAT is a Na+/Cl-/dopamine cotransporter. Each dopamine reuptake event moves dopamine inward together with Na+ and Cl−; the gradient is maintained by Na+/K+-ATPase.",
    enzymes: ["dat"],
    regeneration: "Maintained by Na+/K+-ATPase consuming ATP.",
    citations: [
      pubchem("923", "PubChem CID 923 — sodium cation"),
    ],
  },
];

export function findCofactor(query: string): CofactorEntry | undefined {
  const q = query.trim().toLowerCase();
  for (const c of COFACTOR_KNOWLEDGE) {
    if (c.id.toLowerCase() === q) return c;
    if (c.aliases.some((a) => a.toLowerCase() === q)) return c;
    // partial match — first word of any alias
    if (c.aliases.some((a) => q.startsWith(a.toLowerCase()))) return c;
  }
  return undefined;
}

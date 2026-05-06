import type { Enzyme } from "@/types/enzyme";
import type { Citation } from "@/types/citation";

const ACCESSED = "2026-05-05";

function uniprotCite(uniprotId: string): Citation {
  return {
    sourceName: "UniProt",
    sourceType: "database",
    title: `UniProt ${uniprotId}`,
    url: `https://www.uniprot.org/uniprotkb/${uniprotId}/entry`,
    accessedAt: ACCESSED,
    confidence: "low",
  };
}

function ecCite(ec: string): Citation {
  return {
    sourceName: "ENZYME (Expasy)",
    sourceType: "database",
    title: `EC ${ec}`,
    url: `https://enzyme.expasy.org/EC/${ec}`,
    accessedAt: ACCESSED,
    confidence: "low",
  };
}

export const SEED_ENZYMES: Enzyme[] = [
  {
    id: "pah",
    name: "Phenylalanine hydroxylase",
    shortName: "PAH",
    kind: "enzyme",
    geneSymbol: "PAH",
    proteinName: "Phenylalanine-4-hydroxylase",
    uniprotId: "P00439",
    ecNumber: "1.14.16.1",
    cofactors: ["BH4 (tetrahydrobiopterin)", "Fe(II)", "O2"],
    subcellularLocation: "Cytosol (primarily hepatocytes)",
    reactionEquation: "L-phenylalanine + BH4 + O2 \u2192 L-tyrosine + BH2 + H2O",
    inhibitionEffect:
      "PAH inhibition causes phenylalanine accumulation and reduced tyrosine production.",
    upregulationEffect:
      "More tyrosine is produced from phenylalanine, but downstream catecholamine output is still gated by TH.",
    citations: [uniprotCite("P00439"), ecCite("1.14.16.1")],
  },
  {
    id: "th",
    name: "Tyrosine hydroxylase",
    shortName: "TH",
    kind: "enzyme",
    geneSymbol: "TH",
    proteinName: "Tyrosine 3-monooxygenase",
    uniprotId: "P07101",
    ecNumber: "1.14.16.2",
    cofactors: ["BH4 (tetrahydrobiopterin)", "Fe(II)", "O2"],
    subcellularLocation: "Cytosol of catecholaminergic neurons",
    reactionEquation: "L-tyrosine + BH4 + O2 \u2192 L-DOPA + BH2 + H2O",
    inhibitionEffect:
      "TH is the rate-limiting step of catecholamine synthesis. Inhibition collapses downstream dopamine, norepinephrine, and epinephrine output even with abundant tyrosine.",
    upregulationEffect:
      "Increases L-DOPA flux; downstream dopamine rises until limited by DDC, VMAT2 capacity, or substrate availability.",
    citations: [uniprotCite("P07101"), ecCite("1.14.16.2")],
  },
  {
    id: "ddc",
    name: "Aromatic L-amino acid decarboxylase",
    shortName: "DDC / AADC",
    kind: "enzyme",
    geneSymbol: "DDC",
    proteinName: "Aromatic-L-amino-acid decarboxylase",
    uniprotId: "P20711",
    ecNumber: "4.1.1.28",
    cofactors: ["PLP (pyridoxal 5\u2032-phosphate / vitamin B6)"],
    subcellularLocation: "Cytosol",
    reactionEquation: "L-DOPA \u2192 dopamine + CO2",
    inhibitionEffect:
      "L-DOPA accumulates upstream and dopamine production drops.",
    upregulationEffect:
      "Faster conversion of L-DOPA to dopamine when L-DOPA is available.",
    citations: [uniprotCite("P20711"), ecCite("4.1.1.28")],
  },
  {
    id: "dbh",
    name: "Dopamine β-hydroxylase",
    shortName: "DBH",
    kind: "enzyme",
    geneSymbol: "DBH",
    proteinName: "Dopamine beta-hydroxylase",
    uniprotId: "P09172",
    ecNumber: "1.14.17.1",
    cofactors: ["Ascorbate", "O2", "Cu(II)"],
    subcellularLocation: "Synaptic vesicle membrane (noradrenergic neurons)",
    reactionEquation: "Dopamine + ascorbate + O2 \u2192 norepinephrine + dehydroascorbate + H2O",
    inhibitionEffect:
      "Dopamine accumulates relative to norepinephrine; downstream NE and Epi production fall.",
    upregulationEffect:
      "Greater conversion of vesicular dopamine to norepinephrine.",
    citations: [uniprotCite("P09172"), ecCite("1.14.17.1")],
  },
  {
    id: "pnmt",
    name: "Phenylethanolamine N-methyltransferase",
    shortName: "PNMT",
    kind: "enzyme",
    geneSymbol: "PNMT",
    proteinName: "Phenylethanolamine N-methyltransferase",
    uniprotId: "P11086",
    ecNumber: "2.1.1.28",
    cofactors: ["S-adenosyl-L-methionine (SAM)"],
    subcellularLocation: "Cytosol (adrenal medulla)",
    reactionEquation: "Norepinephrine + SAM \u2192 epinephrine + SAH",
    inhibitionEffect: "Reduced epinephrine production from norepinephrine.",
    upregulationEffect:
      "More norepinephrine is converted to epinephrine.",
    citations: [uniprotCite("P11086"), ecCite("2.1.1.28")],
  },
  {
    id: "comt",
    name: "Catechol-O-methyltransferase",
    shortName: "COMT",
    kind: "enzyme",
    geneSymbol: "COMT",
    proteinName: "Catechol O-methyltransferase",
    uniprotId: "P21964",
    ecNumber: "2.1.1.6",
    cofactors: ["S-adenosyl-L-methionine (SAM)", "Mg(II)"],
    subcellularLocation: "Cytosol and membrane-bound (MB-COMT)",
    reactionEquation:
      "Catechol substrate + SAM \u2192 O-methylated product + SAH",
    inhibitionEffect:
      "Reduced 3-MT, normetanephrine, metanephrine, and HVA output; extracellular dopamine clearance slows.",
    upregulationEffect:
      "Faster O-methylation of catecholamines and increased HVA flux.",
    citations: [uniprotCite("P21964"), ecCite("2.1.1.6")],
  },
  {
    id: "mao_a",
    name: "Monoamine oxidase A",
    shortName: "MAO-A",
    kind: "enzyme",
    geneSymbol: "MAOA",
    proteinName: "Amine oxidase [flavin-containing] A",
    uniprotId: "P21397",
    ecNumber: "1.4.3.4",
    cofactors: ["FAD"],
    subcellularLocation: "Outer mitochondrial membrane",
    reactionEquation:
      "Monoamine + O2 + H2O \u2192 aldehyde + NH3 + H2O2",
    inhibitionEffect:
      "Cytosolic dopamine and other monoamines accumulate; DOPAL formation drops; HVA output falls.",
    upregulationEffect:
      "More rapid catabolism of cytosolic monoamines.",
    citations: [uniprotCite("P21397"), ecCite("1.4.3.4")],
  },
  {
    id: "mao_b",
    name: "Monoamine oxidase B",
    shortName: "MAO-B",
    kind: "enzyme",
    geneSymbol: "MAOB",
    proteinName: "Amine oxidase [flavin-containing] B",
    uniprotId: "P27338",
    ecNumber: "1.4.3.4",
    cofactors: ["FAD"],
    subcellularLocation: "Outer mitochondrial membrane",
    reactionEquation:
      "Monoamine + O2 + H2O \u2192 aldehyde + NH3 + H2O2",
    inhibitionEffect:
      "Reduced oxidative deamination of dopamine; cytosolic dopamine accumulates.",
    upregulationEffect:
      "More rapid catabolism of dopamine to DOPAL.",
    citations: [uniprotCite("P27338"), ecCite("1.4.3.4")],
  },
  {
    id: "aldh",
    name: "Aldehyde dehydrogenase",
    shortName: "ALDH",
    kind: "enzyme",
    geneSymbol: "ALDH1A1 / ALDH2",
    proteinName: "Aldehyde dehydrogenase, mitochondrial / cytosolic",
    uniprotId: "P05091",
    ecNumber: "1.2.1.3",
    cofactors: ["NAD+"],
    subcellularLocation: "Mitochondrial matrix and cytosol",
    reactionEquation: "Aldehyde + NAD+ + H2O \u2192 carboxylic acid + NADH",
    inhibitionEffect:
      "DOPAL accumulates because it is no longer oxidized to DOPAC; this is associated with neurotoxicity in the literature.",
    upregulationEffect:
      "Faster clearance of DOPAL and other reactive aldehydes.",
    citations: [uniprotCite("P05091"), ecCite("1.2.1.3")],
  },
  {
    id: "tyr",
    name: "Tyrosinase",
    shortName: "TYR",
    kind: "enzyme",
    geneSymbol: "TYR",
    proteinName: "Tyrosinase",
    uniprotId: "P14679",
    ecNumber: "1.14.18.1",
    cofactors: ["Cu(II)", "O2"],
    subcellularLocation: "Melanosome membrane (melanocytes)",
    reactionEquation:
      "L-tyrosine / L-DOPA + O2 \u2192 dopaquinone + H2O",
    inhibitionEffect:
      "Reduced melanin production; substrate stays in catechol form.",
    upregulationEffect: "Increased flux toward dopaquinone and melanin.",
    citations: [uniprotCite("P14679"), ecCite("1.14.18.1")],
  },
  {
    id: "vmat2",
    name: "Vesicular monoamine transporter 2",
    shortName: "VMAT2",
    kind: "transporter",
    geneSymbol: "SLC18A2",
    proteinName: "Synaptic vesicular amine transporter",
    uniprotId: "Q05940",
    cofactors: ["Proton gradient (H+)"],
    subcellularLocation: "Synaptic vesicle membrane",
    reactionEquation:
      "Cytosolic monoamine + H+(vesicle) \u2192 vesicular monoamine + H+(cytosol)",
    inhibitionEffect:
      "Cytosolic dopamine accumulates and vesicular dopamine drops; risk of DOPAL-driven toxicity rises.",
    upregulationEffect:
      "More dopamine is sequestered into vesicles, reducing cytosolic exposure to MAO.",
    citations: [uniprotCite("Q05940")],
  },
  {
    id: "dat",
    name: "Dopamine transporter",
    shortName: "DAT",
    kind: "transporter",
    geneSymbol: "SLC6A3",
    proteinName: "Sodium-dependent dopamine transporter",
    uniprotId: "Q01959",
    cofactors: ["Na+ / Cl- gradient"],
    subcellularLocation: "Presynaptic plasma membrane",
    reactionEquation:
      "Synaptic dopamine + Na+ + Cl- \u2192 cytosolic dopamine + Na+ + Cl- (presynapse)",
    inhibitionEffect:
      "Synaptic dopamine clearance slows; signaling at D1\u2013D5 receptors is prolonged and overflow alerts can trigger.",
    upregulationEffect:
      "Faster reuptake; synaptic dopamine duration shortens.",
    citations: [uniprotCite("Q01959")],
  },
  ...(["d1", "d2", "d3", "d4", "d5"] as const).map((id, idx): Enzyme => ({
    id,
    name: `Dopamine receptor D${idx + 1}`,
    shortName: `D${idx + 1}`,
    kind: "receptor",
    geneSymbol: ["DRD1", "DRD2", "DRD3", "DRD4", "DRD5"][idx]!,
    proteinName: `D(${idx + 1}) dopamine receptor`,
    uniprotId: ["P21728", "P14416", "P35462", "P21917", "P21918"][idx]!,
    subcellularLocation: "Postsynaptic plasma membrane (D1, D5 are Gs-coupled; D2, D3, D4 are Gi-coupled)",
    inhibitionEffect: `Reduced D${idx + 1} signaling for any synaptic dopamine present.`,
    upregulationEffect: `Stronger D${idx + 1} signaling per unit synaptic dopamine.`,
    citations: [uniprotCite(["P21728", "P14416", "P35462", "P21917", "P21918"][idx]!)],
  })),
];

export function findSeedEnzyme(id: string): Enzyme | undefined {
  return SEED_ENZYMES.find((e) => e.id === id);
}

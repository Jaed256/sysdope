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

/** PubChem compound page as a medium-confidence anchor for named drugs. */
function pubchemDrugCite(cid: string, title: string): Citation {
  return {
    sourceName: "PubChem",
    sourceType: "database",
    title,
    url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
    accessedAt: ACCESSED,
    confidence: "medium",
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
    pharmacologyNotes: [
      {
        summary:
          "Peripheral aromatic L-amino-acid decarboxylase inhibitors (for example carbidopa co-administered with levodopa) limit extracerebral conversion so more L-DOPA reaches the brain in Parkinson care; see the linked PubChem entry for the small-molecule profile.",
        citations: [pubchemDrugCite("2481", "Carbidopa (PubChem)")],
      },
    ],
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
    pharmacologyNotes: [
      {
        summary:
          "Peripheral COMT inhibitors such as entacapone are used as adjuncts to levodopa therapy in Parkinson disease to prolong L-DOPA half-life; PubChem summarizes the chemical entity.",
        citations: [pubchemDrugCite("52894", "Entacapone (PubChem)")],
      },
    ],
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
    pharmacologyNotes: [
      {
        summary:
          "Reversible MAO-A inhibitors (example: moclobemide) increase monoamine cleft levels and are used clinically as antidepressants; verify indications on product labels—PubChem entry is for identity only.",
        citations: [pubchemDrugCite("4194", "Moclobemide (PubChem)")],
      },
    ],
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
    pharmacologyNotes: [
      {
        summary:
          "Selective MAO-B inhibitors such as selegiline are used in Parkinson therapy to reduce dopamine breakdown; see PubChem for chemical identity.",
        citations: [pubchemDrugCite("26757", "Selegiline (PubChem)")],
      },
    ],
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
    pharmacologyNotes: [
      {
        summary:
          "Disulfiram is an ALDH inhibitor used clinically (for example in alcohol dependence); it illustrates how blocking aldehyde oxidation shifts aldehyde pools—PubChem record linked.",
        citations: [pubchemDrugCite("3117", "Disulfiram (PubChem)")],
      },
    ],
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
    pharmacologyNotes: [
      {
        summary:
          "VMAT2 depleters such as tetrabenazine reduce vesicular monoamine packaging and are used in hyperkinetic movement disorders; chemical identity on PubChem.",
        citations: [pubchemDrugCite("6014", "Tetrabenazine (PubChem)")],
      },
    ],
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
    pharmacologyNotes: [
      {
        summary:
          "DAT-blocking stimulants (example: methylphenidate) increase extracellular catecholamine tone and are used in ADHD; PubChem summarizes the entity—always refer to prescribing information.",
        citations: [pubchemDrugCite("4158", "Methylphenidate (PubChem)")],
      },
    ],
    citations: [uniprotCite("Q01959")],
  },
  ...(["d1", "d2", "d3", "d4", "d5"] as const).map((id, idx): Enzyme => {
    const pharmacologyNotesByIdx: NonNullable<Enzyme["pharmacologyNotes"]>[] = [
      [
        {
          summary:
            "Fenoldopam is a D1-family agonist used as a vasodilator in acute settings; the PubChem page documents the chemical entity (clinical use per labeling).",
          citations: [pubchemDrugCite("3346", "Fenoldopam (PubChem)")],
        },
      ],
      [
        {
          summary:
            "Haloperidol is a prototypical D2-family antagonist used in antipsychotic regimens, whereas pramipexole is a D2/D3-class agonist used in Parkinson disease—PubChem links are for structure/identity only.",
          citations: [
            pubchemDrugCite("3559", "Haloperidol (PubChem)"),
            pubchemDrugCite("6077", "Pramipexole (PubChem)"),
          ],
        },
      ],
      [
        {
          summary:
            "Pramipexole is a non-ergot dopamine agonist with prominent D3/D2 activity used in Parkinson disease and restless legs syndrome; see PubChem for the registered structure.",
          citations: [pubchemDrugCite("6077", "Pramipexole (PubChem)")],
        },
      ],
      [
        {
          summary:
            "Many antipsychotics bind D4 among other monoamine receptors (polypharmacology). Clozapine is a multi-target atypical antipsychotic whose PubChem record is a convenient chemistry anchor.",
          citations: [pubchemDrugCite("2818", "Clozapine (PubChem)")],
        },
      ],
      [
        {
          summary:
            "D5 is D1-like; levodopa remains a backbone oral dopamine-replacement precursor in Parkinson disease—PubChem summarizes the prodrug chemistry (metabolism via AADC to dopamine).",
          citations: [pubchemDrugCite("6030", "Levodopa (PubChem)")],
        },
      ],
    ];
    return {
      id,
      name: `Dopamine receptor D${idx + 1}`,
      shortName: `D${idx + 1}`,
      kind: "receptor",
      geneSymbol: ["DRD1", "DRD2", "DRD3", "DRD4", "DRD5"][idx]!,
      proteinName: `D(${idx + 1}) dopamine receptor`,
      uniprotId: ["P21728", "P14416", "P35462", "P21917", "P21918"][idx]!,
      subcellularLocation:
        "Postsynaptic plasma membrane (D1, D5 are Gs-coupled; D2, D3, D4 are Gi-coupled)",
      inhibitionEffect: `Reduced D${idx + 1} signaling for any synaptic dopamine present.`,
      upregulationEffect: `Stronger D${idx + 1} signaling per unit synaptic dopamine.`,
      pharmacologyNotes: pharmacologyNotesByIdx[idx],
      citations: [uniprotCite(["P21728", "P14416", "P35462", "P21917", "P21918"][idx]!)],
    };
  }),
];

export function findSeedEnzyme(id: string): Enzyme | undefined {
  return SEED_ENZYMES.find((e) => e.id === id);
}

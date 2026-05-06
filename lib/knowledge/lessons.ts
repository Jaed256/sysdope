import type { Citation } from "@/types/citation";

const ACCESSED = "2026-05-05";

/**
 * Source-backed citations used inside lessons. We anchor every numeric or
 * mechanistic claim to a public, citable database entry. When a stronger
 * peer-reviewed source becomes available, replace the entry below — the
 * lesson body should not need to change.
 */
function uniprot(id: string, title: string): Citation {
  return {
    sourceName: "UniProt",
    sourceType: "database",
    title,
    url: `https://www.uniprot.org/uniprotkb/${id}/entry`,
    accessedAt: ACCESSED,
    confidence: "high",
  };
}

function pubchem(cid: string, title: string): Citation {
  return {
    sourceName: "PubChem",
    sourceType: "database",
    title,
    url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
    accessedAt: ACCESSED,
    confidence: "medium",
  };
}

function expasy(ec: string, title: string): Citation {
  return {
    sourceName: "ENZYME (Expasy)",
    sourceType: "database",
    title,
    url: `https://enzyme.expasy.org/EC/${ec}`,
    accessedAt: ACCESSED,
    confidence: "medium",
  };
}

export type LessonDifficulty = "beginner" | "intermediate" | "advanced";

export type Lesson = {
  id: string;
  title: string;
  shortTitle: string;
  difficulty: LessonDifficulty;
  /** Two-to-four short paragraphs. Plain prose, no markdown. */
  body: string[];
  /** Concrete dashboard observations the user should look for. */
  watchFor: string[];
  /** Scenario id from `lib/simulation/scenarios.ts` to invoke from the lesson. */
  scenarioId?: string;
  /** Whether the scenario should be run with the "reset first" mode. */
  resetBeforeScenario?: boolean;
  /** Citations supporting the claims in this lesson body. */
  citations: Citation[];
};

export const LESSONS: Lesson[] = [
  {
    id: "th_bottleneck",
    title: "Why TH is the bottleneck of catecholamine synthesis",
    shortTitle: "TH bottleneck",
    difficulty: "beginner",
    body: [
      "Tyrosine hydroxylase (TH, EC 1.14.16.2) catalyses the first committed step of catecholamine synthesis: it hydroxylates L-tyrosine to L-DOPA using BH4 (tetrahydrobiopterin), Fe(II), and O2 as cofactors. Every dopamine, noradrenaline, and adrenaline molecule that the simulator produces flows through this single reaction.",
      "Compared to the enzymes downstream of it, TH has a much lower maximum velocity and is tightly feedback-regulated. In the simulator we encode that with a low Vmax for TH while DDC (decarboxylating L-DOPA to dopamine) and VMAT2 (sequestering dopamine into vesicles) are given comparatively higher Vmax. The consequence is that pushing more substrate into the precursor pool does not linearly translate into more dopamine — the system saturates at TH.",
      "This is why the 'precursor overload' scenario is informative: pump phenylalanine and tyrosine to the top of the dashboard and watch dopamine rise only modestly. Now apply 'TH inhibition' and watch the entire downstream catecholamine cascade collapse, with tyrosine accumulating upstream — exactly the pattern observed in α-methyl-p-tyrosine pharmacology and inherited TH-deficiency syndromes (UniProt P07101).",
    ],
    watchFor: [
      "Tyrosine in the precursor pool keeps climbing.",
      "L-DOPA, cytosolic dopamine, and vesicular dopamine all stay flat.",
      "A 'TH bottleneck' alert appears.",
    ],
    scenarioId: "precursor_overload",
    citations: [
      uniprot("P07101", "UniProt P07101 — TH (human)"),
      expasy("1.14.16.2", "EC 1.14.16.2 (tyrosine hydroxylase)"),
    ],
  },
  {
    id: "mao_inhibition",
    title: "What happens when MAO is inhibited",
    shortTitle: "MAO inhibition",
    difficulty: "intermediate",
    body: [
      "Monoamine oxidases A and B (EC 1.4.3.4) live on the outer mitochondrial membrane and oxidatively deaminate cytosolic monoamines using FAD and O2. For dopamine in the presynaptic terminal, MAO-B converts cytosolic dopamine to 3,4-dihydroxyphenylacetaldehyde (DOPAL), which is then oxidised by ALDH to DOPAC.",
      "When you inhibit MAO-A and MAO-B together in the simulator, the oxidative deamination route closes. Cytosolic dopamine that is not sequestered by VMAT2 has nowhere to go: it accumulates rather than being cleared, and DOPAL formation drops off. The downstream HVA flux into the urine compartment also slows because much of HVA in the steady state comes through the MAO-driven DOPAC → HVA branch.",
      "Clinically this is why MAO inhibitors are effective antidepressants (more catecholamines stay around) but also why they require dietary tyramine restrictions — MAO normally protects the body from sympathomimetic amines absorbed from food (UniProt P21397, P27338).",
    ],
    watchFor: [
      "Cytosolic dopamine rises.",
      "DOPAL stays low.",
      "HVA flux into urine slows; the HVA bar stops growing.",
    ],
    scenarioId: "mao_inhibition",
    citations: [
      uniprot("P21397", "UniProt P21397 — MAO-A"),
      uniprot("P27338", "UniProt P27338 — MAO-B"),
      expasy("1.4.3.4", "EC 1.4.3.4 (amine oxidase)"),
    ],
  },
  {
    id: "aldh_dopal",
    title: "Why ALDH protects against DOPAL buildup",
    shortTitle: "ALDH and DOPAL",
    difficulty: "intermediate",
    body: [
      "DOPAL is the immediate aldehyde intermediate produced when MAO oxidises cytosolic dopamine. It is also one of the more reactive endogenous aldehydes — it readily forms covalent adducts with proteins and lipids, and DOPAL accumulation has been implicated in dopaminergic neuron vulnerability in Parkinsonian models.",
      "Aldehyde dehydrogenase (ALDH, EC 1.2.1.3) keeps DOPAL low by oxidising it to DOPAC using NAD+. In a healthy presynapse the steady-state DOPAL level is small because ALDH activity comfortably exceeds the DOPAL flux from MAO.",
      "Inhibit ALDH in the simulator and the picture flips: DOPAL accumulates, a 'DOPAL toxicity risk' alert appears, and DOPAC production grinds to a halt even though MAO is still running. Pair ALDH inhibition with MAO upregulation and the warning escalates further — this is the bench-top model behind the 'catecholaldehyde hypothesis' of dopaminergic toxicity (UniProt P05091).",
    ],
    watchFor: [
      "DOPAL bar climbs steadily.",
      "DOPAC bar stays flat.",
      "A 'DOPAL toxicity risk' alert appears.",
    ],
    scenarioId: "aldh_inhibition",
    citations: [
      uniprot("P05091", "UniProt P05091 — ALDH2"),
      expasy("1.2.1.3", "EC 1.2.1.3 (aldehyde dehydrogenase)"),
      pubchem("119219", "PubChem CID 119219 — DOPAL"),
    ],
  },
  {
    id: "vmat2",
    title: "How VMAT2 protects cytosolic dopamine",
    shortTitle: "VMAT2 sequestration",
    difficulty: "intermediate",
    body: [
      "Vesicular monoamine transporter 2 (VMAT2, gene SLC18A2) uses the proton gradient across the synaptic vesicle membrane to load cytosolic monoamines (dopamine, noradrenaline, serotonin) into vesicles. Once inside the vesicle the amine is shielded from the cytosolic MAO/ALDH machinery and is held until depolarisation triggers exocytosis.",
      "In the simulator VMAT2 is given a finite Vmax and the vesicle compartment a hard capacity ceiling. As long as VMAT2 keeps up, cytosolic dopamine stays low and DOPAL formation is suppressed. When VMAT2 is inhibited (think tetrabenazine, valbenazine, or reserpine) the cytosolic pool rises sharply, vesicular dopamine drops, and the 'vesicle saturation' / 'cytosolic overflow' alerts can cascade.",
      "Pair this with the ALDH lesson: the worst-case combination is VMAT2 inhibition plus ALDH inhibition, because cytosolic dopamine is no longer sequestered and the DOPAL it produces is no longer cleared. The simulator's combo scenarios let you reproduce that double-hit (UniProt Q05940).",
    ],
    watchFor: [
      "Vesicular dopamine bar collapses.",
      "Cytosolic dopamine bar climbs.",
      "Cofactor pools tick downward as MAO compensates.",
    ],
    scenarioId: "vmat2_inhibition",
    citations: [
      uniprot("Q05940", "UniProt Q05940 — VMAT2 (SLC18A2)"),
    ],
  },
  {
    id: "dat",
    title: "How DAT changes synaptic dopamine duration",
    shortTitle: "DAT and reuptake",
    difficulty: "beginner",
    body: [
      "The dopamine transporter (DAT, gene SLC6A3) is the high-affinity Na+/Cl-/dopamine cotransporter on the presynaptic plasma membrane. It is the dominant mechanism that ends dopaminergic signalling at the synapse: the transporter takes synaptic dopamine back into the presynaptic cytosol where it can be re-loaded into vesicles by VMAT2 or degraded by MAO/COMT.",
      "In the simulator, click 'Release vesicles' to spike synaptic dopamine, then watch how quickly the synaptic bar decays. With DAT at normal activity the half-life is short. Inhibit DAT (cocaine and methylphenidate are textbook DAT blockers) and the same release event produces a much longer-lasting elevation in the synaptic cleft.",
      "This is the engine behind both the rewarding properties of stimulants and a small portion of the therapeutic action of medications used in attention disorders (UniProt Q01959).",
    ],
    watchFor: [
      "Synaptic dopamine bar stays elevated for many more ticks.",
      "Cytosolic dopamine recovers more slowly after a release event.",
      "Synaptic overflow alert can appear after repeated releases.",
    ],
    scenarioId: "dat_inhibition",
    citations: [uniprot("Q01959", "UniProt Q01959 — DAT (SLC6A3)")],
  },
  {
    id: "comt_hva",
    title: "How COMT contributes to HVA output",
    shortTitle: "COMT and HVA",
    difficulty: "advanced",
    body: [
      "Catechol-O-methyltransferase (COMT, EC 2.1.1.6) transfers a methyl group from S-adenosyl-L-methionine (SAM) to a catechol hydroxyl. In the catecholamine pathway COMT acts in three places at once in this simulator: on synaptic dopamine (→ 3-MT), on extracellular noradrenaline / adrenaline (→ normetanephrine / metanephrine), and on cytosolic DOPAC (→ HVA).",
      "Homovanillic acid (HVA) is the major terminal urinary metabolite of dopamine. In steady state it arrives via two routes: (a) cytosolic DA → DOPAL → DOPAC → HVA, and (b) synaptic DA → 3-MT → MHPA → HVA. Both branches need COMT.",
      "Inhibit COMT and the urinary HVA bar plateaus; 3-MT, normetanephrine, and metanephrine all drop because their COMT-driven formation slows. Inhibit COMT *and* MAO together and the HVA flux collapses entirely — there is no longer a metabolic exit for circulating catecholamines (UniProt P21964).",
    ],
    watchFor: [
      "HVA accumulation in the urine compartment slows or stops.",
      "3-MT, normetanephrine, and metanephrine bars drop.",
      "SAM cofactor pool depletes more slowly because COMT is doing less work.",
    ],
    scenarioId: "comt_inhibition",
    citations: [
      uniprot("P21964", "UniProt P21964 — COMT"),
      expasy("2.1.1.6", "EC 2.1.1.6 (catechol-O-methyltransferase)"),
    ],
  },
];

export function findLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

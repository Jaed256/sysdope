import type { Citation } from "@/types/citation";

const ACCESSED = "2026-05-06";

/**
 * Review discussing basal extracellular dopamine in rat striatum and
 * methodological estimates (microdialysis). The paper’s discussion is often
 * cited for **single-digit to tens of nM** basal extracellular DA in rodent
 * striatum depending on technique — not a direct readout of SysDope’s toy
 * pools.
 */
export const CITATION_RAT_STRIATAL_EC_DA_MICRODIALYSIS: Citation = {
  sourceName: "Journal of Neurochemistry",
  sourceType: "paper",
  title:
    "Watson et al. — Evidence on extracellular dopamine level in rat striatum (microdialysis; basal level discussion)",
  url: "https://pubmed.ncbi.nlm.nih.gov/15606895/",
  pmid: "15606895",
  doi: "10.1111/j.1471-4159.2004.02848.x",
  accessedAt: ACCESSED,
  confidence: "high",
};

/** Broader mechanistic context for extracellular DA regulation (release / uptake). */
export const CITATION_STRIATAL_DA_TRANSMISSION_REVIEW: Citation = {
  sourceName: "Basal Ganglia",
  sourceType: "paper",
  title:
    "Sulzer, Cragg & Rice — Striatal dopamine neurotransmission: regulation of release and uptake",
  url: "https://pubmed.ncbi.nlm.nih.gov/27141430/",
  pmid: "27141430",
  doi: "10.1016/j.baga.2016.02.001",
  accessedAt: ACCESSED,
  confidence: "high",
};

/**
 * **Illustrative** linear mapping from synaptic dopamine “relative simulation
 * units” to an order-of-magnitude **nanomolar** readout anchored to the
 * midpoint (~13.5 nM) of commonly quoted **rat** basal extracellular striatal
 * windows discussed around PMID 15606895. This is **not** a fitted
 * calibration of the simulator to any one experiment.
 */
export const ILLUSTRATIVE_EC_DA_MIDPOINT_NM = 13.5;
export const ILLUSTRATIVE_REL_UNITS_AT_MIDPOINT_NM = 95;

export function illustrativeExtracellularDopamineNm(
  relativeSynapticDopamine: number,
): number {
  if (!Number.isFinite(relativeSynapticDopamine) || relativeSynapticDopamine <= 0) {
    return 0;
  }
  return (
    (relativeSynapticDopamine / ILLUSTRATIVE_REL_UNITS_AT_MIDPOINT_NM) *
    ILLUSTRATIVE_EC_DA_MIDPOINT_NM
  );
}

export const PHYSIOLOGIC_OVERLAY_FOOTNOTE =
  "Illustrative nM column uses a fixed linear anchor (95 relative units ≈ 13.5 nM) informed by rat striatal microdialysis discussions (PMID 15606895). Human extracellular levels differ by region and method; SysDope remains an educational toy.";

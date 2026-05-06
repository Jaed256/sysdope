import type { Edge, Node } from "@xyflow/react";
import type { Compound } from "@/types/compound";
import type { Enzyme } from "@/types/enzyme";
import type { Compartment, Reaction } from "@/types/reaction";
import { SEED_COMPOUNDS } from "./seedCompounds";
import { SEED_ENZYMES } from "./seedEnzymes";
import { SEED_REACTIONS } from "./seedReactions";

export type MoleculeNodeData = {
  kind: "molecule";
  compoundId: string;
  compartment: Compartment;
  label: string;
};

export type EnzymeNodeData = {
  kind: "enzyme";
  enzymeId: string;
  label: string;
  shortName: string;
  enzymeKind: Enzyme["kind"];
};

export type ReactionEdgeData = {
  reactionId: string;
};

export type PathwayNode = Node<MoleculeNodeData | EnzymeNodeData>;
export type PathwayEdge = Edge<ReactionEdgeData>;

export const MOLECULE_NODE_TYPE = "molecule";
export const ENZYME_NODE_TYPE = "enzyme";
export const REACTION_EDGE_TYPE = "reaction";

export function moleculeNodeId(compoundId: string, compartment: Compartment) {
  return `mol:${compoundId}@${compartment}`;
}
export function enzymeNodeId(enzymeId: string) {
  return `enz:${enzymeId}`;
}

/**
 * Hand-tuned layout positions. The pathway flows left → right:
 *   precursor (col 0–1) → cytosol (col 2–6) → vesicle (col 7–8) →
 *   synapse (col 9–10) → extracellular metabolites (col 11–13) → urine (14)
 */
type Position = { x: number; y: number };

const COL_W = 200;
const ROW_H = 100;

function pos(col: number, row: number): Position {
  return { x: col * COL_W, y: row * ROW_H };
}

/**
 * Layout overview (read left → right, with rows top → bottom):
 *
 *   y=-2   melanin branch (TYR → dopaquinone → dopachrome → melanin)
 *   y= 0   NE / Epi catecholamine arm (vesicle → cytosol → extracellular)
 *   y= 2   MAIN SPINE: Phe → Tyr → L-DOPA → DA(cyto) → VMAT2 → DA(vesicle) → release → DA(synapse)
 *   y= 4   Cytosolic DA degradation (MAO-B → DOPAL → ALDH → DOPAC → COMT → HVA)
 *   y= 6   Synaptic clearance (DAT, COMT, MAO 3-MT branch, ALDH MHPA, HVA → urine)
 *   y= 8   Postsynaptic receptors (D1-D5)
 *
 * Columns are kept unique per node to make edges as monotonically left-to-right
 * as possible.
 */

const MOLECULE_POSITIONS: Record<string, Position> = {
  // melanin branch (top)
  "mol:dopaquinone@cytosol": pos(5, -2),
  "mol:dopachrome@cytosol": pos(7, -2),
  "mol:melanin@cytosol": pos(9, -2),

  // NE / Epi arm
  "mol:norepinephrine@vesicle": pos(9, 0),
  "mol:norepinephrine@cytosol": pos(11, 0),
  "mol:epinephrine@cytosol": pos(13, 0),
  "mol:norepinephrine@extracellular": pos(11, 1),
  "mol:epinephrine@extracellular": pos(13, 1),
  "mol:normetanephrine@extracellular": pos(12, 0.4),
  "mol:metanephrine@extracellular": pos(14, 0.4),

  // SPINE
  "mol:phenylalanine@precursor": pos(0, 2),
  "mol:tyrosine@precursor": pos(2, 2),
  "mol:l_dopa@cytosol": pos(4, 2),
  "mol:dopamine@cytosol": pos(6, 2),
  "mol:dopamine@vesicle": pos(8, 2),

  // Cytosolic DA degradation
  "mol:dopal@cytosol": pos(7, 4),
  "mol:dopac@cytosol": pos(9, 4),

  // Synaptic clearance
  "mol:dopamine@synapse": pos(10, 6),
  "mol:three_mt@extracellular": pos(12, 6),
  "mol:mhpa@extracellular": pos(13, 6),
  "mol:hva@extracellular": pos(14, 5),
  "mol:hva@urine": pos(16, 5),

  // Postsynaptic dopamine-receptor teaching nodes (same compartment as synapse band)
  "mol:postsynaptic_d1@synapse": pos(10.9, 8.35),
  "mol:postsynaptic_d2@synapse": pos(11.9, 8.35),
  "mol:postsynaptic_d3@synapse": pos(12.9, 8.35),
  "mol:postsynaptic_d4@synapse": pos(13.9, 8.35),
  "mol:postsynaptic_d5@synapse": pos(14.9, 8.35),
};

const ENZYME_POSITIONS: Record<string, Position> = {
  // SPINE
  "enz:pah": pos(1, 2),
  "enz:th": pos(3, 2),
  "enz:ddc": pos(5, 2),
  "enz:vmat2": pos(7, 2),

  // melanin / NE / Epi
  "enz:tyr": pos(4, -2),
  "enz:dbh": pos(8.5, 1),
  "enz:pnmt": pos(12, 0),

  // Degradation in cytosol
  "enz:mao_b": pos(7, 3),
  "enz:aldh": pos(8, 4),
  "enz:comt": pos(13, 5),

  // Synapse
  "enz:dat": pos(9, 6),
  "enz:mao_a": pos(13, 6.5),

  // Receptors
  "enz:d1": pos(10, 8),
  "enz:d2": pos(11, 8),
  "enz:d3": pos(12, 8),
  "enz:d4": pos(13, 8),
  "enz:d5": pos(14, 8),
};

export type CompartmentBand = {
  compartment: Compartment;
  label: string;
  /** band start in flow Y coords */
  yStart: number;
  yEnd: number;
  color: string;
};

export const COMPARTMENT_BANDS: CompartmentBand[] = [
  {
    compartment: "precursor",
    label: "Precursor pool",
    yStart: -3 * ROW_H,
    yEnd: 1.5 * ROW_H,
    color: "rgba(34, 211, 238, 0.05)",
  },
  {
    compartment: "cytosol",
    label: "Presynaptic cytosol",
    yStart: 1.5 * ROW_H,
    yEnd: 5.5 * ROW_H,
    color: "rgba(232, 121, 249, 0.05)",
  },
  {
    compartment: "synapse",
    label: "Synaptic cleft + receptors",
    yStart: 5.5 * ROW_H,
    yEnd: 9 * ROW_H,
    color: "rgba(167, 139, 250, 0.05)",
  },
];

/**
 * Builds React Flow nodes & edges from the seed pathway. Each unique
 * (compound, compartment) pair becomes one molecule node; each enzyme
 * becomes one enzyme node; each reaction becomes two edges:
 *
 *     substrate-pool ──► enzyme ──► product-pool
 *
 * (sink reactions without an enzyme become a single direct edge.)
 */
export function buildPathwayGraph(
  compounds: Compound[] = SEED_COMPOUNDS,
  enzymes: Enzyme[] = SEED_ENZYMES,
  reactions: Reaction[] = SEED_REACTIONS,
): { nodes: PathwayNode[]; edges: PathwayEdge[] } {
  const compoundById = new Map(compounds.map((c) => [c.id, c]));
  const enzymeById = new Map(enzymes.map((e) => [e.id, e]));

  const moleculeKeys = new Set<string>();
  for (const r of reactions) {
    for (const s of r.from) moleculeKeys.add(`${s}@${r.fromCompartment}`);
    for (const p of r.to) moleculeKeys.add(`${p}@${r.toCompartment}`);
  }

  const nodes: PathwayNode[] = [];

  for (const key of moleculeKeys) {
    const [compoundId, compartment] = key.split("@") as [string, Compartment];
    const compound = compoundById.get(compoundId);
    const id = moleculeNodeId(compoundId, compartment);
    nodes.push({
      id,
      type: MOLECULE_NODE_TYPE,
      position: MOLECULE_POSITIONS[id] ?? pos(0, 0),
      data: {
        kind: "molecule",
        compoundId,
        compartment,
        label: compound?.name ?? compoundId,
      },
    });
  }

  for (const enzyme of enzymes) {
    const id = enzymeNodeId(enzyme.id);
    nodes.push({
      id,
      type: ENZYME_NODE_TYPE,
      position: ENZYME_POSITIONS[id] ?? pos(0, 0),
      data: {
        kind: "enzyme",
        enzymeId: enzyme.id,
        label: enzyme.shortName ?? enzyme.name,
        shortName: enzyme.shortName ?? enzyme.name,
        enzymeKind: enzyme.kind,
      },
    });
  }

  const edges: PathwayEdge[] = [];

  for (const r of reactions) {
    if (r.enzymeId && enzymeById.has(r.enzymeId)) {
      const enzNodeId = enzymeNodeId(r.enzymeId);
      for (const s of r.from) {
        edges.push({
          id: `${r.id}::in::${s}`,
          source: moleculeNodeId(s, r.fromCompartment),
          target: enzNodeId,
          type: REACTION_EDGE_TYPE,
          data: { reactionId: r.id },
        });
      }
      for (const p of r.to) {
        edges.push({
          id: `${r.id}::out::${p}`,
          source: enzNodeId,
          target: moleculeNodeId(p, r.toCompartment),
          type: REACTION_EDGE_TYPE,
          data: { reactionId: r.id },
        });
      }
    } else {
      // direct passive edges (e.g. urinary excretion, spontaneous reactions)
      for (const s of r.from) {
        for (const p of r.to) {
          edges.push({
            id: `${r.id}::direct::${s}-${p}`,
            source: moleculeNodeId(s, r.fromCompartment),
            target: moleculeNodeId(p, r.toCompartment),
            type: REACTION_EDGE_TYPE,
            data: { reactionId: r.id },
          });
        }
      }
    }
  }

  return { nodes, edges };
}

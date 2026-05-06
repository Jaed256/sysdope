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
const ROW_H = 110;

function pos(col: number, row: number): Position {
  return { x: col * COL_W, y: row * ROW_H };
}

const MOLECULE_POSITIONS: Record<string, Position> = {
  // precursors
  "mol:phenylalanine@precursor": pos(0, 1),
  "mol:tyrosine@precursor": pos(2, 1),
  // cytosol
  "mol:l_dopa@cytosol": pos(4, 1),
  "mol:dopamine@cytosol": pos(6, 1),
  "mol:dopal@cytosol": pos(7, 3),
  "mol:dopac@cytosol": pos(9, 3),
  "mol:dopaquinone@cytosol": pos(5, -1),
  "mol:dopachrome@cytosol": pos(7, -1),
  "mol:melanin@cytosol": pos(9, -1),
  // vesicle
  "mol:dopamine@vesicle": pos(8, 1),
  "mol:norepinephrine@vesicle": pos(9, 0),
  // cytosol catecholamines
  "mol:norepinephrine@cytosol": pos(10, 0),
  "mol:epinephrine@cytosol": pos(12, 0),
  // synapse
  "mol:dopamine@synapse": pos(10, 2),
  // extracellular metabolites
  "mol:three_mt@extracellular": pos(12, 2),
  "mol:mhpa@extracellular": pos(13, 2),
  "mol:hva@extracellular": pos(14, 2),
  "mol:normetanephrine@extracellular": pos(11, 0),
  "mol:metanephrine@extracellular": pos(13, 0),
  "mol:norepinephrine@extracellular": pos(10, -1),
  "mol:epinephrine@extracellular": pos(12, -1),
  // urine
  "mol:hva@urine": pos(15, 2),
};

const ENZYME_POSITIONS: Record<string, Position> = {
  "enz:pah": pos(1, 1),
  "enz:th": pos(3, 1),
  "enz:ddc": pos(5, 1),
  "enz:vmat2": pos(7, 1),
  "enz:dbh": pos(8, 0),
  "enz:pnmt": pos(11, 0),
  "enz:comt": pos(11, 2),
  "enz:mao_a": pos(12, 3),
  "enz:mao_b": pos(8, 3),
  "enz:aldh": pos(8, 4),
  "enz:tyr": pos(4, -1),
  "enz:dat": pos(9, 2),
  "enz:d1": pos(11, 4),
  "enz:d2": pos(12, 4),
  "enz:d3": pos(13, 4),
  "enz:d4": pos(11, 5),
  "enz:d5": pos(12, 5),
};

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

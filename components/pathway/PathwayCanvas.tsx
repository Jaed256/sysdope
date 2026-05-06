"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import {
  buildPathwayGraph,
  ENZYME_NODE_TYPE,
  MOLECULE_NODE_TYPE,
  REACTION_EDGE_TYPE,
  type PathwayEdge,
  type PathwayNode,
} from "@/lib/pathway/graph";
import { useSimulationStore } from "@/lib/simulation/store";
import { MoleculeNode } from "./MoleculeNode";
import { EnzymeGate } from "./EnzymeGate";
import { ReactionEdge } from "./ReactionEdge";
import { ParticleLayer } from "./ParticleLayer";

const nodeTypes = {
  [MOLECULE_NODE_TYPE]: MoleculeNode,
  [ENZYME_NODE_TYPE]: EnzymeGate,
};

const edgeTypes = {
  [REACTION_EDGE_TYPE]: ReactionEdge,
};

function PathwayCanvasInner() {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildPathwayGraph(),
    [],
  );
  const [nodes, , onNodesChange] = useNodesState<PathwayNode>(
    initialNodes as PathwayNode[],
  );
  const [edges, , onEdgesChange] = useEdgesState<PathwayEdge>(
    initialEdges as PathwayEdge[],
  );
  const startLoop = useSimulationStore((s) => s.startLoop);
  const lastAutoOx = useSimulationStore((s) => s.lastAutoOxidationFlux);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const stop = startLoop();
    return () => {
      stop();
      startedRef.current = false;
    };
  }, [startLoop]);

  return (
    <div className="relative h-full w-full">
      {lastAutoOx > 0.04 && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-amber-500/20 via-rose-600/20 to-transparent mix-blend-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.12, 0.5, 0.12] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: false }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.6}
        defaultEdgeOptions={{
          type: REACTION_EDGE_TYPE,
        }}
      >
        <ParticleLayer />
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="rgba(113, 113, 122, 0.3)"
        />
        <Controls
          showInteractive={false}
          className="!bottom-4 !left-4"
        />
        <Panel
          position="top-left"
          className="!m-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-2 text-[10px] uppercase tracking-wider text-zinc-300 shadow-lg backdrop-blur"
        >
          <p className="mb-1 font-semibold text-zinc-200">Compartments</p>
          <ul className="space-y-0.5 text-zinc-400">
            <li><span className="mr-1 inline-block size-2 rounded-full bg-cyan-400/70 align-middle" />Precursor</li>
            <li><span className="mr-1 inline-block size-2 rounded-full bg-fuchsia-400/70 align-middle" />Cytosol</li>
            <li><span className="mr-1 inline-block size-2 rounded-full bg-amber-400/70 align-middle" />Vesicle</li>
            <li><span className="mr-1 inline-block size-2 rounded-full bg-violet-400/70 align-middle" />Synapse</li>
            <li><span className="mr-1 inline-block size-2 rounded-full bg-emerald-400/70 align-middle" />Extracellular</li>
            <li><span className="mr-1 inline-block size-2 rounded-full bg-zinc-300/70 align-middle" />Urine</li>
          </ul>
        </Panel>
        <MiniMap
          pannable
          zoomable
          className="!bg-zinc-950/80 !border !border-zinc-800"
          nodeColor={(n) =>
            n.type === ENZYME_NODE_TYPE ? "#67e8f9" : "#e879f9"
          }
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  );
}

export function PathwayCanvas() {
  return (
    <ReactFlowProvider>
      <PathwayCanvasInner />
    </ReactFlowProvider>
  );
}

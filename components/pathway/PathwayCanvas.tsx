"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useEffect, useMemo, useRef } from "react";
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
      <ParticleLayer />
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

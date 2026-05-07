"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { useSimulationStore } from "@/lib/simulation/store";
import type { ReactionEdgeData } from "@/lib/pathway/graph";
import { reactionAnimTransitSeconds } from "@/lib/simulation/kineticsConfig";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Flux is shown with a **stable** dashed-edge animation: duration is derived from
 * kinetics tier and simulation speed only (not per-tick flux), so path
 * updates from React Flow do not fight SVG motion primitives. Intensity still
 * tracks `lastFluxRate`. Moving dots were removed — they SMIL-jumped when node
 * layout or edge geometry changed at high speed / high load.
 */
function ReactionEdgeImpl(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
  } = props;
  const reactionId = (data as ReactionEdgeData | undefined)?.reactionId;

  const flux = useSimulationStore((s) =>
    reactionId ? (s.lastFlux[reactionId] ?? 0) : 0,
  );
  const fluxRate = useSimulationStore((s) =>
    reactionId ? (s.lastFluxRate[reactionId] ?? 0) : 0,
  );
  const speed = useSimulationStore((s) => s.speed);

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const cappedRate = clamp(fluxRate, 0, 48);
  const intensity = clamp(cappedRate / 5.2, 0, 1);
  const stroke =
    intensity > 0.62 ? "#e879f9" : intensity > 0.22 ? "#67e8f9" : "#52525b";

  const transitBase = reactionId ? reactionAnimTransitSeconds(reactionId) : 3.2;
  const durSec = clamp(
    transitBase / Math.sqrt(Math.max(0.2, speed)),
    0.95,
    18,
  );

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke,
          strokeWidth: 1.2 + intensity * 1.65,
          strokeDasharray: "5 7",
          strokeDashoffset: 0,
          opacity: 0.52 + intensity * 0.42,
          transition: "stroke 180ms ease-out, opacity 180ms ease-out, stroke-width 180ms ease-out",
          animation:
            intensity > 0.028
              ? `sysdope-edge-dash-flow ${durSec}s linear infinite`
              : undefined,
        }}
      />
      {intensity > 0.38 && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "none",
            }}
            className="rounded-full bg-zinc-950/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-fuchsia-200 ring-1 ring-fuchsia-500/40"
          >
            {flux.toFixed(1)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const ReactionEdge = memo(ReactionEdgeImpl);

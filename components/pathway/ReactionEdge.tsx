"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { useSimulationStore } from "@/lib/simulation/store";
import type { ReactionEdgeData } from "@/lib/pathway/graph";

const MAX_FLUX_PARTICLES = 2;

export function ReactionEdge(props: EdgeProps) {
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
    reactionId ? s.lastFlux[reactionId] ?? 0 : 0,
  );

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const intensity = Math.min(1, flux / 5);
  const stroke =
    intensity > 0.6 ? "#e879f9" : intensity > 0.2 ? "#67e8f9" : "#52525b";
  const dashSpeed = Math.max(0.01, intensity);
  const motionPathId = `${id}-sysdope-flux-path`;

  const particleCount =
    flux > 0.12
      ? Math.min(MAX_FLUX_PARTICLES, Math.max(1, Math.round(intensity * 2)))
      : 0;
  const baseDur = 1.35 / Math.max(0.15, dashSpeed);

  return (
    <>
      {particleCount > 0 && (
        <path
          id={motionPathId}
          d={path}
          fill="none"
          stroke="none"
          strokeWidth={0}
          aria-hidden
        />
      )}
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke,
          strokeWidth: 1.2 + intensity * 1.6,
          strokeDasharray: "4 6",
          strokeDashoffset: 0,
          opacity: 0.55 + intensity * 0.4,
          transition: "stroke 200ms ease, opacity 200ms ease",
          animation:
            intensity > 0.05
              ? `sysdope-edge-dash-flow ${1.4 / dashSpeed}s linear infinite`
              : undefined,
        }}
      />
      {particleCount > 0 &&
        Array.from({ length: particleCount }).map((_, i) => (
          <circle
            key={`${id}-p-${i}`}
            r={1.8}
            fill="#e879f9"
            opacity={0.75}
            className="sysdope-flux-particle-edge pointer-events-none"
            aria-hidden
          >
            <animateMotion
              dur={`${baseDur + i * 0.2}s`}
              repeatCount="indefinite"
              begin={`${i * (baseDur / particleCount)}s`}
              rotate="auto"
              calcMode="linear"
            >
              <mpath href={`#${motionPathId}`} />
            </animateMotion>
          </circle>
        ))}
      {intensity > 0.4 && (
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

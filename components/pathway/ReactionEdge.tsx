"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { useMemo } from "react";
import { useSimulationStore } from "@/lib/simulation/store";
import type { ReactionEdgeData } from "@/lib/pathway/graph";
import { reactionAnimTransitSeconds } from "@/lib/simulation/kineticsConfig";

const MAX_FLUX_PARTICLES = 2;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Flux dots use a **kinetics-tiered** transit time plus `sqrt(speed)` scaling so
 * wall-clock motion stays stable when per-tick flux swings (inhibition,
 * substepping, or 2×/4× time). Brightness still tracks the live rate.
 */
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

  const motionPathId = `${id}-sysdope-flux-path`;

  const intensity = clamp(fluxRate / 5.2, 0, 1);
  const stroke =
    intensity > 0.62 ? "#e879f9" : intensity > 0.22 ? "#67e8f9" : "#52525b";

  const transitBase = reactionId ? reactionAnimTransitSeconds(reactionId) : 3.2;
  const durSec = clamp(
    transitBase / Math.sqrt(Math.max(0.2, speed)),
    0.7,
    16,
  );

  const particleCount =
    fluxRate > 0.008
      ? Math.min(
          MAX_FLUX_PARTICLES,
          Math.max(1, fluxRate > 0.085 ? 2 : 1),
        )
      : 0;

  const animEpoch = useMemo(
    () => `${Math.round(durSec * 40)}-${Math.round(speed * 20)}`,
    [durSec, speed],
  );

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
          opacity: 0.52 + intensity * 0.42,
          transition: "stroke 220ms ease, opacity 220ms ease, stroke-width 220ms ease",
          animation:
            intensity > 0.035
              ? `sysdope-edge-dash-flow ${durSec}s linear infinite`
              : undefined,
        }}
      />
      {particleCount > 0 &&
        Array.from({ length: particleCount }).map((_, i) => (
          <circle
            key={`${id}-p-${animEpoch}-${i}`}
            r={1.85}
            fill="#e879f9"
            opacity={clamp(0.22 + intensity * 0.78, 0, 0.92)}
            className="sysdope-flux-particle-edge pointer-events-none"
            aria-hidden
          >
            <animateMotion
              dur={`${durSec}s`}
              repeatCount="indefinite"
              begin={`${(i * durSec) / Math.max(1, particleCount * 1.15)}s`}
              rotate="0"
              calcMode="linear"
            >
              <mpath href={`#${motionPathId}`} />
            </animateMotion>
          </circle>
        ))}
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

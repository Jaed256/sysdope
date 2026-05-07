"use client";

import { memo, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { useSimulationStore } from "@/lib/simulation/store";
import type { ReactionEdgeData } from "@/lib/pathway/graph";
import { reactionAnimTransitSeconds } from "@/lib/simulation/kineticsConfig";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** Coarsen flux readout so concentration ticks do not thrash stroke width every frame. */
function quantizeFluxRate(rate: number): number {
  if (rate <= 0) return 0;
  return Math.round(rate * 10) / 10;
}

function quantizeFlux(f: number): number {
  return Math.round(f * 4) / 4;
}

function quantizeSpeedDisplay(v: number): number {
  return Math.round(v * 24) / 24;
}

/**
 * Dash timing follows `speedDisplay` (eased toward simulation `speed` in the
 * store loop) so changing the speed dial does not snap CSS animation period.
 * Flux readout uses quantized slices. Dash animation stays defined; play-state
 * pauses when idle.
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

  const { flux, fluxRate, speedDisplay } = useSimulationStore(
    useShallow((s) => {
      if (!reactionId) {
        return {
          flux: 0,
          fluxRate: 0,
          speedDisplay: quantizeSpeedDisplay(s.speedDisplay ?? s.speed),
        };
      }
      return {
        flux: quantizeFlux(s.lastFlux[reactionId] ?? 0),
        fluxRate: quantizeFluxRate(s.lastFluxRate[reactionId] ?? 0),
        speedDisplay: quantizeSpeedDisplay(s.speedDisplay ?? s.speed),
      };
    }),
  );

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
  const durSec = useMemo(
    () =>
      clamp(
        Math.round((transitBase / Math.sqrt(Math.max(0.15, speedDisplay))) * 8) / 8,
        1.15,
        22,
      ),
    [transitBase, speedDisplay],
  );

  const dashActive = intensity > 0.012;

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
          opacity: dashActive ? 0.52 + intensity * 0.42 : 0.22,
          /** Do not `transition` dash-offset; it fights `animation` and glitches in Chrome. */
          animation: `sysdope-edge-dash-flow ${durSec}s linear infinite`,
          animationPlayState: dashActive ? "running" : "paused",
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

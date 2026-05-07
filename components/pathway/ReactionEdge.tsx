"use client";

import { memo, useMemo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { useSimulationStore } from "@/lib/simulation/store";
import type { ReactionEdgeData } from "@/lib/pathway/graph";
import { reactionAnimTransitSeconds } from "@/lib/simulation/kineticsConfig";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function quantizeFluxRate(rate: number): number {
  if (rate <= 0) return 0;
  return Math.round(rate * 10) / 10;
}

/** Match the speed slider step so dash timing does not churn between stops. */
function quantizeSpeed(s: number): number {
  return Math.round(s * 4) / 4;
}

/**
 * Flux = stroke weight + opacity. Dash motion uses **simulation `speed`**
 * (quantized) with duration `transitBase / speed` so higher × visibly runs
 * faster. `animation` shorthand is avoided — `animationName` + `animationDuration`
 * reduces Chrome resetting the keyframes when only duration changes.
 * Floating flux labels were removed (they read like stray “particles”).
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
  } = props;
  const reactionId = (data as ReactionEdgeData | undefined)?.reactionId;

  const { fluxRate, speedQ } = useSimulationStore(
    useShallow((s) => {
      const speedQ = quantizeSpeed(s.speed);
      if (!reactionId) {
        return { fluxRate: 0, speedQ };
      }
      return {
        fluxRate: quantizeFluxRate(s.lastFluxRate[reactionId] ?? 0),
        speedQ,
      };
    }),
  );

  const [path] = getBezierPath({
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
  const durSec = useMemo(() => {
    const sp = Math.max(0.2, speedQ);
    return clamp(Math.round((transitBase / sp) * 20) / 20, 0.75, 22);
  }, [transitBase, speedQ]);

  const dashActive = intensity > 0.01;

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={undefined}
      style={{
        stroke,
        strokeWidth: 1.15 + intensity * 1.7,
        strokeDasharray: "5 7",
        strokeDashoffset: 0,
        opacity: dashActive ? 0.5 + intensity * 0.44 : 0.2,
        animationName: "sysdope-edge-dash-flow",
        animationDuration: `${durSec}s`,
        animationIterationCount: "infinite",
        animationTimingFunction: "linear",
        animationPlayState: dashActive ? "running" : "paused",
      }}
    />
  );
}

export const ReactionEdge = memo(ReactionEdgeImpl);

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useEdges,
  useNodesInitialized,
  useReactFlow,
  useStore,
  type Edge,
} from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { useSimulationStore } from "@/lib/simulation/store";
import type { ReactionEdgeData } from "@/lib/pathway/graph";

const MAX_PARTICLES_PER_EDGE = 4;
const PARTICLE_BASE_DURATION_MS = 1200;

type EdgeEndpoint = {
  id: string;
  reactionId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/**
 * Real flux particles. For each reaction edge whose `lastFlux > 0` we render
 * a small number of dots that travel from source to target. Particle count
 * and animation speed scale with flux. Honors prefers-reduced-motion: when
 * the user prefers reduced motion, we render static dots at the edge midpoint
 * scaled by flux instead of animating.
 */
export function ParticleLayer() {
  const edges = useEdges<Edge<ReactionEdgeData>>();

  // Subscribe to React Flow's internal store so we re-render when nodes move
  // or the viewport changes.
  const nodeInternals = useStore((s) => s.nodeLookup);
  const transform = useStore((s) => s.transform);
  const initialized = useNodesInitialized();
  const { flowToScreenPosition } = useReactFlow();

  const fluxByReaction = useSimulationStore(
    useShallow((s) => s.lastFlux),
  );

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const endpoints = useMemo<EdgeEndpoint[]>(() => {
    if (!initialized) return [];
    const out: EdgeEndpoint[] = [];
    for (const e of edges) {
      const src = nodeInternals.get(e.source);
      const tgt = nodeInternals.get(e.target);
      if (!src || !tgt) continue;
      const srcW = src.measured?.width ?? 80;
      const srcH = src.measured?.height ?? 60;
      const tgtW = tgt.measured?.width ?? 80;
      const tgtH = tgt.measured?.height ?? 60;
      const p1 = flowToScreenPosition({
        x: src.position.x + srcW / 2,
        y: src.position.y + srcH / 2,
      });
      const p2 = flowToScreenPosition({
        x: tgt.position.x + tgtW / 2,
        y: tgt.position.y + tgtH / 2,
      });
      out.push({
        id: e.id,
        reactionId: (e.data as ReactionEdgeData | undefined)?.reactionId ?? e.id,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
      });
    }
    return out;
    // intentionally include `transform` so panning/zooming triggers a re-layout
  }, [edges, nodeInternals, flowToScreenPosition, initialized, transform]);

  // We need a parent ref so we can read its bounding rect to convert from
  // screen coords -> coords inside this layer.
  const layerRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!layerRef.current) return;
    const r = layerRef.current.getBoundingClientRect();
    setOrigin({ x: r.left, y: r.top });
    const onResize = () => {
      if (!layerRef.current) return;
      const rr = layerRef.current.getBoundingClientRect();
      setOrigin({ x: rr.left, y: rr.top });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      <style jsx global>{`
        @keyframes flux-travel {
          0% {
            transform: translate3d(var(--fx-x1), var(--fx-y1), 0) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--fx-x2), var(--fx-y2), 0) scale(1.0);
            opacity: 0;
          }
        }
      `}</style>

      {endpoints.map((e) => {
        const flux = fluxByReaction[e.reactionId] ?? 0;
        if (flux <= 0.1) return null;
        const intensity = Math.min(1, flux / 4);
        const count = Math.max(1, Math.round(intensity * MAX_PARTICLES_PER_EDGE));
        const duration = Math.max(
          400,
          PARTICLE_BASE_DURATION_MS * (1.4 - intensity),
        );
        const x1 = e.x1 - origin.x;
        const y1 = e.y1 - origin.y;
        const x2 = e.x2 - origin.x;
        const y2 = e.y2 - origin.y;

        if (reduced) {
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          return (
            <span
              key={e.id}
              className="absolute size-2 rounded-full bg-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,0.7)]"
              style={{
                transform: `translate3d(${mx}px, ${my}px, 0)`,
                opacity: 0.4 + intensity * 0.6,
              }}
            />
          );
        }

        return Array.from({ length: count }).map((_, i) => (
          <span
            key={`${e.id}-${i}`}
            className="absolute size-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.7)]"
            style={
              {
                top: 0,
                left: 0,
                animation: `flux-travel ${duration}ms linear ${(i * duration) / count}ms infinite`,
                "--fx-x1": `${x1}px`,
                "--fx-y1": `${y1}px`,
                "--fx-x2": `${x2}px`,
                "--fx-y2": `${y2}px`,
              } as React.CSSProperties
            }
          />
        ));
      })}
    </div>
  );
}

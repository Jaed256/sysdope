"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useEdges,
  useNodesInitialized,
  useReactFlow,
  useStore,
  useViewport,
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
 * Flux-weighted dots along enzyme edges. Must render as a child of
 * {@link ReactFlow} so hooks share the canvas store/coordinate system.
 * Positions rescale whenever the viewport, node measurements, or the host
 * element box changes (`ResizeObserver` + `viewport` deps).
 */
export function ParticleLayer() {
  const edges = useEdges<Edge<ReactionEdgeData>>();
  const nodeInternals = useStore((s) => s.nodeLookup);
  /** Subscribe to xy/z pan/zoom — keeps screen-space particle endpoints current. */
  const viewport = useViewport();

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
        reactionId:
          (e.data as ReactionEdgeData | undefined)?.reactionId ?? e.id,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
      });
    }
    return out;
  }, [
    edges,
    nodeInternals,
    flowToScreenPosition,
    initialized,
    viewport.x,
    viewport.y,
    viewport.zoom,
  ]);

  const layerRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;

    const syncOrigin = () => {
      const r = el.getBoundingClientRect();
      setOrigin({ x: r.left, y: r.top });
    };

    syncOrigin();

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => syncOrigin());
      ro.observe(el);
    }

    window.addEventListener("resize", syncOrigin);
    return () => {
      window.removeEventListener("resize", syncOrigin);
      ro?.disconnect();
    };
  }, [endpoints.length]);

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[4] overflow-hidden"
    >
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
            className="sysdope-flux-particle absolute size-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.7)]"
            style={
              {
                top: 0,
                left: 0,
                animationDuration: `${duration}ms`,
                animationDelay: `${(i * duration) / count}ms`,
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

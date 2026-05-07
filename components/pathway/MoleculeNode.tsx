"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo, useMemo } from "react";
import { clsx } from "clsx";
import { useSimulationStore } from "@/lib/simulation/store";
import { illustrativeExtracellularDopamineNm } from "@/lib/education/physiologicDisplay";
import { useUIPreferences } from "@/lib/ui/preferencesStore";
import type { MoleculeNodeData } from "@/lib/pathway/graph";
import type { Compartment } from "@/types/reaction";

/** Fixed layout box so React Flow edge geometry stays stable as concentrations change. */
const NODE_LAYOUT_W = 108;
const NODE_LAYOUT_MIN_H = 148;
/** Inner orb base size (px); “growth” is visual-only via `transform: scale`. */
const ORB_PX = 52;

const COMPARTMENT_COLORS: Record<Compartment, string> = {
  precursor: "ring-emerald-400/60 shadow-emerald-500/40",
  cytosol: "ring-fuchsia-400/60 shadow-fuchsia-500/40",
  vesicle: "ring-violet-400/60 shadow-violet-500/40",
  synapse: "ring-cyan-400/60 shadow-cyan-500/40",
  extracellular: "ring-amber-400/60 shadow-amber-500/40",
  urine: "ring-zinc-400/60 shadow-zinc-500/40",
};

const COMPARTMENT_LABELS: Record<Compartment, string> = {
  precursor: "PRE",
  cytosol: "CYT",
  vesicle: "VES",
  synapse: "SYN",
  extracellular: "EXT",
  urine: "URI",
};

function bucketize(v: number): string {
  if (v < 1) return "trace";
  if (v < 50) return "low";
  if (v < 150) return "med";
  if (v < 300) return "high";
  return "max";
}

function MoleculeNodeImpl({ data }: NodeProps) {
  const d = data as MoleculeNodeData;
  const conc = useSimulationStore((s) => {
    const m = s.concentrations[d.compoundId];
    if (!m) return 0;
    return m[d.compartment] ?? 0;
  });
  const open = useSimulationStore((s) => s.openDrawer);
  const illustrativeNm = useUIPreferences((s) => s.illustrativeExtracellularDaNm);
  const showSynDaNm =
    illustrativeNm && d.compoundId === "dopamine" && d.compartment === "synapse";
  const synDaNm = showSynDaNm ? illustrativeExtracellularDopamineNm(conc) : null;

  const { visualScale, opacity, bucket } = useMemo(() => {
    const t = Math.log10(1 + Math.max(0, conc));
    const visualScale = Math.min(1.42, Math.max(0.78, 0.82 + t * 0.12));
    const opacity = Math.min(1, 0.36 + t * 0.22);
    return { visualScale, opacity, bucket: bucketize(conc) };
  }, [conc]);

  const ringClass = COMPARTMENT_COLORS[d.compartment];

  return (
    <div
      className="relative flex shrink-0 flex-col items-center gap-1 select-none py-1"
      style={{ width: NODE_LAYOUT_W, minHeight: NODE_LAYOUT_MIN_H }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-zinc-600"
        style={{ top: "44%" }}
      />
      <div className="flex h-[72px] w-full shrink-0 items-center justify-center">
        <button
          type="button"
          onClick={() => open("compound", d.compoundId)}
          aria-label={`Inspect ${d.label} in ${d.compartment}`}
          className={clsx(
            "group flex shrink-0 items-center justify-center rounded-full bg-zinc-950/80 ring-2 transition-[box-shadow,ring-color] duration-300 hover:ring-4 focus:outline-none focus-visible:ring-4",
            "shadow-[0_0_30px_var(--tw-shadow-color)]",
            ringClass,
          )}
          style={{
            width: ORB_PX,
            height: ORB_PX,
            transform: `scale(${visualScale})`,
            opacity,
          }}
          data-bucket={bucket}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-100">
            {d.label.length > 8 ? d.label.slice(0, 6) + "…" : d.label}
          </span>
        </button>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1 rounded-full bg-zinc-900/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-400 ring-1 ring-zinc-800">
          <span>{COMPARTMENT_LABELS[d.compartment]}</span>
          <span className="text-zinc-500">·</span>
          <span className="tabular-nums text-zinc-200">{conc.toFixed(0)}</span>
        </div>
        {showSynDaNm && synDaNm !== null && (
          <span
            className="rounded-full bg-cyan-950/50 px-1.5 py-0.5 text-[8px] font-medium tabular-nums tracking-wide text-cyan-200 ring-1 ring-cyan-800/60"
            title="Illustrative extracellular-style DA (nM); PMID 15606895 anchor — not a patient calibration"
          >
            ≈{synDaNm.toFixed(1)} nM
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-zinc-600"
        style={{ top: "44%" }}
      />
    </div>
  );
}

export const MoleculeNode = memo(MoleculeNodeImpl);

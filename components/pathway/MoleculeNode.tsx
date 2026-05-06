"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo, useMemo } from "react";
import { clsx } from "clsx";
import { useSimulationStore } from "@/lib/simulation/store";
import type { MoleculeNodeData } from "@/lib/pathway/graph";
import type { Compartment } from "@/types/reaction";

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

  const sizing = useMemo(() => {
    const radius = Math.min(56, 28 + Math.sqrt(Math.max(0, conc)) * 1.6);
    const opacity = Math.min(1, 0.35 + Math.log10(1 + conc) * 0.25);
    return { radius, opacity, bucket: bucketize(conc) };
  }, [conc]);

  const ringClass = COMPARTMENT_COLORS[d.compartment];

  return (
    <div className="relative flex flex-col items-center gap-1 select-none">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-zinc-600"
      />
      <button
        type="button"
        onClick={() => open("compound", d.compoundId)}
        aria-label={`Inspect ${d.label} in ${d.compartment}`}
        className={clsx(
          "group flex items-center justify-center rounded-full bg-zinc-950/80 ring-2 transition-all duration-300 hover:ring-4 focus:outline-none focus-visible:ring-4",
          "shadow-[0_0_30px_var(--tw-shadow-color)]",
          ringClass,
        )}
        style={{
          width: sizing.radius,
          height: sizing.radius,
          opacity: sizing.opacity,
        }}
        data-bucket={sizing.bucket}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-100">
          {d.label.length > 8 ? d.label.slice(0, 6) + "…" : d.label}
        </span>
      </button>
      <div className="flex items-center gap-1 rounded-full bg-zinc-900/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-400 ring-1 ring-zinc-800">
        <span>{COMPARTMENT_LABELS[d.compartment]}</span>
        <span className="text-zinc-500">·</span>
        <span className="tabular-nums text-zinc-200">{conc.toFixed(0)}</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-zinc-600"
      />
    </div>
  );
}

export const MoleculeNode = memo(MoleculeNodeImpl);

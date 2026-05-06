"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";
import { clsx } from "clsx";
import { Beaker, Filter, Radar } from "lucide-react";
import { useSimulationStore } from "@/lib/simulation/store";
import type { EnzymeNodeData } from "@/lib/pathway/graph";
import type { EnzymeActivityLevel } from "@/types/simulation";

const ACTIVITY_RING: Record<EnzymeActivityLevel, string> = {
  inhibit: "ring-rose-500/80 shadow-rose-500/40",
  partial: "ring-amber-400/80 shadow-amber-500/40",
  normal: "ring-cyan-400/70 shadow-cyan-500/40",
  upregulate: "ring-emerald-400/80 shadow-emerald-500/40",
  overexpress: "ring-fuchsia-400/90 shadow-fuchsia-500/50",
};

const KIND_ICON = {
  enzyme: Beaker,
  transporter: Filter,
  receptor: Radar,
} as const;

function EnzymeGateImpl({ data }: NodeProps) {
  const d = data as EnzymeNodeData;
  const activity = useSimulationStore(
    (s) => s.enzymeActivity[d.enzymeId] ?? "normal",
  );
  const open = useSimulationStore((s) => s.openDrawer);
  const Icon = KIND_ICON[d.enzymeKind];

  return (
    <div className="relative flex flex-col items-center gap-1 select-none">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-zinc-600"
      />
      <button
        type="button"
        onClick={() => open("enzyme", d.enzymeId)}
        aria-label={`Inspect ${d.shortName}`}
        className={clsx(
          "flex h-10 w-20 items-center justify-center gap-1.5 rounded-md bg-zinc-950/80 ring-2 transition-all hover:ring-4 focus:outline-none focus-visible:ring-4",
          "shadow-[0_0_25px_var(--tw-shadow-color)]",
          ACTIVITY_RING[activity],
        )}
      >
        <Icon className="size-3.5 text-zinc-200" />
        <span className="text-[11px] font-bold tracking-wider text-zinc-100">
          {d.shortName}
        </span>
      </button>
      <span className="rounded-full bg-zinc-900/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-400 ring-1 ring-zinc-800">
        {activity}
      </span>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-zinc-600"
      />
    </div>
  );
}

export const EnzymeGate = memo(EnzymeGateImpl);

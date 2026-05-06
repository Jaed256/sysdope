"use client";

import { useSimulationStore } from "@/lib/simulation/store";
import { Sparkline } from "./Sparkline";

type LevelRow = {
  id: string;
  label: string;
  /** if specified, sum only these compartments; otherwise sum all */
  compartments?: string[];
  color?: string;
};

const LEVELS: LevelRow[] = [
  { id: "phenylalanine", label: "L-Phe", compartments: ["precursor"], color: "#34d399" },
  { id: "tyrosine", label: "L-Tyr", compartments: ["precursor"], color: "#34d399" },
  { id: "l_dopa", label: "L-DOPA", compartments: ["cytosol"], color: "#a3e635" },
  { id: "dopamine", label: "Cyto DA", compartments: ["cytosol"], color: "#e879f9" },
  { id: "dopamine", label: "Ves DA", compartments: ["vesicle"], color: "#a78bfa" },
  { id: "dopamine", label: "Syn DA", compartments: ["synapse"], color: "#67e8f9" },
  { id: "postsynaptic_d1", label: "D1 drive (rel.)", compartments: ["synapse"], color: "#c4b5fd" },
  { id: "postsynaptic_d2", label: "D2 drive (rel.)", compartments: ["synapse"], color: "#a5b4fc" },
  { id: "postsynaptic_d3", label: "D3 drive (rel.)", compartments: ["synapse"], color: "#93c5fd" },
  { id: "postsynaptic_d4", label: "D4 drive (rel.)", compartments: ["synapse"], color: "#7dd3fc" },
  { id: "postsynaptic_d5", label: "D5 drive (rel.)", compartments: ["synapse"], color: "#67e8f9" },
  { id: "norepinephrine", label: "NE", color: "#f472b6" },
  { id: "epinephrine", label: "Epi", color: "#fb7185" },
  { id: "dopal", label: "DOPAL", color: "#fbbf24" },
  { id: "dopac", label: "DOPAC", color: "#facc15" },
  { id: "three_mt", label: "3-MT", color: "#fde68a" },
  { id: "hva", label: "HVA / urine", color: "#fcd34d" },
];

export function LevelsDashboard() {
  const concentrations = useSimulationStore((s) => s.concentrations);
  const history = useSimulationStore((s) => s.history);
  const time = useSimulationStore((s) => s.time);

  return (
    <div className="glass w-full max-w-xs rounded-xl p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Live levels
        </h2>
        <span className="rounded-full bg-zinc-800/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-300">
          t = {time}
        </span>
      </div>
      <p className="mb-2 text-[10px] leading-relaxed text-zinc-500">
        Relative simulation units. Not clinical values.
      </p>
      <ul className="space-y-1.5">
        {LEVELS.map((row, idx) => {
          const map = concentrations[row.id] ?? {};
          const value = row.compartments
            ? row.compartments.reduce((s, k) => s + (map[k as keyof typeof map] ?? 0), 0)
            : Object.values(map).reduce((s, v) => s + (v ?? 0), 0);
          // history is total-across-compartments per compound
          const buf = history[row.id] ?? [];
          return (
            <li
              key={`${row.id}-${row.label}-${idx}`}
              className="flex items-center justify-between gap-2 rounded-md bg-zinc-900/40 px-2 py-1.5 ring-1 ring-zinc-800"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-zinc-100">
                  {row.label}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-zinc-500">
                  {row.compartments?.join(" + ") ?? "all compartments"}
                </p>
              </div>
              <Sparkline values={buf} stroke={row.color ?? "#e879f9"} width={64} height={18} />
              <span className="w-10 text-right text-xs tabular-nums text-zinc-200">
                {value.toFixed(0)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

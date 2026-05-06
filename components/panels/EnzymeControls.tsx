"use client";

import { clsx } from "clsx";
import { useSimulationStore } from "@/lib/simulation/store";
import { SEED_ENZYMES } from "@/lib/pathway/seedEnzymes";
import type { EnzymeActivityLevel } from "@/types/simulation";

const LEVELS: {
  level: EnzymeActivityLevel;
  short: string;
  color: string;
}[] = [
  { level: "inhibit", short: "0", color: "bg-rose-500/30 text-rose-100 ring-rose-400/40" },
  { level: "partial", short: "½", color: "bg-amber-500/30 text-amber-100 ring-amber-400/40" },
  { level: "normal", short: "1", color: "bg-cyan-500/30 text-cyan-100 ring-cyan-400/40" },
  { level: "upregulate", short: "↑", color: "bg-emerald-500/30 text-emerald-100 ring-emerald-400/40" },
  { level: "overexpress", short: "↑↑", color: "bg-fuchsia-500/30 text-fuchsia-100 ring-fuchsia-400/40" },
];

export function EnzymeControls() {
  const activity = useSimulationStore((s) => s.enzymeActivity);
  const set = useSimulationStore((s) => s.setEnzymeActivity);

  return (
    <div className="glass w-full rounded-xl p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        Enzyme · transporter activity
      </h3>
      <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {SEED_ENZYMES.map((e) => {
          const cur = activity[e.id] ?? "normal";
          return (
            <li
              key={e.id}
              className="flex items-center justify-between gap-2 rounded-md bg-zinc-900/40 px-2 py-1.5 ring-1 ring-zinc-800"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-zinc-100">
                  {e.shortName ?? e.name}
                </p>
                <p className="truncate text-[9px] uppercase tracking-wider text-zinc-500">
                  {e.kind}
                  {e.id === "th" && " · rate-limiting"}
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                {LEVELS.map((opt) => (
                  <button
                    key={opt.level}
                    type="button"
                    aria-label={`Set ${e.shortName} to ${opt.level}`}
                    title={opt.level}
                    onClick={() => set(e.id, opt.level)}
                    className={clsx(
                      "h-6 w-6 rounded text-[10px] font-bold ring-1 transition",
                      cur === opt.level
                        ? opt.color
                        : "bg-zinc-800/60 text-zinc-500 ring-zinc-700 hover:text-zinc-300",
                    )}
                  >
                    {opt.short}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

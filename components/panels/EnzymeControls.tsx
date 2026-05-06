"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSimulationStore } from "@/lib/simulation/store";
import { useUIPreferences } from "@/lib/ui/preferencesStore";
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
  const inhibitor = useSimulationStore((s) => s.inhibitorStrength);
  const setActivity = useSimulationStore((s) => s.setEnzymeActivity);
  const setInhibitor = useSimulationStore((s) => s.setInhibitorStrength);
  const advanced = useUIPreferences((s) => s.mode) === "advanced";
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="glass w-full rounded-xl p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        Enzyme · transporter activity
      </h3>
      <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
        {SEED_ENZYMES.map((e) => {
          const cur = activity[e.id] ?? "normal";
          const inh = inhibitor[e.id] ?? 0;
          const expanded = expandedId === e.id;
          return (
            <li
              key={e.id}
              className="rounded-md bg-zinc-900/40 ring-1 ring-zinc-800"
            >
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => advanced && setExpandedId(expanded ? null : e.id)}
                  disabled={!advanced}
                  className={clsx(
                    "flex min-w-0 flex-1 items-center gap-1 text-left",
                    !advanced && "cursor-default",
                  )}
                  aria-label={`Toggle ${e.shortName} controls`}
                >
                  {advanced &&
                    (expanded ? (
                      <ChevronDown className="size-3 shrink-0 text-zinc-500" />
                    ) : (
                      <ChevronRight className="size-3 shrink-0 text-zinc-500" />
                    ))}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-zinc-100">
                      {e.shortName ?? e.name}
                    </p>
                    <p className="truncate text-[9px] uppercase tracking-wider text-zinc-500">
                      {e.kind}
                      {e.id === "th" && " · rate-limiting"}
                      {inh > 0 && ` · inhibitor ${(inh * 100).toFixed(0)}%`}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-0.5">
                  {LEVELS.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      aria-label={`Set ${e.shortName} to ${opt.level}`}
                      title={opt.level}
                      onClick={() => setActivity(e.id, opt.level)}
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
              </div>
              {expanded && advanced && (
                <div className="space-y-1.5 border-t border-zinc-800 px-2 py-2">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400">
                    <label htmlFor={`inh-${e.id}`}>Inhibitor strength</label>
                    <span className="tabular-nums text-zinc-200">
                      {(inh * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    id={`inh-${e.id}`}
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={inh}
                    onChange={(ev) => setInhibitor(e.id, Number(ev.target.value))}
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-rose-400"
                  />
                  <p className="text-[10px] leading-snug text-zinc-500">
                    Continuous dial layered on top of the activity level. Effective
                    flux is multiplied by (1 − inhibitor).
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

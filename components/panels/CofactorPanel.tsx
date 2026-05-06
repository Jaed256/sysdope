"use client";

import { Pill, RefreshCw } from "lucide-react";
import { useSimulationStore } from "@/lib/simulation/store";
import { COFACTORS } from "@/lib/simulation/kineticsConfig";
import { Button } from "@/components/ui/Button";

export function CofactorPanel() {
  const cofactors = useSimulationStore((s) => s.cofactors);
  const refill = useSimulationStore((s) => s.refillCofactors);

  return (
    <div className="glass rounded-xl p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Pill className="size-3.5" />
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Cofactor pools
          </h3>
        </div>
        <Button size="sm" variant="ghost" onClick={refill}>
          <RefreshCw className="size-3" />
          Refill
        </Button>
      </div>
      <ul className="space-y-1.5">
        {(Object.entries(COFACTORS) as [string, (typeof COFACTORS)[keyof typeof COFACTORS]][]) .map(([id, cfg]) => {
          const v = cofactors[id] ?? cfg.replenishTarget;
          const pct = Math.min(1, v / cfg.replenishTarget);
          const danger = pct < 0.3;
          return (
            <li
              key={id}
              className="rounded-md bg-zinc-900/40 px-2 py-1.5 ring-1 ring-zinc-800"
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
                <span className="font-semibold text-zinc-200">{id}</span>
                <span className="tabular-nums text-zinc-400">
                  {v.toFixed(0)} / {cfg.replenishTarget}
                </span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={
                    danger
                      ? "h-full bg-rose-400 transition-[width] duration-200"
                      : "h-full bg-emerald-400 transition-[width] duration-200"
                  }
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] leading-snug text-zinc-500">
                Throttles {cfg.reactions.length} reaction
                {cfg.reactions.length === 1 ? "" : "s"}.
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

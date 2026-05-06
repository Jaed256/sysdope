"use client";

import { useSimulationStore } from "@/lib/simulation/store";
import { SCENARIOS } from "@/lib/simulation/scenarios";
import { Button } from "@/components/ui/Button";

export function ScenarioCards() {
  const apply = useSimulationStore((s) => s.applyScenario);
  return (
    <div className="glass rounded-xl p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        Scenarios
      </h3>
      <ul className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto pr-1">
        {SCENARIOS.map((sc) => (
          <li
            key={sc.id}
            className="rounded-md bg-zinc-900/40 p-2 ring-1 ring-zinc-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-zinc-100">
                  {sc.title}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-zinc-400">
                  {sc.description}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => apply(sc.id, "merge")}
              >
                Run
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

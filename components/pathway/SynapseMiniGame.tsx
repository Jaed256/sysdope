"use client";

import { useSimulationStore } from "@/lib/simulation/store";
import { Button } from "@/components/ui/Button";
import { Zap } from "lucide-react";

const RECEPTORS = [
  { id: "d1", label: "D1", coupling: "Gs" },
  { id: "d2", label: "D2", coupling: "Gi" },
  { id: "d3", label: "D3", coupling: "Gi" },
  { id: "d4", label: "D4", coupling: "Gi" },
  { id: "d5", label: "D5", coupling: "Gs" },
];

/**
 * Compact synapse panel: visualizes the cleft as a row of receptors lit up
 * in proportion to current synaptic dopamine. Trigger a release event with
 * the button.
 */
export function SynapseMiniGame() {
  const synDA = useSimulationStore((s) => s.concentrations.dopamine?.synapse ?? 0);
  const vesDA = useSimulationStore((s) => s.concentrations.dopamine?.vesicle ?? 0);
  const cytDA = useSimulationStore((s) => s.concentrations.dopamine?.cytosol ?? 0);
  const release = useSimulationStore((s) => s.releaseVesicles);
  const open = useSimulationStore((s) => s.openDrawer);

  const intensity = Math.min(1, synDA / 80);

  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Synapse
        </h3>
        <Button size="sm" variant="primary" onClick={() => release(1)}>
          <Zap className="size-3" />
          Release
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400">
        <div>
          <p>Cyto DA</p>
          <p className="tabular-nums text-zinc-100">{cytDA.toFixed(0)}</p>
        </div>
        <div>
          <p>Ves DA</p>
          <p className="tabular-nums text-zinc-100">{vesDA.toFixed(0)}</p>
        </div>
        <div>
          <p>Syn DA</p>
          <p className="tabular-nums text-zinc-100">{synDA.toFixed(0)}</p>
        </div>
      </div>
      <div className="mt-3">
        <div
          className="relative mx-auto h-10 rounded-md bg-cyan-500/5 ring-1 ring-cyan-500/20 transition"
          style={{ background: `rgba(34,211,238,${0.06 + intensity * 0.2})` }}
        >
          <div className="absolute inset-0 flex items-center justify-around">
            {RECEPTORS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => open("enzyme", r.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-wider text-cyan-100 ring-2 ring-cyan-400/40 transition hover:ring-cyan-300"
                style={{
                  background: `rgba(103,232,249,${0.1 + intensity * 0.6})`,
                  boxShadow: intensity > 0.1
                    ? `0 0 ${8 + intensity * 16}px rgba(103,232,249,${intensity * 0.6})`
                    : undefined,
                }}
                title={`${r.label} (${r.coupling}) — click for details`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-500">
          Click receptors for citations · Release pushes vesicular DA into the cleft
        </p>
      </div>
    </div>
  );
}

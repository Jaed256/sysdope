"use client";

import { Plus } from "lucide-react";
import { useSimulationStore } from "@/lib/simulation/store";
import { Button } from "@/components/ui/Button";
import type { Compartment } from "@/types/reaction";

const PRECURSORS: {
  compoundId: string;
  label: string;
  compartment: Compartment;
  amount: number;
}[] = [
  { compoundId: "phenylalanine", label: "L-Phe", compartment: "precursor", amount: 50 },
  { compoundId: "tyrosine", label: "L-Tyr", compartment: "precursor", amount: 50 },
  { compoundId: "l_dopa", label: "L-DOPA", compartment: "cytosol", amount: 25 },
  { compoundId: "dopamine", label: "Dopamine", compartment: "cytosol", amount: 25 },
];

export function PrecursorTray() {
  const addPrecursor = useSimulationStore((s) => s.addPrecursor);
  return (
    <div className="glass rounded-xl p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        Precursor inventory
      </h3>
      <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
        Add a bolus of substrate to the pathway to see how the system responds.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PRECURSORS.map((p) => (
          <Button
            key={p.compoundId}
            size="sm"
            variant="primary"
            onClick={() => addPrecursor(p.compoundId, p.compartment, p.amount)}
            title={`Add ${p.amount} units of ${p.label} to ${p.compartment}`}
          >
            <Plus className="size-3" />
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

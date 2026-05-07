"use client";

import { useSimulationStore } from "@/lib/simulation/store";
import { Button } from "@/components/ui/Button";
import { CitationList } from "@/components/ui/CitationList";
import { HOMEOSTASIS_LITERATURE } from "@/lib/simulation/kineticsConfig";
import { Zap, ArrowRightCircle } from "lucide-react";

const RECEPTORS = [
  { id: "d1", label: "D1", coupling: "Gs" },
  { id: "d2", label: "D2", coupling: "Gi" },
  { id: "d3", label: "D3", coupling: "Gi" },
  { id: "d4", label: "D4", coupling: "Gi" },
  { id: "d5", label: "D5", coupling: "Gs" },
];

function barPct(value: number, cap: number) {
  return Math.min(100, Math.max(0, (value / cap) * 100));
}

/**
 * Synapse + DAT teaching panel: cleft dopamine, vesicle release, reuptake flux
 * readout, and schematic homeostasis factors (relative simulation units).
 */
export function SynapseMiniGame() {
  const synDA = useSimulationStore((s) => s.concentrations.dopamine?.synapse ?? 0);
  const vesDA = useSimulationStore((s) => s.concentrations.dopamine?.vesicle ?? 0);
  const cytDA = useSimulationStore((s) => s.concentrations.dopamine?.cytosol ?? 0);
  const datFluxRate = useSimulationStore((s) => s.lastFluxRate.rx_dat ?? 0);
  const comtSynFlux = useSimulationStore((s) => s.lastFluxRate.rx_comt_da_to_3mt ?? 0);
  const release = useSimulationStore((s) => s.releaseVesicles);
  const open = useSimulationStore((s) => s.openDrawer);

  const toneEma = useSimulationStore((s) => s.synapticToneEma);
  const datFactor = useSimulationStore((s) => s.datHomeostaticFactor);
  const thTonic = useSimulationStore((s) => s.thTonicFactor);
  const d2Gain = useSimulationStore((s) => s.receptorHomeostaticFactor.d2 ?? 1);

  const intensity = Math.min(1, synDA / 80);
  const datBar = barPct(datFluxRate, 18);
  const comtBar = barPct(comtSynFlux, 6);

  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Synapse · DAT
        </h3>
        <div className="flex shrink-0 gap-1">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="!px-2 text-[10px]"
            title="Open DAT transporter details"
            onClick={() => open("enzyme", "dat")}
          >
            <ArrowRightCircle className="size-3.5" />
            DAT
          </Button>
          <Button
            size="sm"
            variant="primary"
            type="button"
            disabled={vesDA < 0.5}
            title={
              vesDA < 0.5
                ? "Need vesicular dopamine to release into the cleft."
                : "Vesicle fusion (toy): vesicular DA → synaptic cleft."
            }
            onClick={() => release(1)}
          >
            <Zap className="size-3" />
            Release
          </Button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400">
        <div>
          <p>Cyto DA</p>
          <p className="tabular-nums text-zinc-100">{cytDA.toFixed(0)}</p>
          <p className="mt-0.5 text-[9px] normal-case text-zinc-600">rel. units</p>
        </div>
        <div>
          <p>Ves DA</p>
          <p className="tabular-nums text-zinc-100">{vesDA.toFixed(0)}</p>
          <p className="mt-0.5 text-[9px] normal-case text-zinc-600">rel. units</p>
        </div>
        <div>
          <p>Syn DA</p>
          <p className="tabular-nums text-fuchsia-100">{synDA.toFixed(0)}</p>
          <p className="mt-0.5 text-[9px] normal-case text-zinc-600">rel. units</p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <div>
          <div className="mb-1 flex justify-between text-[9px] uppercase tracking-wider text-zinc-500">
            <span>DAT reuptake (last tick rate)</span>
            <span className="tabular-nums text-zinc-300">{datFluxRate.toFixed(2)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-[width] duration-200"
              style={{ width: `${datBar}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[9px] uppercase tracking-wider text-zinc-500">
            <span>COMT @ cleft → 3-MT (last tick rate)</span>
            <span className="tabular-nums text-zinc-300">{comtSynFlux.toFixed(2)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-violet-500/80 transition-[width] duration-200"
              style={{ width: `${comtBar}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-2 text-[9px] text-zinc-400">
        <div>
          <p className="uppercase tracking-wider text-zinc-500">Tone EMA</p>
          <p className="mt-0.5 tabular-nums text-zinc-100">{toneEma.toFixed(1)}</p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-zinc-500">DAT factor</p>
          <p className="mt-0.5 tabular-nums text-cyan-200">{datFactor.toFixed(2)}×</p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-zinc-500">TH tonic</p>
          <p className="mt-0.5 tabular-nums text-amber-200">{thTonic.toFixed(2)}×</p>
        </div>
        <div className="col-span-3 border-t border-zinc-800/80 pt-2">
          <p className="uppercase tracking-wider text-zinc-500">D2 gain (homeostasis)</p>
          <p className="mt-0.5 tabular-nums text-fuchsia-200">{d2Gain.toFixed(2)}×</p>
          <p className="mt-1 text-[8px] leading-snug text-zinc-600">
            Sustained high tone raises DAT schematic capacity and throttles TH; D2
            gain drifts down (toy downregulation). Educational schematic only.
          </p>
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
                  boxShadow:
                    intensity > 0.1
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
          Receptors · click for citations · Release works while paused
        </p>
      </div>

      <div className="mt-3 border-t border-zinc-800/80 pt-2">
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
          Concept anchors (not numeric calibration)
        </p>
        <CitationList citations={HOMEOSTASIS_LITERATURE} />
      </div>
    </div>
  );
}

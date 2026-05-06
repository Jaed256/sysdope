"use client";

import { useSimulationStore } from "@/lib/simulation/store";
import { illustrativeExtracellularDopamineNm } from "@/lib/education/physiologicDisplay";
import { useUIPreferences } from "@/lib/ui/preferencesStore";
import { dopamineEnzymaticOxidationShield } from "@/lib/simulation/dopamineModulation";
import { Sparkline } from "./Sparkline";

type LevelRow = {
  id: string;
  label: string;
  /** if specified, sum only these compartments; otherwise sum all */
  compartments?: string[];
  color?: string;
  /** show illustrative nM when toggle on (extracellular / synaptic DA only) */
  illustrativeNm?: boolean;
};

const LEVELS: LevelRow[] = [
  { id: "phenylalanine", label: "L-Phe", compartments: ["precursor"], color: "#34d399" },
  { id: "tyrosine", label: "L-Tyr", compartments: ["precursor"], color: "#34d399" },
  { id: "l_dopa", label: "L-DOPA", compartments: ["cytosol"], color: "#a3e635" },
  { id: "dopamine", label: "Cyto DA", compartments: ["cytosol"], color: "#e879f9" },
  { id: "dopamine", label: "Ves DA", compartments: ["vesicle"], color: "#a78bfa" },
  { id: "dopamine", label: "Syn DA", compartments: ["synapse"], color: "#67e8f9", illustrativeNm: true },
  {
    id: "dopamine",
    label: "EC DA",
    compartments: ["extracellular"],
    color: "#22d3ee",
    illustrativeNm: true,
  },
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
  const illustrativeNm = useUIPreferences((s) => s.illustrativeExtracellularDaNm);
  const lastAutoOx = useSimulationStore((s) => s.lastAutoOxidationFlux);
  const shield = useSimulationStore((s) => dopamineEnzymaticOxidationShield(s));

  const daMap = concentrations.dopamine ?? {};
  const autoOxPool =
    (daMap.cytosol ?? 0) + (daMap.synapse ?? 0);
  const autoOxHighlight = autoOxPool >= 2000 || lastAutoOx > 0.0005;

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
        Primary column: <span className="text-zinc-400">relative simulation units</span>
        {illustrativeNm ? (
          <>
            . Synaptic + extracellular DA rows also show{" "}
            <span className="text-cyan-300">illustrative nM</span> (rat
            microdialysis anchor, PMID 15606895)—{" "}
            <span className="text-zinc-400">
              not blood serum, not cytosolic intracellular nM
            </span>
            .
          </>
        ) : (
          <> (engine). Toggle illustrative nM in Settings.</>
        )}
      </p>
      <ul className="space-y-1.5">
        {LEVELS.map((row, idx) => {
          const map = concentrations[row.id] ?? {};
          const value = row.compartments
            ? row.compartments.reduce((s, k) => s + (map[k as keyof typeof map] ?? 0), 0)
            : Object.values(map).reduce((s, v) => s + (v ?? 0), 0);
          const buf = history[row.id] ?? [];
          const showNm = illustrativeNm && row.illustrativeNm;
          const nm = showNm ? illustrativeExtracellularDopamineNm(value) : null;
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
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className="w-12 text-right text-xs tabular-nums text-zinc-200">
                  {value.toFixed(0)}
                </span>
                {showNm && nm !== null && (
                  <span
                    className="max-w-[5.5rem] text-right text-[9px] tabular-nums text-cyan-300"
                    title="Illustrative extracellular-style DA (nM); linear toy mapping"
                  >
                    ≈{nm.toFixed(1)} nM
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className={`mt-3 rounded-md p-2 text-[10px] leading-snug ring-1 ${
          autoOxHighlight
            ? "bg-amber-500/10 text-amber-100 ring-amber-500/35"
            : "bg-zinc-900/50 text-zinc-300 ring-zinc-800"
        }`}
      >
        <p className="mb-1 font-semibold uppercase tracking-wider text-zinc-400">
          Autoxidation-sensitive DA (toy)
        </p>
        <p>
          Modeled pool (cytosol + synapse only):{" "}
          <span className="tabular-nums font-medium text-zinc-100">
            {autoOxPool.toFixed(0)}
          </span>{" "}
          rel. · Last-step sink flux:{" "}
          <span className="tabular-nums font-medium text-zinc-100">
            {lastAutoOx.toFixed(4)}
          </span>{" "}
          · Clearance index:{" "}
          <span className="tabular-nums font-medium text-zinc-100">
            {shield.toFixed(2)}
          </span>
        </p>
        <p className="mt-1 text-zinc-500">
          Real dopamine oxidation couples O₂, pH, metal ions, quinone chemistry,
          and enzymatic clearance in ways this graph cannot separate; the engine
          uses one competing schematic sink (see alerts / kinetics docs). High
          cytosolic boluses raise this pool even when synaptic nM stays low until
          you release vesicular stores.
        </p>
      </div>
    </div>
  );
}

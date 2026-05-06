"use client";

import { useMemo } from "react";
import { useSimulationStore } from "@/lib/simulation/store";
import { SEED_REACTIONS } from "@/lib/pathway/seedReactions";
import {
  dopamineEnzymaticOxidationShield,
  enzymeEffectiveMultiplier,
} from "@/lib/simulation/dopamineModulation";

const AUTOX_CONTEXT_ENZYMES = new Set([
  "mao_a",
  "mao_b",
  "comt",
  "aldh",
  "dat",
  "vmat2",
]);

type Props = { enzymeId: string };

/**
 * Live snapshot of graph flux through reactions mapped to this enzyme, plus
 * activity multiplier (inhibit / upregulate / inhibitor strength). Flux is in
 * relative simulation units for the last engine step — not SI rates.
 */
export function EnzymeFluxSection({ enzymeId }: Props) {
  const lastFlux = useSimulationStore((s) => s.lastFlux);
  const time = useSimulationStore((s) => s.time);
  const paused = useSimulationStore((s) => s.paused);
  const lastAutoOx = useSimulationStore((s) => s.lastAutoOxidationFlux);
  const multiplier = useSimulationStore((s) =>
    enzymeEffectiveMultiplier(s, enzymeId),
  );
  const shield = useSimulationStore((s) => dopamineEnzymaticOxidationShield(s));
  const actLevel = useSimulationStore(
    (s) => s.enzymeActivity[enzymeId] ?? "normal",
  );
  const inhStr = useSimulationStore(
    (s) => s.inhibitorStrength[enzymeId] ?? 0,
  );

  const rows = useMemo(
    () => SEED_REACTIONS.filter((r) => r.enzymeId === enzymeId),
    [enzymeId],
  );

  const totalFlux = useMemo(() => {
    let t = 0;
    for (const r of rows) {
      t += Math.abs(lastFlux[r.id] ?? 0);
    }
    return t;
  }, [rows, lastFlux]);

  return (
    <section>
      <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        Simulator flux (live)
      </h3>
      <p className="mb-2 text-[10px] leading-snug text-zinc-500">
        Values are <span className="text-zinc-400">relative simulation units</span>{" "}
        from the last integration step (t={time}
        {paused ? ", paused — flux frozen until you resume" : ""}). Upregulate or
        inhibit this target and watch the per-reaction totals change on the next
        tick.
      </p>

      <div className="mb-3 rounded-md bg-zinc-900/50 p-2 ring-1 ring-zinc-800">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
          Activity on this target
        </p>
        <p className="mt-1 text-[11px] text-zinc-200">
          Mode: <span className="font-medium text-fuchsia-200">{actLevel}</span>
          {" · "}
          Inhibitor strength:{" "}
          <span className="font-medium tabular-nums text-zinc-100">
            {(inhStr * 100).toFixed(0)}%
          </span>
          {" · "}
          Effective multiplier:{" "}
          <span className="font-medium tabular-nums text-cyan-200">
            {multiplier.toFixed(3)}×
          </span>
        </p>
      </div>

      {rows.length > 0 ? (
        <ul className="space-y-1.5">
          {rows.map((r) => {
            const f = lastFlux[r.id] ?? 0;
            return (
              <li
                key={r.id}
                className="rounded-md bg-zinc-900/40 p-2 ring-1 ring-zinc-800"
              >
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {r.id}
                </p>
                {r.equation && (
                  <p className="mt-0.5 text-[11px] text-zinc-300">{r.equation}</p>
                )}
                <p className="mt-1 text-xs tabular-nums text-zinc-100">
                  |flux| this step: {Math.abs(f).toFixed(3)}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[11px] text-zinc-500">
          No pathway reactions in the toy graph list this node as{" "}
          <code className="text-zinc-400">enzymeId</code> (for example postsynaptic
          drive nodes).
        </p>
      )}

      {rows.length > 0 && (
        <p className="mt-2 text-[10px] text-zinc-500">
          Sum of |flux| across mapped reactions:{" "}
          <span className="font-medium tabular-nums text-zinc-300">
            {totalFlux.toFixed(3)}
          </span>
        </p>
      )}

      {AUTOX_CONTEXT_ENZYMES.has(enzymeId) && (
        <div className="mt-3 rounded-md bg-amber-500/5 p-2 text-[11px] leading-snug text-amber-100 ring-1 ring-amber-500/25">
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Dopamine autoxidation (toy)
          </p>
          <p>
            Enzymatic clearance competes with a schematic auto-oxidation sink in
            relative units. Current sink flux:{" "}
            <span className="tabular-nums font-medium text-amber-200">
              {lastAutoOx.toFixed(4)}
            </span>
            {" · "}Clearance capacity index (higher → more modeled enzymatic
            competition):{" "}
            <span className="tabular-nums font-medium text-amber-200">
              {shield.toFixed(2)}
            </span>
          </p>
        </div>
      )}
    </section>
  );
}

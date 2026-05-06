"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, NotebookPen } from "lucide-react";
import { useSimulationStore } from "@/lib/simulation/store";

const LESSONS = [
  {
    id: "th_bottleneck",
    title: "Why TH is the bottleneck",
    body: `Tyrosine hydroxylase has a low maximum velocity compared to the
enzymes downstream of it on the catecholamine pathway. Even when tyrosine is
abundant, the saturated MM rate of TH caps L-DOPA production — and therefore
caps dopamine, norepinephrine, and epinephrine. Try the "Precursor overload"
scenario: phenylalanine and tyrosine spike, but downstream pools rise much
less. Now apply "TH inhibition" to see the effect amplified.`,
    written: true,
  },
  {
    id: "mao",
    title: "What happens when MAO is inhibited",
    body: "Coming soon — Phase 4.",
    written: false,
  },
  {
    id: "aldh",
    title: "Why ALDH protects against DOPAL buildup",
    body: "Coming soon — Phase 4.",
    written: false,
  },
  {
    id: "vmat2",
    title: "How VMAT2 protects cytosolic dopamine",
    body: "Coming soon — Phase 4.",
    written: false,
  },
  {
    id: "dat",
    title: "How DAT changes synaptic dopamine duration",
    body: "Coming soon — Phase 4.",
    written: false,
  },
  {
    id: "comt",
    title: "How COMT contributes to HVA output",
    body: "Coming soon — Phase 4.",
    written: false,
  },
];

export function LabNotebook() {
  const [openLesson, setOpenLesson] = useState<string | null>("th_bottleneck");
  const eventLog = useSimulationStore((s) => s.eventLog);

  return (
    <div className="glass rounded-xl p-3">
      <div className="mb-2 flex items-center gap-1.5 text-zinc-300">
        <NotebookPen className="size-3.5" />
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Lab notebook
        </h3>
      </div>

      <ul className="space-y-1">
        {LESSONS.map((l) => {
          const open = openLesson === l.id;
          return (
            <li
              key={l.id}
              className="rounded-md bg-zinc-900/40 ring-1 ring-zinc-800"
            >
              <button
                type="button"
                onClick={() => setOpenLesson(open ? null : l.id)}
                className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left"
              >
                <span className="text-[11px] font-medium text-zinc-100">
                  {l.title}
                </span>
                {open ? (
                  <ChevronDown className="size-3.5 text-zinc-500" />
                ) : (
                  <ChevronRight className="size-3.5 text-zinc-500" />
                )}
              </button>
              {open && (
                <div className="border-t border-zinc-800 px-2 py-2">
                  <p className="whitespace-pre-line text-[11px] leading-relaxed text-zinc-300">
                    {l.body}
                  </p>
                  {!l.written && (
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-amber-400">
                      Phase 4 placeholder
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <details className="mt-3">
        <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300">
          Event log ({eventLog.length})
        </summary>
        <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto rounded-md bg-zinc-950/60 p-1.5 font-mono text-[10px] text-zinc-400 ring-1 ring-zinc-800">
          {eventLog
            .slice()
            .reverse()
            .slice(0, 80)
            .map((line, i) => (
              <li key={`${line}-${i}`} className="truncate">
                {line}
              </li>
            ))}
        </ul>
      </details>
    </div>
  );
}

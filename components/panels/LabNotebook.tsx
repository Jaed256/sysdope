"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  NotebookPen,
  Play,
  Sparkles,
} from "lucide-react";
import { useSimulationStore } from "@/lib/simulation/store";
import { useUIPreferences } from "@/lib/ui/preferencesStore";
import { LESSONS, type Lesson } from "@/lib/knowledge/lessons";
import { CitationList } from "@/components/ui/CitationList";
import { Button } from "@/components/ui/Button";

const DIFFICULTY_STYLE: Record<Lesson["difficulty"], string> = {
  beginner: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  intermediate: "bg-sky-500/10 text-sky-300 ring-sky-500/30",
  advanced: "bg-fuchsia-500/10 text-fuchsia-300 ring-fuchsia-500/30",
};

export function LabNotebook() {
  const [openId, setOpenId] = useState<string | null>(LESSONS[0]?.id ?? null);
  const eventLog = useSimulationStore((s) => s.eventLog);
  const applyScenario = useSimulationStore((s) => s.applyScenario);
  const showCitations = useUIPreferences((s) => s.showCitations);
  const mode = useUIPreferences((s) => s.mode);

  const visibleLessons =
    mode === "beginner"
      ? LESSONS.filter((l) => l.difficulty !== "advanced")
      : LESSONS;

  return (
    <div className="glass rounded-xl p-3">
      <div className="mb-2 flex items-center gap-1.5 text-zinc-300">
        <NotebookPen className="size-3.5" />
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Lab notebook · guided lessons
        </h3>
        <span className="ml-auto rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-500">
          {mode}
        </span>
      </div>

      <ul className="space-y-1.5">
        {visibleLessons.map((l) => {
          const open = openId === l.id;
          return (
            <li
              key={l.id}
              className="rounded-md bg-zinc-900/40 ring-1 ring-zinc-800"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : l.id)}
                className="flex w-full items-start justify-between gap-2 px-2 py-1.5 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-zinc-100">
                    {l.title}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider ring-1 ring-inset ${DIFFICULTY_STYLE[l.difficulty]}`}
                >
                  {l.difficulty}
                </span>
                {open ? (
                  <ChevronDown className="size-3.5 shrink-0 text-zinc-500" />
                ) : (
                  <ChevronRight className="size-3.5 shrink-0 text-zinc-500" />
                )}
              </button>
              {open && (
                <div className="space-y-3 border-t border-zinc-800 px-2 py-2">
                  {l.body.map((p, i) => (
                    <p
                      key={i}
                      className="text-[11px] leading-relaxed text-zinc-300"
                    >
                      {p}
                    </p>
                  ))}

                  <div className="rounded-md bg-amber-500/5 p-2 ring-1 ring-amber-500/30">
                    <p className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                      <Sparkles className="size-3" /> What to watch
                    </p>
                    <ul className="ml-3 list-disc space-y-0.5 text-[10px] leading-snug text-amber-100">
                      {l.watchFor.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>

                  {l.scenarioId && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          applyScenario(
                            l.scenarioId!,
                            l.resetBeforeScenario ? "reset" : "merge",
                          )
                        }
                      >
                        <Play className="size-3" />
                        Try it
                      </Button>
                      <span className="text-[10px] text-zinc-500">
                        Runs scenario:{" "}
                        <code className="text-zinc-400">{l.scenarioId}</code>
                      </span>
                    </div>
                  )}

                  {showCitations && l.citations.length > 0 && (
                    <div>
                      <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                        Citations
                      </p>
                      <CitationList citations={l.citations} />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {mode === "beginner" && (
        <p className="mt-2 text-[10px] leading-snug text-zinc-500">
          Some advanced lessons are hidden. Switch to advanced mode in the
          settings panel to see them.
        </p>
      )}

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

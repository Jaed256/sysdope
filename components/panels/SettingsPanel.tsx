"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings2, Quote, GraduationCap, FlaskConical } from "lucide-react";
import { clsx } from "clsx";
import { useUIPreferences } from "@/lib/ui/preferencesStore";

/**
 * Floating settings menu in the workspace top-right. Two toggles:
 *   - Beginner / Advanced mode (gates the inhibitor strength slider, the
 *     cofactor pools panel, and advanced lessons)
 *   - Show / hide citations (gates citation lists in drawers, lessons,
 *     and cofactor tooltips; inline source links inside data fields are
 *     still always visible)
 */
export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const mode = useUIPreferences((s) => s.mode);
  const showCitations = useUIPreferences((s) => s.showCitations);
  const setMode = useUIPreferences((s) => s.setMode);
  const setShowCitations = useUIPreferences((s) => s.setShowCitations);

  // Avoid SSR/CSR mismatch flash from persisted preferences.
  useEffect(() => setHydrated(true), []);

  return (
    <div className="absolute right-3 top-3 z-30">
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-zinc-800 bg-zinc-950/80 p-2 text-zinc-300 shadow-lg backdrop-blur transition hover:border-fuchsia-500/50 hover:text-zinc-100"
      >
        <Settings2 className="size-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur"
          >
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Display preferences
            </h3>

            <div className="mb-3 space-y-1.5">
              <p className="text-[11px] font-medium text-zinc-200">Mode</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode("beginner")}
                  className={clsx(
                    "flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] ring-1 transition",
                    hydrated && mode === "beginner"
                      ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/40"
                      : "bg-zinc-900/40 text-zinc-400 ring-zinc-800 hover:text-zinc-200",
                  )}
                >
                  <GraduationCap className="size-3" />
                  Beginner
                </button>
                <button
                  type="button"
                  onClick={() => setMode("advanced")}
                  className={clsx(
                    "flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] ring-1 transition",
                    hydrated && mode === "advanced"
                      ? "bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-500/40"
                      : "bg-zinc-900/40 text-zinc-400 ring-zinc-800 hover:text-zinc-200",
                  )}
                >
                  <FlaskConical className="size-3" />
                  Advanced
                </button>
              </div>
              <p className="text-[10px] leading-snug text-zinc-500">
                Advanced mode reveals the inhibitor-strength sliders, cofactor
                pool panel, and the harder lessons.
              </p>
            </div>

            <label className="flex cursor-pointer items-start justify-between gap-2 rounded-md bg-zinc-900/40 p-2 ring-1 ring-zinc-800">
              <span className="flex flex-col">
                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-200">
                  <Quote className="size-3" /> Show citations
                </span>
                <span className="mt-0.5 text-[10px] leading-snug text-zinc-500">
                  Toggle the citation lists inside drawers, lessons, and
                  cofactor tooltips.
                </span>
              </span>
              <input
                type="checkbox"
                checked={hydrated ? showCitations : true}
                onChange={(e) => setShowCitations(e.target.checked)}
                className="mt-0.5 size-4 accent-fuchsia-400"
              />
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

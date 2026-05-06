"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UIMode = "beginner" | "advanced";

export type UIPreferences = {
  mode: UIMode;
  showCitations: boolean;
  /** When true, the global disclaimer strip is hidden (restorable from settings). */
  disclaimerDismissed: boolean;
  /**
   * When true, synaptic dopamine rows show an *illustrative* nM readout using a
   * fixed anchor tied to literature (see `lib/education/physiologicDisplay.ts`).
   * Core simulation state remains in relative units.
   */
  illustrativeExtracellularDaNm: boolean;
};

export type UIPreferencesStore = UIPreferences & {
  setMode: (mode: UIMode) => void;
  toggleMode: () => void;
  setShowCitations: (v: boolean) => void;
  toggleShowCitations: () => void;
  setIllustrativeExtracellularDaNm: (v: boolean) => void;
  dismissDisclaimer: () => void;
  restoreDisclaimer: () => void;
};

const DEFAULTS: UIPreferences = {
  mode: "beginner",
  showCitations: true,
  disclaimerDismissed: false,
  illustrativeExtracellularDaNm: false,
};

/**
 * Lightweight UI preferences store, persisted to localStorage so a returning
 * user keeps their mode and citations choice between sessions. Kept separate
 * from the simulation store so React Flow re-renders are not driven by UI
 * pref toggles.
 */
export const useUIPreferences = create<UIPreferencesStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set({ mode: get().mode === "beginner" ? "advanced" : "beginner" }),
      setShowCitations: (showCitations) => set({ showCitations }),
      toggleShowCitations: () => set({ showCitations: !get().showCitations }),
      setIllustrativeExtracellularDaNm: (illustrativeExtracellularDaNm) =>
        set({ illustrativeExtracellularDaNm }),
      dismissDisclaimer: () => set({ disclaimerDismissed: true }),
      restoreDisclaimer: () => set({ disclaimerDismissed: false }),
    }),
    {
      name: "sysdope.ui.v1",
      partialize: (s): UIPreferences => ({
        mode: s.mode,
        showCitations: s.showCitations,
        disclaimerDismissed: s.disclaimerDismissed,
        illustrativeExtracellularDaNm: s.illustrativeExtracellularDaNm,
      }),
      merge: (persisted, current): UIPreferencesStore => {
        const p =
          typeof persisted === "object" && persisted !== null
            ? (persisted as Partial<UIPreferences>)
            : {};
        // Fill new preference keys when localStorage predates them.
        return { ...current, ...DEFAULTS, ...p };
      },
    },
  ),
);

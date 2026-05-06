"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UIMode = "beginner" | "advanced";

export type UIPreferences = {
  mode: UIMode;
  showCitations: boolean;
};

export type UIPreferencesStore = UIPreferences & {
  setMode: (mode: UIMode) => void;
  toggleMode: () => void;
  setShowCitations: (v: boolean) => void;
  toggleShowCitations: () => void;
};

const DEFAULTS: UIPreferences = {
  mode: "beginner",
  showCitations: true,
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
    }),
    {
      name: "sysdope.ui.v1",
      version: 1,
    },
  ),
);

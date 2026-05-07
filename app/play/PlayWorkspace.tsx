"use client";

import { NavBar } from "@/components/landing/NavBar";
import { PathwayCanvas } from "@/components/pathway/PathwayCanvas";
import { LevelsDashboard } from "@/components/panels/LevelsDashboard";
import { EnzymeControls } from "@/components/panels/EnzymeControls";
import { CofactorPanel } from "@/components/panels/CofactorPanel";
import { SimulationControls } from "@/components/panels/SimulationControls";
import { AlertCenter } from "@/components/panels/AlertCenter";
import { ScenarioCards } from "@/components/panels/ScenarioCards";
import { LabNotebook } from "@/components/panels/LabNotebook";
import { LiteraturePanel } from "@/components/panels/LiteraturePanel";
import { SettingsPanel } from "@/components/panels/SettingsPanel";
import { CompoundDrawer } from "@/components/panels/CompoundDrawer";
import { EnzymeDrawer } from "@/components/panels/EnzymeDrawer";
import { PrecursorTray } from "@/components/pathway/PrecursorTray";
import { SynapseMiniGame } from "@/components/pathway/SynapseMiniGame";
import { useUIPreferences } from "@/lib/ui/preferencesStore";

export function PlayWorkspace() {
  const advanced = useUIPreferences((s) => s.mode) === "advanced";

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-[#050507]">
      <NavBar />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left rail — full width on small screens, fixed width on desktop */}
        <aside className="z-20 order-2 flex max-h-[38dvh] w-full shrink-0 flex-col gap-3 overflow-y-auto overflow-x-hidden border-zinc-800/80 p-3 sm:max-h-[42dvh] lg:order-1 lg:max-h-none lg:w-[min(300px,100%)] lg:border-r">
          <LevelsDashboard />
          {advanced && <CofactorPanel />}
          <PrecursorTray />
          <SynapseMiniGame />
        </aside>

        {/* Pathway canvas — primary on top for thumb reach */}
        <section className="relative order-1 flex min-h-[42dvh] flex-1 min-w-0 touch-manipulation lg:order-2 lg:min-h-0">
          <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center px-2 sm:top-3">
            <SimulationControls />
          </div>
          <SettingsPanel />
          <AlertCenter />
          <PathwayCanvas />
        </section>

        {/* Right rail */}
        <aside className="z-20 order-3 flex max-h-[38dvh] w-full shrink-0 flex-col gap-3 overflow-y-auto overflow-x-hidden border-zinc-800/80 p-3 sm:max-h-[42dvh] lg:max-h-none lg:w-[min(300px,100%)] lg:border-l">
          <EnzymeControls />
          <ScenarioCards />
          <LiteraturePanel />
          <LabNotebook />
        </aside>
      </div>

      <CompoundDrawer />
      <EnzymeDrawer />
    </div>
  );
}

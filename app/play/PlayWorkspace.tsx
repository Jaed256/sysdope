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
import { CompoundDrawer } from "@/components/panels/CompoundDrawer";
import { EnzymeDrawer } from "@/components/panels/EnzymeDrawer";
import { PrecursorTray } from "@/components/pathway/PrecursorTray";
import { SynapseMiniGame } from "@/components/pathway/SynapseMiniGame";

export function PlayWorkspace() {
  return (
    <div className="flex h-screen flex-col">
      <NavBar />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Left rail */}
        <aside className="z-20 flex w-[300px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-zinc-800/80 bg-zinc-950/40 p-3">
          <LevelsDashboard />
          <CofactorPanel />
          <PrecursorTray />
          <SynapseMiniGame />
        </aside>

        {/* Pathway canvas */}
        <section className="relative flex-1">
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
            <SimulationControls />
          </div>
          <AlertCenter />
          <PathwayCanvas />
        </section>

        {/* Right rail */}
        <aside className="z-20 flex w-[300px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-zinc-800/80 bg-zinc-950/40 p-3">
          <EnzymeControls />
          <ScenarioCards />
          <LabNotebook />
        </aside>
      </div>

      <CompoundDrawer />
      <EnzymeDrawer />
    </div>
  );
}

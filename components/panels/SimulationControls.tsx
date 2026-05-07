"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useSimulationStore } from "@/lib/simulation/store";
import { Button } from "@/components/ui/Button";

export function SimulationControls() {
  const paused = useSimulationStore((s) => s.paused);
  const speed = useSimulationStore((s) => s.speed);
  const togglePause = useSimulationStore((s) => s.togglePause);
  const setSpeed = useSimulationStore((s) => s.setSpeed);
  const reset = useSimulationStore((s) => s.reset);

  return (
    <div className="glass pointer-events-auto inline-flex max-w-full flex-nowrap items-center gap-1.5 rounded-lg px-2 py-1.5">
      <Button
        size="sm"
        variant={paused ? "primary" : "ghost"}
        onClick={togglePause}
        className="shrink-0"
      >
        {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
        {paused ? "Resume" : "Pause"}
      </Button>
      <Button size="sm" variant="ghost" onClick={reset} className="shrink-0">
        <RotateCcw className="size-3" />
        Reset
      </Button>
      <div className="flex shrink-0 items-center gap-1 border-l border-zinc-700/80 pl-1.5">
        <label
          htmlFor="sim-speed"
          className="hidden text-[9px] uppercase tracking-wider text-zinc-500 sm:inline"
        >
          Speed
        </label>
        <input
          id="sim-speed"
          type="range"
          min={0.25}
          max={4}
          step={0.25}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Simulation speed"
          className="h-1 w-[4.5rem] shrink-0 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-fuchsia-400 sm:w-24"
        />
        <span className="min-w-[2.75rem] shrink-0 text-right text-[10px] tabular-nums text-zinc-200">
          {speed.toFixed(2)}×
        </span>
      </div>
    </div>
  );
}

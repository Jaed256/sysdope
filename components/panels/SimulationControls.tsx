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
    <div className="glass flex flex-wrap items-center gap-2 rounded-xl p-2">
      <Button
        size="sm"
        variant={paused ? "primary" : "ghost"}
        onClick={togglePause}
      >
        {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
        {paused ? "Resume" : "Pause"}
      </Button>
      <Button size="sm" variant="ghost" onClick={reset}>
        <RotateCcw className="size-3" />
        Reset
      </Button>
      <div className="ml-1 flex items-center gap-1.5">
        <label
          htmlFor="sim-speed"
          className="text-[10px] uppercase tracking-wider text-zinc-400"
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
          className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-fuchsia-400"
        />
        <span className="w-8 text-right text-[10px] tabular-nums text-zinc-200">
          {speed.toFixed(2)}×
        </span>
      </div>
    </div>
  );
}

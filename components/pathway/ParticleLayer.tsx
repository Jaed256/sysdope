"use client";

import { useEffect, useState } from "react";
import { useSimulationStore } from "@/lib/simulation/store";

const PARTICLE_COUNT = 18;

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
};

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 6,
    duration: 8 + Math.random() * 12,
  }));
}

/**
 * Ambient decorative particle layer. Sits behind the React Flow canvas.
 * Particle count and opacity tween with total flux so the canvas visibly
 * "lights up" when the pathway is busy. Honors prefers-reduced-motion: when
 * the user prefers reduced motion, particles are rendered as static dots.
 */
export function ParticleLayer() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [reduced, setReduced] = useState(false);
  const totalFlux = useSimulationStore((s) =>
    Object.values(s.lastFlux).reduce((sum, v) => sum + v, 0),
  );
  const intensity = Math.min(1, totalFlux / 30);

  useEffect(() => {
    setParticles(makeParticles());
    if (typeof window !== "undefined" && window.matchMedia) {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduced(mql.matches);
      const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: 0.3 + intensity * 0.5 }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-fuchsia-300/70 shadow-[0_0_10px_rgba(232,121,249,0.7)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: reduced
              ? undefined
              : `particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes particle-drift {
          0% {
            transform: translate3d(0, 0, 0) scale(0.6);
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate3d(20px, -30px, 0) scale(1.1);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}

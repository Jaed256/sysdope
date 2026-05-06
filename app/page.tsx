import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { FeatureGrid } from "@/components/landing/FeatureGrid";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <Hero />
      <FeatureGrid />
      <footer className="border-t border-zinc-800/80 px-6 py-6 text-center text-[11px] text-zinc-500">
        SysDope · Educational simulation only · Not medical advice · Built with
        Next.js, React Flow, Motion, Zustand, and Zod
      </footer>
    </main>
  );
}

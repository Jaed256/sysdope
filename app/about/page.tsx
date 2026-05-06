import { NavBar } from "@/components/landing/NavBar";

export const metadata = {
  title: "SysDope · About",
  description:
    "SysDope is an interactive, citation-backed dopamine pathway simulator built as an educational portfolio project.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <article className="mx-auto max-w-3xl px-6 py-16 text-zinc-300">
        <p className="text-[11px] uppercase tracking-wider text-fuchsia-300">About</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight text-zinc-50">
          A small lab for understanding dopamine.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          SysDope models the catecholamine pathway as a tiny interactive game.
          Substrate flows through enzymes whose activity you can throttle,
          molecules accumulate when bottlenecks appear, and the simulator
          flashes alerts when known failure modes are reached — a TH bottleneck
          with abundant tyrosine but no L-DOPA, DOPAL accumulation when ALDH is
          inhibited, synaptic dopamine that lingers when DAT is blocked.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">
          What this project is — and is not
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
          <li><strong className="text-zinc-100">It is</strong> a teaching toy and a portfolio piece.</li>
          <li><strong className="text-zinc-100">It is not</strong> a clinical tool, a diagnostic, or a source of medical advice.</li>
          <li>Numeric values are <em>relative simulation units</em> calibrated for visual demonstration. They are not serum concentrations.</li>
          <li>Every scientific identifier in the side drawers links to a real database (PubChem, UniProt, ChEBI, HMDB, Rhea) and includes a citation.</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">Phase plan</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-zinc-300">
          <li><strong className="text-zinc-100">Phase 1 (current):</strong> seed pathway, headless engine, drawers, working PubChem adapter, Vitest tests.</li>
          <li><strong className="text-zinc-100">Phase 2:</strong> richer kinetics, more compartments, scenario presets, particle layer.</li>
          <li><strong className="text-zinc-100">Phase 3:</strong> Rhea / UniProt / ChEBI / HMDB / literature adapters wired through the same normalize layer.</li>
          <li><strong className="text-zinc-100">Phase 4:</strong> guided lessons, tooltips, source-toggle, beginner / advanced modes.</li>
          <li><strong className="text-zinc-100">Phase 5:</strong> portfolio polish — animated previews, more docs.</li>
        </ol>
      </article>
    </main>
  );
}

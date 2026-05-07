import Link from "next/link";
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
          surfaces alerts when pedagogical failure modes are crossed — a TH
          bottleneck with abundant tyrosine but little L-DOPA, a clear cue when
          TH is fully inhibited so the run does not feel “stuck,” DOPAL
          accumulation when ALDH is crippled, cytosolic dopamine risk when
          VMAT2 is low, synaptic dopamine that lingers when DAT is blocked,
          and postsynaptic D1–D5 “drive” hubs that illustrate where released
          dopamine is processed in the simplified graph.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">
          What this project is — and is not
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
          <li><strong className="text-zinc-100">It is</strong> a teaching toy and a portfolio piece.</li>
          <li><strong className="text-zinc-100">It is not</strong> a clinical tool, a diagnostic, or a source of medical advice.</li>
          <li>Numeric values are <em>relative simulation units</em> calibrated for visual demonstration. They are not serum concentrations.</li>
          <li>Identifiers in the drawers point to real databases (PubChem, UniProt, ChEBI, Rhea, Europe PMC) wherever an adapter is wired; manual / seed notes stay marked with low confidence citations.</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">Phase history</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
          <li><strong className="text-zinc-100">Phase 1</strong> — seed pathway, kinetic core, PubChem adapter, Vitest simulation tests, React Flow UI.</li>
          <li><strong className="text-zinc-100">Phase 2</strong> — dedicated kinetics config, cofactor pools, inhibitor sliders, adaptive substepping, flux-weighted edge animation, scenario cards.</li>
          <li><strong className="text-zinc-100">Phase 3</strong> — UniProt, Rhea, ChEBI, Europe PMC live adapters with Zod parsing, merged API routes, literature search panel, richer health endpoint.</li>
          <li><strong className="text-zinc-100">Phase 4</strong> — guided lessons, cofactor tooltips, beginner / advanced gating, citations toggle, Lab Notebook refresh.</li>
          <li><strong className="text-zinc-100">Phase 5 (current polish)</strong> — landing refresh, accurate docs, reversible global disclaimer, postsynaptic binding edges, stable pathway edge flux (inside React Flow), alert when TH is completely blocked, accessibility pass on marketing pages, GitHub links.</li>
        </ol>

        <p className="mt-10 text-sm">
          <Link href="/docs" className="text-fuchsia-300 underline-offset-2 hover:underline">
            Read the technical docs
          </Link>
          {" "}or{" "}
          <Link href="/play" className="text-fuchsia-300 underline-offset-2 hover:underline">
            jump straight into the simulator
          </Link>
          .
        </p>
      </article>
    </main>
  );
}

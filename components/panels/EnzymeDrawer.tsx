"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSimulationStore } from "@/lib/simulation/store";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { CitationList } from "@/components/ui/CitationList";
import { CofactorChip } from "@/components/ui/CofactorChip";
import { useUIPreferences } from "@/lib/ui/preferencesStore";
import type { Enzyme } from "@/types/enzyme";

type EnrichedEnzyme = Enzyme & {
  catalyticActivities?: { name: string; ecNumber?: string; rheaId?: string }[];
  relatedReactions?: { equation?: string; rheaId: string; ecNumbers: string[] }[];
};

type ApiResponse = {
  enzyme: EnrichedEnzyme;
  sources: { seed: boolean; uniprot: boolean; rhea: boolean };
};

const Field = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 py-1 text-xs">
      <dt className="uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="text-zinc-100">{value}</dd>
    </div>
  );
};

export function EnzymeDrawer() {
  const drawer = useSimulationStore((s) => s.drawer);
  const close = useSimulationStore((s) => s.closeDrawer);
  const showCitations = useUIPreferences((s) => s.showCitations);
  const open = drawer?.kind === "enzyme";
  const id = drawer?.kind === "enzyme" ? drawer.targetId : null;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    const ctl = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`/api/enzymes/${encodeURIComponent(id)}`, { signal: ctl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: ApiResponse) => setData(j))
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
      })
      .finally(() => setLoading(false));
    return () => ctl.abort();
  }, [id]);

  const enzyme = data?.enzyme;

  return (
    <Drawer
      open={open}
      onClose={close}
      title={enzyme?.name ?? id ?? "Enzyme"}
      subtitle={enzyme ? `${enzyme.kind}${enzyme.shortName ? ` · ${enzyme.shortName}` : ""}` : undefined}
    >
      {loading && (
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-xs">Loading…</span>
        </div>
      )}
      {error && (
        <p className="rounded-md bg-rose-500/10 p-2 text-xs text-rose-200 ring-1 ring-rose-500/30">
          Failed to load: {error}
        </p>
      )}
      {enzyme && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="info">Seed</Badge>
            <Badge variant={data?.sources.uniprot ? "success" : "warning"}>
              {data?.sources.uniprot ? "UniProt live" : "UniProt offline"}
            </Badge>
            <Badge variant={data?.sources.rhea ? "success" : "warning"}>
              {data?.sources.rhea ? "Rhea live" : "Rhea offline"}
            </Badge>
          </div>

          <section>
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Identity
            </h3>
            <dl>
              <Field label="Gene" value={enzyme.geneSymbol} />
              <Field label="Protein" value={enzyme.proteinName} />
              <Field label="EC number" value={enzyme.ecNumber} />
              <Field label="UniProt" value={enzyme.uniprotId} />
              <Field label="Compartment" value={enzyme.subcellularLocation} />
            </dl>
            {enzyme.cofactors && enzyme.cofactors.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">
                  Cofactors
                </p>
                <div className="flex flex-wrap gap-1">
                  {enzyme.cofactors.map((c) => (
                    <CofactorChip key={c} label={c} />
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-zinc-500">
                  Hover a chip for the cofactor&apos;s role and citations.
                </p>
              </div>
            )}
          </section>

          {enzyme.reactionEquation && (
            <section>
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Reaction catalyzed
              </h3>
              <pre className="overflow-x-auto rounded-md bg-zinc-900/60 p-2 font-mono text-[11px] leading-snug text-zinc-100 ring-1 ring-zinc-800">
                {enzyme.reactionEquation}
              </pre>
            </section>
          )}

          <section className="grid grid-cols-1 gap-2">
            {enzyme.inhibitionEffect && (
              <div className="rounded-md bg-rose-500/5 p-2 text-[11px] text-rose-100 ring-1 ring-rose-500/30">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                  When inhibited
                </p>
                {enzyme.inhibitionEffect}
              </div>
            )}
            {enzyme.upregulationEffect && (
              <div className="rounded-md bg-emerald-500/5 p-2 text-[11px] text-emerald-100 ring-1 ring-emerald-500/30">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                  When upregulated / overexpressed
                </p>
                {enzyme.upregulationEffect}
              </div>
            )}
          </section>

          {enzyme.relatedReactions && enzyme.relatedReactions.length > 0 && (
            <section>
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Related Rhea reactions
              </h3>
              <ul className="space-y-1.5">
                {enzyme.relatedReactions.map((r) => (
                  <li
                    key={r.rheaId}
                    className="rounded-md bg-zinc-900/40 p-2 ring-1 ring-zinc-800"
                  >
                    <a
                      href={`https://www.rhea-db.org/rhea/${r.rheaId}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[10px] uppercase tracking-wider text-fuchsia-300 hover:text-fuchsia-200"
                    >
                      Rhea {r.rheaId}
                    </a>
                    {r.equation && (
                      <p className="mt-0.5 break-words text-[11px] text-zinc-200">
                        {r.equation}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {enzyme.diseases && enzyme.diseases.length > 0 && (
            <section>
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Disease associations
              </h3>
              <ul className="space-y-2">
                {enzyme.diseases.map((d) => (
                  <li
                    key={d.name}
                    className="rounded-md bg-zinc-900/40 p-2 ring-1 ring-zinc-800"
                  >
                    <p className="text-xs font-medium text-zinc-100">
                      {d.name}
                    </p>
                    <p className="text-[11px] text-zinc-400">{d.relationship}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showCitations && (
            <section>
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Citations
              </h3>
              <CitationList citations={enzyme.citations} />
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
}

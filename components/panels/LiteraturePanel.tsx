"use client";

import { useCallback, useState } from "react";
import { BookOpen, Loader2, Search, ExternalLink } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";

const PRESET_QUERIES = [
  "tyrosine hydroxylase rate limiting dopamine",
  "DOPAL toxicity ALDH Parkinson",
  "VMAT2 cytosolic dopamine vesicular",
  "MAO inhibitor dopamine clinical",
  "DAT reuptake synaptic dopamine duration",
];

const LiteratureResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  abstract: z.string().optional(),
  doi: z.string().optional(),
  pmid: z.string().optional(),
  pmcid: z.string().optional(),
  journal: z.string().optional(),
  authors: z.string().optional(),
  year: z.number().optional(),
  url: z.string().optional(),
});

const LiteratureResponseSchema = z.object({
  query: z.string(),
  count: z.number(),
  results: z.array(LiteratureResultSchema),
  source: z.string(),
});

type Literature = z.infer<typeof LiteratureResultSchema>;

export function LiteraturePanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Literature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/literature/search?q=${encodeURIComponent(q)}&limit=8`,
      );
      if (!res.ok) {
        setError(`Search failed (${res.status})`);
        setResults([]);
        return;
      }
      const json: unknown = await res.json();
      const parsed = LiteratureResponseSchema.safeParse(json);
      if (!parsed.success) {
        setError("Unexpected response shape from search API");
        setResults([]);
        return;
      }
      setResults(parsed.data.results);
    } catch (err) {
      setError((err as Error).message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="glass rounded-xl p-3">
      <div className="mb-2 flex items-center gap-1.5 text-zinc-300">
        <BookOpen className="size-3.5" />
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Literature search
        </h3>
        <span className="ml-auto rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-500">
          Europe PMC
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void search(query);
        }}
        className="flex items-center gap-1.5"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search peer-reviewed literature..."
          className="min-w-0 flex-1 rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-1 text-[11px] text-zinc-100 placeholder:text-zinc-600 focus:border-fuchsia-400 focus:outline-none"
        />
        <Button size="sm" variant="primary" type="submit" disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="size-3 animate-spin" /> : <Search className="size-3" />}
        </Button>
      </form>

      <div className="mt-2 flex flex-wrap gap-1">
        {PRESET_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setQuery(q);
              void search(q);
            }}
            className="rounded-full border border-zinc-800 bg-zinc-900/40 px-2 py-0.5 text-[9px] uppercase tracking-wider text-zinc-400 transition hover:border-fuchsia-500/50 hover:text-zinc-100"
          >
            {q.split(" ").slice(0, 3).join(" ")}…
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-[10px] text-rose-400">Error: {error}</p>
      )}

      {results.length > 0 && (
        <ul className="mt-2 max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {results.map((r) => (
            <li
              key={r.id}
              className="rounded-md bg-zinc-900/40 p-2 ring-1 ring-zinc-800"
            >
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group block"
              >
                <p className="line-clamp-2 text-[11px] font-medium leading-snug text-zinc-100 group-hover:text-fuchsia-300">
                  {r.title}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-zinc-400">
                  {[r.journal, r.year].filter(Boolean).join(" · ")}
                </p>
                {r.authors && (
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-zinc-500">
                    {r.authors}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-2 text-[9px] uppercase tracking-wider text-zinc-500">
                  {r.pmid && <span>PMID {r.pmid}</span>}
                  {r.doi && <span className="truncate">DOI {r.doi}</span>}
                  <ExternalLink className="size-2.5" />
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && results.length === 0 && query && (
        <p className="mt-2 text-[10px] text-zinc-500">
          No results for &quot;{query}&quot;.
        </p>
      )}

      <p className="mt-2 text-[10px] leading-snug text-zinc-500">
        Live search of <span className="text-zinc-400">europepmc.org</span>.
        Results are cached server-side for 6 hours per query.
      </p>
    </div>
  );
}

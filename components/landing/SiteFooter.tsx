"use client";

import Link from "next/link";
import { useUIPreferences } from "@/lib/ui/preferencesStore";

export function SiteFooter() {
  const dismissed = useUIPreferences((s) => s.disclaimerDismissed);
  const restoreDisclaimer = useUIPreferences((s) => s.restoreDisclaimer);

  return (
    <footer className="border-t border-zinc-800/80 px-6 py-6 text-center text-[11px] text-zinc-500">
      <p className="text-zinc-400">
        SysDope · Educational simulation only · Not medical advice · Built with
        Next.js, React Flow, Motion, Zustand, and Zod
      </p>
      {dismissed && (
        <p className="mt-3">
          <button
            type="button"
            onClick={() => restoreDisclaimer()}
            className="text-fuchsia-300 underline underline-offset-2 hover:text-fuchsia-200"
          >
            Show the educational disclaimer banner again
          </button>
          <span className="mx-2 text-zinc-700">·</span>
          <Link
            href="/play"
            className="text-zinc-400 underline underline-offset-2 hover:text-zinc-300"
          >
            Launch simulator
          </Link>
        </p>
      )}
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import { useUIPreferences } from "@/lib/ui/preferencesStore";

/**
 * Global disclaimer required on every surface; users may dismiss it locally and
 * restore it from /play settings or the home footer link.
 */
export function DisclaimerBanner() {
  const dismissed = useUIPreferences((s) => s.disclaimerDismissed);
  const dismissDisclaimer = useUIPreferences((s) => s.dismissDisclaimer);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <aside
        role="note"
        className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-[11px] text-amber-200"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <Info className="size-3.5 shrink-0" />
          <p>
            <strong className="font-semibold">Educational simulation only.</strong> Not medical
            advice. Values are simplified and labeled relative simulation units unless explicitly
            source-backed.
          </p>
        </div>
      </aside>
    );
  }

  if (dismissed) return null;

  return (
    <aside
      role="note"
      className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-[11px] text-amber-200"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <Info className="size-3.5 shrink-0" />
        <p className="min-w-0 flex-1">
          <strong className="font-semibold">Educational simulation only.</strong> Not medical
          advice. Values are simplified and labeled relative simulation units unless explicitly
          source-backed.
        </p>
        <button
          type="button"
          onClick={() => dismissDisclaimer()}
          className="shrink-0 rounded-md px-2 py-1 font-medium uppercase tracking-wider text-amber-100 ring-1 ring-amber-500/40 transition hover:bg-amber-500/15"
          aria-label="Hide disclaimer banner"
        >
          <span className="inline-flex items-center gap-1">
            <X className="size-3.5" />
            Dismiss
          </span>
        </button>
      </div>
    </aside>
  );
}

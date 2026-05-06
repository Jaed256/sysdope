import Link from "next/link";
import { Atom, Code2 } from "lucide-react";

const NAV = [
  { href: "/play", label: "Play" },
  { href: "/about", label: "About" },
  { href: "/docs", label: "Docs" },
];

export function NavBar() {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-zinc-100">
          <span className="relative flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-500/30 to-cyan-500/30 ring-1 ring-fuchsia-400/40">
            <Atom className="size-4 text-fuchsia-200" />
          </span>
          <span className="text-sm font-semibold tracking-wider uppercase">
            Sys<span className="text-fuchsia-300">Dope</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-xs">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-2.5 py-1.5 text-zinc-300 transition hover:bg-zinc-800/60 hover:text-zinc-100"
            >
              {n.label}
            </Link>
          ))}
          <a
            href="https://github.com/Jaed256/sysdope"
            target="_blank"
            rel="noreferrer"
            className="ml-1 flex items-center gap-1 rounded-md px-2.5 py-1.5 text-zinc-300 transition hover:bg-zinc-800/60 hover:text-zinc-100"
            aria-label="SysDope source on GitHub"
          >
            <Code2 className="size-3.5" />
            <span className="hidden sm:inline">Source</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

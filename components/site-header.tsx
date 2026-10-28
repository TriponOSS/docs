"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { site, topNav } from "@/lib/site";

/**
 * The title bar is a terminal tabline: one full-bleed row, flush to the top of
 * the window, and it scrolls away with the page. The wordmark is a lit block;
 * the current route is the only other lit thing on the bar; the rest are dim
 * tabs. The path readout is the shell's pwd.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const cwd = pathname === "/" ? "~" : `~${pathname}`;

  // `/docs/language/types` is under both [docs] and [language]. Light the one
  // with the longest matching href so exactly one tab is ever current.
  const current = topNav
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <header className="masthead">
      <div className="wrap masthead-bar">
        <Link href="/" className="wordmark" aria-label={`${site.name} — home`}>
          <span className="wordmark-plate">{site.wordmark}</span>
          <span className="wordmark-caret" aria-hidden="true" />
        </Link>

        <span className="masthead-cwd" aria-hidden="true">
          {cwd}
        </span>

        <nav className="masthead-nav" aria-label="Primary">
          {topNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current === item.href ? "page" : undefined}
            >
              [{item.label}]
            </Link>
          ))}
        </nav>

        <Link href={site.repo} className="masthead-repo">
          [github]
        </Link>
      </div>
    </header>
  );
}
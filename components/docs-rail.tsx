"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { docsNav } from "@/lib/site";

export function DocsRail() {
  const pathname = usePathname();

  /* A nested page keeps its section current: /docs/diagnostics/E0202 lights up
     Diagnostic codes, not Overview. The longest matching href wins, so /docs
     stays quiet on every child page. */
  const active = docsNav
    .flatMap((group) => group.items)
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="docs-rail" aria-label="Documentation">
      {docsNav.map((group) => (
        <div className="rail-group" key={group.label}>
          <span className="rail-label">{group.label}</span>
          <ul>
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

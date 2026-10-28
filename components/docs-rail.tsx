"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { docsNav } from "@/lib/site";

export function DocsRail() {
  const pathname = usePathname();

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
                  aria-current={pathname === item.href ? "page" : undefined}
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { docsNav } from "@/lib/site";

/** Every docs page, in reading order, so previous and next are one list. */
const order = docsNav.flatMap((group) => group.items);

export function DocsPager() {
  const pathname = usePathname();
  const at = order.findIndex((item) => item.href === pathname);
  if (at === -1) return null;

  const prev = order[at - 1];
  const next = order[at + 1];
  if (!prev && !next) return null;

  return (
    <nav className="pager" aria-label="Pagination">
      {prev ? (
        <Link href={prev.href}>
          <span className="pager-dir">previous</span>
          {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="pager-next">
          <span className="pager-dir">next</span>
          {next.label}
        </Link>
      ) : null}
    </nav>
  );
}

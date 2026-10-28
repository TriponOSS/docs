"use client";

import { usePathname } from "next/navigation";

import { Session } from "@/components/code";

/**
 * The 404 as the toolchain would report it: the address that was asked for, the
 * code, the hint, the exit status. The path is only known in the browser, so
 * this much of the page is a client component.
 */
export function NotFoundTerm() {
  const path = usePathname() || "/";

  return (
    <Session
      lines={[
        `$ ralt check ${path}`,
        `${path}:404:1: error: no such page; it is not part of the tree`,
        "  [E0404 page-not-found] start at /docs; every code is under /docs/diagnostics",
        "",
        "exit status 1",
      ]}
    />
  );
}
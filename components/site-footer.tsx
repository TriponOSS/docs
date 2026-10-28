import Link from "next/link";

import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <hr className="rule" />
        <div className="footer-grid">
          <div>
            <p className="footer-line">
              {site.name}, {site.license} licensed. Source at{" "}
              <Link href={site.repo}>TriponOSS/tripon</Link>.
            </p>
            <p className="footer-line dim">
              The animated ASCII art on this site is{" "}
              <Link href="https://ascii.rest">ascii.rest</Link> by @bas3line, {site.license} —
              pieces by name, drawn in this page&apos;s own ink.
            </p>
          </div>
          <div className="footer-meta">
            <p>
              <span className="dim">spec</span> v0.0
            </p>
            <p>
              <span className="dim">backend</span> C99 + x86-64
            </p>
            <p>
              <span className="dim">phase</span> P4 in progress
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

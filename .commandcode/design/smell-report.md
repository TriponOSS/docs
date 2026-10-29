# Smell Report — Tripon docs

**Project**: Tripon docs (tripon-docs)
**Mode**: smell
**Date**: 2026-10-29
**Score**: 10/10 — CLEAN

## Summary

No AI slop tells detected. The surface has a deliberate, project-specific identity: a compiler's terminal. Every visual choice traces to the toolchain's own vocabulary (severity colors, amber prompt, blue-black CRT ground), and the composition follows the dominant work pattern (Learn/Decide). No generic defaults were found.

## Heuristic Scores

| # | Odor | Score | Finding |
|---|---|---|---|
| 1 | Tech gradient | 1 | None. Only gradient is a functional hero scrim in `app/landing.css:101-114`. |
| 2 | Generic tech hue | 1 | None. Identity hue is amber `--signal: #f0a63c`, derived from terminal prompt, not blue-violet. |
| 3 | Feature tile grid | 1 | None. Sections use varied layouts: contract table, tiers grid, steps, numbers, readon. |
| 4 | Accent rail | 1 | None. No colored side stripes. |
| 5 | Unearned blur | 1 | None. No backdrop-filter or blur anywhere. |
| 6 | Stat monument | 1 | None. Numbers carry context (bench-note, session transcripts). |
| 7 | Icon topper | 1 | None. No decorative icons above headings. |
| 8 | Bounce everywhere | 1 | None. Only motion is the ascii.rest art (functional, not decorative). |
| 9 | Default type | 1 | None. JetBrains Mono chosen with explicit reason (ascii.rest glyph metrics). |
| 10 | Center stack | 1 | None. Left-aligned composition throughout; hero splits at 62rem. |

## Findings

None.

## Considered but Rejected

| Location | Candidate | Rejected because |
|---|---|---|
| `app/landing.css:101` | Hero scrim gradient | It is a functional legibility device (text over art), not a decorative tech gradient. |
| `app/page.tsx:331` | Tiers grid (4 equal columns) | Equal columns are correct here — tiers are genuinely equal in weight and scannable as a set. |
| `app/page.tsx:384` | Numbers section (2 columns) | Two-column split serves the compare/learn work pattern; not a feature tile grid. |

## Verification

- Inspected all CSS files: `globals.css`, `landing.css`, `components.css`, `art.css`, `docs.css`, `app/docs.css`, `art.css`.
- Searched for: gradients, blur, border-radius, box-shadow, Inter/Roboto/Plus Jakarta, bounce/elastic easing, icon-topper patterns.
- Result: no AI-tell patterns found.

## Verdict

**Approve** — no smells detected; surface reads as authored.
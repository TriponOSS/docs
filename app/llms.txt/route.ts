import { diagnostics } from "@/lib/diagnostics";
import { docsNav, site } from "@/lib/site";

/**
 * /llms.txt — the playbook, in the shape an agent can read in one pass.
 *
 * The link list follows the llms.txt convention: an H1, a one-paragraph
 * summary, then sections of `- [title](url): note`. The playbook sections above
 * the links are the part that is specific to Tripon: the loop, the JSON
 * contract, and the rules that prevent most diagnostics before they happen.
 */

const abs = (href: string) => `${site.url}${href}`;

function docsSection() {
  return docsNav
    .map((group) => {
      const items = group.items
        .map((item) => `- [${item.label}](${abs(item.href)})`)
        .join("\n");
      return `### ${group.label}\n\n${items}`;
    })
    .join("\n\n");
}

function diagnosticsSection() {
  return diagnostics
    .map(
      (d) =>
        `- [${d.code} ${d.name}](${abs(`/docs/diagnostics/${d.code}`)}): ${d.hint}`,
    )
    .join("\n");
}

const body = `# Tripon

> Tripon is a statically typed, compiled language for low-resource systems. A
> .tp file compiles to C99 (default) or x86-64 through one static binary, ralt.
> There is no null, no implicit conversion, no undefined behaviour and no
> garbage collector. Four tiers — kernel, core, std, full — decide how much
> runtime a file may assume. Every diagnostic carries a stable code, an exact
> span and a fix hint.

Tripon is designed to be driven by a program as much as by a person. The
compiler's output is deterministic, the diagnostic table is append-only, and
the commands that describe a program are cheaper than building it.

## The loop

1. Write the program in a \`.tp\` file. One file is one compilation unit.
2. Check it: \`ralt check foo.tp --json\`. This runs lex, parse and typecheck; it
   does not emit or link.
3. Parse the array. Each object has \`code\`, \`kind\`, \`name\`, \`file\`, \`line\`,
   \`col\`, \`len\`, \`msg\`, \`hint\`. An empty array is a clean check.
4. Fix by span. \`line\` and \`col\` are 1-based, \`len\` counts bytes from the start
   of the token. Fix the earliest diagnostic first; later ones are often cascade.
5. Run it: \`ralt run foo.tp\`. Exit 0 is success, 1 is a diagnostic, 101 is a
   trap (the program ran and hit a defined edge), 2 is a bad command line.
6. For a release: \`ralt build foo.tp -o foo\`.

Do not guess at a diagnostic's meaning from \`msg\`. \`ralt explain E0202\` prints
the stable name and hint, and every code has a page at
${abs("/docs/diagnostics")}.

## The diagnostic object

    { "code": "E0202",
      "kind": "error",          // error | warn
      "name": "type-mismatch",
      "file": "bad.tp",
      "line": 5,                // 1-based
      "col": 13,                // 1-based, byte column
      "len": 7,                 // bytes covered
      "msg": "i32 and f64 do not share an operator; no implicit conversion exists",
      "hint": "types must match exactly; no implicit conversion exists; use cast<T>(x)" }

Codes are never renumbered and never reused. Match on \`code\`; never match on
\`msg\`.

## Rules that prevent most diagnostics

- Every type boundary is exact: binding to initializer, argument to parameter,
  operand to operand, return to signature. Write \`cast<T>(x)\`; there is no
  implicit widening, not even i32 to i64.
- No null. Use \`opt<T>\` and consume it with \`match\` or \`?\`.
- A \`result<T, E>\` may not be dropped: \`match\` it or spread it with \`?\`
  (E0205). \`?\` is legal only in a function whose return type matches.
- \`match\` over an enum must cover every variant or end in \`_\` (E0206).
- A condition must be \`bool\`. There is no truthiness and no \`cast<bool>\`.
- Integer literals are \`i32\` when they fit, otherwise \`i64\`. Floats are \`f64\`.
- Arrays are declared, never literal: \`let a: [3]i32;\` then \`a[0] = 1;\`.
  They are local-only — no array parameters. Index with \`i32\`; \`len(a)\` is
  \`i32\` and is a compile-time constant.
- Strings are NUL-terminated bytes. Six escapes: \\n \\t \\r \\0 \\\\ \\". No
  single quotes, no interpolation, no concatenation.
- Integer arithmetic traps on overflow (E9001), division or remainder by zero
  (E9003). Indexing traps at run time (E9002); a constant index out of range is
  E0202 at check time. \`ralt run -fast\` selects wrapping instead of the
  overflow trap.
- Not in v0: \`**\`, bitwise and shift operators, \`for\`, \`loop\`, \`break\`,
  \`continue\`, slices \`[]T\`, references \`&T\`, top-level \`const\`, \`pub\`,
  modules, single-quoted strings, chained assignment. Tier ceilings are parsed
  but not enforced yet (E0301/E0302 are reserved, not emitted).

## Commands

- \`ralt check <file.tp> [--json]\` — lex, parse, typecheck. Clean exit 0.
- \`ralt run <file.tp> [-fast]\` — build in memory and execute.
- \`ralt build <file.tp> [-o out] [-O fast] [-fast] [--backend native]\` — write
  an executable. The default backend emits C99 and calls cc.
- \`ralt emit <file.tp>\` — write the generated C.
- \`ralt explain <code>\` — code, severity, name, hint.
- \`ralt fmt <file.tp>\` — the only formatter; two-space indent.
- \`ralt doc [--json]\` — the documented surface.
- \`ralt init <name>\` — scaffold ralt.yaml and src/main.tp.
- \`ralt lsp\` — language server on stdio.
- \`ralt tokens <file.tp>\` / \`ralt tree <file.tp>\` — lexer and parse-tree
  oracles: deterministic dumps for checking a port.

## Docs

${docsSection()}

## Diagnostic codes

${diagnosticsSection()}

## Source

- [tripon](https://github.com/TriponOSS/tripon): compiler, spec, examples, tests
- [docs](https://github.com/TriponOSS/docs): this site
- The spec is three files: \`spec/grammar.ebnf\`, \`spec/tripon.md\`,
  \`spec/errors.csv\`. The compiler is held to them, not the other way around.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
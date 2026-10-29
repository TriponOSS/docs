import type { Metadata } from "next";
import Link from "next/link";

import { CommandLine, Session } from "@/components/code";
import { docsNav, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "The Tripon documentation tree: getting started, the language contract, the ralt toolchain, the frozen diagnostic table, the agent interface, and the specification the compiler is held to.",
  alternates: { canonical: "/docs" },
};

const cloneLine = `git clone ${site.repo} && cd tripon && make`;

/** One line per page: what it answers, in the order the rail lists them. */
const blurbs: Record<string, string> = {
  "/docs/getting-started": "Clone it, build the one binary, run a .tp file.",
  "/docs/hello-tripon": "Every line of the first program, and what each one does.",
  "/docs/language": "The shape of the language: lexical surface, statements, precedence.",
  "/docs/language/types": "Widths, inference, and cast<T>, the only conversion.",
  "/docs/language/data": "Structs, enums with payloads, and exhaustive match.",
  "/docs/language/errors": "opt<T>, result<T, E>, and ? propagation in place of null.",
  "/docs/language/arrays": "Fixed arrays, bounds checks, and what a str really is.",
  "/docs/language/modules": "pub exports, use \"file.tp\" as alias, alias::fn calls.",
  "/docs/language/tiers": "The ceiling you declare, and what each tier carries.",
  "/docs/language/traps": "The no-UB contract, code by code: E9001 to E9004.",
  "/docs/toolchain": "Every subcommand of ralt, every flag, and what it writes.",
  "/docs/diagnostics": "The frozen table: code, severity, name and fix hint.",
  "/docs/reference": "The lookup: every builtin, operator, statement and literal.",
  "/docs/reference/builtins": "print_i32 through len, plus some, none, ok, err and cast<T>.",
  "/docs/reference/operators": "Precedence, operand types, and which operators exist at all.",
  "/docs/reference/statements": "The nine statement forms, with the diagnostic for each edge.",
  "/docs/reference/literals": "Number forms, six escapes, identifiers, keywords and comments.",
  "/docs/stdlib": "The pure-Tripon library: math, opt/result, str, containers.",
  "/docs/self-hosting": "The compiler ports written in the language they compile.",
  "/docs/roadmap": "P0 through P4, what shipped, and what is next.",
};

const groups = docsNav.map((group) => ({
  ...group,
  items: group.items.filter((item) => item.href !== "/docs"),
}));

export default function DocsIndex() {
  return (
    <>
      <h1>The documentation</h1>

      <p>
        Tripon is a statically typed language for machines with very little room —{" "}
        <code>i8</code> to <code>i64</code>, no allocator, no runtime. It compiles to
        C99 by default and to x86-64 assembly on request, through one static binary,{" "}
        <code>ralt</code>.
      </p>

      <p>
        These pages are the language contract and the toolchain, in reading order.
        Every program on them is an example in the repository, and every transcript is
        copied from a live run against the binary this page was written with.
      </p>

      <CommandLine command={cloneLine} />

      <div className="docs-index">
        {groups.flatMap((group) =>
          group.items.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className="idx-t">{item.label}</span>
              <span className="idx-d">{blurbs[item.href] ?? group.label}</span>
            </Link>
          )),
        )}
      </div>

      <h2>What holds the pages down</h2>

      <p>
        A documentation site drifts from its compiler, so the parts that could drift
        are machine-checked instead: the diagnostic table is generated from{" "}
        <code>spec/errors.csv</code>, and every sample under <code>tests/cases/</code>{" "}
        is run by the test suite.
      </p>

      <Session
        title="the contract, tested"
        lines={[
          "$ make test",
          "59 checks passing, gcc and clang",
          "$ sh tests/determinism.sh",
          "byte-identical on every build",
        ]}
      />

      <p>
        <code>spec/grammar.ebnf</code> and <code>spec/errors.csv</code> are the source
        of truth, not the C code:{" "}
        <Link href="/docs/diagnostics">the diagnostic table</Link> is the same table the
        compiler emits and the goldens check. Error codes are append-only — never
        renumbered, never reused — which is what lets a fix written against{" "}
        <code>E0202</code> still mean the same thing ten releases later.
      </p>

      <h2>Reading the diagnostics</h2>

      <p>
        <code>ralt check --json</code> answers with one array, one object per
        diagnostic, each carrying a code, an exact <code>{"{file,line,col,len}"}</code>{" "}
        span and a fix hint — and every command in the toolchain is deterministic, so
        the same input always produces the same bytes. If you want the whole table
        as one fetch, <Link href="/llms.txt">/llms.txt</Link> is the playbook.
      </p>
    </>
  );
}

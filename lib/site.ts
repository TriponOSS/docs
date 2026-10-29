export const site = {
  name: "Tripon",
  wordmark: "tripon",
  binary: "ralt",
  extension: ".tp",
  url: "https://tripon.vspcoderz.tech",
  repo: "https://github.com/TriponOSS/tripon",
  org: "https://github.com/TriponOSS",
  license: "MIT",
  tagline: "A compiled language for low-resource systems, with no FFI, no null and no undefined behavior.",
  description:
    "Tripon is a statically typed language that compiles to C99 and x86-64. Four tiers decide how much runtime you can afford. No null, no undefined behavior, no implicit conversions, and every diagnostic carries a stable code, an exact span and a fix hint.",
} as const;

export type NavItem = { href: string; label: string };

export const topNav: NavItem[] = [
  { href: "/docs/getting-started", label: "start" },
  { href: "/docs/language", label: "language" },
  { href: "/docs/toolchain", label: "toolchain" },
  { href: "/docs/diagnostics", label: "diagnostics" },
];

export type NavGroup = { label: string; items: NavItem[] };

export const docsNav: NavGroup[] = [
  {
    label: "start",
    items: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/getting-started", label: "Getting started" },
      { href: "/docs/hello-tripon", label: "Hello, Tripon" },
    ],
  },
  {
    label: "language",
    items: [
      { href: "/docs/language", label: "The language" },
      { href: "/docs/language/types", label: "Types and inference" },
      { href: "/docs/language/data", label: "Structs, enums, match" },
      { href: "/docs/language/errors", label: "opt, result and ?" },
      { href: "/docs/language/arrays", label: "Arrays and strings" },
      { href: "/docs/language/tiers", label: "Tiers" },
      { href: "/docs/language/traps", label: "Traps and no-UB" },
    ],
  },
  {
    label: "toolchain",
    items: [
      { href: "/docs/toolchain", label: "ralt reference" },
      { href: "/docs/diagnostics", label: "Diagnostic codes" },
    ],
  },
  {
    label: "reference",
    items: [
      { href: "/docs/reference", label: "Reference" },
      { href: "/docs/reference/builtins", label: "Builtins" },
      { href: "/docs/reference/operators", label: "Operators" },
      { href: "/docs/reference/statements", label: "Statements" },
      { href: "/docs/reference/literals", label: "Literals and names" },
    ],
  },
  {
    label: "more",
    items: [
      { href: "/docs/stdlib", label: "Standard library" },
      { href: "/docs/self-hosting", label: "Self-hosting" },
      { href: "/docs/roadmap", label: "Roadmap" },
    ],
  },
];

/* ---------------------------------------------------------------------------
   Numbers.
   Measured by bench/build_bench.sh on a cold cache; the binary size is the
   x86-64 hello built by the default pipeline. Reproduce with `make bench`.
   ------------------------------------------------------------------------- */

export const benchmarks = [
  { key: "build", label: "full build", value: 333, unit: "ms", note: "emit, cc, link" },
  { key: "check", label: "ralt check", value: 4, unit: "ms", note: "type gates only" },
  { key: "emit", label: "codegen only", value: 5, unit: "ms", note: "writes the .c" },
  { key: "size", label: "hello binary", value: 17.7, unit: "KB", note: "x86-64, dynamic" },
];

/** The source tree, verbatim, for the file-tree piece. */
export const repoTTree = `spec/
  grammar.ebnf
  errors.csv
ralt/
  src/
    lex.c
    parse.c
    parse_tree.c
    typecheck.c
    codegen.c
    native.c
    fmt.c
    doc.c
    lsp.c
    deps.c
    util.c
    diag.c
    common.h
    main.c
src/
  main.tp
  selfhost/
    lexer.tp
    parser.tp
    check.tp
  stdlib/
    kernel/
    core/
tests/
  cases/
  expected/
  run.sh
  determinism.sh
  selfhost.sh
  deps_smoke.sh
  lsp_smoke.sh
bench/
  build_bench.sh
LICENSE
README.md
PLAN.md
Makefile`;

/* ---------------------------------------------------------------------------
   Programs. Every sample on this site runs; the output under each one is the
   output the toolchain prints today.
   ------------------------------------------------------------------------- */

export type Sample = {
  id: string;
  title: string;
  path: string;
  source: string;
  output: string;
  note?: string;
};

export const fibSample: Sample = {
  id: "fib",
  title: "fib.tp",
  path: "fib.tp",
  source: `use tier core;

fn fib(n: i32) -> i32 {
    let a = 0;
    let b = 1;
    let idx = 0;
    while idx < n {
        let next = a + b;
        a = b;
        b = next;
        idx += 1;
    }
    return a;
}

fn main() -> i32 {
    let n = 0;
    while n < 10 {
        print_i32(fib(n));
        n += 1;
    }
    return 0;
}`,
  output: `0
1
1
2
3
5
8
13
21
34`,
  note: "Signatures are explicit, locals infer. `idx += 1` is a compound assign; there is no `++`.",
};

export const resultSample: Sample = {
  id: "result",
  title: "result_ok.tp",
  path: "tests/cases/result_ok.tp",
  source: `use tier core;

fn parse(s: str) -> result<i32, str> {
    if s == "" { return err("empty input"); }
    return ok(42);
}

fn validate(n: i32) -> result<i32, str> {
    if n < 10 { return err("too small"); }
    return ok(n * 2);
}

fn run() -> result<i32, str> {
    let n = parse("hi")?;
    let m = validate(n)?;
    return ok(m);
}

fn handle(r: result<i32, str>) -> i32 {
    match r {
        ok(v) => { return v; }
        err(e) => { print_str(e); return -1; }
    }
}

fn main() -> i32 {
    print_i32(handle(run()));
    return 0;
}`,
  output: `84`,
  note: "`?` propagates an err to the caller. A result that is discarded without `?` or `match` is E0205.",
};

export const traitSample = `struct Point { x: i32; y: i32; }

enum Res { Good(i32), Bad(str), Empty }

fn show(r: Res) -> i32 {
    match r {
        Res::Good(v) => { print_i32(v); }
        Res::Bad(b)  => { print_str(b); }
        Res::Empty   => { }
    }
    return 0;
}

fn scale(p: Point) -> Point {
    return Point { x: p.x * 2, y: p.y * 2 };
}`;

export const termSample = `use tier core;

fn find(x: i32) -> opt<i32> {
    if x > 0 { return some(x); }
    return none;
}

fn show(o: opt<i32>) {
    match o {
        some(v) => { print_i32(v); }
        none    => { print_str("none"); }
    }
}`;

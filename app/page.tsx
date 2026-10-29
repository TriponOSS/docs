import Link from "next/link";
import type { Metadata } from "next";

import { Art } from "@/components/art/art";
import { Code, CommandLine, Session } from "@/components/code";
import { bands, exitCodes } from "@/lib/diagnostics";
import { fibSample, repoTTree, site } from "@/lib/site";

export const metadata: Metadata = {
  // `absolute`, or the layout's `%s — Tripon` template appends the name twice.
  title: { absolute: `${site.name} — ${site.tagline}` },
  description: site.description,
  alternates: { canonical: "/" },
};

const cloneLine = `git clone ${site.repo} && cd tripon && make`;

/* The no-UB table. Left column names the bug a C programmer knows; the middle
   column is what the code generator actually emits; the right is the outcome. */
const contract = [
  {
    classic: "integer overflow",
    tripon: "traps, exit 101, E9001 — or wraps with -fast",
    outcome: "defined",
  },
  {
    classic: "division and modulo by zero",
    tripon: "traps, E9003",
    outcome: "defined",
  },
  {
    classic: "index out of bounds",
    tripon: "bounds-checked on every access, traps E9002",
    outcome: "defined",
  },
  {
    classic: "read of an uninitialized local",
    tripon: "locals are zero-initialized",
    outcome: "defined",
  },
  {
    classic: "an ignored error",
    tripon: "a discarded result is a compile error, E0205",
    outcome: "won't build",
  },
  {
    classic: "a silent narrowing or widening",
    tripon: "cast<T>(x) or nothing; E0207 otherwise",
    outcome: "won't build",
  },
];

const tiers = [
  {
    n: "0",
    name: "kernel",
    gets: "ints, bools, structs, enums, fn, fixed arrays, const",
    target: "firmware, bootloaders, bare metal",
  },
  {
    n: "1",
    name: "core",
    gets: "+ arena, slices, result / opt / ?, match, modules",
    target: "microcontrollers, tiny CLIs",
  },
  {
    n: "2",
    name: "std",
    gets: "+ references, String / Vec / Map, closures, generics",
    target: "normal applications",
  },
  {
    n: "3",
    name: "full",
    gets: "+ coroutines and async, the self-host runtime",
    target: "everything else",
  },
];

const readOn = [
  {
    href: "/docs/getting-started",
    title: "Getting started",
    line: "Clone it, build the one binary, run your first .tp file.",
  },
  {
    href: "/docs/toolchain",
    title: "The ralt reference",
    line: "Every subcommand, every flag, and what each one writes.",
  },
  {
    href: "/docs/diagnostics",
    title: "Diagnostic codes",
    line: "The frozen table: code, severity, name and the fix hint.",
  },
  {
    href: "/docs/language/tiers",
    title: "The tier system",
    line: "What each tier carries, and what E0301 refuses.",
  },
];

export default function Home() {
  return (
    <div className="wrap">
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <Art
            piece="edge-orbit"
            bare
            color
            label="The night earth seen from orbit, request arcs crossing between cities."
          />
        </div>

        <div className="hero-copy">
          <h1>
            A compiled language for low-resource systems.
            <span className="quiet">No FFI. No null. No undefined behavior.</span>
          </h1>

          <p className="hero-lede">
            Tripon is a small, statically typed language for machines with very little
            room: firmware, microcontrollers, bootloaders. There is no <code>null</code>{" "}
            and no implicit conversion here, and the mistakes that are undefined behavior
            in C become traps that name their code and their line. The whole toolchain is
            one static binary, and every diagnostic it prints is also valid JSON.
          </p>

          <div className="hero-actions">
            <Link href="/docs/getting-started" className="btn" data-primary="true">
              [read the docs]
            </Link>
            <Link href={site.repo} className="btn">
              [source on github]
            </Link>
          </div>

          <div className="hero-plate">
            <CommandLine command={cloneLine} />
          </div>

          <p className="hero-note">Needs a C99 toolchain and nothing else.</p>
        </div>

        {/* A solid that turns: the thing the compiler emits, rather than the
            text about it. Hidden under 62rem, where there is no second column. */}
        <div className="hero-object">
          <Art
            piece="icosahedron"
            max="13px"
            bare
            label="A wireframe icosahedron turning, its hidden edges drawn as dots."
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}

      <section className="band">
        <h2>Red to green in one round trip</h2>
        <p className="band-lede">
          This is a real session against the compiler in this repository. Line 7 of{" "}
          <code>main.tp</code> multiplies an <code>i32</code> by an <code>f64</code>, and{" "}
          <code>ralt</code> reports the exact span, so the fix is a computation rather
          than a guess.
        </p>

        <div className="band-body">
          <Art
            piece="ralt-session"
            max="16px"
            label="A terminal session: ralt check reports E0202 on main.tp line 7, the line is edited, the check passes, and ralt run prints 6765."
            caption={
              <>
                <span>
                  <b>ralt-session</b> — an ascii.rest piece written for this site
                </span>
                <span className="rule-key">output copied from a live run</span>
              </>
            }
          />
        </div>

        <div className="steps" style={{ marginTop: "2.5rem" }}>
          <div className="step">
            <p className="step-h">Machine-readable by default</p>
            <p>
              <code>ralt check --json</code> writes one array, in lex → parse →
              typecheck order. Nothing is batched behind the first real error.
            </p>
          </div>
          <div className="step">
            <p className="step-h">Codes that never move</p>
            <p>
              <code>E0202</code> means the same thing today and in ten releases. The
              table is append-only: never renumbered, never reused.
            </p>
          </div>
          <div className="step">
            <p className="step-h">A fix hint in the payload</p>
            <p>
              Every diagnostic carries its healer&apos;s hint — or run{" "}
              <code>ralt explain E0202</code>.
            </p>
          </div>
        </div>

        <div style={{ marginTop: "2.5rem" }}>
          <Session
            title="the same check, machine format"
            lines={[
              "$ ralt check main.tp --json",
              "[",
              '  { "code": "E0202", "kind": "error", "name": "type-mismatch", "file": "main.tp", "line": 7, "col": 25, "len": 7, "msg": "i32 and f64 do not share an operator; no implicit conversion exists", "hint": "types must match exactly; no implicit conversion exists; use cast<T>(x)" }',
              "]",
            ]}
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}

      <section className="band">
        <h2>No undefined behavior, and not as a slogan</h2>
        <p className="band-lede">
          None of this is a promise in the documentation. The code generator emits these
          checks on both backends, so every program built by <code>ralt</code> carries
          them.
        </p>

        <div className="band-body">
          <table className="contract">
            <thead>
              <tr>
                <th scope="col">the classic</th>
                <th scope="col">in Tripon</th>
                <th scope="col">outcome</th>
              </tr>
            </thead>
            <tbody>
              {contract.map((row) => (
                <tr key={row.classic} data-open={row.outcome === "defined" ? undefined : "true"}>
                  <td>{row.classic}</td>
                  <td>{row.tripon}</td>
                  <td>
                    <span className="outcome">{row.outcome}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="trap-sample">
            <Session
              title="what a trap looks like, and what it exits with"
              lines={[
                "$ ralt run overflow.tp",
                "tripon trap E9001 integer-overflow-trap at overflow.tp:4",
                "$ echo $?",
                "101",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}

      <section className="band">
        <h2>A language you already know the shape of</h2>
        <p className="band-lede">
          Braces, semicolons, <code>let</code> and <code>fn</code>: there is nothing to
          relearn, and nothing underneath that could reasonably be read two ways.
        </p>

        <div className="band-body split" data-cols="two">
          <Code code={fibSample.source} title="fib.tp" />

          <div className="stack">
            <Session
              title="ralt run fib.tp"
              lines={[`$ ralt run fib.tp`, fibSample.output]}
            />
            <p className="bench-note">
              Data lives by value, variants carry payloads, and <code>match</code> is
              exhaustive — a missing arm is E0206. Lossy conversions are explicit:{" "}
              <code>cast&lt;i16&gt;(x)</code> truncates by definition.
            </p>
            <ul className="facts">
              <li>
                <code>i8</code> through <code>u64</code>, <code>isize</code>,{" "}
                <code>usize</code>, <code>f32</code>, <code>f64</code>, <code>bool</code>,{" "}
                <code>str</code>, <code>void</code>
              </li>
              <li>
                <code>result&lt;T, E&gt;</code> with <code>?</code> propagation; an
                ignored result will not build
              </li>
              <li>
                <code>opt&lt;T&gt;</code> with <code>some</code> and <code>none</code>;
                passing a null is E0204
              </li>
              <li>fixed arrays are bounds-checked by construction, and len is compile-time</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}

      <section className="band">
        <h2>Pick how much runtime you can afford</h2>
        <p className="band-lede">
          Firmware is not a server, so you declare what each file is allowed to use.
          Reach for something above your tier and the build fails with E0301 — never{" "}
          &ldquo;kinda works, probably&rdquo;.
        </p>

        <div className="band-body">
          <div className="tiers">
            {tiers.map((tier) => (
              <div className="tier" key={tier.name}>
                <span className="tier-n">{tier.n}</span>
                <span className="tier-name">use tier {tier.name};</span>
                <span className="tier-gets">{tier.gets}</span>
                <span className="tier-target">{tier.target}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2.5rem" }} className="split" data-cols="two">
            <Art
              piece="boot-log"
              label="An ASCII boot log: a self test counts memory, then the boot log scrolls by."
              caption={
                <>
                  <span>
                    <b>ascii.rest/boot-log</b> — the tier-0 target
                  </span>
                  <span className="rule-key">no allocator, no runtime, no libc needed</span>
                </>
              }
            />
            <div className="stack">
              <p className="bench-note">
                The kernel tier has no allocator at all, so <code>malloc</code> cannot
                exist there. A stdlib module declares its own tier, and a{" "}
                <code>use</code> raises your requirement rather than degrading it.
              </p>
              <Session
                title="a tier violation reads like any other diagnostic"
                lines={[
                  "$ ralt check firmware.tp",
                  "firmware.tp:12:9: error: feature [arena] requires tier core; current tier is kernel",
                  "  [E0301 tier-violation] feature requires a higher tier; raise the tier target or rewrite the call",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}

      <section className="band">
        <h2>Milliseconds to build, kilobytes to ship</h2>
        <p className="band-lede">
          We optimize build speed first, because it is what you pay on every iteration.
          The default pipeline runs no optimizer at all; <code>-O fast</code> turns the
          passes on once the types prove them safe.
        </p>

        <div className="band-body numbers">
          <div>
            <Session
              title="sh bench/build_bench.sh"
              lines={[
                "build full pipeline : 333 ms",
                "check only          : 4 ms",
                "emit c only         : 5 ms",
                "binary size         : 17728 bytes",
              ]}
            />
            <p className="bench-note" style={{ marginTop: "1rem" }}>
              Measured cold-cache by <code>bench/build_bench.sh</code>, which runs on any
              box. <code>ralt check</code> is the loop an agent lives in — four
              milliseconds.
            </p>
          </div>

          <div>
            <dl className="status-list">
              <div>
                <dt>P0</dt>
                <dd>Spec — grammar, contract, frozen error table</dd>
              </div>
              <div>
                <dt>P1</dt>
                <dd>Bootstrap compiler in C99 — lex, parse, typecheck, codegen</dd>
              </div>
              <div>
                <dt>P2</dt>
                <dd>Agent tooling — fmt, doc, lsp, deps, tokens oracle</dd>
              </div>
              <div>
                <dt>P3</dt>
                <dd>
                  Self-host — lexer and parser ports replay their oracles byte for byte;
                  the typechecker port is next
                </dd>
              </div>
              <div>
                <dt>P4</dt>
                <dd>
                  Native x86-64 — scalars and floats at byte parity; aggregates next
                </dd>
              </div>
            </dl>
            <p className="bench-note" style={{ marginTop: "1rem" }}>
              Phases are tracked in <code>PLAN.md</code>, not a roadmap slide. Determinism
              is tested: the same source compiles byte-identically on every build, with
              gcc and clang.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}

      <section className="band">
        <h2>One binary, six directories</h2>
        <p className="band-lede">
          <code>spec/</code> is the source of truth, not the C code. Each pass is one C
          file with no dependencies, and <code>src/selfhost/</code> holds the same
          passes written in Tripon.
        </p>

        <div className="band-body split" data-cols="two">
          <Art
            piece="file-tree"
            options={{ root: "tripon", entries: repoTTree }}
            label="The Tripon repository tree: spec, ralt, src, tests, bench."
            caption={
              <>
                <span>
                  <b>ascii.rest/file-tree</b>
                </span>
                <span className="rule-key">entries are the real repository</span>
              </>
            }
          />
          <div className="stack">
            <Session
              title="the contract, tested"
              lines={[
                "$ make test",
                "59 checks passing, gcc and clang",
                "$ sh tests/determinism.sh",
                "byte-identical on every build",
              ]}
            />
            <p className="bench-note">
              Changing a semantic means changing the spec first, then the code, then the
              goldens in <code>tests/expected/</code> — and the suite must pass under both
              compilers.
            </p>
            <div className="btn-row">
              <Link href={site.repo} className="btn">
                [browse the source]
              </Link>
              <Link href="/docs/roadmap" className="btn">
                [roadmap]
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}

      <section className="band">
        <h2>Read on</h2>
        <div className="band-body">
          <div className="readon">
            {readOn.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="readon-t">{item.title}</span>
                <span className="readon-d">{item.line}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="call">
        <p>
          Tripon is {site.license} licensed and developed in the open at{" "}
          <Link href={site.repo}>TriponOSS/tripon</Link>. Four bands of diagnostics,{" "}
          {bands.reduce((n, band) => n + band.diagnostics.length, 0)} codes in total, and{" "}
          {exitCodes.length} exit codes to branch on.
        </p>
        <div className="btn-row">
          <Link href="/docs/getting-started" className="btn" data-primary="true">
            [start here]
          </Link>
        </div>
      </section>
    </div>
  );
}

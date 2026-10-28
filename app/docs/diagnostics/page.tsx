import type { Metadata } from "next";
import Link from "next/link";

import { Session } from "@/components/code";
import { TRAP_EXIT_CODE, bands, diagnostics, exitCodes } from "@/lib/diagnostics";

export const metadata: Metadata = {
  title: "Diagnostic codes",
  description:
    "The frozen Tripon diagnostic table: every code, its severity, its name, and the hint the compiler prints with it. Codes are append-only and never renumbered.",
  alternates: { canonical: "/docs/diagnostics" },
};

export default function Diagnostics() {
  return (
    <>
      <h1>Diagnostic codes</h1>

      <p>
        This is the machine table the compiler and the test goldens are both held to:
        {" "}
        <code>spec/errors.csv</code>, {diagnostics.length} codes, grouped by the pass
        that emits them. A code is never renumbered and never reused, so a fix
        written against <code>E0202</code> still means the same thing ten releases
        later.
      </p>

      <p>
        Every entry carries two things a person needs and one thing a program needs.
        The person gets the code and the hint; the program gets the same text as a
        field in the JSON. Run <code>ralt explain E0202</code> for any of them, or
        read the table below. Each row links to a page with a program that produces
        the code, the exact transcript, the repair, and — where the bootstrap never
        emits the code — a note saying so.
      </p>

      <Session
        title="the shape of a diagnostic"
        lines={[
          "$ ralt check bad.tp --json",
          "[",
          '  { "code": "E0202", "kind": "error", "name": "type-mismatch", "file": "bad.tp", "line": 5, "col": 13, "len": 7, "msg": "i32 and f64 do not share an operator; no implicit conversion exists", "hint": "types must match exactly; no implicit conversion exists; use cast<T>(x)" }',
          "]",
        ]}
      />

      <h2>Exit codes</h2>

      <table>
        <thead>
          <tr>
            <th scope="col">status</th>
            <th scope="col">meaning</th>
          </tr>
        </thead>
        <tbody>
          {exitCodes.map((row) => (
            <tr key={row.code}>
              <td>
                <span className="tag" data-sev={row.severity}>
                  {row.code}
                </span>
              </td>
              <td>{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        A trap is {TRAP_EXIT_CODE}, which is separate from a failed build, so a
        harness can tell &ldquo;the source is wrong&rdquo; from &ldquo;the program ran
        and hit a defined edge&rdquo; without parsing anything. See{" "}
        <Link href="/docs/language/traps">traps and no-UB</Link>.
      </p>

      {bands.map((band) => (
        <section key={band.id}>
          <h2>{band.label}</h2>
          <p>{band.blurb}</p>
          {band.diagnostics.map((d) => (
            <Link
              className="diag"
              key={d.code}
              href={`/docs/diagnostics/${d.code}`}
              data-sev={d.severity}
            >
              <span className="diag-code">{d.code}</span>
              <span className="diag-name">{d.name}</span>
              <span className="diag-hint">{d.hint}</span>
            </Link>
          ))}
        </section>
      ))}

      <h2>Severities</h2>

      <table>
        <thead>
          <tr>
            <th scope="col">severity</th>
            <th scope="col">fails the build</th>
            <th scope="col">when</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="tag" data-sev="error">
                error
              </span>
            </td>
            <td>yes</td>
            <td>the source text is not a valid program</td>
          </tr>
          <tr>
            <td>
              <span className="tag" data-sev="warn">
                warn
              </span>
            </td>
            <td>
              no — it does not change the exit code
            </td>
            <td>unused binding, unreachable code, shadowing</td>
          </tr>
          <tr>
            <td>
              <span className="tag" data-sev="trap">
                trap
              </span>
            </td>
            <td>not applicable</td>
            <td>
              the program ran and hit a defined edge; exit {TRAP_EXIT_CODE}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="callout">
        <span className="callout-h">One row still to fill</span>
        <p>
          The compiler&rsquo;s <code>explain</code> table has a row for every code
          above except <code>E9004</code>, which the code generator emits and the trap
          tests cover, but <code>ralt explain E9004</code> does not yet answer for.
          The row below, like the rest of this page, is <code>spec/errors.csv</code>.
        </p>
      </div>

      <h2>Adding a code</h2>

      <p>
        Codes are appended, never inserted: a new row goes at the end of{" "}
        <code>spec/errors.csv</code>, the matching golden lands in{" "}
        <code>tests/expected/</code>, and the spec changes before the compiler does.
        The order of this page follows the first digit of the code — the pass that
        emits it — and the traps sit last because they are not failures of the
        program text at all.
      </p>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Code, Session } from "@/components/code";
import { codeDetails, findCodeDetail } from "@/lib/diagnostic-details";
import { bands, findDiagnostic } from "@/lib/diagnostics";
import { docsNav } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return codeDetails.map((detail) => ({ code: detail.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const detail = findCodeDetail(code);
  const diagnostic = findDiagnostic(code);
  if (!detail || !diagnostic) return {};

  return {
    title: `${diagnostic.code} ${diagnostic.name}`,
    description: detail.headline,
    alternates: { canonical: `/docs/diagnostics/${diagnostic.code}` },
  };
}

const labels = new Map(docsNav.flatMap((group) => group.items).map((item) => [item.href, item.label]));

export default async function CodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const detail = findCodeDetail(code);
  const diagnostic = findDiagnostic(code);
  if (!detail || !diagnostic) notFound();

  const band = bands.find((b) => b.diagnostics.some((d) => d.code === diagnostic.code));
  const at = codeDetails.findIndex((d) => d.code === detail.code);
  const prev = codeDetails[at - 1];
  const next = codeDetails[at + 1];

  /* `ralt explain` answers from its own table. For E9004 that table still has
     the fallback row, so the page shows what the command really prints. */
  const explainLines =
    detail.code === "E9004"
      ? [
          `$ ralt explain ${detail.code}`,
          detail.code,
          "severity: error",
          "name: internal",
          "hint: report this to the Tripon repo with a minimal repro",
        ]
      : [
          `$ ralt explain ${detail.code}`,
          detail.code,
          `severity: ${diagnostic.severity === "trap" ? "error" : diagnostic.severity}`,
          `name: ${diagnostic.name}`,
          `hint: ${diagnostic.hint}`,
        ];

  return (
    <>
      <p className="rail-label">
        <Link href="/docs/diagnostics">diagnostic codes</Link> / {band?.label ?? "code"}
      </p>

      <h1>
        {diagnostic.code} {diagnostic.name}
      </h1>

      <p>{detail.headline}</p>

      <div className="diag" data-sev={diagnostic.severity}>
        <span className="diag-code">{diagnostic.code}</span>
        <span className="diag-name">{diagnostic.name}</span>
        <span className="diag-hint">{diagnostic.hint}</span>
      </div>

      <table>
        <tbody>
          <tr>
            <th scope="row">severity</th>
            <td>
              <span className="tag" data-sev={diagnostic.severity}>
                {diagnostic.severity}
              </span>
            </td>
          </tr>
          <tr>
            <th scope="row">band</th>
            <td>{band?.label ?? "—"}</td>
          </tr>
          <tr>
            <th scope="row">in the v0 bootstrap</th>
            <td>{detail.status === "emitted" ? "emitted" : "reserved — not emitted yet"}</td>
          </tr>
          <tr>
            <th scope="row">explain</th>
            <td>
              <code>ralt explain {diagnostic.code}</code>
            </td>
          </tr>
        </tbody>
      </table>

      <p>{detail.body}</p>

      {detail.status === "reserved" && detail.statusNote ? (
        <div className="callout" data-kind="trap">
          <span className="callout-h">Not emitted by the v0 bootstrap</span>
          <p>{detail.statusNote}</p>
        </div>
      ) : null}

      <h2>What it looks like</h2>

      <Code code={detail.trigger.source} title={detail.trigger.file} />

      <Session lines={detail.transcript} />

      {detail.reading ? <p>{detail.reading}</p> : null}

      <h2>What to do</h2>

      <ul>
        {detail.fix.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h2>Why the code exists</h2>

      <p>{detail.why}</p>

      <h2>What <code>ralt explain</code> says</h2>

      <Session lines={explainLines} />

      {detail.code === "E9004" ? (
        <p>
          That is the fallback row, not the trap. The code above is what the driver
          prints when it does not recognise an argument; the trap path never consults
          the table, so a program can trap with E9004 while <code>explain</code> still
          says <code>internal</code>.
        </p>
      ) : null}

      {detail.related?.length ? (
        <>
          <h2>Related</h2>
          <ul>
            {detail.related.map((href) => (
              <li key={href}>
                <Link href={href}>{labels.get(href) ?? href}</Link>{" "}
                <span className="dim">{href}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <nav className="pager" aria-label="Diagnostic codes">
        {prev ? (
          <Link href={`/docs/diagnostics/${prev.code}`}>
            <span className="pager-dir">previous code</span>
            {prev.code}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/docs/diagnostics/${next.code}`} className="pager-next">
            <span className="pager-dir">next code</span>
            {next.code}
          </Link>
        ) : null}
      </nav>
    </>
  );
}
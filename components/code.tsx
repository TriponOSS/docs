"use client";

import { useState, type ReactNode } from "react";

/**
 * A small, deterministic highlighter for `.tp`.
 *
 * Four token classes, which is all the language has: a comment, a string, a
 * keyword, a type name. Anything else is an identifier or punctuation and stays
 * in the page's ink — there is deliberately no operator colouring, because in
 * Tripon an operator means exactly one thing and does not need to be found by
 * eye.
 */
const KEYWORDS = new Set([
  "use",
  "tier",
  "fn",
  "let",
  "const",
  "struct",
  "enum",
  "match",
  "if",
  "else",
  "while",
  "return",
  "extern",
  "cast",
  "true",
  "false",
]);

const TYPES = new Set([
  "i8",
  "i16",
  "i32",
  "i64",
  "u8",
  "u16",
  "u32",
  "u64",
  "isize",
  "usize",
  "f32",
  "f64",
  "bool",
  "str",
  "void",
  "byte",
  "opt",
  "result",
]);

const BUILTINS = new Set([
  "print_i32",
  "print_i64",
  "print_f64",
  "print_str",
  "len",
  "some",
  "none",
  "ok",
  "err",
]);

const TOKEN = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|(\b[A-Za-z_][A-Za-z0-9_]*\b)|(\b\d[\w.]*\b)/g;

function highlight(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of code.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    if (at > cursor) nodes.push(code.slice(cursor, at));
    cursor = at + match[0].length;

    const [text, comment, str, word, num] = match;
    let className: string | undefined;

    if (comment) className = "tok-comment";
    else if (str) className = "tok-str";
    else if (word) {
      if (KEYWORDS.has(word)) className = "tok-kw";
      else if (TYPES.has(word)) className = "tok-type";
      else if (BUILTINS.has(word)) className = "tok-builtin";
    } else if (num) className = "tok-num";

    nodes.push(
      className ? (
        <span key={key++} className={className}>
          {text}
        </span>
      ) : (
        text
      ),
    );
  }

  if (cursor < code.length) nodes.push(code.slice(cursor));
  return nodes;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // A browser that refuses the clipboard is not a reason to break the page.
    }
  }

  return (
    <button type="button" className="code-copy" onClick={copy}>
      [{copied ? "copied" : "copy"}]
      <span className="visually-hidden"> {copied ? "the code" : "this code"} to the clipboard</span>
    </button>
  );
}

/** One command, with the prompt glyph and a copy control. */
export function CommandLine({ command }: { command: string }) {
  return (
    <div className="cmdline">
      <code className="term-in">{command}</code>
      <CopyButton text={command} />
    </div>
  );
}

type CodeProps = {
  code: string;
  /** A filename, shown in the block's header line. */
  title?: string;
  copyable?: boolean;
  className?: string;
};

/** A source listing. */
export function Code({ code, title, copyable = true, className }: CodeProps) {
  return (
    <div className={["code", className].filter(Boolean).join(" ")}>
      {(title || copyable) && (
        <div className="code-head">
          {title ? <span className="code-title">{title}</span> : <span />}
          {copyable ? <CopyButton text={code} /> : null}
        </div>
      )}
      <div className="code-body">
        <pre>{highlight(code)}</pre>
      </div>
    </div>
  );
}

/**
 * A shell transcript. A line that begins with `$` is something a person typed
 * and is drawn with the prompt glyph; every other line is what the toolchain
 * printed back.
 */
export function Session({
  lines,
  title,
  copyable = false,
}: {
  lines: string[];
  title?: string;
  copyable?: boolean;
}) {
  const copyText = lines
    .filter((line) => line.startsWith("$"))
    .map((line) => line.replace(/^\$\s?/, ""))
    .join("\n");

  return (
    <div className="code">
      {(title || copyable) && (
        <div className="code-head">
          {title ? <span className="code-title">{title}</span> : <span />}
          {copyable ? <CopyButton text={copyText} /> : null}
        </div>
      )}
      <div className="code-body">
        <pre>
          {lines.map((line, i) =>
            line.startsWith("$") ? (
              <span key={i} className="term-in">
                {line.replace(/^\$\s?/, "")}
                {"\n"}
              </span>
            ) : (
              <span key={i} className={line ? "term-out" : undefined}>
                {line}
                {"\n"}
              </span>
            ),
          )}
        </pre>
      </div>
    </div>
  );
}

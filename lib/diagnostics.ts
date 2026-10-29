/**
 * The frozen diagnostic contract.
 *
 * Codes, severities and names come from `spec/errors.csv`, which is the machine
 * table the compiler and the test goldens are both held to. The hint text is
 * what `ralt explain <code>` prints today, transcribed verbatim.
 *
 * Codes are append-only: they are never renumbered and never reused, which is
 * what lets a fix written against E0202 still mean the same thing in ten
 * releases. Nothing on this page is prose the compiler does not already emit.
 */

export type Severity = "error" | "trap" | "warn";

export type Diagnostic = {
  code: string;
  severity: Severity;
  name: string;
  hint: string;
};

export type Band = {
  id: string;
  label: string;
  blurb: string;
  diagnostics: Diagnostic[];
};

/**
 * Bands follow the first digit of the code: the pass that emits it, then the
 * traps, which are not failures of the program text but of the program's run.
 */
export const bands: Band[] = [
  {
    id: "lex",
    label: "Lexer",
    blurb: "The source text itself is not readable as Tripon.",
    diagnostics: [
      {
        code: "E0001",
        severity: "error",
        name: "unterminated-string",
        hint: "string must close with a double quote on the same line",
      },
      {
        code: "E0002",
        severity: "error",
        name: "invalid-character",
        hint: "ASCII identifiers only; table in spec/grammar.ebnf",
      },
      {
        code: "E0003",
        severity: "error",
        name: "bad-number-literal",
        hint: "forms: 123, 0x1F, 0o17, 0b1010, 3.14, 1e-9",
      },
    ],
  },
  {
    id: "parse",
    label: "Parser",
    blurb: "One file of grammar decides what may appear here, and it is published.",
    diagnostics: [
      {
        code: "E0101",
        severity: "error",
        name: "unexpected-token",
        hint: "see spec/grammar.ebnf for what is legal here",
      },
      {
        code: "E0102",
        severity: "error",
        name: "missing-token",
        hint: "expected the token named in the message",
      },
    ],
  },
  {
    id: "types",
    label: "Types",
    blurb: "The type contract, enforced by the checker.",
    diagnostics: [
      {
        code: "E0201",
        severity: "error",
        name: "unknown-identifier",
        hint: "define it, use the right module, or fix spelling",
      },
      {
        code: "E0202",
        severity: "error",
        name: "type-mismatch",
        hint: "types must match exactly; no implicit conversion exists; use cast<T>(x)",
      },
      {
        code: "E0203",
        severity: "error",
        name: "mutability-required",
        hint: "declared const but reassigned; switch to let",
      },
      {
        code: "E0204",
        severity: "error",
        name: "no-null",
        hint: "null and undefined do not exist; use opt<T>",
      },
      {
        code: "E0205",
        severity: "error",
        name: "unhandled-result",
        hint: "Result value ignored; spread with ? or match",
      },
      {
        code: "E0206",
        severity: "error",
        name: "non-exhaustive-match",
        hint: "match must cover every enum variant or add a deliberate _ arm",
      },
      {
        code: "E0207",
        severity: "error",
        name: "implicit-conversion-denied",
        hint: "no implicit conversions exist; use cast<T>(x) for exact or explicit lossy casts",
      },
      {
        code: "E0212",
        severity: "error",
        name: "duplicate-match-arm",
        hint: "remove or reorder the repeated arm; match arms are checked top to bottom",
      },
    ],
  },
  {
    id: "tiers",
    label: "Tiers",
    blurb: "A feature the declared tier does not carry is a hard error, never a surprise.",
    diagnostics: [
      {
        code: "E0301",
        severity: "error",
        name: "tier-violation",
        hint: "feature requires a higher tier; raise the tier target or rewrite the call",
      },
      {
        code: "E0302",
        severity: "error",
        name: "tier-not-declared",
        hint: "add a top-of-file use tier <name>; statement",
      },
    ],
  },
  {
    id: "driver",
    label: "Driver",
    blurb: "What the toolchain needs before a program can be built at all.",
    diagnostics: [
      {
        code: "E0501",
        severity: "error",
        name: "entry-point-missing",
        hint: "define fn main() -> i32",
      },
    ],
  },
  {
    id: "warn",
    label: "Warnings",
    blurb: "Not errors. They do not fail a build and they do not change exit code.",
    diagnostics: [
      {
        code: "E0601",
        severity: "warn",
        name: "unused-binding",
        hint: "prefix with _ to mute",
      },
      {
        code: "E0602",
        severity: "warn",
        name: "unreachable-code",
        hint: "unreachable after earlier return/branch",
      },
      {
        code: "E0603",
        severity: "warn",
        name: "shadowing",
        hint: "name shadows an existing binding in scope; rename",
      },
    ],
  },
  {
    id: "traps",
    label: "Traps",
    blurb:
      "A trap is not a crash. It is defined behavior: the program exits 101 and names the code, the file and the line.",
    diagnostics: [
      {
        code: "E9001",
        severity: "trap",
        name: "integer-overflow-trap",
        hint: "arithmetic overflow is a defined trap; pass -fast to wrap",
      },
      {
        code: "E9002",
        severity: "trap",
        name: "index-out-of-bounds",
        hint: "indexing is bounds-checked everywhere; slice.len() before indexing",
      },
      {
        code: "E9003",
        severity: "trap",
        name: "division-by-zero-trap",
        hint: "div and mod by zero are defined traps; guard the divisor",
      },
      {
        code: "E9004",
        severity: "trap",
        name: "cast-overflow-trap",
        hint: "float-to-integer casts outside the target range are defined traps",
      },
    ],
  },
];

export const diagnostics: Diagnostic[] = bands.flatMap((band) => band.diagnostics);

export function findDiagnostic(code: string): Diagnostic | undefined {
  return diagnostics.find((d) => d.code.toLowerCase() === code.toLowerCase());
}

/** Traps exit 101. Anything else about the exit code is in the driver. */
export const TRAP_EXIT_CODE = 101;

export const exitCodes = [
  { code: "0", meaning: "clean, or warnings only", severity: "ok" as const },
  { code: "1", meaning: "at least one diagnostic with severity error", severity: "error" as const },
  { code: "101", meaning: "the program trapped at runtime", severity: "trap" as const },
  { code: "2", meaning: "the command line itself was wrong", severity: "warn" as const },
];

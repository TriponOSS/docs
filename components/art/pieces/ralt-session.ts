/**
 * `ralt session` — an ascii.rest piece drawn from a real transcript.
 *
 * Every line is copied from a session against the toolchain in this repository:
 * the diagnostic is what `ralt check main.tp` prints for an i32 multiplied by an
 * f64 literal, down to the column, and 6765 is what `ralt run` prints once line
 * 7 carries a cast. Nothing here is invented output.
 *
 * It is a piece in the same shape as the library's own — `meta` plus a default
 * function returning `(t) => string` — so <Ascii> mounts it with the same
 * reduced-motion still frame and the same viewport pausing as any other.
 */

type Kind = "cmd" | "note" | "out";

type Line = {
  kind: Kind;
  text: string;
  /** Seconds this line starts appearing. */
  at: number;
  /** Seconds per character, or 0 when the line lands whole. */
  pace: number;
};

const LEAD = 0;
const PACE = 0.034;
const AFTER_CMD = 0.34;
const BETWEEN = 0.9;
const HOLD = 5;

/** The session, in order. An empty `out` is a blank line. */
const SCRIPT: Array<[Kind, string]> = [
  ["cmd", "ralt check main.tp"],
  [
    "out",
    "main.tp:7:25: error: i32 and f64 do not share an operator; no implicit conversion exists",
  ],
  [
    "out",
    "  [E0202 type-mismatch] types must match exactly; no implicit conversion exists; use cast<T>(x)",
  ],
  ["out", ""],
  ["note", "# main.tp:7  ->  total = total + cast<f64>(n) * 1.5;"],
  ["cmd", "ralt check main.tp"],
  ["out", ""],
  ["cmd", "ralt run main.tp"],
  ["out", "6765"],
];

function schedule(): Line[] {
  const lines: Line[] = [];
  let at = LEAD;

  SCRIPT.forEach(([kind, text], i) => {
    // The opening prompt is already typed, so the piece is never blank: the screen
    // starts mid-session, the way a terminal somebody just walked away from looks.
    const pace = kind === "cmd" && i > 0 ? PACE : 0;
    lines.push({ kind, text, at, pace });

    if (kind === "cmd") at += text.length * PACE + AFTER_CMD;
    else at += (text ? 0.22 : 0.02) + BETWEEN * 0.35;
  });

  return lines;
}

const LINES = schedule();

/** The moment the whole transcript is on screen. */
const PRINTED = LINES.reduce((end, line) => Math.max(end, line.at + line.text.length * line.pace), 0);
const LOOP = PRINTED + HOLD;

export const meta = {
  name: "ralt session",
  category: "ui" as const,
  note: "an agent's fix loop: a failing check, one edit, a clean check, a run",
  cols: 96,
  rows: SCRIPT.length,
  fps: 30,
  /** The transcript repeats exactly, and prints in this long. */
  loop: LOOP,
  /** A reader who prefers no motion gets the finished transcript. */
  still: PRINTED,
};

export default function raltSession() {
  return (t: number) => {
    // Past the last line the screen simply stays; then the loop starts over.
    const clock = t % LOOP > PRINTED ? PRINTED : t % LOOP;
    const out: string[] = [];
    let live = -1;

    for (const line of LINES) {
      if (clock < line.at) break;

      const shown = line.pace
        ? Math.min(line.text.length, Math.max(1, Math.floor((clock - line.at) / line.pace) + 1))
        : line.text.length;

      out.push(line.text.slice(0, shown));
      live = out.length - 1;
      // Stop at the line being typed: nothing below it has printed yet.
      if (line.pace && shown < line.text.length) break;
    }

    // A cursor sits on the live line until the transcript lands, and blinks on the half second.
    const holding = clock >= PRINTED;
    if (!holding && live >= 0 && Math.floor(t * 2) % 2 === 0) {
      const room = meta.cols - 1 - out[live].length;
      if (room > 0) out[live] += "█";
    }

    // Every frame is exactly `rows` lines, blank below the last one printed: the
    // screen is a fixed size, so the lines below never move.
    while (out.length < meta.rows) out.push("");

    return out.join("\n");
  };
}

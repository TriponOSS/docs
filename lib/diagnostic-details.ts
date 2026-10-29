/**
 * One page per diagnostic code.
 *
 * Everything here was captured from the bootstrap in `ralt/` — the source is a
 * file that really was checked, and the transcript is verbatim what `ralt`
 * printed. Where a code exists in `spec/errors.csv` but the bootstrap never
 * emits it, the entry says so and shows the program that will trip it once the
 * pass lands. Nothing is invented: the gap is part of the documentation.
 */

export type CodeDetail = {
  code: string;
  /** One line, the thing to read first. */
  headline: string;
  /** What the compiler is looking at, in plain terms. */
  body: string;
  /** Whether the v0 bootstrap can produce this code today. */
  status: "emitted" | "reserved";
  /** Required when status is "reserved": what is true instead. */
  statusNote?: string;
  trigger: { file: string; source: string };
  transcript: string[];
  /** Extra paragraph after the transcript, when the transcript needs reading. */
  reading?: string;
  fix: string[];
  why: string;
  related?: string[];
};

const T = (file: string, source: string) => ({ file, source });

export const codeDetails: CodeDetail[] = [
  {
    code: "E0001",
    headline: "A string was opened and never closed.",
    body:
      "The lexer starts a string at the first double quote and looks for the matching quote on the same line. A newline before it is not allowed to continue the string; it ends the token with an error. Everything after the unclosed quote is still lexed, which is why one missing `\"` usually arrives with one or two follow-on errors.",
    status: "emitted",
    trigger: T(
      "e0001.tp",
      `use tier core;

fn main() -> i32 {
    print_str("oops);
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0001.tp",
      "e0001.tp:4:15: error: unterminated string",
      "  [E0001 unterminated-string] string must close with a double quote on the same line",
      "e0001.tp:5:5: error: expected ')' to close the call, got 'return'",
      "  [E0101 unexpected-token] see spec/grammar.ebnf for what is legal here",
      "e0001.tp:5:5: error: expected ';' to end the statement, got 'return'",
      "  [E0101 unexpected-token] see spec/grammar.ebnf for what is legal here",
    ],
    reading:
      "The two E0101 lines are cascade: the parser never saw a `)` or a `;`, because the string swallowed them. Fix the first error and the rest usually vanish. Do not chase the last line first.",
    fix: [
      "Close the string with `\"` on the same line.",
      "Multi-line text is a sequence of strings, not one literal: there is no triple-quoted form and no automatic continuation.",
      "If the quote is meant to be literal, escape it as `\\\"`.",
    ],
    why:
      "A string that silently continues across lines makes every subsequent line's column numbers a lie, and column numbers are the contract this compiler gives an agent. Refusing early keeps spans exact.",
    related: ["/docs/reference/literals"],
  },
  {
    code: "E0002",
    headline: "A byte in the source is not part of Tripon's alphabet.",
    body:
      "The lexer is ASCII. Identifiers are `[A-Za-z_][A-Za-z0-9_]*`, punctuation is the listed set, and string escapes are exactly `\\n \\t \\r \\0 \\\\ \\\"`. A non-ASCII letter outside a string, a single quote, a backtick, or an escape outside that list is reported here, one diagnostic per byte.",
    status: "emitted",
    trigger: T(
      "e0002.tp",
      `use tier core;

fn main() -> i32 {
    let café = 1;
    print_i32(café);
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0002.tp",
      "e0002.tp:4:12: error: unexpected character in source",
      "  [E0002 invalid-character] ASCII identifiers only; table in spec/grammar.ebnf",
      "e0002.tp:4:13: error: unexpected character in source",
      "  [E0002 invalid-character] ASCII identifiers only; table in spec/grammar.ebnf",
      "e0002.tp:5:18: error: unexpected character in source",
      "  [E0002 invalid-character] ASCII identifiers only; table in spec/grammar.ebnf",
      "e0002.tp:5:19: error: unexpected character in source",
      "  [E0002 invalid-character] ASCII identifiers only; table in spec/grammar.ebnf",
    ],
    reading:
      "The `é` in `café` is two bytes in UTF-8, so it produces two diagnostics at the same identifier, and then two more on the use site. That is not noise: the lexer reports the exact bytes it could not classify.",
    fix: [
      "Spell the name in ASCII: `cafe`.",
      "Inside strings, use one of the six escapes; `\\q`, `\\x41` and `\\u{...}` are not in the language.",
      "For a literal `'`, use a double-quoted string containing `'`.",
    ],
    why:
      "One alphabet means one byte is one column, which means an agent can convert a span to an edit without a Unicode table in the loop.",
    related: ["/docs/reference/literals", "/docs/reference/statements"],
  },
  {
    code: "E0003",
    headline: "A radix prefix was given no digits.",
    body:
      "`0x`, `0o` and `0b` must be followed by at least one digit of that radix. The lexer checks the prefix before it reads the body, so `0x;` is this error rather than a zero followed by an identifier.",
    status: "emitted",
    trigger: T(
      "e0003.tp",
      `use tier core;

fn main() -> i32 {
    print_i32(0x);
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0003.tp",
      "e0003.tp:4:15: error: empty number literal after 0x/0o/0b",
      "  [E0003 bad-number-literal] forms: 123, 0x1F, 0o17, 0b1010, 3.14, 1e-9",
    ],
    fix: [
      "Add at least one digit: `0x0`, `0o0`, `0b0`.",
      "Digits of the wrong radix stop the literal early rather than report this code; `0b102` lexes as `0b10` followed by a separate `2`, and the parser then reports the stray token.",
      "Underscores are allowed between digits: `0xFF_FF` is 65535.",
    ],
    why:
      "The message names the four legal forms, so the whole number grammar is in the diagnostic. An agent does not need to fetch a second page to repair the literal.",
    related: ["/docs/reference/literals"],
  },
  {
    code: "E0101",
    headline: "The token here cannot start what the grammar expects.",
    body:
      "This is the parser's general refusal. The message names the production it was in the middle of and the token it found instead. The grammar is published as `spec/grammar.ebnf`, so the message always has a page to point at.",
    status: "emitted",
    trigger: T(
      "e0101.tp",
      `use tier core;

fn main() -> i32 {
    for i in 0..3 {
    }
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0101.tp",
      "e0101.tp:4:9: error: expected ';' to end the statement, got identifier",
      "  [E0101 unexpected-token] see spec/grammar.ebnf for what is legal here",
      "e0101.tp:4:11: error: expected ';' to end the statement, got identifier",
      "  [E0101 unexpected-token] see spec/grammar.ebnf for what is legal here",
      "e0101.tp:4:14: error: expected ';' to end the statement, got number",
      "  [E0101 unexpected-token] see spec/grammar.ebnf for what is legal here",
      "e0101.tp:4:16: error: expected a field name after '.', got '.'",
      "  [E0101 unexpected-token] see spec/grammar.ebnf for what is legal here",
      "e0101.tp:4:17: error: expected a field name after '.', got number",
      "  [E0101 unexpected-token] see spec/grammar.ebnf for what is legal here",
      "e0101.tp:4:17: error: expected ';' to end the statement, got number",
      "  [E0101 unexpected-token] see spec/grammar.ebnf for what is legal here",
      "e0101.tp:4:19: error: expected ';' to end the statement, got '{'",
      "  [E0101 unexpected-token] see spec/grammar.ebnf for what is legal here",
    ],
    reading:
      "`for` is not a keyword, so `for` lexes as an identifier, `i` as another, `in` as another, and the parser tries to read the whole line as a statement. One unsupported construct can therefore produce a wall of errors on one line. The earliest span is the one to read; the rest is the parser recovering statement by statement.",
    fix: [
      "Replace the construct with a form the grammar has: `while` plus a counter, not `for`.",
      "Read the message as a pair — what was expected, what arrived. `expected ';' ... got identifier` means the previous statement was not terminated.",
      "When the first error is on a construct the language does not have, check the unsupported list in the reference before repairing the syntax.",
    ],
    why:
      "Recovery keeps going so one run reports every line that is wrong, not just the first. That is worth the cost of cascade diagnostics, which are always downstream of an earlier span.",
    related: ["/docs/reference/statements", "/docs/language"],
  },
  {
    code: "E0102",
    headline: "A required token was missing.",
    body:
      "The frozen table reserves a distinct code for a missing token, separate from a token that is present and wrong. The bootstrap currently reports both as E0101 and puts the expected token in the message text, so the information is there even though the second code is not.",
    status: "reserved",
    statusNote:
      "Not emitted by the v0 bootstrap. Every parse error today, including a missing `;`, carries E0101; the message still names the token that was expected.",
    trigger: T(
      "e0102.tp",
      `use tier core;

fn main() -> i32 {
    let x = 1
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0102.tp",
      "e0102.tp:5:5: error: expected ';' to end the statement, got 'return'",
      "  [E0101 unexpected-token] see spec/grammar.ebnf for what is legal here",
    ],
    fix: [
      "Add the token named in the message.",
      "A `let` statement always ends in `;`, including when it is the last statement before `}`.",
      "An `if` or `while` body is a block and takes no `;` after the closing brace.",
    ],
    why:
      "The split matters to a tool, not a person: a missing token is usually a one-character insertion at the reported span, while a wrong token may need a rewrite. Keeping the codes separate lets a fixer choose the cheaper edit without reading English.",
    related: ["/docs/reference/statements", "/docs/language"],
  },
  {
    code: "E0201",
    headline: "A name was used that nothing declares.",
    body:
      "The name-resolution pass knows every function, struct, enum, local and builtin visible at this point. A call to a function that is not declared in the file, or in a dependency folded into it, lands here before any type is considered.",
    status: "emitted",
    trigger: T(
      "e0201.tp",
      `use tier core;

fn main() -> i32 {
    puts("hi");
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0201.tp",
      "e0201.tp:4:5: error: call to unknown function 'puts'",
      "  [E0201 unknown-identifier] define it, use the right module, or fix spelling",
    ],
    fix: [
      "Declare the function in the file, or add it as a dependency in `ralt.yaml`.",
      "For a local, check the binding is in scope at the use site: a block-local `let` does not exist after its `}`.",
      "For a struct or enum, check the definition precedes the use in the file.",
    ],
    why:
      "Tripon has no implicit libc prelude. A name in the environment is a dependency, and a dependency has to be written down. That is what makes a `.tp` file's imports auditable from the file itself.",
    related: ["/docs/reference/builtins", "/docs/toolchain"],
  },
  {
    code: "E0202",
    headline: "Two types are not the same type.",
    body:
      "Tripon has no implicit conversion, in either direction, including widening. Every place that asks two types to meet — a binding and its initializer, two operands, an argument and its parameter, a condition and `bool`, a return and its signature — requires them to be identical. The message names both sides and the value is left untyped so later errors do not cascade from it.",
    status: "emitted",
    trigger: T(
      "e0202.tp",
      `use tier core;

fn main() -> i32 {
    print_f64(3);
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0202.tp",
      "e0202.tp:4:15: error: builtin 'print_f64' expects f64, got i32",
      "  [E0202 type-mismatch] types must match exactly; no implicit conversion exists; use cast<T>(x)",
    ],
    reading:
      "The integer literal `3` is an `i32` because that is the default for an integer literal. `print_f64` takes `f64`. The repair is a written conversion: `print_f64(cast<f64>(3))`.",
    fix: [
      "Convert explicitly with `cast<T>(x)` on the side that needs to change.",
      "If the types are integers of different widths, cast at the boundary where the width matters, not in the middle of an expression.",
      "For a condition, the expression must already be `bool`; there is no truthiness and no `cast<bool>`.",
      "For a struct initializer, all fields are required: `missing field 'y' in struct init` is this code.",
    ],
    why:
      "The rule is the same one that makes `i8` and `i64` separate types: an implicit conversion turns a width bug into a silent truncation that shows up in a value far from the source line. Making it a compile error moves it to the line that caused it.",
    related: ["/docs/language/types", "/docs/reference/operators", "/docs/reference/builtins"],
  },
  {
    code: "E0203",
    headline: "A `const` binding was reassigned.",
    body:
      "`let` is mutable and `const` is not. The check runs on the left-hand side of every assignment and compound assignment, after the binding resolves, so it reports the binding's own name rather than the type of the value.",
    status: "emitted",
    trigger: T(
      "e0203.tp",
      `use tier core;

fn main() -> i32 {
    const k = 1;
    k = 2;
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0203.tp",
      "e0203.tp:5:5: error: k is const and cannot be reassigned",
      "  [E0203 mutability-required] declared const but reassigned; switch to let",
    ],
    fix: [
      "Change the declaration to `let` when the value is meant to change.",
      "Keep `const` and introduce a new binding for the second value.",
      "`const` beyond the function body is not accepted by the v0 parser; a file-level constant is E0101 today.",
    ],
    why:
      "A `const` says the reader never has to look for a second assignment. Enforcing it at the assignment is cheaper than making every reader scan the body.",
    related: ["/docs/reference/statements"],
  },
  {
    code: "E0204",
    headline: "`null` was written, and there is no `null`.",
    body:
      "`null` and `undefined` are not values, not keywords with no meaning, not anything. The name-resolution pass recognises both spellings and reports this code with the replacement in the message. A missing value is represented by `opt<T>`, and it cannot be used without a `match` or a `?`.",
    status: "emitted",
    trigger: T(
      "e0204.tp",
      `use tier core;

fn main() -> i32 {
    let o: opt<i32> = null;
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0204.tp",
      "e0204.tp:4:23: error: null and undefined do not exist; use opt (T) for may-be-missing values",
      "  [E0204 no-null] null and undefined do not exist; use opt<T>",
    ],
    reading:
      "The human message renders the angle brackets as `opt (T)`; the hint line prints `opt<T>`. Both are the compiler's text; they are reproduced here rather than normalised.",
    fix: [
      "Use `opt<T>` and construct it with `some(v)` or `none`.",
      "Unwrap it with `match`, or propagate it with `?` from a function returning `opt<T>`.",
      "For a failure with a reason, use `result<T, E>` instead.",
    ],
    why:
      "A null that can appear anywhere is a null that must be checked everywhere. Removing the value removes the check from every type that does not opt in.",
    related: ["/docs/language/errors"],
  },
  {
    code: "E0205",
    headline: "A `result` was evaluated and its value dropped.",
    body:
      "A `result<T, E>` in statement position is a decision the program has not made. The checker rejects it unless the value is consumed by `match` or propagated with `?`. The same rule applies to a `result` returned from a call that is not the last expression of a `return`.",
    status: "emitted",
    trigger: T(
      "e0205.tp",
      `use tier core;

fn f() -> result<i32, str> {
    return ok(1);
}

fn main() -> i32 {
    f();
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0205.tp",
      "e0205.tp:8:5: error: result<i32, str> value evaluated and dropped",
      "  [E0205 unhandled-result] Result value ignored; spread with ? or match",
    ],
    fix: [
      "Propagate with `?` from a function whose return type matches the error type.",
      "Handle both arms with `match` if this is the function that decides.",
      "Bind the value and handle it later — the check is on the drop, not on the call.",
    ],
    why:
      "An ignored error is the bug that survives every test that only exercises the happy path. Making the drop a compile error is the only place it can be caught without running the failure.",
    related: ["/docs/language/errors"],
  },
  {
    code: "E0206",
    headline: "A `match` over an enum does not cover every variant.",
    body:
      "Enums are closed: the variants are known at the declaration, so a `match` can be checked against the full set. A missing variant is reported with its name. A `_` arm is accepted and is treated as deliberate coverage of everything not listed.",
    status: "emitted",
    trigger: T(
      "e0206.tp",
      `use tier core;

enum E { A, B, C }

fn main() -> i32 {
    let e = E::A;
    match e {
        E::A => { print_str("a"); }
        E::B => { print_str("b"); }
    }
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0206.tp",
      "e0206.tp:7:5: error: match over 'E' misses variant 'C'",
      "  [E0206 non-exhaustive-match] match must cover every enum variant or add a deliberate _ arm",
    ],
    fix: [
      "Add the missing variant arm, even if its body is empty.",
      "Or add `_ => { }` if new variants should not force a change here. That is a decision, and the syntax records it.",
    ],
    why:
      "Adding a variant should break every `match` that needs to think about it, at compile time. That is the whole reason the enum is closed.",
    related: ["/docs/language/data"],
  },
  {
    code: "E0207",
    headline: "The operation is not defined for this type, and no cast creates the definition.",
    body:
      "The table uses E0207 for type-directed refusals that are not a mismatch between two sides: composite equality, array equality, and casts that are not in the conversion table. The message names the operation and the type; the hint says what to write instead.",
    status: "emitted",
    trigger: T(
      "e0207.tp",
      `use tier core;

struct P { x: i32; y: i32; }

fn main() -> i32 {
    let a = P { x: 1, y: 2 };
    let b = P { x: 1, y: 2 };
    if a == b {
        print_str("eq");
    }
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0207.tp",
      "e0207.tp:8:8: error: composite equality on P is not defined; no cast exists for it",
      "  [E0207 implicit-conversion-denied] no implicit conversions exist; use cast<T>(x) for exact or explicit lossy casts",
      "e0207.tp:8:8: error: condition must be bool",
      "  [E0202 type-mismatch] types must match exactly; no implicit conversion exists; use cast<T>(x)",
    ],
    reading:
      "The second line is cascade: the failed `==` produced no type, and `if` then reports that its condition is not `bool`. The first line is the one to fix.",
    fix: [
      "Compare composites field by field: `a.x == b.x && a.y == b.y`.",
      "Arrays compare element by element too; there is no builtin slice comparison in v0.",
      "`str` and `bool` do support `==` and `!=` directly.",
      "Only integer↔integer, float↔float, integer↔float casts are defined; `cast<i32>(someBool)` is this code.",
    ],
    why:
      "Equality is not free: it is a generated function with a cost, and a language that hides it makes `if bigStruct == other` look like a comparison of two words. Requiring the loop makes the cost visible.",
    related: ["/docs/reference/operators", "/docs/language/types", "/docs/language/data"],
  },
  {
    code: "E0212",
    headline: "The same variant is matched twice.",
    body:
      "Arm matching is top to bottom, so the second arm for a variant is unreachable. The check reports the repeated variant, not the arm body. It applies to enum variants and to the `some`/`none` and `ok`/`err` constructors.",
    status: "emitted",
    trigger: T(
      "e0212.tp",
      `use tier core;

enum E { A, B }

fn main() -> i32 {
    let e = E::A;
    match e {
        E::A => { print_str("a"); }
        E::A => { print_str("b"); }
        E::B => { }
    }
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0212.tp",
      "e0212.tp:9:9: error: duplicate match arm: variant 'A' already covered",
      "  [E0212 duplicate-match-arm] remove or reorder the repeated arm; match arms are checked top to bottom",
    ],
    fix: [
      "Delete the later arm, or change its pattern to the variant it was meant to be.",
      "If the intent was an ordered decision, the first arm already won; there is no pattern ranking in v0.",
    ],
    why:
      "A duplicate arm is always a copy-paste bug, never a feature. Reporting it at the duplicate keeps the reader from having to reason about which body runs.",
    related: ["/docs/language/data"],
  },
  {
    code: "E0301",
    headline: "A feature needs a higher tier than the file declares.",
    body:
      "The tier system is a compile-time ceiling. A file that declares `use tier kernel` may not call a builtin, allocate, or use a construct that the kernel tier does not carry; reaching past the ceiling is meant to be a hard error, never a runtime surprise.",
    status: "reserved",
    statusNote:
      "Not enforced in the v0 bootstrap. The tier checker is not wired: a kernel-tier file that uses `opt`, `match`, or `print_str` checks clean, and no input produces E0301 today. The tier declarations are parsed and recorded, and the pass is on the roadmap.",
    trigger: T(
      "e0301.tp",
      `use tier kernel;

fn main() -> i32 {
    let o: opt<i32> = some(1);
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0301.tp",
      "$ echo $?",
      "0",
    ],
    reading:
      "This is the pass that is not there yet. The program above should be refused once the tier pass lands; today it is accepted, and the docs say so rather than pretend otherwise.",
    fix: [
      "Raise the declared tier: `use tier core;` or higher.",
      "Or remove the feature the tier cannot carry.",
      "There is no pragma to silence the check; the declaration is the decision.",
    ],
    why:
      "On a microcontroller, a runtime you did not budget for is not a style problem. A ceiling that fails the build is the only version of that promise that can be checked before flashing.",
    related: ["/docs/language/tiers"],
  },
  {
    code: "E0302",
    headline: "The file never declared a tier.",
    body:
      "Every file is meant to say which tier it targets, with `use tier <name>;` near the top. A file with no declaration has no ceiling, which defeats the point of having tiers at all.",
    status: "reserved",
    statusNote:
      "Not emitted in v0. A file with no `use tier` line checks clean and builds; `use tier bogus;` is also accepted without complaint. Both are waiting on the same pass as E0301.",
    trigger: T(
      "e0302.tp",
      `fn main() -> i32 {
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0302.tp",
      "$ echo $?",
      "0",
    ],
    fix: [
      "Add `use tier core;` as the first line (or `kernel`, `std`, `full`).",
      "There is no implicit default tier today; once the pass lands, a missing declaration is this code rather than a guess.",
    ],
    why:
      "A default tier is a silent choice made on the author's behalf. The declaration is one line and it is the only place the budget is written down.",
    related: ["/docs/language/tiers"],
  },
  {
    code: "E0501",
    headline: "There is no `main` to start from.",
    body:
      "The driver looks for `fn main()` after a successful check. The diagnostic has no useful source position because there is no token to point at; it reports `(null):1:1` and carries the signature it wants.",
    status: "emitted",
    trigger: T(
      "e0501.tp",
      `use tier core;

fn helper() -> i32 {
    return 1;
}`,
    ),
    transcript: [
      "$ ralt check e0501.tp",
      "(null):1:1: error: no fn main() found in this file",
      "  [E0501 entry-point-missing] define fn main() -> i32",
    ],
    fix: [
      "Add `fn main() -> i32 { return 0; }`.",
      "`fn main()` with no return type also builds and exits 0; the `-> i32` form is the one the hint asks for because it can report a status.",
      "An empty file is this error, not a parse error.",
    ],
    why:
      "A program needs an entry point. Reporting it as a named code keeps a harness from having to match English in the linker's output.",
    related: ["/docs/reference/statements", "/docs/toolchain"],
  },
  {
    code: "E0601",
    headline: "A binding is never read.",
    body:
      "The warning table reserves a code for a local that is declared and never used. The intended mute is an underscore prefix, which is how other languages in this family signal an intentionally ignored binding.",
    status: "reserved",
    statusNote:
      "Not emitted in v0. An unused local checks clean, and `let _unused = 1;` is also accepted. There is no liveness pass to raise the warning yet.",
    trigger: T(
      "e0601.tp",
      `use tier core;

fn main() -> i32 {
    let unused = 1;
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0601.tp",
      "$ echo $?",
      "0",
    ],
    fix: [
      "Remove the binding, or prefix it with `_` once the pass exists.",
      "A warning never changes the exit code; a build with only warnings exits 0.",
    ],
    why:
      "An unused local is usually the residue of a deleted feature or a typo in a name. It is a warning rather than an error because code in progress is allowed to have them.",
    related: ["/docs/diagnostics"],
  },
  {
    code: "E0602",
    headline: "Code after a `return` can never run.",
    body:
      "The warning table reserves a code for statements after an unconditional `return` in the same block. It is a warning because a `return` can be deliberately early while older code is kept for reference.",
    status: "reserved",
    statusNote:
      "Not emitted in v0. The statement after `return 0;` is checked and silently accepted; nothing reports it.",
    trigger: T(
      "e0602.tp",
      `use tier core;

fn main() -> i32 {
    return 0;
    print_str("never");
}`,
    ),
    transcript: [
      "$ ralt check e0602.tp",
      "$ echo $?",
      "0",
    ],
    fix: [
      "Delete the statement, or move it above the `return`.",
      "If the `return` was meant to be conditional, it needs an `if` around it.",
    ],
    why:
      "Unreachable code in a language with no exceptions is always a mistake or a leftover. It is cheap to detect and cheap to fix, so it stays at warning severity.",
    related: ["/docs/diagnostics"],
  },
  {
    code: "E0603",
    headline: "A new binding hides one that is already in scope.",
    body:
      "Shadowing is legal and checked: the inner binding wins for the rest of its block, and the outer one comes back at the closing brace. The warning exists because the two names being identical is usually a typo, not an intent.",
    status: "emitted",
    trigger: T(
      "e0603.tp",
      `use tier core;

fn main() -> i32 {
    let x = 1;
    let x = 2;
    print_i32(x);
    return 0;
}`,
    ),
    transcript: [
      "$ ralt check e0603.tp",
      "e0603.tp:5:5: warn: 'x' shadows an existing binding",
      "  [E0603 shadowing] name shadows an existing binding in scope; rename",
      "$ echo $?",
      "0",
    ],
    reading:
      "The exit status is 0: a warning does not fail a build. The JSON form of the same diagnostic carries a longer hint than `ralt explain` does — `rename the inner binding or drop shadowing intent` — because the two tables were written at different times.",
    fix: [
      "Rename the inner binding.",
      "If the shadowing is intentional, the build still succeeds; there is no error to silence.",
    ],
    why:
      "Shadowing is useful for a value that is transformed once (a parsed form of a raw form). It is also how a typo hides. A warning is the compromise: visible in output, never blocking.",
    related: ["/docs/reference/statements"],
  },
  {
    code: "E9001",
    headline: "Integer arithmetic left the range of its type.",
    body:
      "Overflow is not undefined and it is not a wrap by default. Every integer operation that can leave the type's range checks, and a defined trap exits 101 with the code, the name, and the source line. `ralt run -fast` selects wrapping instead, and that is the only way to get it.",
    status: "emitted",
    trigger: T(
      "e9001.tp",
      `use tier core;

fn main() -> i32 {
    let big: i32 = 2147483647;
    print_i32(big + 1);
    return 0;
}`,
    ),
    transcript: [
      "$ ralt run e9001.tp",
      "tripon trap E9001 integer-overflow-trap at e9001.tp:5",
      "$ echo $?",
      "101",
    ],
    reading:
      "The trap line is the whole report: no stack trace, no core file, no diagnostic JSON. A harness distinguishes a trap from a build failure by the exit code alone (101 versus 1).",
    fix: [
      "Widen the type before the operation: `let big: i64 = 2147483647;`.",
      "Guard the operation if the input is not trusted.",
      "Choose wrapping deliberately with `ralt run -fast` when the algorithm is defined modulo the width; the flag belongs after `run`, not before it.",
    ],
    why:
      "A wrap in C is the bug that survives a code review and dies in production. A trap at the exact operation makes the failure local, and a binary search over inputs finds the edge.",
    related: ["/docs/language/traps"],
  },
  {
    code: "E9002",
    headline: "An index was outside the array.",
    body:
      "Array indexing is checked everywhere. A constant index outside the length is caught at check time as E0202. An index that is only known at run time is checked at the access and traps with E9002. A `str` index counts bytes, and the same rule applies.",
    status: "emitted",
    trigger: T(
      "e9002.tp",
      `use tier core;

fn main() -> i32 {
    let a: [3]i32;
    let i = 3;
    print_i32(a[i]);
    return 0;
}`,
    ),
    transcript: [
      "$ ralt run e9002.tp",
      "tripon trap E9002 index-out-of-bounds at e9002.tp:6",
      "$ echo $?",
      "101",
    ],
    reading:
      "`let i = 3;` makes the index opaque to the checker, so this one reaches the runtime. With a literal `a[3]` the same program is refused before codegen.",
    fix: [
      "Compare the index with `len(a)` before the access when the index comes from input.",
      "Remember the valid range is `0 .. len - 1`; `len(a)` is one past the last element.",
      "An empty array has no valid index, including `0`.",
    ],
    why:
      "An out-of-bounds read is the classic memory-safety bug, and a bounds check is one compare. The trade is explicit: pay the compare, or lose the guarantee.",
    related: ["/docs/language/arrays", "/docs/language/traps"],
  },
  {
    code: "E9003",
    headline: "A division or remainder had a zero divisor.",
    body:
      "Both `/` and `%` trap on a zero divisor. Integer division truncates toward zero, and the remainder takes the sign of the dividend; a zero divisor has no defined result in either operation, so it is a trap rather than a guess.",
    status: "emitted",
    trigger: T(
      "e9003.tp",
      `use tier core;

fn main() -> i32 {
    let z = 0;
    print_i32(7 / z);
    return 0;
}`,
    ),
    transcript: [
      "$ ralt run e9003.tp",
      "tripon trap E9003 division-by-zero-trap at e9003.tp:5",
      "$ echo $?",
      "101",
    ],
    fix: [
      "Check the divisor before the operation.",
      "Return an `opt` or a `result` from the function when zero is a valid input and not a bug.",
      "`%` with a zero divisor is the same trap, not a separate code.",
    ],
    why:
      "In C, division by zero is undefined for integers. A defined trap means a fuzzer can trust the exit code and a reader can trust the report.",
    related: ["/docs/language/traps"],
  },
  {
    code: "E9004",
    headline: "A float-to-integer cast had no integer in range.",
    body:
      "Casting `f64` to an integer truncates toward zero, and a value outside the target type's range traps. `cast<i32>(3.5e9)` has no `i32` to truncate to. Integer-to-integer casts are different: they wrap, and `cast<i8>(200)` is `-56` with no trap.",
    status: "emitted",
    trigger: T(
      "e9004.tp",
      `use tier core;

fn main() -> i32 {
    print_i32(cast<i32>(3.5e9));
    return 0;
}`,
    ),
    transcript: [
      "$ ralt run e9004.tp",
      "tripon trap E9004 cast-overflow-trap at e9004.tp:4",
      "$ echo $?",
      "101",
    ],
    reading:
      "`ralt explain E9004` does not know this code yet: it answers with the internal-error row (`name: internal`, `report this to the Tripon repo with a minimal repro`). The code is real, `spec/errors.csv` lists it, and the trap is the one above; only the explain table is missing the row.",
    fix: [
      "Check the float against the target range before the cast.",
      "Cast to a wider integer first if the value may be large: `cast<i64>` before `cast<i32>` truncates the same way, so check the value instead.",
      "If the cast is a guess at the value's shape, the input needs validating before it reaches this line.",
    ],
    why:
      "Converting a float that is out of range is not a rounding question; there is no answer. Trapping keeps it from becoming whatever the hardware happens to produce.",
    related: ["/docs/language/types", "/docs/language/traps"],
  },
];

export const codeDetailByCode = new Map(
  codeDetails.map((detail) => [detail.code.toLowerCase(), detail]),
);

export function findCodeDetail(code: string): CodeDetail | undefined {
  return codeDetailByCode.get(code.toLowerCase());
}
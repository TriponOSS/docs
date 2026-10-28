/**
 * Types for the vendored `edge orbit` scene.
 *
 * The module itself is plain JavaScript, kept byte for byte from ascii.rest, so
 * `meta.category` would infer as `string` and the piece would not satisfy the
 * `Piece` its neighbours are. This file says what the module is, in the
 * library's own types, so the vendored piece is held to the same shape as the
 * 217 pieces that ship with ascii.rest — and so a piece that drifts from that
 * shape is a type error rather than a canvas that renders nothing.
 */

import type { Frame, Meta } from "ascii.rest";

export declare const meta: Meta;

export default function edgeOrbit(): Frame;

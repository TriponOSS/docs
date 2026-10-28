/**
 * The ascii.rest pieces this site uses, imported one module at a time so each
 * becomes its own chunk.
 *
 * Pieces are addressed by slug from server components and resolved to their
 * module here, inside the client bundle: a piece module carries a function, and
 * functions do not survive the server/client boundary. This is ascii.rest's own
 * documented pattern, made explicit with a type so a typo is a build error.
 *
 * `ralt-session` is local — the library ships 217 pieces and none of them is a
 * Tripon compiler, so that one is written next door from a real transcript.
 */

import * as bigText from "ascii.rest/pieces/big-text";
import * as bootLog from "ascii.rest/pieces/boot-log";
import * as cLogo from "ascii.rest/pieces/c";
import * as fileTree from "ascii.rest/pieces/file-tree";
import * as icosahedron from "ascii.rest/pieces/icosahedron";
import * as ruledMountains from "ascii.rest/pieces/ruled-mountains";

import * as edgeOrbit from "./pieces/edge-orbit";
import * as raltSession from "./pieces/ralt-session";

export const pieces = {
  "big-text": bigText,
  "boot-log": bootLog,
  c: cLogo,
  "edge-orbit": edgeOrbit,
  "file-tree": fileTree,
  icosahedron: icosahedron,
  "ralt-session": raltSession,
  "ruled-mountains": ruledMountains,
};

export type PieceSlug = keyof typeof pieces;

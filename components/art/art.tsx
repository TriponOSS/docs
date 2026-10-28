"use client";

import { Ascii, type MountOptions } from "ascii.rest/react";
import type { CSSProperties, ReactNode } from "react";

import { pieces, type PieceSlug } from "./registry";

type ArtProps = {
  piece: PieceSlug;
  /** The piece's own options, plus `fps` to override its frame rate. */
  options?: MountOptions;
  /** What the picture shows, for a screen reader. */
  label?: string;
  /** Cap on the solved font size, so a short piece does not balloon. */
  max?: string;
  /** Drop the well: for art that sits in a column of prose. */
  bare?: boolean;
  /**
   * Keep the piece's palette. A palette piece draws on a canvas; without this
   * it is forced onto a <pre> and drawn in one ink like the text pieces.
   */
  color?: boolean;
  /** Draw it in the faint ink reserved for texture rather than output. */
  faint?: boolean;
  /** A line under the art: what it is, and where its numbers came from. */
  caption?: ReactNode;
  className?: string;
};

/**
 * One ascii.rest piece, sized to its own character grid.
 *
 * The piece's `cols` and `rows` are handed to CSS as custom properties, which
 * is what lets the art rule solve a font size against the container instead of
 * trusting a breakpoint. Playback, the reduced-motion still frame and the
 * screen-reader label all come from ascii.rest itself.
 */
export function Art({
  piece,
  options,
  label,
  max,
  bare,
  color,
  faint,
  caption,
  className,
}: ArtProps) {
  const mod = pieces[piece];
  const meta = mod.meta;

  return (
    <figure className={["art-figure", className].filter(Boolean).join(" ")}>
      <div className="art-cell" data-bare={bare || undefined} data-faint={faint || undefined}>
        <Ascii
          piece={mod}
          options={options}
          label={label ?? meta.name}
          mono={!color}
          className="art"
          style={
            {
              "--cols": meta.cols,
              "--rows": meta.rows,
              ...(max ? { "--art-max": max } : null),
            } as CSSProperties
          }
        />
      </div>
      {caption ? <figcaption className="art-caption">{caption}</figcaption> : null}
    </figure>
  );
}

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import { GLYPH_SIZE, isOn } from "./glyphs";

/**
 * Signature mark — a 16x16 board of square tiles. The tiles flip Othello-style,
 * a cascade rippling out from the centre, and land as the Atomic "A". They flip
 * back to blank, then flip in again.
 *
 * Seamless loop: frame 0 is the finished A (also what Outlook shows, since it
 * renders only the first frame), and the last frame lands back on it.
 */

const LETTER = "A";

/** Tile face while blank, and while claimed by the letter. */
const FACE_BLANK = "rgba(26,46,242,0.13)";
const FACE_ON = COLOR.cobalt;

/** Cycle: hold A, flip out, hold blank, flip in. Fractions of the loop. */
const FLIP_OUT_START = 0.34;
const FLIP_IN_START = 0.66;
const FLIP_SPAN = 0.26; // how long a full cascade takes
const FLIP_DURATION = 0.1; // how long one tile takes to turn over

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Quantise so the GIF encoder sees a handful of repeated tile widths. */
const quantise = (v: number, steps: number) => Math.round(v * steps) / steps;

export const SigMark: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const t = (frame % durationInFrames) / durationInFrames;

  const margin = width * 0.05;
  const cell = (width - margin * 2) / GLYPH_SIZE;
  const gap = cell * 0.14;
  const mid = (GLYPH_SIZE - 1) / 2;

  const tiles: React.ReactNode[] = [];
  for (let row = 0; row < GLYPH_SIZE; row++) {
    for (let col = 0; col < GLYPH_SIZE; col++) {
      // Cascade order: rings out from the middle of the board, so the flip
      // reads as one capture spreading, not a row-by-row wipe.
      const dist = Math.max(Math.abs(col - mid), Math.abs(row - mid)) / mid;
      const delay = dist * (FLIP_SPAN - FLIP_DURATION);

      // Progress of this tile's turn, 0 -> 1, for each of the two flips.
      const out = clamp01((t - FLIP_OUT_START - delay) / FLIP_DURATION);
      const back = clamp01((t - FLIP_IN_START - delay) / FLIP_DURATION);

      // 0 = showing the letter face, 1 = showing the blank face.
      const flipped = clamp01(out - back);
      const turn = flipped < 0.5 ? flipped : 1 - flipped;

      const on = isOn(LETTER, col, row);
      // Mid-turn the tile is edge-on; past halfway it shows its other face.
      const showsLetter = on && (flipped < 0.5 ? true : false);

      // Squeeze on the vertical axis — a square tile turning over in place.
      const squeeze = quantise(1 - turn * 1.94, 8);
      const w = Math.abs(cell - gap) * Math.max(0.06, Math.abs(squeeze));
      const full = cell - gap;

      tiles.push(
        <div
          key={`${row}-${col}`}
          style={{
            position: "absolute",
            left: margin + col * cell + gap / 2 + (full - w) / 2,
            top: margin + row * cell + gap / 2,
            width: w,
            height: full,
            backgroundColor: showsLetter ? FACE_ON : FACE_BLANK,
          }}
        />,
      );
    }
  }

  return <AbsoluteFill style={{ backgroundColor: COLOR.groundLight }}>{tiles}</AbsoluteFill>;
};

/**
 * GROW+ — "What Holds It Up".
 *
 * Tokens lifted verbatim from the approved Paper file (Grow+, artboard
 * "03 · FINAL SIX"). They are the film's design system, not a brand in
 * `motion-system/brands` — the piece is authored, like `hero/`.
 *
 * Everything in this folder is written in the Paper artboard's own coordinate
 * space (1240 × 698) and scaled once, at the root, to 1920 × 1080. That way a
 * number here and a number in the keyframe are the same number.
 */

export const COLOR = {
  bone: "#EEEDE1",
  boneDeep: "#E4E2D2",
  forest: "#014B4F",
  forestDeep: "#013A3D",
  ink: "#0A0503",
  inkMuted: "#0A0503B3",
  blue: "#2296BB",
  yellow: "#FFE055",
  onForest: "#F1EFE3",
} as const;

export const DESIGN = { width: 1240, height: 698 } as const;

export const FRAME = { width: 1920, height: 1080 } as const;

/** One scale for the whole film. 1920 / 1240. */
export const SCALE = FRAME.width / DESIGN.width;

export const FONT = {
  family: '"Sora", system-ui, sans-serif',
  file: "fonts/Sora.ttf",
} as const;

/** Photographs, with their natural sizes so cover-crops can be computed. */
export const PHOTO = {
  countryside: { src: "media/grow/land-countryside.webp", w: 544, h: 363 },
  snow: { src: "media/grow/land-snow.webp", w: 544, h: 361 },
  island: { src: "media/grow/land-island.webp", w: 850, h: 478 },
  dunes: { src: "media/grow/land-dunes.webp", w: 544, h: 363 },
  coast: { src: "media/grow/land-coast.jpg", w: 1200, h: 675 },
  mountains: { src: "media/grow/land-mountains.webp", w: 3200, h: 2135 },
} as const;

export type PhotoId = keyof typeof PHOTO;

export const RING = { src: "media/grow/ring.webp" } as const;

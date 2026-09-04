import { PHOTO, type PhotoId } from "./tokens";
import { EASE, FPS, mix, span, T } from "./timeline";

/**
 * The landscape system: one logical object for the first two thirds of the film.
 *
 * There is no scene here and no mount/unmount. `stripsAt` is a pure function of
 * the frame that returns the geometry of every surface currently in the frame,
 * derived from the geometry of the surface it came out of:
 *
 *   one strip → incision → two surfaces → six → one band
 *
 * Rects are in the Paper artboard's coordinate space (1240 × 698); the numbers
 * are the approved keyframe's own numbers.
 */

export type Rect = { x: number; y: number; w: number; h: number };
/** Where the photograph sits inside its strip, in the strip's local space. */
export type Cover = { left: number; top: number; w: number; h: number };
export type Strip = {
  key: string;
  photo: PhotoId;
  rect: Rect;
  cover: Cover;
  opacity: number;
  /** Visible fraction of the strip, and which edge it is anchored to. */
  reveal: number;
  anchor: "top" | "bottom";
};

const rect = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });

const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  w: mix(a.w, b.w, t),
  h: mix(a.h, b.h, t),
});

/** Centre cover-crop of a photograph inside a rect, exactly like CSS `cover`. */
export const coverOf = (photo: PhotoId, r: Rect): Cover => {
  const p = PHOTO[photo];
  const scale = Math.max(r.w / p.w, r.h / p.h);
  const w = p.w * scale;
  const h = p.h * scale;
  return { left: (r.w - w) / 2, top: (r.h - h) / 2, w, h };
};

/**
 * A cover expressed against a *different* rect — used when a surface is a slice
 * of a parent surface and has to keep showing that parent's photograph in the
 * same place. This is what makes the split read as one picture being cut rather
 * than two pictures appearing.
 */
const inheritedCover = (parent: Rect, parentCover: Cover, piece: Rect): Cover => ({
  left: parent.x + parentCover.left - piece.x,
  top: parent.y + parentCover.top - piece.y,
  w: parentCover.w,
  h: parentCover.h,
});

const lerpCover = (a: Cover, b: Cover, t: number): Cover => ({
  left: mix(a.left, b.left, t),
  top: mix(a.top, b.top, t),
  w: mix(a.w, b.w, t),
  h: mix(a.h, b.h, t),
});

/* ------------------------------------------------------------------ *
 * The five geometric states, straight off the keyframes.
 * ------------------------------------------------------------------ */

/** FRAME 01 — one full-bleed sliver, 22% down. */
const PARENT = rect(0, 154, 1240, 116);
const PARENT_OPACITY = 0.85;
const PARENT_COVER = coverOf("countryside", PARENT);
/** The incision: the parent's own middle. */
const CUT = PARENT.y + PARENT.h / 2;

/** FRAME 02 — the same strip, cut, the halves offset. */
const TOP_START = rect(PARENT.x, PARENT.y, PARENT.w, CUT - PARENT.y);
const TOP_END = rect(0, 154, 1240, 44);
const BOTTOM_START = rect(PARENT.x, CUT, PARENT.w, PARENT.y + PARENT.h - CUT);
const BOTTOM_END = rect(252, 266, 988, 44);

/** FRAME 03 — six, left-anchored, ragged on the right. */
type Six = { key: string; photo: PhotoId; rect: Rect; opacity: number; anchor: "top" | "bottom"; open: [number, number] };
const SIX: Six[] = [
  // Strip one is the top half of the split, carried forward — same photograph,
  // same object. It is not revealed; it travels.
  { key: "s1", photo: "countryside", rect: rect(0, 116, 1024, 36), opacity: 0.6, anchor: "top", open: [T.stripMultiply[0], T.stripMultiply[0]] },
  { key: "s2", photo: "snow", rect: rect(0, 176, 1240, 22), opacity: 0.6, anchor: "bottom", open: [5.05, 5.45] },
  { key: "s3", photo: "island", rect: rect(0, 224, 712, 52), opacity: 0.38, anchor: "top", open: [5.15, 5.6] },
  { key: "s4", photo: "dunes", rect: rect(0, 304, 1156, 18), opacity: 0.6, anchor: "top", open: [5.1, 5.5] },
  { key: "s5", photo: "coast", rect: rect(0, 352, 536, 32), opacity: 0.6, anchor: "top", open: [5.4, 5.8] },
  { key: "s6", photo: "mountains", rect: rect(0, 412, 924, 14), opacity: 0.6, anchor: "top", open: [5.55, 5.95] },
];

/** FRAME 04 — the band the six collapse into, and the slots that fill it. */
export const BAND = { top: 304, bottom: 464, height: 160 };
const SLOTS: Rect[] = (() => {
  const total = SIX.reduce((n, s) => n + s.rect.h, 0);
  const k = BAND.height / total;
  let y = BAND.top;
  return SIX.map((s) => {
    const h = s.rect.h * k;
    const r = rect(0, y, 1240, h);
    y += h;
    return r;
  });
})();
/** Opacity the six converge on, so the collapsed band reads as one surface. */
const COLLAPSED_OPACITY = 0.75;

/* ------------------------------------------------------------------ *
 * The system at a frame.
 * ------------------------------------------------------------------ */

export const stripsAt = (frame: number): Strip[] => {
  const s = frame / FPS;

  /* --- 01 · the frame is cut open and the landscape is under it --- */
  if (s < T.stripSplit[0]) {
    const reveal = span(frame, T.stripEnter, EASE.settle);
    if (reveal <= 0) return [];
    return [
      { key: "a", photo: "countryside", rect: PARENT, cover: PARENT_COVER, opacity: PARENT_OPACITY, reveal, anchor: "top" },
    ];
  }

  /* --- 01 → 02 · the incision, and the two surfaces separating --- */
  if (s < T.stripMultiply[0]) {
    const p = span(frame, T.stripSplit, EASE.boundary);
    const top = lerpRect(TOP_START, TOP_END, p);
    const bottom = lerpRect(BOTTOM_START, BOTTOM_END, p);
    return [
      {
        key: "a",
        photo: "countryside",
        rect: top,
        cover: inheritedCover(PARENT, PARENT_COVER, top),
        opacity: PARENT_OPACITY,
        reveal: 1,
        anchor: "top",
      },
      {
        key: "b",
        photo: "countryside",
        rect: bottom,
        cover: inheritedCover(PARENT, PARENT_COVER, bottom),
        opacity: PARENT_OPACITY,
        reveal: 1,
        anchor: "top",
      },
    ];
  }

  /* --- 02 → 03 · two become six, uncovered from the seams --- */
  const collapse = span(frame, T.stripCollapse, EASE.open);

  const six: Strip[] = SIX.map((cfg, i) => {
    const target = collapse > 0 ? lerpRect(cfg.rect, SLOTS[i], collapse) : cfg.rect;
    const cover = collapse > 0 ? lerpCover(coverOf(cfg.photo, cfg.rect), coverOf(cfg.photo, SLOTS[i]), collapse) : coverOf(cfg.photo, cfg.rect);
    const opacity = mix(cfg.opacity, COLLAPSED_OPACITY, collapse);

    if (cfg.key === "s1") {
      // The surviving half of the split, travelling into its new position.
      const p = span(frame, [T.stripMultiply[0], 5.4], EASE.open);
      const r = p < 1 ? lerpRect(TOP_END, cfg.rect, p) : target;
      const from = inheritedCover(PARENT, PARENT_COVER, TOP_END);
      const to = coverOf(cfg.photo, cfg.rect);
      return {
        key: cfg.key,
        photo: cfg.photo,
        rect: r,
        cover: p < 1 ? lerpCover(from, to, p) : cover,
        opacity: p < 1 ? mix(PARENT_OPACITY, cfg.opacity, p) : opacity,
        reveal: 1,
        anchor: cfg.anchor,
      };
    }

    return {
      key: cfg.key,
      photo: cfg.photo,
      rect: target,
      cover,
      opacity,
      reveal: span(frame, cfg.open, EASE.boundary),
      anchor: cfg.anchor,
    };
  });

  /* The lower half of the split closes as the new material opens out of it —
     removal, not a fade. It is gone before the six have finished arriving. */
  const closing = 1 - span(frame, [5.0, 5.4], EASE.boundary);
  if (closing > 0) {
    six.unshift({
      key: "b",
      photo: "countryside",
      rect: BOTTOM_END,
      cover: inheritedCover(PARENT, PARENT_COVER, BOTTOM_END),
      opacity: PARENT_OPACITY,
      reveal: closing,
      anchor: "top",
    });
  }

  return six.filter((strip) => strip.reveal > 0);
};

/** The gap the split opens, which is what uncovers the word "But." */
export const gapAt = (frame: number) => {
  const p = span(frame, T.stripSplit, EASE.boundary);
  const top = mix(CUT, TOP_END.y + TOP_END.h, p);
  const bottom = mix(CUT, BOTTOM_END.y, p);
  return { top, bottom };
};

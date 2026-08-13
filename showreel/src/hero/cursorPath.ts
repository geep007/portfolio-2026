import { interpolate } from "remotion";
import { OUT } from "../theme";
import type { Timeline } from "./timeline";

/**
 * One cursor, one continuous path, across the whole reel.
 *
 * Keys are stored as (shot id, frame within that shot) rather than absolute
 * frames. That is what lets shots be deleted or retimed in the editor without
 * the choreography sliding out from under the edit: a key belonging to a shot
 * that has been switched off simply drops out, and the rest re-resolve against
 * the new timeline.
 */

export type CursorState = "idle" | "press" | "drag";

type Key = {
  shot: string;
  /** Frame within that shot. */
  at: number;
  x: number;
  y: number;
  state?: CursorState;
  opacity?: number;
};

const KEYS: Key[] = [
  // Enters from off-screen right and crosses the opening mosaic.
  { shot: "mosaic-open", at: 0, x: 2120, y: 300, opacity: 0 },
  { shot: "mosaic-open", at: 12, x: 1560, y: 380, opacity: 1 },
  { shot: "mosaic-open", at: 40, x: 1000, y: 520 },
  { shot: "mosaic-open", at: 58, x: 760, y: 560, state: "press" },

  // DESIGN — draws a selection box out of the cleared ground.
  { shot: "cursor-select", at: 0, x: 760, y: 560 },
  { shot: "cursor-select", at: 6, x: 470, y: 250 },
  { shot: "cursor-select", at: 8, x: 470, y: 250, state: "press" },
  { shot: "cursor-select", at: 30, x: 1450, y: 830, state: "drag" },
  { shot: "cursor-select", at: 38, x: 1450, y: 830 },

  // FIGMA → LIVE — steps outside the frame and clicks to deselect. It publishes.
  { shot: "creo-figma-to-live", at: 18, x: 1700, y: 950 },
  { shot: "creo-figma-to-live", at: 26, x: 1700, y: 950, state: "press" },
  { shot: "creo-figma-to-live", at: 36, x: 1700, y: 950 },

  // Rides along, low and out of the way, so the composed frames are never
  // competing with a moving arrow.
  { shot: "creo-annotated", at: 0, x: 1500, y: 900, opacity: 0.45 },
  { shot: "grow-mosaic", at: 0, x: 1150, y: 930, opacity: 0.3 },
  { shot: "athina-annotated", at: 0, x: 880, y: 900, opacity: 0.3 },
  { shot: "surreal-globe", at: 34, x: 1050, y: 880, opacity: 0.24 },

  { shot: "surreal-globe", at: 60, x: 1240, y: 500, opacity: 0 },

  // WEB GALLERY — steps in to place the last card, then backs off.
  { shot: "web-gallery", at: 0, x: 1240, y: 500, opacity: 0 },
  { shot: "web-gallery", at: 18, x: 1560, y: 420, opacity: 0.9 },
  { shot: "web-gallery", at: 24, x: 1560, y: 420, state: "press" },
  { shot: "web-gallery", at: 44, x: 1180, y: 560, state: "drag" },
  { shot: "web-gallery", at: 62, x: 980, y: 640, opacity: 0.5 },

  // MOBILE GRID — rides across the columns, low.
  { shot: "mobile-grid", at: 0, x: 940, y: 700, opacity: 0.35 },
  { shot: "mobile-grid", at: 60, x: 700, y: 780, opacity: 0.25 },

  // The client wall runs clean — no cursor over the logos.
  { shot: "logo-wall", at: 0, x: 700, y: 800, opacity: 0 },

  // CALM HOLD — gone entirely. Nothing competes with this shot.
  { shot: "calm-hold", at: 0, x: 560, y: 720, opacity: 0.35 },
  { shot: "calm-hold", at: 18, x: 480, y: 940, opacity: 0 },
  { shot: "calm-hold", at: 64, x: 1180, y: 700, opacity: 0 },

  // Rests beside the positioning line, then exits right on the entry height so
  // the last frame hands straight back to the first.
  { shot: "final-title", at: 6, x: 1180, y: 680, opacity: 1 },
  { shot: "final-title", at: 18, x: 1180, y: 660 },
  { shot: "final-title", at: 26, x: 1180, y: 660 },
  { shot: "final-title", at: 40, x: 2120, y: 300, opacity: 0 },
];

type Resolved = Omit<Key, "shot" | "at"> & { frame: number };

/** Drop keys whose shot is switched off, and place the rest on the timeline. */
const resolve = (timeline: Timeline): Resolved[] => {
  const out: Resolved[] = [];

  for (const k of KEYS) {
    const s = timeline.shots.find((x) => x.id === k.shot);
    if (!s) {
      continue;
    }
    // A shot can be shortened below a key's offset; clamp rather than overshoot.
    out.push({ ...k, frame: s.from + Math.min(k.at, s.duration) });
  }

  out.sort((a, b) => a.frame - b.frame);
  return out;
};

export const cursorAt = (frame: number, timeline: Timeline) => {
  const keys = resolve(timeline);

  if (keys.length === 0) {
    return { x: -100, y: -100, opacity: 0, state: "idle" as CursorState };
  }
  if (keys.length === 1) {
    const only = keys[0];
    return {
      x: only.x,
      y: only.y,
      opacity: only.opacity ?? 1,
      state: only.state ?? ("idle" as CursorState),
    };
  }

  let prev = keys[0];
  let next = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (frame >= keys[i].frame && frame <= keys[i + 1].frame) {
      prev = keys[i];
      next = keys[i + 1];
      break;
    }
  }

  const span = next.frame - prev.frame;
  const t =
    span <= 0
      ? 1
      : interpolate(frame, [prev.frame, next.frame], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
        });

  return {
    x: interpolate(t, [0, 1], [prev.x, next.x]),
    y: interpolate(t, [0, 1], [prev.y, next.y]),
    opacity: interpolate(t, [0, 1], [prev.opacity ?? 1, next.opacity ?? 1]),
    // State belongs to the key you are travelling *from* — a press reads as
    // held down until the next key releases it.
    state: (prev.state ?? "idle") as CursorState,
  };
};

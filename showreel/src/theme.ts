import { Easing } from "remotion";

/**
 * Lifted from CASE-STUDY-SYSTEM.md — the capabilities deck visual system.
 * Do not invent new values here; the reel has to read as the same object as the deck.
 */
export const COLOR = {
  cobalt: "#1A2EF2",
  cobaltOnDark: "#4757F4",
  groundLight: "#FAFAFA",
  groundDark: "#0A0A0A",
  ink: "#333333",
  inkMuted: "rgb(51 51 51 / 62%)",
  inkRule: "rgb(51 51 51 / 16%)",
  onDark: "#FAFAFA",
  onDarkMuted: "rgba(250,250,250,0.68)",
  onDarkRule: "rgba(250,250,250,0.18)",
  gridLight: "rgba(26,46,242,0.09)",
  gridDark: "rgba(250,250,250,0.08)",
} as const;

export const FONT = {
  display: '"Neue Haas Display", "Helvetica Neue", sans-serif',
  mono: '"Tronica Mono", ui-monospace, monospace',
} as const;

/** Expo-out. Everything decelerates hard and lands — nothing drifts. */
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
/** For pushes and pans that must never look like they stop. */
export const LINEAR_ISH = Easing.bezier(0.33, 0, 0.67, 1);

export const FPS = 30;

/** Scene boundaries in frames, 12.0s total. */
export const SCENE = {
  open: { from: 0, duration: 42 },
  surreal: { from: 42, duration: 82 },
  creo: { from: 124, duration: 76 },
  athina: { from: 200, duration: 72 },
  grow: { from: 272, duration: 46 },
  close: { from: 318, duration: 42 },
} as const;

export const TOTAL = SCENE.close.from + SCENE.close.duration;

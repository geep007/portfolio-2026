import { atomic } from "./motion-system/brands/atomic/brand";
import { bezier } from "./motion-system/engine/easing";

/**
 * Legacy theme surface for the pre-motion-system components.
 *
 * These constants used to BE the brand. They are now derived from the Atomic
 * BrandSystem (`motion-system/brands/atomic/brand.ts`), so the old reels keep
 * reading the same values while new work goes through `useBrand()`. Do not add
 * values here — add them to the brand file.
 */
const c = atomic.colors;

export const COLOR = {
  cobalt: c.primary,
  cobaltOnDark: c.inverse.accent,
  groundLight: c.background,
  groundDark: c.inverse.background,
  ink: c.foreground,
  inkMuted: c.muted,
  inkRule: c.rule,
  onDark: c.inverse.foreground,
  onDarkMuted: c.inverse.muted,
  onDarkRule: c.inverse.rule,
  gridLight: c.semantic!.gridLight,
  gridDark: c.semantic!.gridDark,
} as const;

export const FONT = {
  display: atomic.typography.display.stack,
  mono: atomic.typography.mono!.stack,
} as const;

/** Expo-out. Everything decelerates hard and lands — nothing drifts. */
export const OUT = bezier(atomic.motion.easings.enter);
/** For pushes and pans that must never look like they stop. */
export const LINEAR_ISH = bezier(atomic.motion.easings.travel);

export const FPS = 30;

/**
 * Scene boundaries for the 12s ShowreelShort. Absolute frames — the oldest
 * timeline in the project, kept as-is because that cut is finished.
 */
export const SCENE = {
  open: { from: 0, duration: 42 },
  surreal: { from: 42, duration: 82 },
  creo: { from: 124, duration: 76 },
  athina: { from: 200, duration: 72 },
  grow: { from: 272, duration: 46 },
  close: { from: 318, duration: 42 },
} as const;

export const TOTAL = SCENE.close.from + SCENE.close.duration;

import { Easing } from "remotion";
import type { Bezier, BrandSystem } from "../brand/schema";

/**
 * Turns the brand's bezier data into Remotion easing functions. Memoised per
 * tuple so a component asking every frame gets the same function back.
 */
const cache = new Map<string, (t: number) => number>();

export const bezier = (b: Bezier) => {
  const key = b.join(",");
  let fn = cache.get(key);
  if (!fn) {
    fn = Easing.bezier(b[0], b[1], b[2], b[3]);
    cache.set(key, fn);
  }
  return fn;
};

export type EasingName = "enter" | "exit" | "travel" | (string & {});

/**
 * Resolve a named easing for a brand. Unknown names fall back to `enter` so a
 * pattern written against one brand cannot crash another — it just moves in
 * that brand's default way, which is the correct failure.
 */
export const easingOf = (brand: BrandSystem, name: EasingName = "enter") => {
  const e = brand.motion.easings;
  if (name === "enter") return bezier(e.enter);
  if (name === "exit") return bezier(e.exit);
  if (name === "travel") return bezier(e.travel);
  const extra = e.extra?.[name];
  return bezier(extra ?? e.enter);
};

/** Engine reference curves. Brands override; these are what "1.0" means. */
export const REFERENCE_EASINGS = {
  /** Expo-out: decelerates hard and lands. */
  expoOut: [0.16, 1, 0.3, 1] as Bezier,
  /** Near-linear with soft ends, for pushes that must not visibly stop. */
  travel: [0.33, 0, 0.67, 1] as Bezier,
  /** Expo-in: accelerates away. */
  expoIn: [0.7, 0, 0.84, 0] as Bezier,
  /** Quart-out: softer landing than expo. */
  quartOut: [0.25, 1, 0.5, 1] as Bezier,
  /** Cubic in-out: symmetrical, mechanical. */
  cubicInOut: [0.65, 0, 0.35, 1] as Bezier,
  /** Linear. */
  linear: [0, 0, 1, 1] as Bezier,
};

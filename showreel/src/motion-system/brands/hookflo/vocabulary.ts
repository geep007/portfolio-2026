import type { MotionVocabulary } from "../../brand/vocabulary";

/**
 * How Hookflo speaks.
 *
 * Narrow on purpose. This brand has one visual verb — CONTAIN — and everything
 * it shows sits inside a hairline panel on a near-black ground. Patterns that
 * fly, float, bleed or crop through the frame edge are not in the vocabulary at
 * all; that is the difference between Hookflo and Atomic, not a setting.
 *
 * The film itself (films/hookflo/MissingDot.tsx) is authored rather than
 * planned — see direction.ts. This vocabulary is what the *planner* may reach
 * for when it composes other Hookflo pieces from the generic patterns.
 */
export const hookfloVocabulary: MotionVocabulary = {
  brandId: "hookflo",
  entries: [
    {
      pattern: "headline-reveal",
      alias: "hero line",
      category: "typography",
      description:
        "Left-aligned Geist at -0.045em, two short lines, the second in lavender. Lines mask-rise inside their own boxes; nothing scales or fades. An uppercase mono label sits above.",
      roles: ["hook", "statement", "close"],
      compatibleContent: ["short-headline", "brand-statement"],
      energy: "low",
      duration: { min: 40, preferred: 60, max: 90 },
      constraints: { maxWords: 8, maxLines: 2 },
      goodFor: ["the opening claim", "the closing line under the mark"],
      avoidWhen: ["the beat needs to show the product working"],
      brandOptions: { behaviour: "mask-rise", align: "left", emphasisLine: "last", grid: false },
    },
    {
      pattern: "browser-scroll",
      alias: "the console",
      category: "product",
      description:
        "The dashboard inside window chrome: traffic lights, a hookflo.com URL pill, a live status strip along the bottom. The frame stays still and the interface inside it moves.",
      roles: ["reveal", "proof", "detail"],
      compatibleContent: ["website", "ui-fragments"],
      energy: "medium",
      duration: { min: 60, preferred: 90, max: 140 },
      goodFor: ["showing that the product is running, not posed"],
      avoidWhen: ["the previous beat was also a window"],
      brandOptions: { chrome: "titled", statusStrip: true, scrollEasing: "travel", push: 0 },
    },
    {
      pattern: "annotated-window",
      alias: "inspect",
      category: "product",
      description:
        "One window with a hairline callout pointing at a single row or chip. Used to name a state — 410, no signature, delivered — never to label three things at once.",
      roles: ["detail", "proof"],
      compatibleContent: ["ui-fragments", "website"],
      energy: "low",
      duration: { min: 50, preferred: 70, max: 110 },
      constraints: { maxItems: 1 },
      goodFor: ["making one failure legible"],
      avoidWhen: ["more than one thing needs naming"],
      brandOptions: { rule: "hairline", labelCase: "upper", labelFace: "mono" },
    },
    {
      pattern: "stat-tiles",
      alias: "bento",
      category: "layout",
      description:
        "Three hairline cards, each with a live UI fragment above its text. Cards clip open in place on a metronome; they do not fade up or float.",
      roles: ["proof", "detail"],
      compatibleContent: ["stat", "ui-fragments"],
      energy: "medium",
      duration: { min: 60, preferred: 85, max: 130 },
      constraints: { minItems: 2, maxItems: 3 },
      goodFor: ["what you get, in three"],
      avoidWhen: ["the beat already has a window in it"],
      brandOptions: { radius: "medium", border: "hairline", entrance: "clip-open", stagger: "tight" },
    },
    {
      pattern: "logo-wall",
      alias: "works with",
      category: "logo",
      description:
        "Ecosystem marks in their own colours at low contrast, marching left on one line under an uppercase mono label. Continuous, never staggered in.",
      roles: ["proof", "breathe"],
      compatibleContent: ["logo-set"],
      energy: "low",
      duration: { min: 40, preferred: 60, max: 90 },
      constraints: { minItems: 4 },
      goodFor: ["placing Hookflo in the stack the viewer already uses"],
      avoidWhen: ["the marks would have to be silhouetted to fit"],
      brandOptions: { motion: "marquee", grid: false, monochrome: false },
    },
    {
      pattern: "knockout-statement",
      alias: "the slab",
      category: "typography",
      description:
        "The one inverted surface: a grainy lavender panel with a serif line and a black pill. Appears once, at the end, and never twice in a piece.",
      roles: ["close", "statement"],
      compatibleContent: ["short-headline", "brand-statement"],
      energy: "medium",
      duration: { min: 50, preferred: 70, max: 100 },
      constraints: { maxWords: 9, maxLines: 1 },
      goodFor: ["the last card"],
      avoidWhen: ["a lavender surface has already been used in this piece"],
      brandOptions: { ground: "inverse", face: "serif", cta: true, grain: true },
    },
    {
      pattern: "logo-outro",
      alias: "the mark",
      category: "logo",
      description:
        "The 3x3 dot grid with its missing corner and its one white dot, the wordmark beside it, one line under it, a mono status strip at the bottom edge.",
      roles: ["close"],
      compatibleContent: ["logo", "short-headline"],
      energy: "low",
      duration: { min: 45, preferred: 65, max: 100 },
      goodFor: ["resolving a piece back into the identity"],
      avoidWhen: ["never — every Hookflo piece ends here"],
      brandOptions: { mark: "dot-grid", statusStrip: true, drift: false },
    },
  ],

  preferences: {
    hook: ["headline-reveal", "browser-scroll"],
    statement: ["headline-reveal"],
    reveal: ["browser-scroll"],
    proof: ["annotated-window", "stat-tiles", "logo-wall"],
    detail: ["annotated-window", "stat-tiles"],
    breathe: ["logo-wall"],
    close: ["logo-outro", "knockout-statement"],
  },
};

/**
 * BrandSystem — the smallest structured description of a brand that lets the
 * motion engine produce work that feels native to it.
 *
 * Everything here is plain data (JSON-serialisable). No functions, no Remotion
 * imports. The engine resolves it: `Easing` curves come from `easing.ts`,
 * frame counts from `timing.ts`. That split is deliberate — an agent has to be
 * able to read and write a brand without executing anything.
 *
 * Two halves:
 *   - the design system  → what the brand LOOKS like  (colors, type, space, surfaces)
 *   - the motion system  → how the brand MOVES        (tempo, easing, entrances, camera)
 *
 * Only decisions that change what a viewer would recognise are tokens. Pixel
 * noise stays inside components.
 */

/* ------------------------------------------------------------------ *
 * Identity
 * ------------------------------------------------------------------ */

export type BrandIdentity = {
  /** Machine id, e.g. "atomic", "edelgive". Folder name under brands/. */
  id: string;
  name: string;
  description: string;
  /** 4–8 adjectives an agent can reason with: "precise", "warm", "editorial". */
  personality: string[];
};

/* ------------------------------------------------------------------ *
 * Colour
 * ------------------------------------------------------------------ */

export type BrandColors = {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  /** Hairlines and rules on `background`. */
  rule: string;
  /**
   * Inverse ground, for brands that switch between light and dark fields.
   * Both required so a pattern can ask for `dark` and always get an answer.
   */
  inverse: {
    background: string;
    foreground: string;
    muted: string;
    rule: string;
    /** Accent tuned for the inverse ground (cobalt needs lifting on black). */
    accent: string;
  };
  /** Optional named colours for content plates, chips, semantic states. */
  semantic?: Record<string, string>;
};

/* ------------------------------------------------------------------ *
 * Typography
 * ------------------------------------------------------------------ */

export type FontFace = {
  /** CSS family name as it will be referenced. */
  family: string;
  /** Full fallback stack, including `family` first. */
  stack: string;
  /**
   * Files under public/ to inject with @font-face. Empty when the family is a
   * system font or a webfont already loaded another way.
   */
  files?: { path: string; weight: number; style?: "normal" | "italic" }[];
};

export type TypeRole = {
  face: "display" | "body" | "mono";
  weight: number;
  /** em, e.g. "-0.05em". */
  tracking: string;
  lineHeight: number;
  casing: "none" | "upper" | "lower";
};

export type BrandTypography = {
  display: FontFace;
  body: FontFace;
  /** Utility/mono face. Falls back to body if the brand has none. */
  mono?: FontFace;
  /**
   * Type scale in px at 1920 wide. Named steps so a pattern asks for `hero`
   * rather than 132.
   */
  scale: {
    hero: number;
    display: number;
    title: number;
    body: number;
    label: number;
    micro: number;
  };
  /** How each role is set. Patterns ask `typeStyle(brand, "headline")`. */
  roles: {
    headline: TypeRole;
    subhead: TypeRole;
    body: TypeRole;
    label: TypeRole;
    /** Tracking on very large knockout/wordmark type. */
    wordmark: TypeRole;
  };
  /** Does the brand favour many short lines or one long line? */
  lineBreaking: "short-lines" | "long-lines";
};

/* ------------------------------------------------------------------ *
 * Spacing & layout
 * ------------------------------------------------------------------ */

export type BrandSpacing = {
  /** Base unit in px at 1920. */
  unit: number;
  /** Outer margin from the frame edge. */
  margin: number;
  /** Gap between sibling panels/cards. */
  gap: number;
  /** Gap between a headline and what sits under it. */
  stack: number;
  /** Safe zone the content should stay inside (for crops/overlays), px. */
  safe: { x: number; y: number };
};

export type BrandLayout = {
  /** Columns the brand composes on. Mosaic and gallery grids resolve to this. */
  columns: number;
  rows: number;
  maxWidth: number;
  alignment: "left" | "center" | "mixed";
  symmetry: "symmetric" | "asymmetric" | "mixed";
  density: "sparse" | "medium" | "dense";
  /** Compositions the brand reaches for. Free text but keep it short. */
  compositions: string[];
};

/* ------------------------------------------------------------------ *
 * Surfaces & imagery
 * ------------------------------------------------------------------ */

export type BrandSurfaces = {
  radius: { none: number; small: number; medium: number; large: number };
  /** Which radius media containers use by default. */
  mediaRadius: "none" | "small" | "medium" | "large";
  border: { width: number; color: string; style: "hairline" | "none" | "heavy" };
  shadow: "none" | "soft" | "hard";
  /** CSS shadow used when `shadow !== "none"`. */
  shadowValue: string;
  /** Does the brand use gradients at all? Most good ones don't. */
  gradients: boolean;
  blur: boolean;
  /** How the brand cuts a thing off: hard mask edge vs. soft fade. */
  clipping: "hard" | "soft";
};

export type BrandImagery = {
  /** Aspect ratios the brand crops to, most-used first. */
  aspects: string[];
  cropping: "tight" | "loose" | "full-bleed";
  /** Bordered, matted, or bare. */
  treatment: "bare" | "bordered" | "matted" | "framed";
  /** Continuous push (Ken Burns) — amount as scale delta, 0 = still. */
  push: number;
  /** Do images drift/parallax inside their frame? */
  drift: boolean;
  /** Preferred reveal for a single image. Must be a MotionVocabulary pattern id. */
  reveal: string;
};

/* ------------------------------------------------------------------ *
 * Motion — how the brand moves
 * ------------------------------------------------------------------ */

/** Cubic bezier as data: [x1, y1, x2, y2]. */
export type Bezier = [number, number, number, number];

export type BrandEasings = {
  /** Default entrance. Decelerating. */
  enter: Bezier;
  /** Default exit. Accelerating. */
  exit: Bezier;
  /** Continuous motion: pushes, pans, drifts. Never stops visibly. */
  travel: Bezier;
  /** Optional extras, named by the brand. Patterns fall back to the three above. */
  extra?: Record<string, Bezier>;
};

/**
 * Tempo scales every semantic duration. 1 = the engine's reference tempo
 * (Atomic). 1.3 = 30% slower everywhere. Keep between 0.7 and 1.6.
 */
export type BrandMotion = {
  tempo: number;
  /** Travel distance of entrances relative to the engine reference (1 = 100%). */
  amplitude: number;
  easings: BrandEasings;
  /** Overshoot allowed on entrances, 0 = none. Springs are opt-in via > 0. */
  overshoot: number;
  /** Frames between siblings when staggering, before tempo. */
  stagger: { tight: number; normal: number; loose: number };
  /** Reference frame counts before tempo. See timing.ts. */
  durations: { micro: number; short: number; standard: number; hero: number };
  /** Transition vocabulary this brand is allowed to use, in preference order. */
  transitions: string[];
  transitionFrames: { min: number; preferred: number; max: number };
  /** Preferred entrance/exit behaviours, as MotionVocabulary pattern tags. */
  entrances: string[];
  exits: string[];
  /** Camera: does the frame move? */
  camera: "static" | "push" | "drift" | "handheld";
  /** Does the brand use a persistent cursor/pointer as protagonist? */
  cursor: boolean;
};

/* ------------------------------------------------------------------ *
 * Motifs & rules
 * ------------------------------------------------------------------ */

export type BrandMotif = {
  id: string;
  description: string;
  /** Where it may appear. */
  use: ("background" | "transition" | "accent" | "logo" | "frame" | "cursor")[];
  /** Primitive that draws it, if one exists. */
  primitive?: string;
};

export type BrandRules = {
  always: string[];
  sometimes: string[];
  never: string[];
};

/* ------------------------------------------------------------------ *
 * The whole thing
 * ------------------------------------------------------------------ */

export type BrandSystem = {
  identity: BrandIdentity;
  colors: BrandColors;
  typography: BrandTypography;
  spacing: BrandSpacing;
  layout: BrandLayout;
  surfaces: BrandSurfaces;
  imagery: BrandImagery;
  motion: BrandMotion;
  motifs: BrandMotif[];
  rules: BrandRules;
  /** Logo assets under public/, if any. */
  logo?: { mark?: string; wordmark?: string; onDark?: string };
};

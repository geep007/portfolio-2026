import type { BrandSystem } from "../../brand/schema";
import { REFERENCE_EASINGS } from "../../engine/easing";

/**
 * Athina — collaborative platform for developing, evaluating and observing LLM
 * features. Derived from `projects/athina/brand-brief.json`, which is the
 * canonical archaeology; this file is the engine-facing half of it.
 *
 * The two things worth reading twice:
 *
 * The mark is the product drawn. Short stacked horizontal rules with one dot
 * riding one line — many parallel runs, one of them observed. It scales three
 * ways on the site without ever being called a logo: nav glyph, persona bullet,
 * and a full-bleed black band of rules with peach dots parked on individual
 * lines. Dots never sit between lines.
 *
 * The marketing is night and the tool is daylight. The page is black, white and
 * peach; every saturated colour on the site — mint, plum, olive, blue charts,
 * pastel score tints — appears only inside a product surface. Colour is a
 * property of working, not of branding.
 *
 * Type substitution, recorded honestly: the site sets a geometric grotesque
 * this repo does not license. Geist is used instead — a neutral grotesque of
 * similar proportion and the closest available. It is the one place the film
 * is not the site.
 */
export const athina: BrandSystem = {
  identity: {
    id: "athina",
    name: "Athina AI",
    description:
      "A measurement instrument that behaves like a dark room with one lamp. Black page, near-invisible type, then a single lit object: a sphere, a peach dot, a pastel product panel. Structure is ruled lines with dots parked on individual rules. Withholds where the category overwhelms; shows its own unflattering numbers.",
    personality: ["measured", "withholding", "instrumental", "honest", "nocturnal", "editorial"],
  },

  colors: {
    background: "#000000",
    foreground: "#FFFFFF",
    /** Peach is the data colour: every dot, every low score. */
    primary: "#F3CFC0",
    secondary: "#0B0B0B",
    /** Tan marks exactly one word in a headline. Never two. */
    accent: "#C9AE86",
    muted: "#8C8C8C",
    rule: "rgba(255,255,255,0.22)",
    /**
     * The inverse ground is the product itself: the tool is daylight inside a
     * night page. Product panels are the one place white grounds appear.
     */
    inverse: {
      background: "#FFFFFF",
      foreground: "#1C1C1C",
      muted: "#8C8C8C",
      rule: "#E6E6E6",
      accent: "#3E3341",
    },
    semantic: {
      /** Near-black type: legible only where light catches it. */
      inkHero: "#1C1C1C",
      inkGhost: "#141414",
      /** Pale cell washes behind an already-resolved mono number. */
      scoreGood: "#DCF0D0",
      scoreBad: "#F7DCC9",
      chartBlue: "#7CC0F0",
      chartGreen: "#9BD3A6",
      /** Product slabs. Colour only ever appears on these. */
      slabPlum: "#3E3341",
      slabOlive: "#3A4239",
      slabMint: "#DDE9DC",
      pink: "#E48AA6",
      panel: "#FFFFFF",
      panelRule: "#EAEAEA",
      panelInk: "#1C1C1C",
      panelMuted: "#9A9A9A",
      dim: "rgba(255,255,255,0.34)",
      ghost: "rgba(255,255,255,0.10)",
    },
  },

  typography: {
    display: {
      family: "Geist",
      stack: 'Geist, "Geist Fallback", "Inter", system-ui, -apple-system, sans-serif',
      files: [
        { path: "fonts/Geist-300.woff2", weight: 300 },
        { path: "fonts/Geist-400.woff2", weight: 400 },
        { path: "fonts/Geist-500.woff2", weight: 500 },
        { path: "fonts/Geist-600.woff2", weight: 600 },
      ],
    },
    body: {
      family: "Geist",
      stack: 'Geist, "Geist Fallback", "Inter", system-ui, -apple-system, sans-serif',
    },
    mono: {
      family: "Geist Mono",
      stack: '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace',
      files: [{ path: "fonts/GeistMono-400.woff2", weight: 400 }],
    },
    scale: { hero: 140, display: 88, title: 40, body: 20, label: 16, micro: 14 },
    roles: {
      headline: { face: "display", weight: 400, tracking: "-0.035em", lineHeight: 1.04, casing: "none" },
      subhead: { face: "display", weight: 300, tracking: "-0.02em", lineHeight: 1.15, casing: "none" },
      body: { face: "body", weight: 400, tracking: "-0.005em", lineHeight: 1.55, casing: "none" },
      /** The site's kicker: grey caps, widely tracked, top-left. */
      label: { face: "mono", weight: 400, tracking: "0.2em", lineHeight: 1.4, casing: "upper" },
      /** Bold ATHINA, light AI — the platform is the weight. */
      wordmark: { face: "display", weight: 600, tracking: "-0.02em", lineHeight: 1, casing: "none" },
    },
    lineBreaking: "short-lines",
  },

  spacing: { unit: 8, margin: 160, gap: 26, stack: 30, safe: { x: 160, y: 120 } },

  layout: {
    columns: 12,
    rows: 6,
    maxWidth: 1760,
    alignment: "mixed",
    symmetry: "asymmetric",
    density: "sparse",
    compositions: [
      "headline large-left at a third of frame width, 13px grey body block far right, big empty middle",
      "full-bleed band of 1px horizontal rules with peach dots parked on individual lines",
      "rounded product panel inset, cropped only at the bottom of frame, never bleeding left or right",
      "row of equal outlined pills sharing borders, exactly one active",
      "persona name with the dot-and-rule glyph as its bullet, inactive members held below at low opacity",
      "matte spheres lit on one terminator, overlapping into an eclipse, passing in front of type",
    ],
  },

  surfaces: {
    radius: { none: 0, small: 8, medium: 16, large: 24 },
    mediaRadius: "medium",
    border: { width: 1, color: "rgba(255,255,255,0.22)", style: "hairline" },
    shadow: "none",
    shadowValue: "none",
    /** The one gradient is a defocused wash sitting BEHIND product, never on it. */
    gradients: true,
    blur: true,
    clipping: "hard",
  },

  imagery: {
    aspects: ["16:9"],
    cropping: "tight",
    treatment: "framed",
    push: 0,
    drift: false,
    reveal: "photo-statement",
  },

  motion: {
    tempo: 1.15,
    amplitude: 0.5,
    easings: {
      /** Rules wipe, panels wash up: measured, lands, never overshoots. */
      enter: REFERENCE_EASINGS.quartOut,
      /** Luminance falling away. Nothing about this brand snaps. */
      exit: REFERENCE_EASINGS.travel,
      /** The dot along its line, and the camera pull-back. */
      travel: REFERENCE_EASINGS.travel,
      extra: {
        /** The dot's discrete one-rule step: decisive, no bounce. */
        step: [0.6, 0, 0.2, 1],
        /** Terminator rotation and world scale: continuous, unhurried. */
        world: [0.4, 0, 0.2, 1],
        /** Score tint washing in behind a resolved number. */
        tint: [0.33, 0, 0.2, 1],
      },
    },
    overshoot: 0,
    stagger: { tight: 2, normal: 5, loose: 10 },
    durations: { micro: 8, short: 16, standard: 26, hero: 40 },
    /** There are no transitions in this brand's films; states change by light. */
    transitions: ["cut"],
    transitionFrames: { min: 0, preferred: 0, max: 0 },
    entrances: ["luminance", "clip-left"],
    exits: ["luminance"],
    camera: "static",
    cursor: false,
  },

  motifs: [
    {
      id: "rules-and-dots",
      description:
        "1px horizontal rules at even gaps running full bleed, with peach dots parked ON individual lines, never between. The mark at any scale.",
      use: ["background", "logo", "accent"],
    },
    {
      id: "eclipse-spheres",
      description:
        "Matte spheres lit white-to-black on a single terminator, unequal sizes, overlapping into eclipse shapes. One light source for the whole brand.",
      use: ["background"],
    },
    {
      id: "score-tint",
      description:
        "A pale cell wash behind an already-resolved mono number — green high, peach low. The number never counts up; only the tint arrives.",
      use: ["accent"],
    },
    {
      id: "shared-border-pills",
      description:
        "A row of equal stroke-only pills sharing borders with exactly one active. Mode is expressed by which one is lit, not by movement.",
      use: ["frame"],
    },
    {
      id: "daylight-panel",
      description:
        "A white rounded product panel, flat and square to camera, inset or cropped at the bottom only. The tool is daylight inside a night page.",
      use: ["frame"],
    },
  ],

  rules: {
    always: [
      "Black frame, one illuminated object. Everything else is at or near black.",
      "Rules are the grid and dots are the data. A dot sits on a rule, never between.",
      "Saturated colour appears only inside a product surface.",
      "Numbers appear already resolved; state changes by tint behind them.",
      "Show the unflattering number. Every measurement beat includes a real failure.",
      "Emphasis is exactly one tan word in a headline.",
      "Product UI is flat, square to camera, at true density with real labels.",
      "Inactive members of a list stay in place at low opacity rather than being hidden.",
      "Hold on the number: a measurement beat ends still, long enough to read.",
    ],
    sometimes: [
      "Type sitting below legibility, occluded by an object passing in front of it.",
      "A defocused rainbow wash behind a product panel — the only saturated field.",
      "The glyph at editorial scale as a full-bleed band.",
    ],
    never: [
      "A scrim, glow or contrast lift added to make the hero headline readable.",
      "Rules animated as ambient texture — shimmer, scanlines, waveform, EQ bars.",
      "Counting numbers up. Odometer rolls read as advertising.",
      "3D tilt, perspective float or layer explosion of a product panel.",
      "Building the glyph from particles or a network graph.",
      "Springs, bounce, squash on the spheres. Only the terminator rotates.",
      "Diagonal dot travel, or a dot resting between two rules.",
      "Two competing light sources in one frame.",
      "An all-green dashboard.",
    ],
  },

  logo: {
    /** Drawn, not loaded: see films/athina/parts.tsx `Glyph`. */
    mark: "",
  },
};

import type { BrandSystem } from "../../brand/schema";
import { REFERENCE_EASINGS } from "../../engine/easing";
import { REFERENCE_DURATIONS, REFERENCE_STAGGER } from "../../engine/timing";

/**
 * Atomic Designz — the portfolio's own identity, lifted out of theme.ts,
 * typography.ts and the CASE-STUDY-SYSTEM.md visual system.
 *
 * This is the reference brand: tempo 1.0, reference easings, reference
 * durations. Every number the old components hardcoded that a viewer would
 * recognise is here. `theme.ts` now derives its COLOR/FONT/OUT from this file,
 * so the legacy reel reads the same values it always did.
 */
export const atomic: BrandSystem = {
  identity: {
    id: "atomic",
    name: "Atomic Designz",
    description:
      "Webflow and creative-development partner for design studios. Mechanical precision presented as a design tool: cursors, selection chrome, mono labels, hard cuts.",
    personality: ["precise", "mechanical", "cobalt", "editorial", "playful", "technical"],
  },

  colors: {
    background: "#FAFAFA",
    foreground: "#333333",
    primary: "#1A2EF2",
    secondary: "#0A0A0A",
    accent: "#1A2EF2",
    muted: "rgb(51 51 51 / 62%)",
    rule: "rgb(51 51 51 / 16%)",
    inverse: {
      background: "#0A0A0A",
      foreground: "#FAFAFA",
      muted: "rgba(250,250,250,0.68)",
      rule: "rgba(250,250,250,0.18)",
      accent: "#4757F4",
    },
    semantic: {
      gridLight: "rgba(26,46,242,0.09)",
      gridDark: "rgba(250,250,250,0.08)",
      plateYellow: "#F4E39B",
      cream: "#FCF5EA",
    },
  },

  typography: {
    display: {
      family: "Neue Haas Display",
      stack: '"Neue Haas Display", "Helvetica Neue", sans-serif',
      files: [
        { path: "fonts/NeueHaasDisplay-Roman.ttf", weight: 400 },
        { path: "fonts/NeueHaasDisplay-Medium.ttf", weight: 500 },
        { path: "fonts/NeueHaasDisplay-Bold.ttf", weight: 700 },
      ],
    },
    body: {
      family: "Neue Haas Display",
      stack: '"Neue Haas Display", "Helvetica Neue", sans-serif',
    },
    mono: {
      family: "Tronica Mono",
      stack: '"Tronica Mono", ui-monospace, monospace',
      files: [{ path: "fonts/Tronica-Mono.otf", weight: 400 }],
    },
    scale: { hero: 250, display: 132, title: 52, body: 26, label: 24, micro: 18 },
    roles: {
      headline: { face: "display", weight: 700, tracking: "-0.05em", lineHeight: 0.98, casing: "none" },
      subhead: { face: "display", weight: 500, tracking: "-0.03em", lineHeight: 1.1, casing: "none" },
      body: { face: "display", weight: 500, tracking: "-0.02em", lineHeight: 1.25, casing: "none" },
      label: { face: "mono", weight: 400, tracking: "0.06em", lineHeight: 1, casing: "upper" },
      wordmark: { face: "display", weight: 700, tracking: "-0.03em", lineHeight: 0.9, casing: "none" },
    },
    lineBreaking: "short-lines",
  },

  spacing: {
    unit: 8,
    margin: 120,
    gap: 26,
    stack: 30,
    safe: { x: 120, y: 96 },
  },

  layout: {
    columns: 12,
    rows: 8,
    maxWidth: 1680,
    alignment: "left",
    symmetry: "asymmetric",
    density: "dense",
    compositions: [
      "composed panel mosaic on a 12x8 grid",
      "one build centred in a browser window with callouts around it",
      "UI fragments floating on a flat accent field",
      "type block bottom-left over a full-bleed capture",
    ],
  },

  surfaces: {
    radius: { none: 0, small: 10, medium: 18, large: 22 },
    mediaRadius: "small",
    border: { width: 1, color: "rgba(51,51,51,0.2)", style: "hairline" },
    shadow: "soft",
    shadowValue: "0 34px 80px rgba(0,0,0,0.22)",
    gradients: false,
    blur: false,
    clipping: "hard",
  },

  imagery: {
    aspects: ["16:9", "9:16", "4:5"],
    cropping: "tight",
    treatment: "framed",
    push: 0.06,
    drift: true,
    reveal: "wipe",
  },

  motion: {
    tempo: 1,
    amplitude: 1,
    easings: {
      enter: REFERENCE_EASINGS.expoOut,
      exit: REFERENCE_EASINGS.expoOut,
      travel: REFERENCE_EASINGS.travel,
    },
    overshoot: 0,
    stagger: REFERENCE_STAGGER,
    durations: REFERENCE_DURATIONS,
    transitions: ["cut", "shutter", "pixelate", "wipe", "iris", "blinds", "fade"],
    transitionFrames: { min: 10, preferred: 12, max: 20 },
    entrances: ["mask-rise", "clip-wipe", "draw-on"],
    exits: ["cut", "clip-wipe"],
    camera: "push",
    cursor: true,
  },

  motifs: [
    {
      id: "dot-field",
      description: "Sparse cobalt lattice, one nucleus lifts the nearest dots. The site's hero texture.",
      use: ["background"],
      primitive: "DotField",
    },
    {
      id: "rule-grid",
      description: "8 vertical + 4 horizontal hairlines at the deck's exact coordinates.",
      use: ["background"],
      primitive: "RuleGrid",
    },
    {
      id: "cursor",
      description: "One arrow cursor on an unbroken path above every cut. The protagonist.",
      use: ["cursor"],
      primitive: "Cursor",
    },
    {
      id: "selection-chrome",
      description: "Design-tool selection box: hairline, eight handles, name tag, size chip.",
      use: ["frame", "accent"],
      primitive: "SelectionFrame",
    },
    {
      id: "pixel-confetti",
      description: "Large black/white/cobalt cells on a 16x9 grid, clearing in seeded order.",
      use: ["transition"],
      primitive: "transition:pixelate",
    },
    {
      id: "shutter-bands",
      description: "Four cobalt horizontal bands sweeping across a cut.",
      use: ["transition"],
      primitive: "transition:shutter",
    },
    {
      id: "system-label",
      description: "Mono uppercase chip that clips open from the left, holds under a second, clips shut.",
      use: ["accent"],
      primitive: "LabelFlash",
    },
  ],

  rules: {
    always: [
      "Hard cuts by default; transitions are covers, not crossfades.",
      "Something always moves: clips get a slow push, panels drift.",
      "Type rises inside a mask edge; it never fades in.",
      "Labels are interface feedback in mono caps, under a second on screen.",
      "Real captures only. No mockups, no placeholder UI.",
    ],
    sometimes: [
      "Cobalt as a full field behind floating UI fragments.",
      "A circle match-cut chain between shots.",
      "The mascot as the playful ending.",
      "Serif type on a coloured plate inside a mosaic, as a foreign accent.",
    ],
    never: [
      "Gradients, glows, glassmorphism.",
      "Spring or bounce easing.",
      "3D tilt that makes the motion the subject.",
      "Type fading in.",
      "A static frame for longer than a beat.",
    ],
  },

  logo: {
    mark: "media/mascot/mascot-mark.svg",
  },
};

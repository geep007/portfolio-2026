import type { BrandSystem } from "../../brand/schema";
import { REFERENCE_EASINGS } from "../../engine/easing";

/**
 * Hookflo — failure-first webhook observability. See source-study.html.
 *
 * Sampled from hookflo.com: ground 240 6% 10%, cards 240 6% 11% at 60% over a
 * single overhead lavender bloom, hairlines at #27272A, 12px radius everywhere,
 * Geist 400 at -0.045em for display, uppercase mono for labels.
 *
 * The one thing worth reading twice: the mark is a 3x3 dot grid with the
 * top-right dot MISSING and the bottom-centre dot WHITE. The identity is a data
 * grid with a hole in it. Every motif below descends from that.
 */
export const hookflo: BrandSystem = {
  identity: {
    id: "hookflo",
    name: "Hookflo",
    description:
      "Webhook observability for SaaS teams. Near-black instrument panel lit by one lavender bloom overhead; Geist at tight negative tracking; hairline containers with 12px radii; product UI shown live rather than posed. Precise, quiet, slightly nocturnal — a monitoring console, not an ad.",
    personality: ["precise", "nocturnal", "instrumental", "calm", "engineered", "vigilant"],
  },

  colors: {
    background: "#17171C",
    foreground: "#FAFAFA",
    primary: "#6C5DD3",
    secondary: "#18181B",
    accent: "#C4B5FD",
    muted: "#9CA3AF",
    rule: "#27272A",
    /**
     * The inverse ground is the one inverted surface on the site: the grainy
     * lavender CTA slab with a serif headline on it. It appears exactly once.
     */
    inverse: {
      background: "#A692E5",
      foreground: "#FFFFFF",
      muted: "rgba(255,255,255,0.78)",
      rule: "rgba(255,255,255,0.28)",
      accent: "#17171C",
    },
    semantic: {
      /** Card fill, as used: #18181B at 60% over the ground. */
      panel: "rgba(24,24,27,0.6)",
      panelSolid: "#1C1C21",
      /** Window chrome bar, darker than the panel it caps. */
      chrome: "#101014",
      /** Deep end of the button gradient; the light end is `bloom`. */
      lavenderDeep: "#6C5DD3",
      lavenderLight: "#A692E5",
      /** Syntax + inline code violet. */
      code: "#A78BFA",
      ok: "#4ADE80",
      okPlate: "rgba(22,101,52,0.45)",
      fail: "#F94D4D",
      failPlate: "rgba(127,29,29,0.35)",
      /** The single overhead light source. */
      bloom: "rgba(166,146,229,0.20)",
      dim: "rgba(250,250,250,0.32)",
      ghost: "rgba(250,250,250,0.12)",
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
    scale: { hero: 150, display: 96, title: 44, body: 26, label: 18, micro: 15 },
    roles: {
      // The site's h1: 60/56.4 with -2.7px tracking = -0.045em, leading 0.94.
      headline: { face: "display", weight: 400, tracking: "-0.045em", lineHeight: 0.94, casing: "none" },
      subhead: { face: "display", weight: 300, tracking: "-0.025em", lineHeight: 1.12, casing: "none" },
      body: { face: "body", weight: 400, tracking: "-0.01em", lineHeight: 1.5, casing: "none" },
      // Every label on the site is uppercase mono, widely tracked, above its content.
      label: { face: "mono", weight: 400, tracking: "0.18em", lineHeight: 1.4, casing: "upper" },
      wordmark: { face: "display", weight: 600, tracking: "-0.03em", lineHeight: 1, casing: "none" },
    },
    lineBreaking: "short-lines",
  },

  spacing: {
    unit: 8,
    margin: 160,
    gap: 24,
    stack: 28,
    safe: { x: 160, y: 110 },
  },

  layout: {
    columns: 12,
    rows: 6,
    maxWidth: 1600,
    alignment: "mixed",
    symmetry: "mixed",
    density: "dense",
    compositions: [
      "headline left third, live code/product window right, both inside the max-width container",
      "one wide browser frame holding the dashboard, cropped by the next section",
      "3-up bento of hairline cards, each with a live UI fragment above its text",
      "uppercase mono label centred above a centred heading",
      "one inverted lavender slab with a serif line and a black pill",
      "rows of log entries: dot, source chip, event name, timestamp, status chip",
    ],
  },

  surfaces: {
    // 0.5rem tokens, 12px in practice on cards and buttons. Nothing is rounder.
    radius: { none: 0, small: 8, medium: 12, large: 20 },
    mediaRadius: "medium",
    border: { width: 1, color: "#27272A", style: "hairline" },
    shadow: "soft",
    shadowValue: "0 24px 80px rgba(0,0,0,0.55)",
    // The bloom and the CTA slab are the only two. Both are lavender, both flat.
    gradients: true,
    blur: false,
    // Panels end at a hairline. Nothing fades out at an edge.
    clipping: "hard",
  },

  imagery: {
    aspects: ["16:9", "16:10"],
    cropping: "tight",
    treatment: "framed",
    // The site's product shots are still. The UI inside them is what moves.
    push: 0,
    drift: false,
    reveal: "browser-scroll",
  },

  motion: {
    tempo: 1.0,
    // Small travel. This brand contains things inside frames; it does not fly.
    amplitude: 0.5,
    easings: {
      enter: REFERENCE_EASINGS.expoOut,
      exit: REFERENCE_EASINGS.expoIn,
      travel: REFERENCE_EASINGS.linear,
      extra: {
        /** The scroll-illumination head: constant speed, no ease at either end. */
        scan: REFERENCE_EASINGS.linear,
        /** Routing along orthogonal paths: mechanical, symmetric. */
        route: REFERENCE_EASINGS.cubicInOut,
        settle: REFERENCE_EASINGS.quartOut,
      },
    },
    overshoot: 0,
    // Machine cadence: rows arrive on a metronome, not on a designer's stagger.
    stagger: { tight: 2, normal: 4, loose: 8 },
    durations: { micro: 5, short: 10, standard: 18, hero: 30 },
    transitions: ["cut", "wipe", "blinds", "fade"],
    transitionFrames: { min: 8, preferred: 12, max: 18 },
    entrances: ["clip-open", "mask-rise", "hard"],
    exits: ["dim", "cut"],
    camera: "static",
    cursor: false,
  },

  motifs: [
    {
      id: "dot-grid",
      description:
        "The mark: a 3x3 grid of dots with the top-right position EMPTY and the bottom-centre dot white. Lavender #A692E5. Read it as a stream of deliveries with one missing and one caught.",
      use: ["logo", "background", "accent"],
    },
    {
      id: "overhead-bloom",
      description:
        "One lavender radial bloom above the top edge of a section, centred. The only light source. Never a glow around an object, never a side light.",
      use: ["background"],
    },
    {
      id: "hairline-panel",
      description: "12px radius, 1px #27272A, fill #18181B at 60%. Every container. Edges are hard.",
      use: ["frame"],
    },
    {
      id: "window-chrome",
      description:
        "Three traffic lights left, a filename or a hookflo.com URL pill centred, a status strip along the bottom reading in mono. Signals 'this is running'.",
      use: ["frame"],
      primitive: "BrowserFrame",
    },
    {
      id: "scan-illumination",
      description:
        "The site's scroll-linked paragraph: text sits at ~30% and brightens as a reading head passes over it. Brightness is a hierarchy tool, not an effect.",
      use: ["transition", "accent"],
    },
    {
      id: "status-chip",
      description:
        "Small mono chip on a tinted plate: green 200 / Active / Connect, red for failure. Semantic colour appears only at chip scale, never as an area.",
      use: ["accent"],
    },
    {
      id: "lavender-slab",
      description:
        "The single inverted surface: a grainy lavender gradient panel with a serif headline and a black pill. Used once, at the end.",
      use: ["background"],
    },
  ],

  rules: {
    always: [
      "Near-black ground, one lavender bloom overhead, everything else contained in hairline panels.",
      "One accent per field of view. If the headline has lavender in it, nothing else does.",
      "Hierarchy by size and brightness, never by weight. Muted grey is a real level, not a leftover.",
      "Labels are uppercase mono, tracked wide, sitting above their content.",
      "Product UI is shown running: cursors blink, statuses read, toggles are on.",
      "Hard edges. A panel ends at its hairline; a mask is a rectangle.",
      "Semantic colour only at chip scale — green connected, red failed.",
      "Show the failure. This is a failure-first product; a film with only green in it is off-brand.",
    ],
    sometimes: [
      "The second line of a headline in lavender #C4B5FD.",
      "Mono timestamps ticking in real time.",
      "A serif line — but only on the inverted lavender slab, and only once.",
      "Ecosystem marks (Stripe, Clerk, Supabase, GitHub) in their own colours at low contrast.",
    ],
    never: [
      "Overshoot, springs, bounce. This is an instrument.",
      "Floating or tumbling cards, 3D, parallax, camera moves into the UI.",
      "Glow around elements, frosted glass, particles, glowing network graphs.",
      "Lavender as a field colour on the dark ground — it is an accent and one slab.",
      "Radii above 20px, or a soft/feathered edge anywhere.",
      "Kinetic typography. Type changes brightness and position; it does not scale, rotate or fly.",
      "Every element entering on its own fade-up stagger.",
    ],
  },

  logo: {
    // Drawn, not loaded: see films/hookflo/DotGrid.tsx.
    mark: "",
  },
};

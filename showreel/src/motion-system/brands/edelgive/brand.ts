import type { BrandSystem } from "../../brand/schema";
import { REFERENCE_EASINGS } from "../../engine/easing";

/**
 * EdelGive Foundation — see analysis.md.
 *
 * Fonts: PT Serif Caption ships with macOS and is used directly. Manrope is not
 * installed on this machine; the body stack falls to Avenir Next / system sans
 * until the OFL files are added under public/fonts (TODO-V1 NOW).
 */
export const edelgive: BrandSystem = {
  identity: {
    id: "edelgive",
    name: "EdelGive Foundation",
    description:
      "Indian philanthropy platform connecting funders with grassroots NGOs. Reads like an annual report: serif headlines, warm photography, blush plates, one deep navy. Calm, humane, institutional.",
    personality: ["warm", "grounded", "editorial", "institutional", "humane", "calm"],
  },

  colors: {
    background: "#FEFCFB",
    foreground: "#1D3459",
    primary: "#1D3459",
    secondary: "#F5EAE6",
    accent: "#C6623D",
    muted: "rgba(0,0,0,0.62)",
    rule: "rgba(0,0,0,0.15)",
    inverse: {
      background: "#1D3459",
      foreground: "#FFFFFF",
      muted: "rgba(255,255,255,0.7)",
      rule: "rgba(255,255,255,0.2)",
      accent: "#E0865F",
    },
    semantic: {
      plate: "#F7F0EE",
      plateDeep: "#F5EAE6",
      navyDeep: "#24377E",
      wash: "#D6E4F0",
      scrim: "rgba(20,24,30,0.42)",
      ink: "#000000",
    },
  },

  typography: {
    display: {
      family: "PT Serif Caption",
      stack: '"PT Serif Caption", "PT Serif", Georgia, "Times New Roman", serif',
    },
    body: {
      family: "Manrope",
      stack: 'Manrope, "Avenir Next", Avenir, system-ui, -apple-system, sans-serif',
    },
    scale: { hero: 200, display: 112, title: 48, body: 30, label: 26, micro: 20 },
    roles: {
      headline: { face: "display", weight: 400, tracking: "-0.01em", lineHeight: 1.15, casing: "none" },
      subhead: { face: "display", weight: 400, tracking: "-0.005em", lineHeight: 1.25, casing: "none" },
      body: { face: "body", weight: 400, tracking: "0em", lineHeight: 1.5, casing: "none" },
      label: { face: "body", weight: 500, tracking: "0em", lineHeight: 1.3, casing: "none" },
      wordmark: { face: "display", weight: 400, tracking: "-0.01em", lineHeight: 1.05, casing: "none" },
    },
    lineBreaking: "long-lines",
  },

  spacing: {
    unit: 8,
    margin: 200,
    gap: 32,
    stack: 36,
    safe: { x: 200, y: 140 },
  },

  layout: {
    columns: 4,
    rows: 2,
    maxWidth: 1400,
    alignment: "center",
    symmetry: "symmetric",
    density: "sparse",
    compositions: [
      "centred serif headline over a full-bleed dimmed landscape",
      "4x2 bento of blush stat plates alternating with portrait photos",
      "label + headline left, body right, no image",
      "numbered vertical pillars with rotated serif labels",
      "logos on white tiles in a 5-column grid",
    ],
  },

  surfaces: {
    radius: { none: 0, small: 16, medium: 32, large: 40 },
    mediaRadius: "small",
    border: { width: 1, color: "rgba(0,0,0,0.15)", style: "none" },
    shadow: "none",
    shadowValue: "0 2px 5px rgba(0,0,0,0.04)",
    gradients: false,
    blur: true,
    clipping: "soft",
  },

  imagery: {
    aspects: ["16:9", "3:2", "4:5"],
    cropping: "full-bleed",
    treatment: "bare",
    push: 0.05,
    drift: false,
    reveal: "fade",
  },

  motion: {
    tempo: 1.35,
    amplitude: 0.6,
    easings: {
      // The site's one curve: quick soft ease-out.
      enter: [0.2, 0, 0, 1],
      exit: [0.4, 0, 0.6, 1],
      travel: REFERENCE_EASINGS.travel,
      extra: { settle: REFERENCE_EASINGS.quartOut },
    },
    overshoot: 0,
    stagger: { tight: 4, normal: 8, loose: 14 },
    durations: { micro: 8, short: 16, standard: 26, hero: 40 },
    transitions: ["wave", "fade", "cut", "push-up"],
    transitionFrames: { min: 16, preferred: 22, max: 30 },
    entrances: ["mask-rise", "fade", "clip-open"],
    exits: ["fade", "wave"],
    camera: "push",
    cursor: false,
  },

  motifs: [
    {
      id: "wave-edge",
      description: "Hand-drawn wave separating photography from paper sections. ~30px amplitude, two crests across the width.",
      use: ["transition", "frame"],
      primitive: "transition:wave",
    },
    {
      id: "blush-plate",
      description: "Rounded blush plate (#F7F0EE, 32px) holding a serif figure or headline.",
      use: ["background", "accent"],
      primitive: "StatTiles",
    },
    {
      id: "pill",
      description: "100px-radius pill buttons, navy fill or 5% black fill.",
      use: ["accent"],
    },
    {
      id: "watercolour-wash",
      description: "Pale blue watercolour wash behind a cut-out photograph, used once per page as the CTA card.",
      use: ["background"],
    },
    {
      id: "terracotta-line",
      description: "The last line of a headline set in terracotta.",
      use: ["accent"],
    },
    {
      id: "numbered-pillars",
      description: "01 02 03 vertical panels with rotated serif labels along a rail.",
      use: ["frame"],
      primitive: "PillarIndex",
    },
  ],

  rules: {
    always: [
      "Serif for every headline and figure; sans only for body and labels.",
      "Sentence case. No uppercase, no mono.",
      "Centre headlines over photography; left-align them in split layouts.",
      "Every container is rounded. Masks are rounded insets, not hard rectangles.",
      "Photography is full-bleed with a scrim under white type.",
      "Cuts arrive under a wave edge or a fade. Never a hard cut between a photo and a paper section.",
      "One idea per shot, held long enough to read twice.",
    ],
    sometimes: [
      "Last headline line in terracotta.",
      "Figures count up.",
      "A watercolour wash behind a cut-out photo.",
      "Partner logos on white tiles, in their own colours.",
    ],
    never: [
      "Cursor, selection chrome, browser windows as the hero, phone grids.",
      "Black grounds. Saturated accent fields.",
      "Cuts shorter than 1.5 seconds. Overshoot. Drift rows. 3D.",
      "Uppercase labels or tracked-out type.",
      "Silhouetted (single-colour) partner logos.",
    ],
  },

  logo: {
    mark: "media/logos/edelgive.png",
  },
};

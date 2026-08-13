import { z } from "zod";
import { FONT } from "./theme";

/**
 * Type pairings for the standalone intro/outro frames.
 *
 * The reel body stays locked to the deck's Neue Haas / Tronica pairing — that
 * is the brand and it is not a per-render decision. The intro and outro are the
 * pieces that get dropped into someone else's context (a client deck, a job
 * post, a pitch page), so those two get a picker: same layout and timing, a
 * different voice.
 *
 * Every option here resolves to a font that is either shipped in public/fonts
 * or already on the machine, so nothing is fetched at render time and an
 * offline render produces the same frames as an online one. The tradeoff is
 * that the system pairings are macOS-first: rendering them on Linux or Lambda
 * falls back down the stack. `deck` is the only pairing guaranteed everywhere,
 * because it is the only one whose files travel with the project.
 *
 * Tracking lives here rather than in the components because it is a property of
 * the typeface, not of the layout: -0.05em is right for Neue Haas at 148px and
 * closes Futura's counters at the same size.
 */
export type FontPairing = {
  label: string;
  display: string;
  mono: string;
  /** Weight for the display headline and the knockout wordmark. */
  displayWeight: number;
  /** Weight for the outro's supporting line, set one step down from the mark. */
  displayMediumWeight: number;
  /** Tracking on large display type (headline, wordmark). */
  displayTracking: string;
  /** Tracking on the mono labels — eyebrow, chip, contact. */
  monoTracking: string;
  /**
   * Knockout wordmark tracking. Held looser than `displayTracking` because a
   * two-word line inside a mask loses its word space before the letters touch.
   */
  knockoutTracking: string;
};

export const FONT_PAIRINGS = {
  deck: {
    label: "Deck — Neue Haas / Tronica Mono",
    display: FONT.display,
    mono: FONT.mono,
    displayWeight: 700,
    displayMediumWeight: 500,
    displayTracking: "-0.05em",
    monoTracking: "0.08em",
    knockoutTracking: "-0.03em",
  },
  deckSf: {
    label: "Deck display / SF Mono",
    display: FONT.display,
    mono: '"SF Mono", ui-monospace, Menlo, monospace',
    displayWeight: 700,
    displayMediumWeight: 500,
    displayTracking: "-0.05em",
    monoTracking: "0.08em",
    knockoutTracking: "-0.03em",
  },
  helvetica: {
    label: "Helvetica Neue / SF Mono",
    display: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    mono: '"SF Mono", ui-monospace, Menlo, monospace',
    displayWeight: 700,
    displayMediumWeight: 500,
    displayTracking: "-0.045em",
    monoTracking: "0.08em",
    knockoutTracking: "-0.025em",
  },
  system: {
    label: "System sans / SF Mono",
    display:
      'system-ui, -apple-system, "SF Pro Display", "Segoe UI", sans-serif',
    mono: '"SF Mono", ui-monospace, Menlo, monospace',
    displayWeight: 700,
    displayMediumWeight: 500,
    displayTracking: "-0.04em",
    monoTracking: "0.08em",
    knockoutTracking: "-0.02em",
  },
  avenir: {
    label: "Avenir Next / Menlo",
    display: '"Avenir Next", Avenir, "Helvetica Neue", sans-serif',
    mono: 'Menlo, ui-monospace, monospace',
    displayWeight: 700,
    displayMediumWeight: 500,
    displayTracking: "-0.035em",
    monoTracking: "0.07em",
    knockoutTracking: "-0.015em",
  },
  futura: {
    label: "Futura / Courier New",
    display: 'Futura, "Avenir Next", "Century Gothic", sans-serif',
    mono: '"Courier New", Courier, monospace',
    displayWeight: 500,
    displayMediumWeight: 400,
    // Geometric caps have wide sidebearings already; pulling them in as hard as
    // the grotesk closes the counters on O and G.
    displayTracking: "-0.015em",
    monoTracking: "0.1em",
    knockoutTracking: "0em",
  },
  editorial: {
    label: "Editorial — Times / Courier New",
    display: '"Times New Roman", Times, Georgia, serif',
    mono: '"Courier New", Courier, monospace',
    displayWeight: 700,
    displayMediumWeight: 400,
    displayTracking: "-0.02em",
    monoTracking: "0.1em",
    knockoutTracking: "-0.01em",
  },
  georgia: {
    label: "Georgia / SF Mono",
    display: 'Georgia, "Times New Roman", serif',
    mono: '"SF Mono", ui-monospace, Menlo, monospace',
    displayWeight: 700,
    displayMediumWeight: 400,
    displayTracking: "-0.025em",
    monoTracking: "0.08em",
    knockoutTracking: "-0.005em",
  },
} as const satisfies Record<string, FontPairing>;

export type FontPairingId = keyof typeof FONT_PAIRINGS;

const IDS = Object.keys(FONT_PAIRINGS) as [FontPairingId, ...FontPairingId[]];

/**
 * The three typography props every intro/outro composition carries.
 *
 * The overrides exist because the pairing list is my shortlist, not a limit: a
 * client asking for their own family should be a props-panel edit, not a commit.
 * Anything typed there has to be installed locally or declared in fonts.ts —
 * a name the machine does not have silently falls back to the stack's tail.
 */
export const fontFields = {
  fontPairing: z.enum(IDS),
  displayFontOverride: z.string(),
  monoFontOverride: z.string(),
};

export type FontFields = {
  fontPairing: FontPairingId;
  displayFontOverride: string;
  monoFontOverride: string;
};

/** Resolve a pairing plus any override into the values a frame actually sets. */
export const resolveFonts = (p: Partial<FontFields>): FontPairing => {
  const base = FONT_PAIRINGS[p.fontPairing ?? "deck"] ?? FONT_PAIRINGS.deck;
  const display = p.displayFontOverride?.trim();
  const mono = p.monoFontOverride?.trim();

  return {
    ...base,
    display: display ? display : base.display,
    mono: mono ? mono : base.mono,
  };
};

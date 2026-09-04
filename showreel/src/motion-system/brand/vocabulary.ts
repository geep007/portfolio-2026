/**
 * MotionVocabulary — the patterns a brand is allowed to speak in.
 *
 * A BrandSystem says what the brand looks like and how it moves in general.
 * The vocabulary says which *specific behaviours* it uses, when, and with what
 * constraints. This is the layer an agent reads to choose a pattern for a beat
 * without opening any React file.
 *
 * Every entry points at a pattern id in `patterns/registry.ts`. The same
 * pattern can appear in two brands' vocabularies with different guidance.
 */

export type Energy = "low" | "medium" | "high";

export type PatternCategory =
  | "typography"
  | "media"
  | "layout"
  | "product"
  | "transition"
  | "graphic"
  | "logo";

/** The role a beat plays in a story. Compositions are sequences of these. */
export type Beat =
  | "hook"
  | "statement"
  | "section-intro"
  | "reveal"
  | "proof"
  | "detail"
  | "breathe"
  | "close";

export type ContentKind =
  | "short-headline"
  | "brand-statement"
  | "body-copy"
  | "single-image"
  | "single-video"
  | "image-set"
  | "website"
  | "ui-fragments"
  | "logo-set"
  | "logo"
  | "stat"
  | "none";

export type VocabularyEntry = {
  /** Pattern id in the registry. */
  pattern: string;
  /** Brand-specific name for it, if the brand calls it something. */
  alias?: string;
  category: PatternCategory;
  description: string;
  roles: Beat[];
  compatibleContent: ContentKind[];
  energy: Energy;
  /** Frames. `preferred` is what the planner uses when unconstrained. */
  duration: { min: number; preferred: number; max: number };
  constraints?: {
    maxWords?: number;
    maxLines?: number;
    maxItems?: number;
    minItems?: number;
  };
  goodFor: string[];
  avoidWhen: string[];
  /**
   * Fixed pattern options this brand always passes. The agent never sets these;
   * they are how the brand makes a generic pattern its own.
   */
  brandOptions?: Record<string, unknown>;
};

export type MotionVocabulary = {
  brandId: string;
  entries: VocabularyEntry[];
  /** Beat → ordered list of pattern ids to prefer. */
  preferences: Partial<Record<Beat, string[]>>;
};

export const findEntry = (v: MotionVocabulary, patternId: string) =>
  v.entries.find((e) => e.pattern === patternId);

export const entriesForBeat = (v: MotionVocabulary, beat: Beat) => {
  const pref = v.preferences[beat] ?? [];
  const byPref = pref
    .map((id) => findEntry(v, id))
    .filter((e): e is VocabularyEntry => Boolean(e));
  const rest = v.entries.filter(
    (e) => e.roles.includes(beat) && !pref.includes(e.pattern),
  );
  return [...byPref, ...rest];
};

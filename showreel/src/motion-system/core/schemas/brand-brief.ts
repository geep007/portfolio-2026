import type { Artifact, Extensible, RefId, Rule } from "./common";

/**
 * BrandBrief — "what does this identity permit?"
 *
 * The compressed replacement for a 30KB source-study. Written ONCE per brand
 * from the raw sources; every downstream stage reads this instead of the site.
 *
 * Budget: aim for under ~2,000 tokens serialised. If it does not fit, the
 * archaeology was reporting instead of deciding.
 *
 * The two fields that did the most work on Hookflo are `markLogic` and
 * `failureModes` — both are cheap to write and both killed expensive ideas
 * before any time was spent on them.
 */
export type BrandBriefBody = Extensible & {
  brand: string;
  /** 2–3 sentences. Character, ground, type, temperature. */
  identitySummary: string;
  /** What the product is actually true about. One sentence, no marketing. */
  productTruth: string;
  audience: string;

  /**
   * The mark read as a DIAGRAM, not as an asset — what its geometry claims
   * about the product. Null only if the mark genuinely encodes nothing.
   * On Hookflo this was the single highest-value line in the whole project.
   */
  markLogic: string | null;

  /** How this brand differs from the category default. 1–3 lines. */
  inversions?: string[];

  /** Rules derived from compositions, not from CSS. Target 6–10. */
  visualRules: Rule[];
  /** How the page is built: containment, grid, symmetry, bleed. Target 2–4. */
  compositionRules: Rule[];
  /** What the site's own motion implies about how a film may move. 4–8. */
  motionImplications: Rule[];

  /**
   * "How to ruin this brand" — the specific generic moves THIS brand invites.
   * Required output. Not a general list of motion sins.
   */
  failureModes: Rule[];

  /** Colour/type/spacing values worth carrying. Keep to what a film needs. */
  tokens?: Record<string, string | number>;
  /** Evidence for the brief as a whole. */
  signatureRefs: RefId[];
};

export type BrandBrief = Artifact<"brand-brief", BrandBriefBody>;

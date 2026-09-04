/**
 * Shared primitives for every pipeline artifact.
 *
 * Rules that hold across all of them:
 *  - every artifact is JSON-serialisable and small enough to paste into a prompt
 *  - every list a UI might want to edit is a list of objects WITH AN `id`,
 *    never a bare string array, so one element can be regenerated in place
 *  - raw sources are referenced by `RefId`, never re-described in prose
 */

/**
 * A stable pointer to one piece of source evidence. Downstream artifacts cite
 * these instead of restating what a screenshot looks like.
 *
 * Convention: `ref.<domain>.<subject>` — `ref.hero`, `ref.logo.mark`,
 * `ref.product.failure`, `ref.section.observability`.
 */
export type RefId = string;

/** Where an artifact came from, and whether it is still current. */
export type Provenance = {
  /** Bumped whenever the artifact's content changes. */
  version: number;
  /** Role that produced it — see core/roles.ts. */
  producedBy: string;
  /** ISO date. */
  producedAt: string;
  /**
   * Hash of the inputs this artifact was derived from. If the recomputed hash
   * matches, the stage is a cache hit and MUST NOT re-read its raw sources.
   */
  inputHash: string;
  /** Ids of the artifacts this was derived from, `<kind>@<version>`. */
  derivedFrom?: string[];
};

export type ArtifactKind =
  | "assets"
  | "brand-brief"
  | "creative-direction"
  | "storyboard"
  | "score"
  | "render-state";

export type Artifact<K extends ArtifactKind, T> = T & {
  kind: K;
  /** `<project>/<film>` for film-scoped artifacts, `<project>` for brand-scoped. */
  id: string;
  provenance: Provenance;
};

/** A rule with an id so a critique can cite it and a UI can edit one line. */
export type Rule = {
  id: string;
  /** Short imperative name, e.g. "CONTAIN", "ONE ACCENT PER VIEW". */
  name: string;
  /** One or two sentences. Not a paragraph. */
  rule: string;
  /** Evidence for the rule. Never re-describe the evidence in `rule`. */
  refs?: RefId[];
};

/** Optional extension hatch. Prefer this over widening a schema. */
export type Extensible = { ext?: Record<string, unknown> };

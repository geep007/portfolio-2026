import type { Artifact, Extensible, RefId } from "./common";

/**
 * AssetManifest — the only place raw source material is named.
 *
 * Produced by the `extractor` stage, once, from the URL / design file. Every
 * later stage refers to `RefId`s from here and never re-crawls the site.
 *
 * `caption` is the ONE prose description of each asset that exists anywhere in
 * the pipeline. Keep it under ~15 words: it is what a downstream stage reads
 * instead of looking at the image.
 */
export type AssetKind =
  | "screenshot"
  | "logo"
  | "font"
  | "image"
  | "video"
  | "product-ui"
  | "icon"
  | "keyframe"
  | "palette";

export type Asset = Extensible & {
  /** `ref.hero`, `ref.logo.mark`, … Stable for the life of the project. */
  ref: RefId;
  kind: AssetKind;
  /** Path relative to the repo root, or a URL for something not downloaded. */
  path: string;
  /** ≤15 words. The only prose description of this asset in the whole system. */
  caption: string;
  /** For screenshots: which part of the source it came from. */
  section?: string;
  /** For fonts: family + weights, so engine/fonts can load without a brand. */
  font?: { family: string; weight: number; style?: "normal" | "italic" };
  /** For design-derived films: the source coordinate space of this keyframe. */
  space?: { w: number; h: number };
};

export type AssetManifestBody = Extensible & {
  /** URL, Figma/Paper file, or "authored". */
  source: string;
  /** Ingestion mode this project runs in. */
  mode: "brand-derived" | "design-derived";
  assets: Asset[];
};

export type AssetManifest = Artifact<"assets", AssetManifestBody>;

export const findAsset = (m: AssetManifest, ref: RefId) =>
  m.assets.find((a) => a.ref === ref);

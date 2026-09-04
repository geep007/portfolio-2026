import { BRAND_BRIEF_SCHEMA } from "../../core/schemas/json-schema";
import type { AssetManifest } from "../../core/schemas";
import type { StageModule } from "./index";

/**
 * ARCHAEOLOGY — the last stage permitted to open the website.
 *
 * Everything downstream reads the BrandBrief instead. That is the single
 * largest saving in the pipeline and the single easiest thing to lose: if a
 * later stage finds itself wanting the site, the fix is a missing field here,
 * not a widened contract there.
 */
export const archaeologyStage: StageModule = {
  id: "archaeology",
  skill: "brand-archaeology.md",
  /** The brief depends on the source and on which assets were found. */
  cacheExtra: (p) => ({ source: p.source, assetsDir: p.assetsDir ?? null }),
  schema: BRAND_BRIEF_SCHEMA as unknown as Record<string, unknown>,

  prompt: (ctx) => {
    const assets = ctx.inputs.assets as AssetManifest;
    ctx.noteFetch(ctx.params.source);
    return [
      `Write the BrandBrief for ${assets.source}.`,
      "",
      "You may open the source and the assets below. You are the last stage that",
      "can: every later stage reads your brief instead of the site, so a fact you",
      "leave out is a fact the film will not have.",
      "",
      "LOOK at every screenshot below before writing a rule. Rules come from",
      "compositions, not from markup or from captions.",
      "",
      "Assets (cite these ref ids as evidence; never re-describe them in prose):",
      ...assets.assets.map((a) => `  ${a.ref}  [${a.kind}]  ${a.caption}\n    ${a.path}`),
      "",
      "Work in the order the skill gives: mark-as-diagram first, then the",
      "inversion, then the tension between what the site says and what it shows,",
      "then rules from compositions, then motion, then failureModes.",
      "",
      "`markLogic` carries the most weight of any field. Read the mark as a",
      "drawing that may already encode the product. If it genuinely encodes",
      "nothing, return null and do not force a reading.",
      "",
      "`failureModes` is required and is not a general list of motion sins: it is",
      "how a generic film would ruin THIS brand specifically, given what it is.",
    ].join("\n");
  },
};

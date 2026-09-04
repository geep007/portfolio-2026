import { ASSET_MANIFEST_SCHEMA } from "../../core/schemas/json-schema";
import type { StageModule } from "./index";

/**
 * EXTRACT — the raw source becomes a list of refs with one caption each.
 *
 * The only outputs that matter are stable `ref` ids and captions short enough
 * that a later stage reads the caption instead of the image. Everything after
 * this stage refers to `ref.hero`, never to "the screenshot with the terminal
 * in it".
 */
export const extractStage: StageModule = {
  id: "extract",
  skill: "brand-archaeology.md",
  /** Re-extract only when the source itself changes. */
  cacheExtra: (p) => ({ source: p.source, mode: p.mode, assetsDir: p.assetsDir ?? null }),
  schema: ASSET_MANIFEST_SCHEMA as unknown as Record<string, unknown>,

  prompt: (ctx) => {
    ctx.noteFetch(ctx.params.source);
    return [
      `Build an AssetManifest for: ${ctx.params.source}`,
      ctx.params.assetsDir
        ? `\nCaptured screenshots are already on disk in \`${ctx.params.assetsDir}\`. List them` +
          ` and LOOK at each one — a caption written from pixels is worth more than` +
          ` one written from markup. Use those local paths for screenshot assets;` +
          ` fetch the page only for what the images cannot tell you (fonts, the` +
          ` mark, copy).`
        : "",
      "",
      "Fetch the source and inventory what a motion film could actually use:",
      "the mark, the typefaces, the product UI, and the handful of sections",
      "that carry the brand's compositional argument. 8-16 assets, not an audit.",
      "",
      "Rules:",
      "- `ref` ids are stable and namespaced: ref.hero, ref.logo.mark,",
      "  ref.product.<thing>, ref.section.<name>, ref.font.<role>.",
      "- `caption` is at most 15 words and is the ONLY prose description of that",
      "  asset anywhere in the system. Later stages read it instead of looking.",
      "  Describe what is IN it, not that it exists.",
      "- `path` is the URL the asset lives at, or a local path if one was given.",
      `- \`mode\` is "${ctx.params.mode}".`,
    ].join("\n");
  },
};

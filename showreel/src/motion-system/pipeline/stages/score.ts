import { SCORE_SCHEMA } from "../../core/schemas/json-schema";
import type { CreativeDirection, Storyboard } from "../../core/schemas";
import type { StageModule } from "./index";

/**
 * SCORE — the storyboard becomes frames and coordinates.
 *
 * The narrowest stage in the pipeline and the only one that is mostly
 * arithmetic. It does not get the brand brief or the assets: by this point
 * every brand decision has been made, and what remains is where things are and
 * when they happen.
 */
export const scoreStage: StageModule = {
  id: "score",
  skill: "score.md",
  cacheExtra: (p) => ({ durationTarget: p.durationTarget }),
  schema: SCORE_SCHEMA as unknown as Record<string, unknown>,

  prompt: (ctx) => {
    const sb = ctx.inputs.storyboard as Storyboard;
    const dir = ctx.inputs["creative-direction"] as CreativeDirection;

    return [
      `Score "${dir.title}" — ${sb.durationTarget}s at 30fps in a 1920x1080 space.`,
      "",
      `Transition logic: ${dir.transitionLogic}`,
      `Spatial logic: ${dir.spatialLogic}`,
      "",
      "## States, with the weights the storyboard assigned",
      ...sb.states.map(
        (s) => `\n### ${s.id}  (weight ${s.weight ?? "—"})\n${s.visual}\n  copy: ${(s.copy ?? []).join(" · ")}`,
      ),
      "",
      "## Continuity the implementation must preserve",
      ...dir.continuityRules.map((c) => `  - ${c}`),
      "",
      "## Task",
      "States contiguous, starting at 0, ending exactly at `duration`. Weight",
      "them by the storyboard's weights, then adjust for the holds the direction",
      "asks for — a beat must never be shorter than the time needed to read its",
      "number.",
      "",
      "`cues`: every animated moment, flat and addressable. Suffix a duration",
      "with `Len`, a per-item interval with `Step`, an offset with `Delay`; every",
      "other cue is a frame position inside the film. Name them for what happens",
      "(`dotLands`, `tintWash`, `pullBack`), never `anim1`.",
      "",
      "`geometry`: every coordinate, nested by object, in space units. Include",
      "the rule pitch and the rule indices the dot occupies in each state, the",
      "panel rects, and the type positions. The composition must contain no",
      "number that is not here.",
      "",
      "`content`: the copy and data tables verbatim from the storyboard — score",
      "rows and their values, the SQL line, the monitoring figures, the labels.",
      "",
      "No prose anywhere in the output.",
    ].join("\n");
  },
};

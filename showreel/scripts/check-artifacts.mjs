#!/usr/bin/env node
/**
 * Artifact coherence check.
 *
 * Cheap, mechanical, and run before any model is asked to look at anything.
 * Every failure here is one an agent would otherwise spend a critique pass
 * discovering — which is the expensive way to learn that a state id is spelt
 * two different ways.
 *
 * Usage: node scripts/check-artifacts.mjs [project/film ...]
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const read = (p) => JSON.parse(readFileSync(p, "utf8"));

const problems = [];
const fail = (slot, msg) => problems.push(`${slot}: ${msg}`);

const films = process.argv.slice(2).length
  ? process.argv.slice(2)
  : discover(join(ROOT, "projects"));

function discover(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const project of readdirSync(dir)) {
    const pdir = join(dir, project);
    if (!statSync(pdir).isDirectory()) continue;
    for (const film of readdirSync(pdir)) {
      const fdir = join(pdir, film);
      if (!statSync(fdir).isDirectory()) continue;
      /** A film directory is one holding artifacts. `source/` holds captures. */
      if (!existsSync(join(fdir, "creative-direction.json"))) continue;
      out.push(`${project}/${film}`);
    }
  }
  return out;
}

for (const slot of films) {
  const [project, film] = slot.split("/");
  const filmDir = join(ROOT, "projects", project, film);
  const projDir = join(ROOT, "projects", project);

  const load = (name) => {
    for (const d of [filmDir, projDir]) {
      const p = join(d, name);
      if (existsSync(p)) return read(p);
    }
    return null;
  };

  const assets = load("assets.json");
  const brief = load("brand-brief.json");
  const direction = load("creative-direction.json");
  const storyboard = load("storyboard.json");
  const score = load("score.json");
  const renderState = load("render-state.json");

  /**
   * A project may legitimately stop before the score — the pipeline's cheap
   * inner loop runs to `storyboard`. Missing later artifacts are reported as
   * an incomplete project, not as a broken one; missing earlier ones are a
   * real failure.
   */
  for (const [name, a] of Object.entries({ assets, direction, storyboard })) {
    if (!a) fail(slot, `missing ${name}.json`);
  }
  if (!assets || !direction || !storyboard) continue;

  const stage = score ? (renderState ? "rendered" : "scored") : "storyboarded";

  /* --- state ids must be the same word everywhere ------------------ */
  const sbIds = storyboard.states.map((s) => s.id);
  const scIds = score ? score.states.map((s) => s.id) : sbIds;
  const dirIds = direction.pacingArc.map((s) => s.state);

  if (score && sbIds.join() !== scIds.join()) {
    fail(slot, `storyboard states [${sbIds}] != score states [${scIds}]`);
  }
  if (dirIds.join() !== sbIds.join()) {
    fail(slot, `direction pacingArc [${dirIds}] != storyboard states [${sbIds}]`);
  }
  for (const d of direction.densityArc) {
    if (!sbIds.includes(d.state)) fail(slot, `densityArc names unknown state "${d.state}"`);
    if (d.density < 0 || d.density > 1) fail(slot, `density out of range for "${d.state}"`);
  }

  if (!score) {
    console.log(`checked ${slot}: ${sbIds.length} states, ${assets.assets.length} assets (${stage}; no score yet)`);
    continue;
  }

  /* --- the score must actually cover the film ---------------------- */
  if (score.states[0].from !== 0) fail(slot, "score does not start at frame 0");
  if (score.states.at(-1).to !== score.duration) {
    fail(slot, `score ends at ${score.states.at(-1).to}, duration is ${score.duration}`);
  }
  score.states.forEach((s, i) => {
    if (s.to <= s.from) fail(slot, `state "${s.id}" has no length`);
    const prev = score.states[i - 1];
    if (prev && prev.to !== s.from) fail(slot, `gap or overlap between "${prev.id}" and "${s.id}"`);
  });

  /* --- every cue lands inside the film ----------------------------- */
  for (const [k, v] of Object.entries(score.cues)) {
    const list = Array.isArray(v) ? v : [v];
    for (const n of list) {
      if (typeof n !== "number") fail(slot, `cue "${k}" is not a number`);
      /** Lengths are durations, not positions, so only positions are bounded. */
      else if (!/Len$|Step$|Delay$/.test(k) && (n < 0 || n > score.duration)) {
        fail(slot, `cue "${k}" = ${n} is outside 0..${score.duration}`);
      }
    }
  }

  /* --- storyboard duration and score duration must agree ----------- */
  const seconds = score.duration / score.fps;
  if (Math.abs(seconds - storyboard.durationTarget) > 0.5) {
    fail(slot, `score is ${seconds}s, storyboard targets ${storyboard.durationTarget}s`);
  }

  /* --- references must resolve ------------------------------------- */
  const refs = new Set(assets.assets.map((a) => a.ref));
  const citedIn = (obj, where) => {
    for (const r of obj?.refs ?? []) if (!refs.has(r)) fail(slot, `${where} cites unknown ${r}`);
  };
  storyboard.states.forEach((s) => citedIn(s, `storyboard.${s.id}`));
  for (const r of brief?.signatureRefs ?? []) {
    if (!refs.has(r)) fail(slot, `brand-brief.signatureRefs cites unknown ${r}`);
  }
  for (const rule of [...(brief?.visualRules ?? []), ...(brief?.compositionRules ?? []), ...(brief?.motionImplications ?? [])]) {
    citedIn(rule, `brand-brief.${rule.id}`);
  }

  /* --- asset files must exist -------------------------------------- */
  for (const a of assets.assets) {
    if (a.path.startsWith("http")) continue;
    if (!existsSync(join(ROOT, "..", a.path)) && !existsSync(join(ROOT, a.path))) {
      fail(slot, `asset ${a.ref} missing at ${a.path}`);
    }
  }

  /* --- the direction must carry hard constraints ------------------- */
  if (!direction.forbiddenBehaviours?.length) {
    fail(slot, "direction has no forbiddenBehaviours — the critic has nothing to check");
  }
  if (brief && !brief.failureModes?.length) {
    fail(slot, "brand-brief has no failureModes — required archaeology output");
  }

  /* --- findings must cite something checkable ---------------------- */
  for (const f of renderState?.critique?.findings ?? []) {
    if (f.stateId && !sbIds.includes(f.stateId)) {
      fail(slot, `finding ${f.id} names unknown state "${f.stateId}"`);
    }
  }

  console.log(`checked ${slot}: ${sbIds.length} states, ${Object.keys(score.cues).length} cues, ${assets.assets.length} assets (${stage})`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("\nartifacts coherent.");

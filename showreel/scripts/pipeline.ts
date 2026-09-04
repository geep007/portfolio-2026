#!/usr/bin/env node
/**
 * Run the pipeline.
 *
 *   node scripts/pipeline.ts --project hookflo --film missing-dot \
 *     --source https://hookflo.com --until storyboard [--force direction] [--dry] [--seed]
 *
 * `--seed` backfills cache keys on artifacts whose content is trusted but was
 * written by hand (the Hookflo migration wrote `inputHash: "migrated"`). It
 * computes the key with the same function the runtime uses and touches nothing
 * else, so a subsequent cache hit is real rather than asserted.
 */
import { setRoleRunner } from "../src/motion-system/core/roles";
import { createClaudeCliRunner, measureAdapterBaseline } from "../src/motion-system/core/node/role-runner";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { readArtifact, seedCacheKey } from "../src/motion-system/core/node/store";
import { runPipeline } from "../src/motion-system/pipeline/run";
import { REGISTRY } from "../src/motion-system/pipeline/run";
import { STAGES, type StageId } from "../src/motion-system/core/stages";
import type { PipelineParams } from "../src/motion-system/pipeline/stages/index";

const argv = process.argv.slice(2);
const flag = (name: string, fallback?: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const has = (name: string) => argv.includes(`--${name}`);

const params: PipelineParams = {
  project: flag("project") ?? "hookflo",
  film: flag("film") ?? "missing-dot",
  source: flag("source") ?? "https://hookflo.com",
  mode: (flag("mode", "brand-derived") as PipelineParams["mode"]),
  durationTarget: Number(flag("duration", "20")),
  assetsDir: flag("assets-dir"),
  brief: flag("brief"),
};

/**
 * Seeding. For artifacts whose content is trusted but whose `inputHash` was
 * written by hand. Seeding every stage of the migrated film is also what
 * protects it: with real keys in place, re-running the pipeline for
 * `missing-dot` is a full cache hit and cannot regenerate the shipped film.
 */
if (has("seed")) {
  const slot = { project: params.project, film: params.film };
  for (const stage of Object.keys(REGISTRY) as StageId[]) {
    const mod = REGISTRY[stage];
    const contract = STAGES[stage];
    if (!mod) continue;
    const inputs = Object.fromEntries(
      contract.reads.map((k) => [k, readArtifact(slot, k)]),
    );
    const kind = contract.produces as "assets" | "brand-brief" | "creative-direction" | "storyboard";
    const key = seedCacheKey(slot, kind, inputs, mod.cacheExtra(params));
    console.log(`seeded ${stage} → ${kind}: ${key ?? "(no artifact)"}`);
  }
  process.exit(0);
}

const runner = createClaudeCliRunner({ verbose: true });
setRoleRunner(runner);

/**
 * Adapter baselines. Measured once per (role, skill) and cached: the fixed
 * system-prompt-and-tools cost of making any call at all, so the report can
 * say what the PIPELINE spent rather than what the harness costs to exist.
 * Both numbers are real; conflating them would flatter the architecture.
 */
const BASELINE_FILE = "runs/_adapter-baseline.json";
const baselines: Record<string, number> = existsSync(BASELINE_FILE)
  ? JSON.parse(readFileSync(BASELINE_FILE, "utf8"))
  : {};

if (has("baseline")) {
  for (const [stage, mod] of Object.entries(REGISTRY)) {
    const role = STAGES[stage as StageId].role;
    if (baselines[role] !== undefined && !has("force-baseline")) continue;
    baselines[role] = await measureAdapterBaseline(runner, role, mod!.skill);
    console.log(`baseline ${role} (${mod!.skill}): ${baselines[role].toLocaleString()} tokens`);
  }
  mkdirSync("runs", { recursive: true });
  writeFileSync(BASELINE_FILE, `${JSON.stringify(baselines, null, 2)}\n`);
  if (!has("run")) process.exit(0);
}

const runId =
  flag("run") ?? `${params.project}-${params.film}-${new Date().toISOString().slice(0, 16).replace(/[:T-]/g, "")}`;

console.log(`\n${params.project}/${params.film} · ${params.mode} · ${params.durationTarget}s`);
console.log(`source: ${params.source}`);
if (params.brief) console.log(`steer:  ${params.brief}`);
console.log(`run:    ${runId}\n`);

const { path, summary } = await runPipeline({
  params,
  runId,
  until: (flag("until") as StageId) ?? "storyboard",
  force: flag("force") ? [flag("force") as StageId] : undefined,
  dryRun: has("dry"),
  verbose: true,
  baselines,
});

console.log(`\nmetrics → ${path}`);
console.log(
  `pipeline tokens ${summary.totalPipelineTokens.toLocaleString()} · ` +
    `calls ${summary.totalCalls} · cache hits ${summary.cacheHits} · ` +
    (summary.costUsd !== null ? `cost $${summary.costUsd.toFixed(4)}` : "cost unavailable"),
);
if (summary.illegalRawSourceReads.length) {
  console.error(`\nRAW SOURCE REREAD past archaeology: ${summary.illegalRawSourceReads.join(", ")}`);
  process.exit(1);
}
console.log(`\nnext: node scripts/run-report.mjs ${runId}\n`);

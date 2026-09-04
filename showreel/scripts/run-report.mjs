#!/usr/bin/env node
/**
 * Token report for one run. `node scripts/run-report.mjs [run-id]`
 * With no argument, reports the most recent run.
 *
 * Three columns need explaining, because on a caching adapter the obvious one
 * is a lie:
 *
 *   PROMPT   total input volume actually sent — uncached input plus cache
 *            reads plus cache writes. The provider reports `input_tokens` as
 *            only the uncached remainder, which is near zero on a request that
 *            caches whole, so `input_tokens` alone tells you nothing.
 *   BASE     the adapter's measured fixed cost for that role: system prompt
 *            plus tool definitions, with no stage content. Measured by
 *            `--baseline`, not estimated.
 *   STAGE    PROMPT − BASE. What the pipeline actually spent on this stage.
 *
 * The two lines that decide whether the architecture works are RAW SOURCE
 * REREADS and CACHE HITS. Totals only say what a run cost.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const runs = join(root, "runs");
if (!existsSync(runs)) { console.error("no runs/ directory yet"); process.exit(1); }

const ids = readdirSync(runs).filter(
  (d) => statSync(join(runs, d)).isDirectory() && existsSync(join(runs, d, "metrics.json")),
);
const id = process.argv[2] ?? ids
  .map((d) => ({ d, t: statSync(join(runs, d, "metrics.json")).mtimeMs }))
  .sort((a, b) => b.t - a.t)[0]?.d;

if (!id) { console.error("no runs recorded"); process.exit(1); }

const run = JSON.parse(readFileSync(join(runs, id, "metrics.json"), "utf8"));

/** Baselines are a measured per-role constant, applied at report time. */
const baselineFile = join(runs, "_adapter-baseline.json");
const baselines = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, "utf8")) : {};

const n = (v) => (v ?? 0).toLocaleString();
const num = (v) => v ?? 0;
const base = (m) => (m.calls > 0 ? (m.adapterBaselineTokens ?? baselines[m.role] ?? null) : null);
/**
 * Derived when the run predates the field, from the raw provider numbers the
 * run did store. Derivation from recorded measurements, not estimation.
 */
const prompt = (m) =>
  m.promptTokens ?? num(m.inputTokens) + num(m.cachedInputTokens) + num(m.cacheCreationTokens);
const stageTokens = (m) => Math.max(0, prompt(m) - num(base(m)));

console.log(`\nRUN ${run.runId}   ${run.project}/${run.film}   (${run.mode})`);
console.log(`${run.startedAt} → ${run.finishedAt ?? "…"}`);

console.log(
  `\n${"STAGE".padEnd(13)}${"ROLE".padEnd(17)}${"MODEL".padEnd(16)}` +
  `${"PROMPT".padStart(9)}${"BASE".padStart(9)}${"STAGE".padStart(9)}${"P-CHARS".padStart(9)}${"OUT".padStart(8)}` +
  `${"CACHE-R".padStart(9)}${"RETRY".padStart(7)}${"SEC".padStart(7)}${"COST".padStart(9)}  STATUS`,
);
console.log("-".repeat(130));

for (const m of run.stages) {
  const status = m.cacheHit
    ? `CACHE HIT  ${m.artifact ?? ""}`
    : m.calls > 0
      ? `ran        ${m.artifact ?? ""}`
      : `skipped    ${m.note ? m.note.slice(0, 46) : ""}`;
  console.log(
    m.stage.padEnd(13) +
    m.role.padEnd(17) +
    String(m.model ?? "—").padEnd(16) +
    (m.calls ? n(prompt(m)) : "—").padStart(9) +
    (base(m) === null ? "—" : n(base(m))).padStart(9) +
    (m.calls ? n(stageTokens(m)) : "—").padStart(9) +
    (m.calls && m.promptChars ? n(m.promptChars) : "—").padStart(9) +
    n(m.outputTokens).padStart(8) +
    n(m.cachedInputTokens).padStart(9) +
    String(m.retries).padStart(7) +
    (m.latencyMs / 1000).toFixed(1).padStart(7) +
    (m.costUsd === null ? "—" : `$${m.costUsd.toFixed(4)}`).padStart(9) +
    "  " + status,
  );
}

const ran = run.stages.filter((m) => m.calls > 0);
const sum = (f) => run.stages.reduce((a, m) => a + f(m), 0);
const totalStage = sum((m) => (m.calls ? stageTokens(m) : 0));
const totalOut = sum((m) => num(m.outputTokens));
const anyCostMissing = ran.some((m) => m.costUsd === null);

const byStage = ran
  .map((m) => ({ stage: m.stage, in: stageTokens(m), out: num(m.outputTokens) }))
  .sort((a, b) => b.in + b.out - (a.in + a.out));

console.log(`\nPIPELINE TOKENS      ${n(totalStage + totalOut)}   (stage input ${n(totalStage)} · output ${n(totalOut)})`);
console.log(`ADAPTER BASELINE     ${n(sum((m) => (m.calls ? num(base(m)) : 0)))}   fixed cost of making the calls at all`);
console.log(`BILLED VOLUME        ${n(sum((m) => prompt(m) + num(m.outputTokens)))}   everything the provider counted`);
const iters = ran.filter((m) => (m.iterations ?? 1) > 1);
if (iters.length) {
  console.log(
    `\nNOTE  ${iters.map((m) => `${m.stage}: ${m.iterations} provider iterations`).join("; ")}.` +
    `\n      Token figures aggregate across iterations, so PROMPT over-counts the logical prompt.` +
    `\n      P-CHARS is the exact size of what the pipeline built; compare stages with that.`,
  );
}
console.log(`CACHE READS          ${n(sum((m) => num(m.cachedInputTokens)))}   prompt tokens served from cache`);
console.log(`MODEL CALLS          ${sum((m) => m.calls)}`);
console.log(`CACHE HITS / MISSES  ${run.stages.filter((m) => m.cacheHit).length} / ${ran.length}`);
console.log(`RETRIES              ${sum((m) => m.retries)}`);
console.log(`LATENCY              ${(sum((m) => m.latencyMs) / 1000).toFixed(1)}s`);
console.log(
  `COST                 ${anyCostMissing ? "unavailable (a stage reported none)" : `$${sum((m) => num(m.costUsd)).toFixed(4)}`}`,
);

if (byStage.length) {
  console.log(`\nLARGEST BY INPUT     ${byStage.slice().sort((a, b) => b.in - a.in)[0].stage}`);
  console.log(`LARGEST BY OUTPUT    ${byStage.slice().sort((a, b) => b.out - a.out)[0].stage}`);
  console.log("\nBY STAGE (stage input + output)");
  const max = Math.max(...byStage.map((b) => b.in + b.out));
  for (const b of byStage) {
    const t = b.in + b.out;
    console.log(`  ${b.stage.padEnd(13)}${String(t).padStart(8)}  ${"█".repeat(Math.round((t / max) * 34))}`);
  }
}

const cacheSaved = run.stages.filter((m) => m.cacheHit);
if (cacheSaved.length) {
  console.log(`\nCACHE HITS AVOIDED   ${cacheSaved.map((m) => m.stage).join(", ")}`);
  console.log(`                     these stages made no model call and re-read no source`);
}

const rawReads = run.stages.filter((m) => m.rawSourceReread);
const illegal = rawReads.filter((m) => !["extract", "archaeology"].includes(m.stage));
console.log(`\nRAW SOURCE REREADS   ${rawReads.map((m) => m.stage).join(", ") || "none"}`);
for (const m of ran) {
  if (m.sourceUrls?.length) console.log(`  ${m.stage}: fetched ${m.sourceUrls.join(", ")}`);
}
if (illegal.length) {
  console.log(`  ^^ ${illegal.map((m) => m.stage).join(", ")} opened raw sources.`);
  console.log("     That is the bug this architecture exists to prevent.");
}

const unmeasured = ran.filter((m) => prompt(m) === 0);
if (unmeasured.length) {
  console.log(`\nUNMEASURED           ${unmeasured.map((m) => m.stage).join(", ")} — provider exposed no usage`);
}
console.log();

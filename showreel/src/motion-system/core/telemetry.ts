/**
 * Run telemetry.
 *
 * The only way to know whether the token strategy works is to measure it. The
 * numbers that matter most are not the totals — they are `rawSourceReread` and
 * `cacheHit`, because those are the failures the architecture exists to
 * prevent.
 *
 * A field the provider does not report is `null`. Never estimated: a total
 * that mixes measured and guessed numbers is worse than one with a hole in it.
 */
import type { StageId } from "./stages";
import type { RoleId } from "./roles";

export type StageMetric = {
  stage: StageId;
  role: RoleId;
  /** As the provider named it, not as it was requested. */
  model: string | null;

  /**
   * Total input volume sent: uncached input + cache reads + cache writes. The
   * adapter caches whole requests, so `inputTokens` alone is near zero and
   * this is the number that means anything.
   */
  promptTokens: number | null;
  /**
   * Exact character length of the prompt the pipeline built. The honest way to
   * compare stage sizes: token figures aggregate across the adapter's internal
   * iterations and over-count the logical prompt.
   */
  promptChars: number | null;
  /** Provider round-trips inside one logical call. >1 inflates token figures. */
  iterations: number | null;
  /** Uncached input only. */
  inputTokens: number | null;
  outputTokens: number | null;
  /** Read from the prompt cache — charged at a fraction of input. */
  cachedInputTokens: number | null;
  /** Written to the prompt cache — charged at a premium. */
  cacheCreationTokens: number | null;
  /**
   * Measured fixed cost of the adapter for this role: system prompt + tool
   * definitions, with no stage content. Reported apart from stage input so the
   * run report can say what the PIPELINE spent rather than what the harness
   * costs to exist. Null when it has not been measured.
   */
  adapterBaselineTokens: number | null;
  costUsd: number | null;

  latencyMs: number;
  retries: number;
  calls: number;
  finishReason: string | null;
  providerRequestId: string | null;

  /** Artifact written, `<kind>@<version>`, or null for a skipped stage. */
  artifact: string | null;
  /** Artifacts handed to the stage, `<kind>@<version>`. */
  artifactInputs: string[];
  /** Files the stage actually opened. Long lists here are the smell to chase. */
  filesRead: string[];
  /** Skill files loaded as system prompt. */
  skillFiles: string[];
  /** URLs fetched. Must be empty for every stage after archaeology. */
  sourceUrls: string[];

  cacheHit: boolean;
  /** The cache key inputs, so a miss can be explained rather than guessed at. */
  cacheKey: string | null;
  /**
   * True if the stage opened raw source material. Must be true only for
   * `extract` and `archaeology`, forever.
   */
  rawSourceReread: boolean;
  /** Set when a stage was executed outside the runner (see RUN-REPORT.md). */
  note?: string;
};

export type RunMetrics = {
  runId: string;
  project: string;
  film: string;
  mode: "brand-derived" | "design-derived";
  startedAt: string;
  finishedAt?: string;
  stages: StageMetric[];
};

export type RunSummary = {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCachedInputTokens: number;
  totalCacheCreationTokens: number;
  /** Measured adapter baseline across the stages that ran. */
  totalAdapterBaselineTokens: number;
  /**
   * What the pipeline itself spent: prompt volume minus the measured adapter
   * baseline, plus output. This is the number the token strategy is judged on.
   */
  totalPipelineTokens: number;
  /** Everything the provider billed against, including overhead. */
  totalBilledTokens: number;
  totalCalls: number;
  cacheHits: number;
  cacheMisses: number;
  retries: number;
  latencyMs: number;
  /** Stage → input + output tokens. */
  byStage: Record<string, number>;
  largestByInput: { stage: string; tokens: number } | null;
  largestByOutput: { stage: string; tokens: number } | null;
  rawSourceReads: StageId[];
  /** Stages past archaeology that touched raw source. Must be empty. */
  illegalRawSourceReads: StageId[];
  /** Real provider cost, summed. Null if any executed stage reported none. */
  costUsd: number | null;
  /** Stages whose usage the provider did not expose. */
  unmeasured: StageId[];
};

export const newRun = (o: Omit<RunMetrics, "stages" | "startedAt">): RunMetrics => ({
  ...o,
  startedAt: new Date().toISOString(),
  stages: [],
});

export const record = (
  run: RunMetrics,
  m: Partial<StageMetric> & Pick<StageMetric, "stage" | "role">,
) => {
  run.stages.push({
    model: null,
    promptTokens: null,
    promptChars: null,
    iterations: null,
    inputTokens: null,
    outputTokens: null,
    cachedInputTokens: null,
    cacheCreationTokens: null,
    adapterBaselineTokens: null,
    costUsd: null,
    latencyMs: 0,
    retries: 0,
    calls: 0,
    finishReason: null,
    providerRequestId: null,
    artifact: null,
    artifactInputs: [],
    filesRead: [],
    skillFiles: [],
    sourceUrls: [],
    cacheHit: false,
    cacheKey: null,
    rawSourceReread: false,
    ...m,
  });
  return run;
};

const n = (v: number | null) => v ?? 0;

export const summarise = (run: RunMetrics): RunSummary => {
  const s = run.stages;
  const ran = s.filter((m) => m.calls > 0);
  const sum = (f: (m: StageMetric) => number) => s.reduce((a, m) => a + f(m), 0);

  const byStage: Record<string, number> = {};
  /** Stage cost = what the stage put in, over the adapter's fixed floor. */
  const stagePrompt = (m: StageMetric) =>
    Math.max(0, n(m.promptTokens) - n(m.adapterBaselineTokens));
  for (const m of s) byStage[m.stage] = stagePrompt(m) + n(m.outputTokens);

  const top = (f: (m: StageMetric) => number) => {
    const best = ran.slice().sort((a, b) => f(b) - f(a))[0];
    return best ? { stage: best.stage, tokens: f(best) } : null;
  };

  const anyUnmeasured = ran.some((m) => m.costUsd === null);

  return {
    totalInputTokens: sum((m) => n(m.inputTokens)),
    totalOutputTokens: sum((m) => n(m.outputTokens)),
    totalCachedInputTokens: sum((m) => n(m.cachedInputTokens)),
    totalCacheCreationTokens: sum((m) => n(m.cacheCreationTokens)),
    totalAdapterBaselineTokens: sum((m) => n(m.adapterBaselineTokens)),
    totalPipelineTokens: sum((m) => stagePrompt(m) + n(m.outputTokens)),
    totalBilledTokens: sum((m) => n(m.promptTokens) + n(m.outputTokens)),
    totalCalls: sum((m) => m.calls),
    cacheHits: s.filter((m) => m.cacheHit).length,
    cacheMisses: ran.length,
    retries: sum((m) => m.retries),
    latencyMs: sum((m) => m.latencyMs),
    byStage,
    largestByInput: top(stagePrompt),
    largestByOutput: top((m) => n(m.outputTokens)),
    rawSourceReads: s.filter((m) => m.rawSourceReread).map((m) => m.stage),
    illegalRawSourceReads: s
      .filter((m) => m.rawSourceReread && !["extract", "archaeology"].includes(m.stage))
      .map((m) => m.stage),
    costUsd: anyUnmeasured ? null : sum((m) => n(m.costUsd)),
    unmeasured: ran.filter((m) => m.promptTokens === null).map((m) => m.stage),
  };
};

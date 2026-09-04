/**
 * The orchestrator.
 *
 * Deliberately small. Everything that makes this pipeline cheap is a rule, not
 * a framework: read the contract, check the cache, hand the stage exactly its
 * declared inputs, record what actually happened. There is no DAG engine and
 * no retry policy beyond the runner's one repair call, because neither was
 * what made the first films expensive.
 *
 * The one line that does the most work is the assembly of `inputs`: a stage
 * cannot re-read what it is never given.
 *
 * Node-side only. Never imported by a composition.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ArtifactKind } from "../core/schemas";
import { STAGES, assertReadable, stagesFor, type SourceClass, type StageId } from "../core/stages";
import { runRole } from "../core/roles";
import { newRun, record, type RunMetrics } from "../core/telemetry";
import {
  isFresh,
  nextVersion,
  pathOf,
  readArtifact,
  writeArtifact,
  writeRun,
  type Slot,
} from "../core/node/store";
import type { PipelineParams, StageModule } from "./stages";
import {
  archaeologyStage, critiqueStage, directionStage, extractStage, scoreStage, storyboardStage,
} from "./stages";

export const REGISTRY: Partial<Record<StageId, StageModule>> = {
  extract: extractStage,
  archaeology: archaeologyStage,
  direction: directionStage,
  storyboard: storyboardStage,
  score: scoreStage,
  critique: critiqueStage,
};

export type PipelineOptions = {
  params: PipelineParams;
  runId?: string;
  /**
   * Force these stages to re-run even if their cache is fresh. This is how a
   * UI asks for "regenerate the storyboard" without touching archaeology.
   */
  force?: StageId[];
  /** Stop after this stage. The cheap inner loop while a concept is argued. */
  until?: StageId;
  /** Report what would run, and why, without calling a model. */
  dryRun?: boolean;
  verbose?: boolean;
  /**
   * Measured adapter overhead per role, so the report can separate what the
   * pipeline spent from what the harness costs. See `measureAdapterBaseline`.
   */
  baselines?: Partial<Record<string, number>>;
};

const ARTIFACT_KINDS: ArtifactKind[] = [
  "assets", "brand-brief", "creative-direction", "storyboard", "score", "render-state",
];
const isArtifactKind = (v: string): v is ArtifactKind =>
  (ARTIFACT_KINDS as string[]).includes(v);

const versionOf = (a: unknown) =>
  (a as { provenance?: { version?: number } } | null)?.provenance?.version ?? 0;

export const runPipeline = async (o: PipelineOptions) => {
  const { params, baselines } = o;
  const slot: Slot = { project: params.project, film: params.film };

  const run: RunMetrics = newRun({
    runId: o.runId ?? `${params.project}-${params.film}-${Date.now().toString(36)}`,
    project: params.project,
    film: params.film,
    mode: params.mode,
  });

  const order = stagesFor(params.mode);
  const stop = o.until ? order.indexOf(o.until) : order.length - 1;

  for (const stage of order.slice(0, stop + 1)) {
    const contract = STAGES[stage];
    const mod = REGISTRY[stage];
    const produces = contract.produces;
    const artifactKind = isArtifactKind(produces) ? produces : null;

    /**
     * Assemble exactly the artifacts the contract allows, and nothing else.
     * Brand-scoped artifacts resolve from the project directory; film-scoped
     * ones from the film directory. A missing input is `null`, which the cache
     * key treats as meaningful.
     */
    const inputs: Partial<Record<ArtifactKind, unknown>> = {};
    const artifactInputs: string[] = [];
    for (const kind of contract.reads) {
      const a = readArtifact(slot, kind);
      inputs[kind] = a;
      artifactInputs.push(`${kind}@${versionOf(a)}`);
    }

    if (!mod || !artifactKind) {
      record(run, {
        stage,
        role: contract.role,
        artifactInputs,
        note: "no stage module registered — executed outside the runner or not yet implemented",
      });
      continue;
    }

    const extra = mod.cacheExtra(params);
    const forced = o.force?.includes(stage) ?? false;
    const { fresh, inputHash, existing } = isFresh(slot, artifactKind, inputs, extra);

    if (fresh && !forced) {
      if (o.verbose) console.log(`  · ${stage} — CACHE HIT (${inputHash})`);
      record(run, {
        stage,
        role: contract.role,
        cacheHit: true,
        cacheKey: inputHash,
        artifactInputs,
        artifact: `${artifactKind}@${versionOf(existing)}`,
      });
      continue;
    }

    if (o.dryRun) {
      console.log(`  · ${stage} — WOULD RUN (key ${inputHash}${forced ? ", forced" : ""})`);
      record(run, { stage, role: contract.role, cacheKey: inputHash, artifactInputs });
      continue;
    }

    /* --- build the prompt, recording what the stage touches -------- */
    const filesRead: string[] = [];
    const sourceUrls: string[] = [];
    const ctx = {
      inputs,
      params,
      noteRead: (p: string) => filesRead.push(p),
      noteFetch: (u: string) => {
        /**
         * A stage that fetches declares it here, and the contract decides
         * whether it may. This is the check that keeps the architecture honest:
         * `assertReadable` throws for any stage whose contract forbids raw
         * source, so a downstream stage cannot quietly go back to the website.
         */
        assertReadable(stage, "raw-source" as SourceClass);
        sourceUrls.push(u);
      },
    };

    const prompt = mod.prompt(ctx);
    const attachments = mod.attachments?.(ctx);

    if (o.verbose) console.log(`  · ${stage} — running (key ${inputHash})`);

    const res = await runRole<unknown>(contract.role, prompt, {
      skill: mod.skill,
      schema: mod.schema,
      attachments,
    });

    const finished = mod.finish?.(res.output, ctx) ?? {
      body: res.output as Record<string, unknown>,
    };

    /* --- write the artifact, versioned ---------------------------- */
    const version = nextVersion(existing, finished.body);
    const artifact = {
      ...finished.body,
      kind: artifactKind,
      id: slot.film ? `${slot.project}/${slot.film}` : slot.project,
      provenance: {
        version,
        producedBy: contract.role,
        producedAt: new Date().toISOString().slice(0, 10),
        inputHash,
        derivedFrom: artifactInputs,
      },
    };
    writeArtifact(slot, artifactKind, artifact);

    for (const s of finished.sidecars ?? []) {
      const p = join(dirname(pathOf(slot, artifactKind)), s.file);
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, `${JSON.stringify(s.data, null, 2)}\n`);
    }

    record(run, {
      stage,
      role: contract.role,
      model: res.model,
      promptTokens: res.promptTokens,
      promptChars: res.promptChars,
      iterations: res.iterations,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      cachedInputTokens: res.cachedInputTokens,
      cacheCreationTokens: res.cacheCreationTokens,
      adapterBaselineTokens: baselines?.[contract.role] ?? null,
      costUsd: res.costUsd,
      latencyMs: res.latencyMs,
      retries: res.retryCount,
      calls: 1 + res.retryCount,
      finishReason: res.finishReason,
      providerRequestId: res.providerRequestId,
      artifact: `${artifactKind}@${version}`,
      artifactInputs,
      filesRead,
      skillFiles: [`agent/SYSTEM_PRINCIPLES.md`, `agent/skills/${mod.skill}`],
      sourceUrls,
      cacheKey: inputHash,
      cacheHit: false,
      rawSourceReread: sourceUrls.length > 0,
    });
  }

  run.finishedAt = new Date().toISOString();
  return writeRun(run);
};

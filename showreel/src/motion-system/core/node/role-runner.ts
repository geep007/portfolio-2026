/**
 * RoleRunner adapter — Claude CLI in headless mode.
 *
 * This is one adapter, not the architecture. Stages call
 * `runRole("creativeDirector", …)`; which model answers is decided in
 * `models.config.ts`. Swapping this file for an HTTP SDK adapter changes
 * nothing upstream of it.
 *
 * Why the CLI rather than an SDK: it is the provider access this repo actually
 * has (no API key in the environment, no SDK installed), and it reports real
 * usage — input, output, cache-read and cache-creation tokens, real cost, the
 * model that served the call, and a session id. Nothing here is estimated.
 *
 * Three flags do the token work:
 *   --tools           the role's tool list. Tool definitions are prompt.
 *   --system-prompt   the skill, replacing the CLI's default system prompt.
 *   --json-schema     provider-enforced structured output, so a stage is not
 *                     trusting prose to be JSON.
 *
 * Measured overhead per call on this adapter: ~3,400 tokens of system prompt
 * and tool definitions with a one-tool role, against ~16,500 with the default
 * tool set. It is charged as cache-creation on the first call of a shape and
 * cache-read afterwards, and it is reported separately from stage input so the
 * run report never claims it as pipeline cost.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { RoleRunner, RunRoleInput, RunRoleResult } from "../roles";
import { MAX_USD_PER_CALL, MODELS } from "../models.config";

/**
 * Resolved from the working directory, not from `import.meta.url`: this file
 * is bundled before it runs, so a path relative to the module lands in a temp
 * directory. Same convention as `store.ts`.
 */
const AGENT_DIR = resolve(process.cwd(), "src/motion-system/agent");

export type RunnerOptions = {
  /** Model alias or id. Omit to use whatever the CLI is configured with. */
  model?: string;
  /** Per-call wall-clock ceiling. */
  timeoutMs?: number;
  /** Print a one-line trace per call. */
  verbose?: boolean;
};

type CliResult = {
  result?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
    iterations?: unknown[];
  };
  modelUsage?: Record<string, unknown>;
  total_cost_usd?: number;
  session_id?: string;
  stop_reason?: string;
  terminal_reason?: string;
  duration_ms?: number;
  is_error?: boolean;
};

const readIfExists = (p: string) => (existsSync(p) ? readFileSync(p, "utf8") : "");

/**
 * The adapter's fixed overhead for a role: system prompt + tool definitions +
 * whatever the harness carries, measured by sending a two-character prompt
 * with exactly the arguments a real call uses.
 *
 * It exists so the run report can separate what the PIPELINE spent from what
 * the ADAPTER costs to exist. Both are real; conflating them would let the
 * architecture take credit for a number it does not control, or be blamed for
 * one it does not spend. Measured once per role and cached to disk.
 */
export const measureAdapterBaseline = async (
  runner: RoleRunner,
  role: RunRoleInput["role"],
  skill: string,
): Promise<number> => {
  const res = await runner<unknown>({
    role,
    skill,
    input: "ok",
    schema: { type: "object", properties: { ok: { type: "boolean" } }, required: ["ok"], additionalProperties: false },
  });
  return res.promptTokens ?? 0;
};

/**
 * The system prompt is the shared principles plus one skill — never the whole
 * agent folder. A stage that wants more methodology edits its skill file.
 */
const systemPromptFor = (skill?: string) => {
  const principles = readIfExists(join(AGENT_DIR, "SYSTEM_PRINCIPLES.md"));
  const body = skill ? readIfExists(join(AGENT_DIR, "skills", skill)) : "";
  if (skill && !body) throw new Error(`Skill not found: agent/skills/${skill}`);
  return [
    principles,
    body,
    "\n---\n\nRespond with the requested JSON object and nothing else. No preamble, no markdown fence, no commentary.",
  ]
    .filter(Boolean)
    .join("\n\n");
};

const invoke = (args: string[], stdin: string, timeoutMs: number) =>
  new Promise<{ stdout: string; stderr: string; code: number | null }>((res, rej) => {
    const child = spawn("claude", args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      rej(new Error(`role call timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (e) => {
      clearTimeout(timer);
      rej(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      res({ stdout, stderr, code });
    });
    child.stdin.write(stdin);
    child.stdin.end();
  });

/** Tolerate a fenced block, but never silently accept non-JSON. */
const parseJson = (raw: string) => {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(text) as unknown;
};

export const createClaudeCliRunner = (o: RunnerOptions = {}): RoleRunner => {
  const timeoutMs = o.timeoutMs ?? 15 * 60_000;

  return async <T>(input: RunRoleInput): Promise<RunRoleResult<T>> => {
    const spec = MODELS[input.role];
    const started = Date.now();

    const args = [
      "-p",
      "--output-format",
      "json",
      /** Do not load MCP servers the role has no use for. */
      "--strict-mcp-config",
      "--disable-slash-commands",
      "--max-budget-usd",
      String(MAX_USD_PER_CALL),
      "--system-prompt",
      systemPromptFor(input.skill),
      "--tools",
      ...spec.tools,
    ];

    /**
     * `spec.model` is "default" today for every role, which means: do not pass
     * --model, use whatever the CLI is configured with. A real model id here
     * routes just that role, with no other change anywhere.
     */
    const model = spec.model !== "default" ? spec.model : o.model;
    if (model) args.push("--model", model);
    if (input.schema) args.push("--json-schema", JSON.stringify(input.schema));
    if (input.cwd) args.push("--add-dir", input.cwd);

    let prompt = input.input;
    if (input.attachments?.length) {
      prompt += `\n\nFiles you may read (use the Read tool; read only what you need):\n${input.attachments
        .map((a) => `- ${a}`)
        .join("\n")}`;
    }

    let retryCount = 0;
    let last: CliResult | null = null;
    let parsed: unknown = null;
    let lastError = "";

    /** One attempt, then one repair attempt. Not a retry loop. */
    for (let attempt = 0; attempt < 2; attempt++) {
      const send =
        attempt === 0
          ? prompt
          : `Your previous reply was not valid JSON for the required schema.\n\nError: ${lastError}\n\nPrevious reply (truncated):\n${String(
              last?.result ?? "",
            ).slice(0, 1500)}\n\nReturn the corrected JSON object only.`;

      const { stdout, stderr, code } = await invoke(args, send, timeoutMs);
      if (!stdout.trim()) {
        throw new Error(`role "${input.role}" produced no output (exit ${code}): ${stderr.slice(0, 400)}`);
      }

      last = JSON.parse(stdout) as CliResult;
      if (last.is_error || last.terminal_reason !== "completed") {
        throw new Error(
          `role "${input.role}" failed: ${last.terminal_reason ?? "unknown"} — ${String(last.result ?? "").slice(0, 300)}`,
        );
      }

      try {
        parsed = parseJson(String(last.result ?? ""));
        break;
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        retryCount++;
        if (attempt === 1) {
          throw new Error(
            `role "${input.role}" returned invalid JSON twice. Last error: ${lastError}`,
          );
        }
      }
    }

    const u = last?.usage ?? {};
    const servedBy = Object.keys(last?.modelUsage ?? {})[0] ?? null;

    if (o.verbose) {
      const cc = u.cache_creation_input_tokens ?? 0;
      const cr = u.cache_read_input_tokens ?? 0;
      console.log(
        `  · ${input.role} → ${servedBy ?? "?"} in=${u.input_tokens ?? 0} out=${u.output_tokens ?? 0} ` +
          `cacheR=${cr} cacheW=${cc} $${(last?.total_cost_usd ?? 0).toFixed(4)} ${Date.now() - started}ms` +
          (retryCount ? ` (${retryCount} repair)` : ""),
      );
    }

    const promptTokens =
      (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);

    return {
      output: parsed as T,
      model: servedBy,
      /**
       * Exact size of the prompt this pipeline built, in characters. Not a
       * token estimate — a byte count, recorded because the provider's token
       * figures aggregate across the adapter's internal iterations and so
       * over-count the logical prompt. Comparing stages by this is safe.
       */
      promptChars: prompt.length,
      iterations: last?.usage?.iterations?.length ?? null,
      promptTokens,
      inputTokens: u.input_tokens ?? null,
      outputTokens: u.output_tokens ?? null,
      cachedInputTokens: u.cache_read_input_tokens ?? null,
      cacheCreationTokens: u.cache_creation_input_tokens ?? null,
      costUsd: last?.total_cost_usd ?? null,
      latencyMs: Date.now() - started,
      retryCount,
      finishReason: last?.stop_reason ?? null,
      providerRequestId: last?.session_id ?? null,
    };
  };
};

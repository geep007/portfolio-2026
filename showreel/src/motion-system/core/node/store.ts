/**
 * Artifact store — the filesystem side. Node only; never imported by a
 * composition.
 *
 * Layout:
 *   projects/<project>/<film>/{assets,brand-brief,creative-direction,storyboard,score,render-state}.json
 *   projects/<project>/<film>/direction-candidates.json   (written, never read downstream)
 *   runs/<run-id>/metrics.json
 *
 * A brand-scoped artifact (`brand-brief`, `assets` for a brand-derived project)
 * may live one level up at `projects/<project>/` and be shared by several films.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { ArtifactKind } from "../schemas";
import { contentHash, hashOf } from "../artifacts";
import type { RunMetrics, RunSummary } from "../telemetry";
import { summarise } from "../telemetry";

export const ROOT = resolve(process.cwd());
export const projectsDir = () => join(ROOT, "projects");
export const runsDir = () => join(ROOT, "runs");

/**
 * Where each artifact lives, and why.
 *
 * `brand` scope means one copy per project, shared by every film in it: the
 * asset inventory and the brand brief describe the identity, not the piece.
 * That sharing is not a convenience — it is what makes a second film for the
 * same brand cache-hit on extract and archaeology.
 *
 * This started as a read-time fallback (look in the film directory, then the
 * project directory) with writes always going to the film directory, which
 * silently shadowed the shared brief with a per-film copy the moment anything
 * touched it. Scope is now declared, and reads and writes resolve identically.
 */
const ARTIFACTS: Record<ArtifactKind, { file: string; scope: "brand" | "film" }> = {
  assets: { file: "assets.json", scope: "brand" },
  "brand-brief": { file: "brand-brief.json", scope: "brand" },
  "creative-direction": { file: "creative-direction.json", scope: "film" },
  storyboard: { file: "storyboard.json", scope: "film" },
  score: { file: "score.json", scope: "film" },
  "render-state": { file: "render-state.json", scope: "film" },
};

export const scopeOf = (kind: ArtifactKind) => ARTIFACTS[kind].scope;

export type Slot = { project: string; film?: string };

export const pathOf = (slot: Slot, kind: ArtifactKind) => {
  const { file, scope } = ARTIFACTS[kind];
  const dir = scope === "film" && slot.film ? [slot.project, slot.film] : [slot.project];
  return join(projectsDir(), ...dir, file);
};

export const readArtifact = <T>(slot: Slot, kind: ArtifactKind): T | null => {
  const p = pathOf(slot, kind);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : null;
};

export const writeArtifact = <T extends Record<string, unknown>>(
  slot: Slot,
  kind: ArtifactKind,
  artifact: T,
) => {
  const p = pathOf(slot, kind);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, `${JSON.stringify(artifact, null, 2)}\n`);
  return p;
};

/**
 * The cache key.
 *
 * Deliberately built from CONTENT, not from files or versions:
 *
 *   key = hash({ <kind>: contentHash(artifact), … , extra })
 *
 * `contentHash` excludes `provenance`, so re-stamping a date or bumping a
 * version upstream does not invalidate anything downstream — only a real
 * change of content does. `extra` carries the stage's non-artifact
 * dependencies (the source URL, the requested duration, the variant brief).
 *
 * A missing input hashes as `null`, which is itself meaningful: a stage whose
 * upstream artifact does not exist yet cannot be fresh.
 */
export const cacheKeyFor = (
  inputs: Partial<Record<ArtifactKind, unknown>>,
  extra: unknown = null,
) => {
  const parts: Record<string, string | null> = {};
  for (const [kind, artifact] of Object.entries(inputs)) {
    parts[kind] = artifact
      ? contentHash(artifact as Record<string, unknown>)
      : null;
  }
  return hashOf({ inputs: parts, extra });
};

/**
 * Cache check. If the artifact exists and its recorded key matches the key
 * recomputed from current inputs, the stage MUST be skipped. This is rule 8 of
 * TOKEN_STRATEGY, and it is the difference between "regenerate state 04"
 * costing one call and costing the whole pipeline.
 */
export const isFresh = (
  slot: Slot,
  kind: ArtifactKind,
  inputs: Partial<Record<ArtifactKind, unknown>>,
  extra: unknown = null,
): { fresh: boolean; inputHash: string; existing: Record<string, unknown> | null } => {
  const inputHash = cacheKeyFor(inputs, extra);
  const existing = readArtifact<Record<string, unknown>>(slot, kind);
  const prov = existing?.provenance as { inputHash?: string } | undefined;
  return { fresh: Boolean(existing) && prov?.inputHash === inputHash, inputHash, existing };
};

/**
 * Backfill the cache key on an artifact whose content is trusted but whose
 * `inputHash` was written by hand (the Hookflo migration wrote "migrated").
 * Content is untouched; only the key is computed, by the same function the
 * runtime uses, so a subsequent hit is real rather than asserted.
 */
export const seedCacheKey = (
  slot: Slot,
  kind: ArtifactKind,
  inputs: Partial<Record<ArtifactKind, unknown>>,
  extra: unknown = null,
) => {
  const existing = readArtifact<Record<string, unknown>>(slot, kind);
  if (!existing) return null;
  const inputHash = cacheKeyFor(inputs, extra);
  const prov = (existing.provenance ?? {}) as Record<string, unknown>;
  if (prov.inputHash === inputHash) return inputHash;
  writeArtifact(slot, kind, { ...existing, provenance: { ...prov, inputHash } });
  return inputHash;
};

/** Bump a version only when the content actually changed. */
export const nextVersion = (
  existing: Record<string, unknown> | null,
  body: Record<string, unknown>,
) => {
  const prov = existing?.provenance as { version?: number } | undefined;
  if (!existing) return 1;
  return contentHash(existing) === contentHash(body) ? (prov?.version ?? 1) : (prov?.version ?? 1) + 1;
};

export const writeRun = (run: RunMetrics): { path: string; summary: RunSummary } => {
  const summary = summarise(run);
  const p = join(runsDir(), run.runId, "metrics.json");
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, `${JSON.stringify({ ...run, summary }, null, 2)}\n`);
  return { path: p, summary };
};

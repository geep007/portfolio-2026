#!/usr/bin/env node
/**
 * Bundle-and-run wrapper for `scripts/pipeline.ts`.
 *
 * Node can strip TypeScript types but will not resolve extensionless imports
 * in a TS source tree, and the motion-system sources are written for a bundler
 * (Remotion's). esbuild is already a Remotion dependency, so one bundle step
 * is cheaper than rewriting every import in the tree.
 */
import { build } from "esbuild";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const out = join(mkdtempSync(join(tmpdir(), "bms-")), "bundle.mjs");

await build({
  entryPoints: [process.env.BMS_ENTRY ?? "scripts/pipeline.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  outfile: out,
  /** Keep node built-ins and esbuild itself external; bundle our own sources. */
  packages: "external",
  logLevel: "warning",
});

process.argv = [process.argv[0], out, ...process.argv.slice(2)];
await import(pathToFileURL(out).href);

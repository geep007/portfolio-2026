// Copies the rendered mascot sequence into the AVAL project, renamed to the
// `prefix`/`digits`/`suffix` scheme that `aval/mascot/motion.json` declares.
//
// Remotion refuses an output directory containing a dot, so it cannot write to
// `../aval/...` itself and names its frames `element-<n>.png` with a variable
// digit count. Both are fixed here.
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..", "out", "mascot-frames");
const dest = join(here, "..", "..", "aval", "mascot", "frames");

const DIGITS = 4;
const PREFIX = "frame-";

const files = (await readdir(src)).filter((f) => f.endsWith(".png"));
if (files.length === 0) {
  throw new Error(`No PNGs in ${src} — did the render succeed?`);
}

const numbered = files.map((file) => {
  const match = file.match(/(\d+)\.png$/);
  if (!match) throw new Error(`Unexpected frame filename: ${file}`);
  return { file, index: Number(match[1]) };
});

// Remotion starts its sequence at whatever `--frames` began with; AVAL wants a
// contiguous run starting at `firstNumber`, so normalise to zero here.
const base = Math.min(...numbered.map((n) => n.index));

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });

for (const { file, index } of numbered) {
  const n = String(index - base).padStart(DIGITS, "0");
  await cp(join(src, file), join(dest, `${PREFIX}${n}.png`));
}

console.log(`Published ${numbered.length} frames to ${dest}`);

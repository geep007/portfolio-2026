/** Verification for the runtime pass. No model calls. */
import { assertReadable, STAGES } from "../src/motion-system/core/stages";
import { cacheKeyFor, readArtifact } from "../src/motion-system/core/node/store";

let fails = 0;
const ok = (label: string, cond: boolean) => {
  console.log(`${cond ? "  ok  " : "FAIL  "}${label}`);
  if (!cond) fails++;
};

/* 1 — assertReadable actually throws for a downstream stage. */
let threw = false;
try { assertReadable("storyboard", "raw-source"); } catch { threw = true; }
ok("storyboard may not read raw-source", threw);
let threwD = false;
try { assertReadable("direction", "raw-source"); } catch { threwD = true; }
ok("direction may not read raw-source", threwD);
let allowed = true;
try { assertReadable("archaeology", "raw-source"); } catch { allowed = false; }
ok("archaeology may read raw-source", allowed);

/* 2 — no stage past archaeology declares raw-source in its contract. */
const leaky = Object.values(STAGES).filter(
  (c) => c.readsSource.includes("raw-source") && !["extract", "archaeology"].includes(c.id),
);
ok("no stage past archaeology declares raw-source", leaky.length === 0);

/* 3 — provenance churn upstream must NOT invalidate downstream. */
const slot = { project: "athina", film: "first" };
const brief = readArtifact<Record<string, unknown>>(slot, "brand-brief")!;
const assets = readArtifact<Record<string, unknown>>(slot, "assets")!;
const base = cacheKeyFor({ "brand-brief": brief, assets }, { brief: null, durationTarget: 18 });
const restamped = { ...brief, provenance: { ...(brief.provenance as object), producedAt: "2099-01-01", version: 99 } };
ok(
  "re-stamping an upstream artifact does not invalidate downstream",
  cacheKeyFor({ "brand-brief": restamped, assets }, { brief: null, durationTarget: 18 }) === base,
);

/* 4 — a real content change MUST invalidate. */
const changed = { ...brief, productTruth: "something else entirely" };
ok(
  "changing upstream content invalidates downstream",
  cacheKeyFor({ "brand-brief": changed, assets }, { brief: null, durationTarget: 18 }) !== base,
);

/* 5 — a direction change must invalidate the storyboard. */
const dir = readArtifact<Record<string, unknown>>(slot, "creative-direction")!;
const sbBase = cacheKeyFor({ "brand-brief": brief, "creative-direction": dir, assets }, { durationTarget: 18 });
const dir2 = { ...dir, title: "A Different Film" };
ok(
  "a new direction invalidates the storyboard",
  cacheKeyFor({ "brand-brief": brief, "creative-direction": dir2, assets }, { durationTarget: 18 }) !== sbBase,
);

/* 6 — a missing upstream artifact can never be fresh. */
ok(
  "a missing upstream input changes the key",
  cacheKeyFor({ "brand-brief": null, assets }, { brief: null, durationTarget: 18 }) !== base,
);

console.log(fails ? `\n${fails} check(s) failed` : "\nall checks passed");
process.exit(fails ? 1 : 0);

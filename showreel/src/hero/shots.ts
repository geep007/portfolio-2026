/**
 * Single source of timing for the hero reel.
 *
 * The animatic (`HeroAnimatic`) and the finished reel (`HeroReel`) both read this
 * table, so pacing checked on the animatic is the pacing that ships.
 *
 * 900 frames @ 30fps = 30.00s.
 *
 * The register is composed panels, not full-bleed captures: mosaics, floating
 * UI cards, annotated builds, a drifting client wall. Shots average ~2.1s —
 * roughly double the previous cut — because the frames now carry enough
 * composition to be worth reading.
 *
 *   HOOK    0–190   let the work be seen
 *   ACCEL   190–590 match cuts and layered compositions
 *   RESOLVE 590–900 noise drops away, land on positioning
 */

export type Phase = "hook" | "accel" | "resolve";

/** What the shot is doing for the reel — used to police the craft/process ratio. */
export type Role = "craft" | "process" | "positioning";

export type Shot = {
  id: string;
  from: number;
  duration: number;
  phase: Phase;
  role: Role;
  project: "surreal" | "creo" | "athina" | "grow" | "none";
  /** Why this shot sits next to the previous one. Every cut must answer this. */
  cut: string;
  note: string;
};

export const SHOTS: Shot[] = [
  {
    id: "mosaic-open",
    from: 0,
    duration: 66,
    phase: "hook",
    role: "craft",
    project: "surreal",
    cut: "open mid-action",
    note: "Composed panel grid: Surreal facility large, colour fields and a type plate around it.",
  },
  {
    id: "cursor-select",
    from: 66,
    duration: 54,
    phase: "hook",
    role: "process",
    project: "creo",
    cut: "cursor drags a selection",
    note: "Panels clear; the cursor draws a design frame out of the empty ground. DESIGN.",
  },
  {
    id: "creo-figma-to-live",
    from: 120,
    duration: 70,
    phase: "hook",
    role: "process",
    project: "creo",
    cut: "same frame, now live",
    note: "Handles drop, chrome draws, the site starts moving and opens to full bleed.",
  },
  {
    id: "creo-annotated",
    from: 190,
    duration: 70,
    phase: "accel",
    role: "craft",
    project: "creo",
    cut: "the same build, now labelled",
    note: "Callout windows name what I owned. The partnership claim, made on real work.",
  },
  {
    id: "creo-circle",
    from: 260,
    duration: 60,
    phase: "accel",
    role: "craft",
    project: "creo",
    cut: "circle out",
    note: "Diagonal-stripe circle — first link in the circle match-cut chain.",
  },
  {
    id: "grow-mosaic",
    from: 320,
    duration: 70,
    phase: "accel",
    role: "craft",
    project: "grow",
    cut: "circle → circle (tree ring)",
    note: "Match cut into an editorial mosaic: ring, story cards, pyramid diagram.",
  },
  {
    id: "athina-cards",
    from: 390,
    duration: 70,
    phase: "accel",
    role: "craft",
    project: "athina",
    cut: "editorial card → product card",
    note: "UI fragments floating on a cobalt field. Precision register.",
  },
  {
    id: "athina-annotated",
    from: 460,
    duration: 66,
    phase: "accel",
    role: "craft",
    project: "athina",
    cut: "pull back to the whole build",
    note: "Observability screen with callouts. Technical credibility without a demo.",
  },
  {
    id: "surreal-globe",
    from: 526,
    duration: 64,
    phase: "accel",
    role: "craft",
    project: "surreal",
    cut: "sphere → globe",
    note: "Third circle in the chain. WebGL globe, scroll-driven.",
  },
  {
    id: "web-gallery",
    from: 590,
    duration: 80,
    phase: "resolve",
    role: "craft",
    project: "none",
    cut: "from one build to the whole body of work",
    note: "Full-page designs fly in and settle into a gallery. Replaces the old window stack.",
  },
  {
    id: "mobile-grid",
    from: 670,
    duration: 74,
    phase: "resolve",
    role: "craft",
    project: "none",
    cut: "same work, every breakpoint",
    note: "Sixteen real phone captures drifting in columns. The only shot that proves responsive.",
  },
  {
    id: "logo-wall",
    from: 744,
    duration: 56,
    phase: "resolve",
    role: "craft",
    project: "none",
    cut: "screens resolve into the roster",
    note: "Client marks drifting one way, capability tags the other.",
  },
  {
    id: "calm-hold",
    from: 800,
    duration: 60,
    phase: "resolve",
    role: "craft",
    project: "grow",
    cut: "deliberate contrast — stop cutting",
    note: "One long editorial composition. The reel exhales here.",
  },
  {
    id: "final-title",
    from: 860,
    duration: 40,
    phase: "resolve",
    role: "positioning",
    project: "none",
    cut: "resolve",
    note: "Positioning. Cursor exits right at the height it entered on frame 0.",
  },
];

export const TOTAL_FRAMES = 900;

export const shot = (id: string): Shot => {
  const found = SHOTS.find((s) => s.id === id);
  if (!found) {
    throw new Error(`unknown shot "${id}"`);
  }
  return found;
};

/** Frames of screen time per role — the brief's 14/4/2 budget, scaled to 30s. */
export const roleBudget = () => {
  const totals: Record<Role, number> = { craft: 0, process: 0, positioning: 0 };
  for (const s of SHOTS) {
    totals[s.role] += s.duration;
  }
  return totals;
};

/**
 * The film as data — every frame number and coordinate in one place.
 *
 * The numbers live in `projects/athina/first/score.json`, the canonical `Score`
 * artifact produced by the `scorer` stage. This file is the typed view: it
 * names the shapes the composition relies on and derives helpers. It invents
 * no values.
 *
 * "One Run, Observed" is a continuity film, not an edit: one dot is mounted at
 * frame 70 and never unmounted, and every apparent cut is a change of
 * luminance or a one-rule step. A `CompositionPlan` would model it as seven
 * shots with transitions, which is precisely what it is not.
 *
 * Frame budget: 540 @ 30fps = 18s.
 */
import scoreJson from "../../../../projects/athina/first/score.json";
import type { ScoreBody } from "../../core/schemas/score";
import { stateAtFrame } from "../../core/schemas/score";

export const SCORE = scoreJson as unknown as ScoreBody;

export const FPS = SCORE.fps;
export const TOTAL = SCORE.duration;

export type StateId = "claim" | "eclipse" | "rules" | "score" | "query" | "observe" | "glyph";

export const STATES = SCORE.states as { id: StateId; from: number; to: number }[];
export const stateAt = (frame: number) => stateAtFrame(SCORE, frame) as StateId;

/** Frame at which a named state begins. */
export const startOf = (id: StateId) => STATES.find((s) => s.id === id)!.from;

/* ------------------------------------------------------------------ *
 * Cues. Every animated moment in the film is one of these numbers.
 *
 * A name ending `Len` is a duration, `Step` a per-item interval; every other
 * cue is a frame position. Nothing in the composition may invent a number.
 * ------------------------------------------------------------------ */
export const CUE = SCORE.cues as Record<string, number> & {
  sphereDriftStep: number[];
};

/** Read a cue as a number. Throws rather than silently animating from zero. */
export const cue = (name: string): number => {
  const v = (SCORE.cues as Record<string, unknown>)[name];
  if (typeof v !== "number") throw new Error(`Score has no numeric cue "${name}"`);
  return v;
};

/* ------------------------------------------------------------------ *
 * Geometry, in the score's 1920x1080 space.
 * ------------------------------------------------------------------ */
type Rect = { x: number; y: number; w: number; h: number };

type Geometry = {
  rules: {
    pitch: number; originY: number; count: number; thickness: number;
    bleedLeft: number; bleedRight: number; carrierIndex: number; knockoutPadX: number;
  };
  dot: {
    radius: number; glyphRadius: number;
    eclipseX: number; eclipseY: number; eclipseScale: number;
    ruleIndexByState: Record<string, number>;
    xByState: Record<string, number>;
  };
  spheres: { cx: number; cy: number; r: number; driftX: number; driftY: number }[];
  eclipseDisc: { cx: number; cy: number; r: number };
  kicker: { x: number; y: number; size: number; tracking: number };
  headline: {
    x: number; lineY: number[]; size: number; lineHeight: number;
    maxWidth: number; tanWordIndexLine: number; tanWordIndex: number;
  };
  bodyBlock: { x: number; y: number; width: number; size: number; lineHeight: number; lines: number };
  panels: Record<"eval" | "query" | "observe", Rect & { radius: number; cropBottom: number }>;
  panelMark: { dx: number; dy: number; glyphSize: number; labelDx: number; labelSize: number };
  evalGrid: {
    x: number; headerY: number;
    colX: Record<"experiment" | "model" | "metric" | "score", number>;
    rowY: number[]; rowHeight: number; cellSize: number;
    tintRect: { dx: number; w: number; h: number };
    tintRowIndex: number; greenRowIndex: number;
  };
  sql: {
    editorX: number; editorY: number; editorW: number; editorH: number;
    lineY: number; size: number;
    runControl: Rect;
    statusX: number; statusY: number;
    resultRowY: number; resultRowX: number; resultRowW: number;
    barChart: Rect & { bars: number; barGap: number };
    table: { x: number; y: number; w: number; rowHeight: number };
  };
  monitor: {
    gradient: Rect & { blur: number };
    pills: { x: number; y: number; w: number; h: number; count: number; activeIndex: number; stroke: number };
    persona: { x: number; y: number; lineHeight: number; size: number; activeIndex: number };
    passRate: { x: number; y: number; size: number };
    stats: { x: number; y: number; size: number }[];
    histograms: (Rect & { bars: number; barGap: number })[];
  };
  glyphOut: {
    worldScale: number; worldOriginX: number; worldOriginY: number;
    glyphX: number; glyphY: number; ruleLength: number;
    wordmarkX: number; wordmarkY: number; wordmarkSize: number;
    rightColumnX: number; rightColumnY: number; rightColumnSize: number;
  };
};

export const G = SCORE.geometry as unknown as Geometry;

/** The y of rule `i`. The dot's vertical position is only ever one of these. */
export const ruleY = (i: number) => G.rules.originY + i * G.rules.pitch;

/* ------------------------------------------------------------------ *
 * Content — every word and figure the film renders.
 * ------------------------------------------------------------------ */
type Content = {
  kicker: string;
  headlines: Record<"claim" | "rules" | "observe", string[]>;
  tanWord: string;
  body: Record<string, string[]>;
  eclipseLabel: string;
  evalGrid: {
    header: string[];
    rows: { experiment: string; model: string; metric: string; score: string; tint: "green" | "peach" | "none" }[];
  };
  panelLabels: Record<"eval" | "query" | "observe", string>;
  sql: { query: string; runControl: string; status: string; rows: string };
  monitor: {
    passRate: string; passRateLabel: string;
    stats: { value: string; label: string }[];
    pills: string[]; activePill: string;
    personas: string[]; activePersona: string;
  };
  wordmark: { bold: string; light: string };
};

export const C = SCORE.content as unknown as Content;

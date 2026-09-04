/**
 * The film as data — every frame number in one place.
 *
 * The numbers themselves now live in `projects/hookflo/missing-dot/score.json`,
 * which is the canonical `Score` artifact (see `core/schemas/score.ts`). This
 * file is the typed view of it: it names the shapes the composition relies on
 * and derives the three geometry helpers. Nothing here invents a value.
 *
 * Why the JSON is canonical rather than generated from here: a Score is the
 * unit a UI regenerates. Editing `score.cues.travel` or
 * `score.geometry.panel.contracted.w` has to be a data edit, not a code edit,
 * or "regenerate one cue" means re-running an implementer.
 *
 * This is deliberately not a `Timeline` of shots. "The Missing Dot" has no
 * shots: it is one persistent object read eight ways, so what it needs is a
 * score of state boundaries and cues, not an edit list.
 *
 * Frame budget: 600 @ 30fps = 20s.
 */
import scoreJson from "../../../../projects/hookflo/missing-dot/score.json";
import type { ScoreBody } from "../../core/schemas/score";
import { stateAtFrame } from "../../core/schemas/score";

export const SCORE = scoreJson as unknown as ScoreBody;

export const FPS = SCORE.fps;
export const TOTAL = SCORE.duration;

export type StateId =
  | "idle"
  | "arrive"
  | "drop"
  | "scan"
  | "detect"
  | "route"
  | "resolve"
  | "mark";

export const STATES = SCORE.states as { id: StateId; from: number; to: number }[];

export const stateAt = (frame: number) => stateAtFrame(SCORE, frame) as StateId;

/* ------------------------------------------------------------------ *
 * Cues. Every animated moment in the film is one of these numbers.
 *
 * IDLE      the mark writes itself, dot by dot, on a 2-frame metronome, and
 *           the white dot lands alone after everyone else has settled.
 * ARRIVE    the panel clips open around the mark and the dots become row rails.
 *           `rowContent` is a 12-frame metronome that misses exactly one beat
 *           (132 -> 156). Index 2 is the failing delivery — the mark's own hole.
 * SCAN      everything drops to 12% in four frames, then one head travels.
 * DETECT    Hookflo writes a marker into the empty slot. Nothing else happens
 *           between `failChip` and `contract`.
 * ROUTE     the only travel in the film.
 * RESOLVE   the card shuts, the marker comes home, brightness returns.
 * MARK      the rows give up their content; the alerted marker lands last,
 *           and lands white.
 * ------------------------------------------------------------------ */
type Cues = {
  markWrite: number; markStep: number; markWhite: number; eyebrow: number;
  panelOpen: number; panelOpenLen: number; migrate: number; migrateStep: number;
  migrateLen: number; topLabel: number;
  rowContent: number[]; verifyDelay: number;
  dim: number; dimLen: number; scanFrom: number; scanTo: number; litRow: number;
  failDot: number; failChip: number; failLabel: number;
  contract: number; contractLen: number; travel: number; travelLen: number;
  card: number; cardStep: number; receipt: number;
  cardShut: number; cardShutLen: number; travelBack: number; restore: number;
  restoreLen: number; alerted: number;
  collapseText: number; collapse: number; collapseStep: number; collapseLen: number;
  collapseAlerted: number; collapseAlertedLen: number; wordmark: number; headline: number;
};

export const CUE = SCORE.cues as unknown as Cues;

/* ------------------------------------------------------------------ *
 * Geometry. Storyboard coordinates, 1920x1080 — the film's `space`, carried
 * across verbatim, so a rect here and a rect in the storyboard are the same
 * number.
 * ------------------------------------------------------------------ */
type Mark = { x: number; y: number; pitch: number; dot: number };

type Geometry = {
  frame: { w: number; h: number };
  margin: number;
  panel: {
    open: { x: number; w: number };
    contracted: { x: number; w: number };
    y: number; h: number; chrome: number; padTop: number; strip: number;
  };
  row: { h: number; padX: number; dot: number };
  markOpen: Mark;
  markClose: Mark;
  /** Reading-order index of the empty grid position, and of the white dot. */
  hole: number;
  white: number;
  card: { x: number; y: number; w: number };
  receipt: { x: number; y: number };
  wordmark: { x: number; y: number; size: number };
  headline: { x: number; y: number; size: number };
};

export const G = SCORE.geometry as unknown as Geometry;

/** Row i's top edge, panel-relative. */
export const rowTop = (i: number) => G.panel.chrome + G.panel.padTop + i * G.row.h;
/** Row i's marker centre, panel-relative. */
export const rowMarker = (i: number) => ({
  x: G.row.padX + G.row.dot / 2,
  y: rowTop(i) + G.row.h / 2,
});
/** Grid position i's dot centre, absolute, for either mark scale. */
export const markCentre = (i: number, m: Mark) => ({
  x: m.x + (i % 3) * m.pitch + m.dot / 2,
  y: m.y + Math.floor(i / 3) * m.pitch + m.dot / 2,
});

/* ------------------------------------------------------------------ *
 * Content. Nine deliveries. Index 2 is the one that never arrives.
 * ------------------------------------------------------------------ */
export type Source = "stripe" | "clerk" | "supabase" | "github";

export type Delivery = {
  source: Source;
  name: string;
  event: string;
  /** Seconds-ago at the moment of the freeze; rendered as a live countdown. */
  age: number;
  failed?: boolean;
};

type Content = {
  clock: { hour: string; startMinute: number };
  deliveries: Delivery[];
  /** Two-letter monogram tiles, in each service's own colour at low saturation. */
  sourceTiles: Record<Source, { tag: string; fg: string; bg: string }>;
};

const CONTENT = SCORE.content as unknown as Content;

export const DELIVERIES: Delivery[] = CONTENT.deliveries;
export const FAIL_ROW = DELIVERIES.findIndex((d) => d.failed);
export const SOURCE_TILE = CONTENT.sourceTiles;

/** 03:14:00 + elapsed. The clock never resets and never stops. */
export const clockAt = (frame: number) => {
  const s = CONTENT.clock.startMinute * 60 + Math.floor(frame / FPS);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${CONTENT.clock.hour}:${mm}:${ss}`;
};

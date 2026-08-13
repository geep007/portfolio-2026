import { z } from "zod";
import {
  buildTimeline,
  defaultShotEntries,
  rangeOf,
  shotEntrySchema,
  type Timeline,
} from "./timeline";

/**
 * Everything in the reel that is worth moving or rewording, in one schema.
 *
 * These are the composition's props, which means two things at once:
 *   - Remotion Studio renders them as editable fields in the right-hand panel
 *   - the drag overlay (`EditLayer`) can write positions straight back into them
 *
 * Both paths persist to `defaultProps` in Root.tsx, so an edit made in the
 * Studio survives a restart and shows up in the next render.
 *
 * Coordinates are always in composition space (1920x1080), never screen pixels.
 */

const point = z.object({
  x: z.number().step(1),
  y: z.number().step(1),
});

const callout = z.object({
  text: z.string(),
  x: z.number().step(1),
  y: z.number().step(1),
  w: z.number().step(1),
  /** Frames after the shot starts before this callout appears. */
  delay: z.number().step(1),
});

/** A media slot the picker can swap. Folder is relative to public/media. */
const galleryItem = z.object({
  src: z.string(),
  x: z.number().step(1),
  y: z.number().step(1),
  w: z.number().step(1),
  h: z.number().step(1),
  fromX: z.number().step(1),
  fromY: z.number().step(1),
  rotate: z.number().step(1),
  delay: z.number().step(1),
  pan: z.number(),
});

const logoRow = z.object({
  y: z.number().step(1),
  travel: z.number().step(1),
  logos: z.array(z.object({ src: z.string(), h: z.number().step(1) })),
  tags: z.array(z.string()),
});

const card = z.object({
  src: z.string(),
  x: z.number().step(1),
  y: z.number().step(1),
  w: z.number().step(1),
  h: z.number().step(1),
  delay: z.number().step(1),
});

export const heroSchema = z.object({
  /** Turns on drag handles in the Studio preview. Never leave this on for a render. */
  editMode: z.boolean(),

  /**
   * The edit itself. Uncheck `enabled` to delete a shot, change `duration` to
   * retime it, and `transition` to pick how it arrives over the previous shot.
   */
  shots: z.array(shotEntrySchema),

  openPlate: z.string(),
  labelDesign: point,
  labelBuiltToMove: point,
  labelStudioDev: point,
  labelInteract: point,
  labelShip: point,

  creoTag: z.string(),
  creoCallouts: z.array(callout),

  athinaTag: z.string(),
  athinaCallouts: z.array(callout),
  athinaCards: z.array(card),

  /**
   * Every clip in the reel, by slot. Filenames are relative to public/media —
   * drop a new file in there and it can be picked without touching code.
   */
  clips: z.object({
    mosaicMain: z.string(),
    mosaicSide: z.string(),
    mosaicCorner: z.string(),
    creoLive: z.string(),
    creoAnnotated: z.string(),
    creoCircle: z.string(),
    growHero: z.string(),
    growStory: z.string(),
    growWorks: z.string(),
    growMission: z.string(),
    athinaAnnotated: z.string(),
    surrealGlobe: z.string(),
    calmHold: z.string(),
  }),

  gallery: z.array(galleryItem),
  /** Column by column, filenames in public/media/phones. */
  phoneColumns: z.array(z.array(z.string())),
  /** The client wall. Add a row, or a logo to a row, to extend it. */
  logoRows: z.array(logoRow),

  title: z.object({
    x: z.number().step(1),
    y: z.number().step(1),
    /** Left/right use `x`; centre ignores it and centres in the frame. */
    align: z.enum(["left", "center", "right"]),
    name: z.string(),
    line1: z.string(),
    line2: z.string(),
  }),

  /** Which closing frame to use. */
  ending: z.enum(["clean", "playful"]),

  /** How the web-gallery shot is staged. */
  galleryStyle: z.enum(["flat", "carousel3d"]),

  /** The portfolio's dot-field pattern behind the closing frame. */
  showPattern: z.boolean(),
});

export type HeroProps = z.infer<typeof heroSchema>;

export const defaultHeroProps: HeroProps = {
  editMode: false,
  shots: defaultShotEntries,

  openPlate: "Built to move",
  labelBuiltToMove: { x: 140, y: 880 },
  labelDesign: { x: 140, y: 880 },
  labelStudioDev: { x: 470, y: 880 },
  labelInteract: { x: 150, y: 760 },
  labelShip: { x: 140, y: 900 },

  creoTag: "STUDIO PARTNERSHIP",
  creoCallouts: [
    {
      text: "Motion specced in FigJam, rebuilt as one GSAP timeline",
      x: 90,
      y: 250,
      w: 340,
      delay: 14,
    },
    {
      text: "Preloader hands off to the hero on complete",
      x: 1470,
      y: 330,
      w: 360,
      delay: 22,
    },
    { text: "Filterable CMS the team runs without me", x: 90, y: 640, w: 340, delay: 30 },
    { text: "Dropbox video integration", x: 1470, y: 700, w: 360, delay: 38 },
  ],

  athinaTag: "LIVE IN UNDER 7 DAYS",
  athinaCallouts: [
    {
      text: "Generative visuals as live p5.js sketches, not exports",
      x: 90,
      y: 260,
      w: 340,
      delay: 12,
    },
    {
      text: "Component library their team builds pages with",
      x: 1470,
      y: 350,
      w: 360,
      delay: 22,
    },
    { text: "Shipped two days before the investor pitch", x: 90, y: 660, w: 340, delay: 32 },
  ],

  athinaCards: [
    { src: "athina-observe.mp4", x: 150, y: 210, w: 780, h: 460, delay: 2 },
    { src: "athina-panels.mp4", x: 700, y: 470, w: 800, h: 440, delay: 14 },
    { src: "athina-data.mp4", x: 1090, y: 160, w: 620, h: 250, delay: 24 },
  ],

  clips: {
    mosaicMain: "surreal-facility.mp4",
    mosaicSide: "surreal-carousel.mp4",
    mosaicCorner: "creo-portfolio.mp4",
    creoLive: "creo-hero.mp4",
    creoAnnotated: "creo-portfolio.mp4",
    creoCircle: "creo-circle.mp4",
    growHero: "grow-hero.mp4",
    growStory: "grow-story.mp4",
    growWorks: "grow-works.mp4",
    growMission: "grow-mission.mp4",
    athinaAnnotated: "athina-observe.mp4",
    surrealGlobe: "surreal-globe.mp4",
    calmHold: "grow-mission.mp4",
  },

  gallery: [
    { src: "surreal.jpg", x: 60, y: 150, w: 400, h: 700, fromX: -520, fromY: 120, rotate: -6, delay: 0, pan: 0.16 },
    { src: "creo.jpg", x: 510, y: 90, w: 430, h: 790, fromX: -180, fromY: -420, rotate: 4, delay: 7, pan: 0.2 },
    { src: "athina.jpg", x: 990, y: 130, w: 430, h: 760, fromX: 220, fromY: 460, rotate: -4, delay: 14, pan: 0.18 },
    { src: "grow.jpg", x: 1470, y: 180, w: 400, h: 690, fromX: 560, fromY: -160, rotate: 6, delay: 21, pan: 0.22 },
  ],

  phoneColumns: [
    ["surreal-01.jpg", "creo-02.jpg", "athina-03.jpg"],
    ["athina-01.jpg", "grow-02.jpg", "surreal-04.jpg"],
    ["creo-03.jpg", "athina-04.jpg", "grow-04.jpg"],
    ["grow-01.jpg", "surreal-05.jpg", "creo-05.jpg"],
    ["athina-06.jpg", "creo-06.jpg", "grow-05.jpg"],
    ["surreal-06.jpg", "athina-03.jpg", "creo-02.jpg"],
  ],

  logoRows: [
    {
      y: 96,
      travel: -240,
      logos: [
        { src: "creo.svg", h: 56 },
        { src: "athina.png", h: 46 },
        { src: "surreal.png", h: 60 },
        { src: "growplus.png", h: 62 },
      ],
      tags: ["BRANDING STUDIO", "AI / YC W23", "EXPERIENTIAL", "NONPROFIT"],
    },
    {
      y: 440,
      travel: 260,
      logos: [
        { src: "lastbench.svg", h: 50 },
        { src: "edelgive.png", h: 52 },
        { src: "creo.svg", h: 56 },
        { src: "surreal.png", h: 60 },
      ],
      tags: ["WEBFLOW", "GSAP", "P5.JS", "ADVANCED CMS"],
    },
    {
      y: 784,
      travel: -180,
      logos: [
        { src: "growplus.png", h: 62 },
        { src: "athina.png", h: 46 },
        { src: "lastbench.svg", h: 50 },
        { src: "creo.svg", h: 56 },
      ],
      tags: ["SHOPIFY", "WEBGL", "COMPONENT LIBRARIES", "MOTION"],
    },
  ],

  title: {
    x: 260,
    y: 360,
    align: "center",
    name: "Geet Parmar",
    line1: "Webflow + creative development",
    line2: "For design studios",
  },

  ending: "clean",
  galleryStyle: "flat",
  showPattern: true,
};

/* ------------------------------------------------------------------ *
 * Hotspots — what the drag overlay can grab, and when.
 * ------------------------------------------------------------------ */

export type Hotspot = {
  /** Dot-path into the props object, e.g. "creoCallouts.2". */
  path: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * Present when the hotspot is a media slot rather than a position. `folder`
   * is the subfolder of public/media the picker offers files from; the path
   * points at a string prop holding the filename.
   */
  media?: { folder: string; current: string };
};

/** Media slots per shot, so the picker knows what is swappable and where. */
export const mediaSpotsAt = (
  props: HeroProps,
  frame: number,
  timeline: Timeline,
): Hotspot[] => {
  const out: Hotspot[] = [];
  const during = (id: string) => {
    const r = rangeOf(timeline, id);
    return r !== null && frame >= r.from && frame < r.to;
  };
  const slot = (
    path: string,
    label: string,
    current: string,
    folder: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => out.push({ path, label, x, y, w, h, media: { folder, current } });

  if (during("mosaic-open")) {
    slot("clips.mosaicMain", "main panel", props.clips.mosaicMain, "", 0, 0, 1280, 810);
    slot("clips.mosaicSide", "side panel", props.clips.mosaicSide, "", 1280, 270, 640, 540);
    slot("clips.mosaicCorner", "corner panel", props.clips.mosaicCorner, "", 800, 810, 480, 270);
  }
  if (during("creo-figma-to-live")) {
    slot("clips.creoLive", "creo clip", props.clips.creoLive, "", 470, 250, 980, 580);
  }
  if (during("creo-annotated")) {
    slot("clips.creoAnnotated", "creo clip", props.clips.creoAnnotated, "", 490, 200, 940, 620);
  }
  if (during("creo-circle")) {
    slot("clips.creoCircle", "creo circle clip", props.clips.creoCircle, "", 660, 240, 600, 600);
  }
  if (during("grow-mosaic")) {
    slot("clips.growHero", "grow hero", props.clips.growHero, "", 0, 0, 1120, 675);
    slot("clips.growStory", "grow story", props.clips.growStory, "", 1120, 0, 800, 405);
    slot("clips.growWorks", "grow works", props.clips.growWorks, "", 1120, 405, 800, 675);
    slot("clips.growMission", "grow mission", props.clips.growMission, "", 640, 675, 480, 405);
  }
  if (during("athina-cards")) {
    props.athinaCards.forEach((c, i) => {
      slot(`athinaCards.${i}.src`, `card ${i + 1} clip`, c.src, "", c.x, c.y, c.w, c.h);
    });
  }
  if (during("athina-annotated")) {
    slot("clips.athinaAnnotated", "athina clip", props.clips.athinaAnnotated, "", 490, 200, 940, 620);
  }
  if (during("surreal-globe")) {
    slot("clips.surrealGlobe", "globe clip", props.clips.surrealGlobe, "", 660, 240, 600, 600);
  }
  if (during("web-gallery")) {
    props.gallery.forEach((g, i) => {
      slot(`gallery.${i}.src`, `design ${i + 1}`, g.src, "gallery", g.x, g.y, g.w, g.h);
    });
  }
  if (during("mobile-grid")) {
    const phoneW = 268;
    const gap = 26;
    const phoneH = Math.round(phoneW * (844 / 390));
    const totalW = props.phoneColumns.length * phoneW + (props.phoneColumns.length - 1) * gap;
    const startX = (1920 - totalW) / 2;
    props.phoneColumns.forEach((col, ci) => {
      const colH = col.length * phoneH + (col.length - 1) * gap;
      const baseY = (1080 - colH) / 2;
      col.forEach((src, ri) => {
        slot(
          `phoneColumns.${ci}.${ri}`,
          `phone ${ci + 1}.${ri + 1}`,
          src,
          "phones",
          startX + ci * (phoneW + gap),
          baseY + ri * (phoneH + gap),
          phoneW,
          phoneH,
        );
      });
    });
  }
  if (during("logo-wall")) {
    props.logoRows.forEach((row, ri) => {
      row.logos.forEach((logo, li) => {
        slot(
          `logoRows.${ri}.logos.${li}.src`,
          `logo ${ri + 1}.${li + 1}`,
          logo.src,
          "logos",
          120 + li * 380,
          row.y - 10,
          300,
          Math.max(60, logo.h + 20),
        );
      });
    });
  }

  return out;
};

/**
 * Only items belonging to the shot under the playhead are grabbable — otherwise
 * the overlay would stack forty handles on top of each other. Ranges come from
 * the timeline, so they stay correct after shots are deleted or retimed.
 */
export const hotspotsAt = (
  props: HeroProps,
  frame: number,
  timeline: Timeline,
): Hotspot[] => {
  const out: Hotspot[] = [];
  const during = (id: string) => {
    const r = rangeOf(timeline, id);
    return r !== null && frame >= r.from && frame < r.to;
  };

  if (during("mosaic-open")) {
    out.push({
      path: "labelBuiltToMove",
      label: "open plate label",
      ...props.labelBuiltToMove,
      w: 320,
      h: 44,
    });
  }
  if (during("cursor-select")) {
    out.push({ path: "labelDesign", label: "DESIGN", ...props.labelDesign, w: 200, h: 44 });
  }
  if (during("creo-figma-to-live")) {
    out.push({
      path: "labelStudioDev",
      label: "STUDIO → DEV / LIVE",
      ...props.labelStudioDev,
      w: 300,
      h: 44,
    });
  }
  if (during("creo-annotated")) {
    props.creoCallouts.forEach((c, i) => {
      out.push({
        path: `creoCallouts.${i}`,
        label: `creo callout ${i + 1}`,
        x: c.x,
        y: c.y,
        w: c.w,
        h: 110,
      });
    });
  }
  if (during("athina-cards")) {
    props.athinaCards.forEach((c, i) => {
      out.push({
        path: `athinaCards.${i}`,
        label: `athina card ${i + 1}`,
        x: c.x,
        y: c.y,
        w: c.w,
        h: c.h,
      });
    });
    out.push({ path: "labelInteract", label: "INTERACT", ...props.labelInteract, w: 220, h: 44 });
  }
  if (during("athina-annotated")) {
    props.athinaCallouts.forEach((c, i) => {
      out.push({
        path: `athinaCallouts.${i}`,
        label: `athina callout ${i + 1}`,
        x: c.x,
        y: c.y,
        w: c.w,
        h: 110,
      });
    });
  }
  if (during("web-gallery")) {
    out.push({ path: "labelShip", label: "SHIP", ...props.labelShip, w: 180, h: 44 });
  }
  if (during("final-title")) {
    out.push({
      path: "title",
      label: "title block",
      x: props.title.x,
      y: props.title.y,
      w: 900,
      h: 300,
    });
  }

  return out;
};

/** Immutably set any value at a dot-path — used by the asset picker. */
export const setAtPath = (props: HeroProps, path: string, value: unknown): HeroProps => {
  const next = structuredClone(props);
  const parts = path.split(".");
  let target: Record<string, unknown> = next as unknown as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    target = target[parts[i]] as Record<string, unknown>;
  }
  target[parts[parts.length - 1]] = value;
  return next;
};

/** Immutably set `{x, y}` at a dot-path, for the drag overlay. */
export const moveAtPath = (
  props: HeroProps,
  path: string,
  x: number,
  y: number,
): HeroProps => {
  const next = structuredClone(props);
  const parts = path.split(".");
  let target: Record<string, unknown> = next as unknown as Record<string, unknown>;

  for (let i = 0; i < parts.length - 1; i++) {
    target = target[parts[i]] as Record<string, unknown>;
  }

  const leaf = target[parts[parts.length - 1]] as { x: number; y: number };
  leaf.x = Math.round(x);
  leaf.y = Math.round(y);

  return next;
};

/** Convenience for components that need the resolved edit. */
export const timelineOf = (props: HeroProps) => buildTimeline(props.shots);

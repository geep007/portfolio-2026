import { z } from "zod";

/**
 * The atomicdesignz.com site reel.
 *
 * Everything a person would want to change — copy, durations, which capture a
 * shot uses, where the music starts — is a prop, so the whole cut is editable
 * from the Studio props panel without opening a component. Shot order is fixed
 * in `SiteReel.tsx`; shot length and shot contents are not.
 *
 * The captures in `public/site/` are real full-page screenshots of the live
 * site (headless Chrome, 2x, reveals already fired), plus the site's own header
 * reel. No mockups — same rule as the hero reel.
 */

const cardSchema = z.object({
  /** File in public/site/. */
  src: z.string(),
  name: z.string(),
  spec: z.string(),
  /** 0 = top of the crop, 1 = bottom. Where the shot sits inside the capture. */
  position: z.number().min(0).max(1),
});

export const siteSchema = z.object({
  url: z.string(),
  music: z.string(),
  /** Seconds into the track the cut starts on. 16 is where the drums land. */
  audioStartInSeconds: z.number(),
  volume: z.number().min(0).max(1),

  boot: z.object({
    duration: z.number(),
    tag: z.string(),
    type: z.string(),
  }),
  hero: z.object({
    duration: z.number(),
    /** Frame of site-reel.mp4 to open on. */
    clipStartFrom: z.number(),
    eyebrow: z.string(),
    headline: z.array(z.string()),
  }),
  blast: z.object({
    duration: z.number(),
    label: z.string(),
    kicker: z.array(z.string()),
  }),
  work: z.object({
    duration: z.number(),
    tag: z.string(),
    heading: z.string(),
    cards: z.array(cardSchema),
  }),
  thesis: z.object({
    duration: z.number(),
    tag: z.string(),
    lines: z.array(z.string()),
  }),
  process: z.object({
    duration: z.number(),
    tag: z.string(),
    steps: z.array(z.string()),
  }),
  mobile: z.object({
    duration: z.number(),
    label: z.string(),
    lines: z.array(z.string()),
  }),
  close: z.object({
    duration: z.number(),
    wordmark: z.array(z.string()),
    line: z.string(),
    cta: z.string(),
  }),
});

export type SiteProps = z.infer<typeof siteSchema>;

/** Scene starts, derived from the durations so retiming one shot moves the rest. */
export const siteTimeline = (p: SiteProps) => {
  const order = [
    ["boot", p.boot.duration],
    ["hero", p.hero.duration],
    ["blast", p.blast.duration],
    ["work", p.work.duration],
    ["thesis", p.thesis.duration],
    ["process", p.process.duration],
    ["mobile", p.mobile.duration],
    ["close", p.close.duration],
  ] as const;

  let at = 0;
  const scenes = order.map(([id, duration]) => {
    const from = at;
    at += duration;
    return { id, from, duration };
  });

  return { scenes, total: at };
};

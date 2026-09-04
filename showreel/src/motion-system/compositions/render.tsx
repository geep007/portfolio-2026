import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import type { BrandSystem } from "../brand/schema";
import type { MotionVocabulary } from "../brand/vocabulary";
import { findEntry } from "../brand/vocabulary";
import { BrandProvider, useBrand } from "../brand/BrandProvider";
import { buildTimeline, type ShotEntry, type Timeline } from "../engine/timeline";
import { framesOf } from "../engine/timing";
import { patternById } from "../patterns/registry";
import { ShotTransition } from "../transitions/ShotTransition";
import type { CompositionPlan, PlanBeat } from "./plan";

/**
 * Plan → frames.
 *
 * `validatePlan` says whether a plan is legal for a brand (pattern in the
 * vocabulary, content within constraints, transition allowed). `planTimeline`
 * turns it into the engine timeline. `PlanFilm` renders it. Nothing here knows
 * what any pattern looks like.
 */

export type PlanIssue = { beat: number; message: string };

const words = (s?: string[] | string) =>
  (Array.isArray(s) ? s.join(" ") : (s ?? "")).split(/\s+/).filter(Boolean).length;

export const validatePlan = (plan: CompositionPlan, vocab: MotionVocabulary, brand: BrandSystem): PlanIssue[] => {
  const issues: PlanIssue[] = [];
  plan.story.forEach((b, i) => {
    const pattern = patternById(b.pattern);
    if (!pattern) {
      issues.push({ beat: i, message: `unknown pattern "${b.pattern}"` });
      return;
    }
    const entry = findEntry(vocab, b.pattern);
    if (!entry) {
      issues.push({ beat: i, message: `"${b.pattern}" is not in the ${vocab.brandId} vocabulary` });
    }
    const c = { ...pattern.meta.constraints, ...entry?.constraints };
    const items = (b.content.media ?? b.content.logos ?? []).length;
    if (c.maxWords !== undefined && words(b.content.headline) > c.maxWords) {
      issues.push({ beat: i, message: `headline has ${words(b.content.headline)} words, max ${c.maxWords}` });
    }
    if (c.maxLines !== undefined && (b.content.headline?.length ?? 0) > c.maxLines) {
      issues.push({ beat: i, message: `headline has ${b.content.headline?.length} lines, max ${c.maxLines}` });
    }
    if (c.minItems !== undefined && items < c.minItems) {
      issues.push({ beat: i, message: `${items} media items, needs at least ${c.minItems}` });
    }
    if (c.maxItems !== undefined && items > c.maxItems) {
      issues.push({ beat: i, message: `${items} media items, max ${c.maxItems}` });
    }
    if (b.transition && !brand.motion.transitions.includes(b.transition)) {
      issues.push({ beat: i, message: `transition "${b.transition}" is not in ${brand.identity.id}'s vocabulary; will cut` });
    }
    if (b.dark && !pattern.meta.supportsDark) {
      issues.push({ beat: i, message: `"${b.pattern}" does not support dark` });
    }
    for (const key of Object.keys(b.content.options ?? {})) {
      if (!pattern.meta.options?.[key]) {
        issues.push({ beat: i, message: `option "${key}" is not declared by "${b.pattern}"` });
      }
    }
  });
  return issues;
};

/** Beat duration in frames: explicit, else the vocabulary's preferred at brand tempo. */
const beatDuration = (b: PlanBeat, vocab: MotionVocabulary, brand: BrandSystem) => {
  if (b.duration) return b.duration;
  const entry = findEntry(vocab, b.pattern);
  const pref = entry?.duration.preferred ?? patternById(b.pattern)?.meta.duration.preferred ?? 60;
  return framesOf(brand, pref);
};

export const planEntries = (plan: CompositionPlan, vocab: MotionVocabulary, brand: BrandSystem): ShotEntry[] => {
  const fps = plan.fps ?? 30;
  const raw = plan.story.map((b, i) => ({
    id: b.id ?? `${b.beat}-${i}`,
    enabled: true,
    duration: beatDuration(b, vocab, brand),
    transition: i === 0 ? "cut" : (b.transition ?? brand.motion.transitions[0] ?? "cut"),
    transitionFrames: b.transitionFrames ?? framesOf(brand, brand.motion.transitionFrames.preferred),
  }));
  if (!plan.duration) return raw;
  // Scale unpinned beats so the total lands on the requested length.
  const target = Math.round(plan.duration * fps);
  const pinned = plan.story.reduce((s, b) => s + (b.duration ?? 0), 0);
  const free = raw.reduce((s, e, i) => s + (plan.story[i].duration ? 0 : e.duration), 0);
  if (free === 0) return raw;
  const k = Math.max(0.5, (target - pinned) / free);
  return raw.map((e, i) => (plan.story[i].duration ? e : { ...e, duration: Math.max(12, Math.round(e.duration * k)) }));
};

export const planTimeline = (plan: CompositionPlan, vocab: MotionVocabulary, brand: BrandSystem): Timeline =>
  buildTimeline(planEntries(plan, vocab, brand));

const Beats: React.FC<{ plan: CompositionPlan; timeline: Timeline }> = ({ plan, timeline }) => {
  const { brand, vocabulary } = useBrand();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: brand.colors.background }}>
      {plan.music ? (
        <Audio
          src={staticFile(plan.music.src)}
          startFrom={Math.round((plan.music.startSeconds ?? 0) * (plan.fps ?? 30))}
          volume={(f) =>
            (plan.music?.volume ?? 0.9) *
            interpolate(f, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
            interpolate(f, [durationInFrames - 26, durationInFrames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          }
        />
      ) : null}
      {timeline.shots.map((s, i) => {
        const beat = plan.story[i];
        const pattern = patternById(beat.pattern);
        if (!pattern) return null;
        const entry = vocabulary ? findEntry(vocabulary, beat.pattern) : undefined;
        const options = { ...entry?.brandOptions, ...beat.content.options };
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.duration + s.outroFrames} layout="none">
            <ShotTransition type={i === 0 ? "cut" : s.transition} duration={s.transitionFrames} seed={s.id}>
              <Sequence from={0} durationInFrames={s.duration} layout="none">
                <pattern.Component content={beat.content} dark={beat.dark} options={options} />
              </Sequence>
            </ShotTransition>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/** Render a plan under a brand. The composition's duration must equal `planTimeline(...).total`. */
export const PlanFilm: React.FC<{ plan: CompositionPlan; brand: BrandSystem; vocabulary: MotionVocabulary }> = ({
  plan,
  brand,
  vocabulary,
}) => {
  const timeline = planTimeline(plan, vocabulary, brand);
  return (
    <BrandProvider brand={brand} vocabulary={vocabulary}>
      <Beats plan={plan} timeline={timeline} />
    </BrandProvider>
  );
};

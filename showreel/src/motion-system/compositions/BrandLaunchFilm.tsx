import React from "react";
import { z } from "zod";
import type { BrandBundle } from "../brands";
import { entriesForBeat, type Beat } from "../brand/vocabulary";
import type { CompositionPlan, MediaRef } from "./plan";
import { PlanFilm, planTimeline } from "./render";

/**
 * The brand-agnostic test composition.
 *
 * Same inputs, any brand. The film chooses its patterns from the brand's
 * vocabulary preferences per beat — so Atomic opens on a mosaic and Edelgive
 * opens on a headline, from the same headline + three images. If the only
 * difference between two renders is fonts and colours, the abstraction failed.
 *
 * Story shape is fixed on purpose (hook → reveal → proof → close). The brand
 * decides how each beat is told, not whether it happens.
 */
export const launchSchema = z.object({
  brand: z.string(),
  headline: z.array(z.string()),
  subhead: z.string(),
  label: z.string(),
  media: z.array(z.string()),
  logo: z.string(),
  cta: z.string(),
  url: z.string(),
  /** Seconds. */
  duration: z.number().min(6).max(40),
});

export type LaunchProps = z.infer<typeof launchSchema>;

const media = (srcs: string[]): MediaRef[] => srcs.map((src) => ({ src }));

/** First vocabulary pick for a beat that accepts the content we have. */
const pick = (bundle: BrandBundle, beat: Beat, accept: (id: string) => boolean, fallback: string) =>
  entriesForBeat(bundle.vocabulary, beat).find((e) => accept(e.pattern))?.pattern ?? fallback;

export const launchPlan = (p: LaunchProps, bundle: BrandBundle): CompositionPlan => {
  const brandId = bundle.brand.identity.id;
  const hookId = pick(bundle, "hook", (id) => id !== "knockout-statement" || p.media.length > 0, "headline-reveal");
  const revealId = pick(
    bundle,
    "reveal",
    (id) => id !== "annotated-window" && id !== "floating-cards" && id !== "pillar-index" && id !== hookId,
    "split-reveal",
  );
  const proofId = pick(
    bundle,
    "proof",
    (id) =>
      id !== revealId &&
      id !== hookId &&
      ((id === "structured-gallery" && p.media.length >= 3) || id === "panel-mosaic" || id === "split-reveal"),
    "structured-gallery",
  );
  const closeId = pick(bundle, "close", () => true, "logo-outro");

  const hookContent =
    hookId === "panel-mosaic"
      ? { media: media(p.media), headline: [p.label] }
      : hookId === "knockout-statement"
        ? { headline: p.headline.slice(0, 2), media: media(p.media.slice(0, 1)) }
        : hookId === "photo-statement"
          ? { headline: p.headline, label: p.label, media: media(p.media.slice(0, 1)), subhead: p.subhead, options: { cta: false } }
          : { headline: p.headline, label: p.label };

  return {
    brand: brandId,
    intent: "brand-launch",
    format: "16:9",
    duration: p.duration,
    story: [
      { id: "hook", beat: "hook", pattern: hookId, content: hookContent },
      {
        id: "reveal",
        beat: "reveal",
        pattern: revealId,
        content: { headline: p.headline, subhead: p.subhead, media: media(p.media.slice(0, 1)), url: p.url, label: p.label },
        dark: revealId === "browser-scroll" && brandId === "atomic",
      },
      {
        id: "proof",
        beat: "proof",
        pattern: proofId,
        content: { media: media(p.media), headline: proofId === "split-reveal" ? p.headline : [p.label], label: p.label },
        dark: proofId === "panel-mosaic",
      },
      {
        id: "close",
        beat: "close",
        pattern: closeId,
        content: { logo: p.logo ? { src: p.logo } : undefined, headline: p.headline.slice(0, 1), subhead: p.subhead, cta: p.cta, url: p.url, media: media(p.media.slice(1, 2)) },
      },
    ],
  };
};

export const launchDuration = (p: LaunchProps, bundle: BrandBundle) =>
  planTimeline(launchPlan(p, bundle), bundle.vocabulary, bundle.brand).total;

export const BrandLaunchFilm: React.FC<LaunchProps & { bundle: BrandBundle }> = ({ bundle, ...p }) => (
  <PlanFilm plan={launchPlan(p, bundle)} brand={bundle.brand} vocabulary={bundle.vocabulary} />
);

/** Shared test content — identical for every brand. */
export const LAUNCH_TEST_CONTENT: Omit<LaunchProps, "brand"> = {
  headline: ["Introducing a new", "digital experience."],
  subhead: "Designed and built for people who read.",
  label: "LAUNCHING 2026",
  media: ["media/edelgive/land-fields.jpg", "media/edelgive/land-mountain.png", "media/edelgive/land-desert.png"],
  logo: "",
  cta: "See it live",
  url: "example.com",
  duration: 12,
};

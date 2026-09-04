import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { Media } from "../primitives/Media";
import { TextReveal } from "../primitives/TextReveal";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * A full-bleed photograph with a scrim and a centred headline over it.
 * The photographic hero as a shot. Type is always on the inverse foreground.
 */
export const meta: PatternMeta = {
  id: "photo-statement",
  name: "Photo statement",
  category: "media",
  description: "Full-bleed image or video with a slow push and a dark scrim; centred headline rises line by line; optional label above, body line and pill CTA below.",
  roles: ["hook", "statement", "section-intro", "close"],
  compatibleContent: ["short-headline", "single-image", "single-video"],
  energy: "low",
  duration: { min: 60, preferred: 90, max: 150 },
  constraints: { maxWords: 12, maxLines: 3, maxItems: 1 },
  avoidWhen: ["no strong photograph", "the brand never sets type over imagery", "two photo statements in a row"],
  options: {
    scrim: { type: "number", min: 0, max: 0.8, default: 0.4, description: "Darkening over the image." },
    cta: { type: "boolean", default: true, description: "Show `cta` as a pill under the text." },
    align: { type: "enum", values: ["center", "left"], default: "center", description: "Text alignment." },
  },
  supportsDark: false,
};

const Component: React.FC<PatternProps> = ({ content, options }) => {
  const { brand, ease, frames, stagger, type, radius } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { enter: "hero", exit: "short" });
  const scrim = opt<number>(options, meta, "scrim");
  const showCta = opt<boolean>(options, meta, "cta");
  const align = opt<"center" | "left">(options, meta, "align");
  const media = content.media?.[0];
  const fg = brand.colors.inverse.foreground;
  const m = brand.spacing.margin;

  const scrimIn = progress(clock.frame, { duration: frames("hero"), easing: ease("enter") });
  const lines = content.headline ?? [];
  const bodyDelay = frames("short") + lines.length * stagger("normal") + frames("short");
  const ctaDelay = bodyDelay + frames("standard");
  const ctaIn = progress(clock.frame, { delay: ctaDelay, duration: frames("standard"), easing: ease("enter") });
  const exitFade = 1 - clock.exit;

  return (
    <AbsoluteFill style={{ background: brand.colors.inverse.background }}>
      {media ? <Media media={media} /> : null}
      <AbsoluteFill style={{ background: `rgba(10,14,20,${scrim * scrimIn})` }} />
      <div
        style={{
          position: "absolute",
          left: align === "center" ? m : m,
          right: m,
          top: 0,
          height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: align === "center" ? "center" : "flex-start",
          textAlign: align,
          opacity: exitFade,
        }}
      >
        {content.label ? (
          <div style={{ marginBottom: brand.spacing.stack * 0.6 }}>
            <TextReveal lines={[content.label]} role="label" behaviour="clip-wipe" color={brand.colors.inverse.accent} align={align} duration="short" />
          </div>
        ) : null}
        <TextReveal
          lines={lines}
          role="headline"
          size={Math.min(brand.typography.scale.display, (width - 2 * m) / 11)}
          align={align}
          color={fg}
          delay={frames("short")}
          duration="hero"
          stagger="normal"
        />
        {content.subhead ? (
          <div style={{ marginTop: brand.spacing.stack * 0.8, maxWidth: Math.min(width - 2 * m, brand.layout.maxWidth * 0.62) }}>
            <TextReveal lines={[content.subhead]} role="body" behaviour="clip-wipe" color={brand.colors.inverse.muted} align={align} delay={bodyDelay} duration="standard" />
          </div>
        ) : null}
        {showCta && content.cta ? (
          <div
            style={{
              marginTop: brand.spacing.stack,
              ...type("label"),
              color: brand.colors.foreground,
              background: fg,
              borderRadius: radius("large") * 3,
              padding: "16px 32px",
              opacity: ctaIn,
              transform: `translateY(${(1 - ctaIn) * 16 * brand.motion.amplitude}px)`,
            }}
          >
            {content.cta}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const PhotoStatement: Pattern = { meta, Component };

import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { TextReveal } from "../primitives/TextReveal";
import { RuleGrid } from "../primitives/RuleGrid";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * The end card: logo or wordmark, one positioning line, optional CTA/URL.
 * Holds still at the end so the last frame can be screenshotted.
 */
export const meta: PatternMeta = {
  id: "logo-outro",
  name: "Logo outro",
  category: "logo",
  description: "Closing card: logo mark or wordmark (headline used as wordmark if no logo), one line under it, optional CTA and URL. Ends on a still frame.",
  roles: ["close"],
  compatibleContent: ["logo", "short-headline"],
  energy: "low",
  duration: { min: 48, preferred: 72, max: 120 },
  constraints: { maxWords: 12, maxLines: 2 },
  avoidWhen: ["not the final beat", "no logo and no wordmark text"],
  options: {
    grid: { type: "boolean", default: false, description: "Rule grid behind the card." },
    logoHeight: { type: "number", min: 60, max: 400, default: 140, description: "Logo height in px." },
  },
  supportsDark: true,
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, ease, frames, type } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { enter: "standard", exits: false });
  const g = ground(dark);
  const grid = opt<boolean>(options, meta, "grid");
  const logoH = opt<number>(options, meta, "logoHeight");
  const logo = content.logo ?? (dark && brand.logo?.onDark ? { src: brand.logo.onDark } : brand.logo?.mark ? { src: brand.logo.mark } : undefined);
  const center = brand.layout.alignment === "center";
  const m = brand.spacing.margin;

  const logoIn = progress(clock.frame, { duration: frames("standard"), easing: ease("enter") });
  const lineDelay = frames("short");
  const ctaDelay = lineDelay + frames("standard");
  const ctaIn = progress(clock.frame, { delay: ctaDelay, duration: frames("short"), easing: ease("enter") });

  return (
    <AbsoluteFill style={{ background: g.background }}>
      {grid ? <RuleGrid dark={dark} inset /> : null}
      <div
        style={{
          position: "absolute",
          left: center ? 0 : m,
          right: center ? 0 : m,
          top: 0,
          height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: center ? "center" : "flex-start",
        }}
      >
        {logo ? (
          <div style={{ height: logoH, marginBottom: brand.spacing.stack, overflow: "hidden" }}>
            <Img
              src={staticFile(logo.src)}
              style={{
                height: logoH,
                objectFit: "contain",
                transform: `translateY(${(1 - logoIn) * 100}%)`,
                filter: dark && !brand.logo?.onDark ? "brightness(0) invert(1)" : undefined,
              }}
            />
          </div>
        ) : content.headline ? (
          <TextReveal lines={content.headline} role="wordmark" size={brand.typography.scale.hero * 0.6} align={center ? "center" : "left"} color={g.foreground} />
        ) : null}
        {content.subhead ? (
          <TextReveal lines={[content.subhead]} role="subhead" behaviour="clip-wipe" align={center ? "center" : "left"} color={g.muted} delay={lineDelay} />
        ) : null}
        {content.cta || content.url ? (
          <div
            style={{
              marginTop: brand.spacing.stack,
              display: "flex",
              gap: brand.spacing.gap,
              alignItems: "center",
              clipPath: `inset(0 ${(1 - ctaIn) * 100}% 0 0)`,
            }}
          >
            {content.cta ? (
              <div style={{ ...type("label"), color: brand.colors.inverse.foreground, background: g.accent, padding: "10px 16px" }}>{content.cta}</div>
            ) : null}
            {content.url ? <div style={{ ...type("label"), color: g.accent }}>{content.url}</div> : null}
          </div>
        ) : null}
      </div>
      {/* Settle: the last frames lift nothing; the card is already still. */}
      <AbsoluteFill style={{ pointerEvents: "none", opacity: interpolate(clock.t, [0, 1], [0, 0]) }} />
    </AbsoluteFill>
  );
};

export const LogoOutro: Pattern = { meta, Component };

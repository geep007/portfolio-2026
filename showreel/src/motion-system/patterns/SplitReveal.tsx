import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { useShotClock } from "../engine/timing";
import { Media } from "../primitives/Media";
import { Mask } from "../primitives/Mask";
import { TextReveal } from "../primitives/TextReveal";
import { LabelFlash } from "../primitives/LabelFlash";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * Type on one side, one media panel on the other. The editorial spread.
 * The split sits on the brand grid (columns 0–5 / 6–11 or 0–6 / 7–11).
 */
export const meta: PatternMeta = {
  id: "split-reveal",
  name: "Split reveal",
  category: "layout",
  description: "Two-column spread: headline (+ optional label, subhead) on one side, a single image or video panel on the other, revealed by a hard mask. Brand decides which side the media takes.",
  roles: ["section-intro", "reveal", "statement", "detail"],
  compatibleContent: ["short-headline", "single-image", "single-video"],
  energy: "medium",
  duration: { min: 54, preferred: 84, max: 130 },
  constraints: { maxWords: 14, maxLines: 4, maxItems: 1 },
  avoidWhen: ["no media available", "headline is a single word (use knockout or headline-reveal)", "brand is centred and symmetric"],
  options: {
    mediaSide: { type: "enum", values: ["right", "left"], default: "right", description: "Which column the media takes." },
    ratio: { type: "enum", values: ["half", "wide-media", "wide-type"], default: "wide-media", description: "Column split." },
    bleed: { type: "boolean", default: true, description: "Media runs to the frame edge on its side." },
  },
  supportsDark: true,
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, frames, stagger } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { exit: "short" });
  const g = ground(dark);
  const side = opt<"right" | "left">(options, meta, "mediaSide");
  const ratio = opt<"half" | "wide-media" | "wide-type">(options, meta, "ratio");
  const bleed = opt<boolean>(options, meta, "bleed");

  const cols = 12;
  const mediaCols = ratio === "half" ? 6 : ratio === "wide-media" ? 7 : 5;
  const cellW = width / cols;
  const m = brand.spacing.margin;
  const media = content.media?.[0];

  const mediaX = side === "right" ? (cols - mediaCols) * cellW : 0;
  const mediaW = mediaCols * cellW;
  const typeX = side === "right" ? m : mediaW + brand.spacing.gap * 2;
  const typeW = width - mediaW - m - brand.spacing.gap * 2;
  const inset = bleed ? 0 : brand.spacing.safe.y;

  return (
    <AbsoluteFill style={{ background: g.background }}>
      {media ? (
        <div
          style={{
            position: "absolute",
            left: mediaX + (bleed ? 0 : side === "right" ? 0 : inset),
            top: inset,
            width: mediaW - (bleed ? 0 : inset),
            height: height - 2 * inset,
            overflow: "hidden",
            borderRadius: bleed ? 0 : brand.surfaces.radius[brand.surfaces.mediaRadius],
          }}
        >
          <Mask direction={side === "right" ? "left" : "right"} duration="standard">
            <Media media={media} />
          </Mask>
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: typeX,
          width: typeW,
          top: 0,
          height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {content.label ? (
          <div style={{ position: "relative", height: brand.typography.scale.label * 1.4, marginBottom: brand.spacing.stack }}>
            <LabelFlash text={content.label} x={0} y={0} dark={dark} />
          </div>
        ) : null}
        <TextReveal
          lines={content.headline ?? []}
          role="headline"
          size={Math.min(
            brand.typography.scale.display,
            // Fit the longest line: ~0.5em average glyph width for a display face.
            (typeW / Math.max(8, ...(content.headline ?? []).map((l) => l.length))) * 2,
          )}
          color={g.foreground}
          delay={frames("micro")}
          exit={clock.exit}
        />
        {content.subhead ? (
          <div style={{ marginTop: brand.spacing.stack }}>
            <TextReveal
              lines={[content.subhead]}
              role="body"
              behaviour="clip-wipe"
              color={g.muted}
              delay={frames("short") + (content.headline?.length ?? 1) * stagger("normal")}
              exit={clock.exit}
            />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const SplitReveal: Pattern = { meta, Component };

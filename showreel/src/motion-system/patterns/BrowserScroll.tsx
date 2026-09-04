import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { useShotClock } from "../engine/timing";
import { BrowserFrame, type ChromeStyle } from "../primitives/BrowserFrame";
import { Media } from "../primitives/Media";
import { LabelFlash } from "../primitives/LabelFlash";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * A website inside a window, its capture scrolling. The window either sits
 * centred at a fixed size or opens from that size to full bleed.
 */
export const meta: PatternMeta = {
  id: "browser-scroll",
  name: "Browser scroll",
  category: "product",
  description:
    "One website capture (scroll-motion video or tall screenshot) inside a browser window styled by the brand. Optional URL and label. Can open to full bleed.",
  roles: ["reveal", "proof", "detail"],
  compatibleContent: ["website", "single-video", "single-image"],
  energy: "medium",
  duration: { min: 50, preferred: 80, max: 140 },
  constraints: { maxItems: 1 },
  avoidWhen: ["media is not a website capture", "the beat is a statement", "more than one site must be compared"],
  options: {
    chrome: {
      type: "enum",
      values: ["brand", "hairline", "plain", "titled"],
      default: "brand",
      description: "Window chrome; `brand` picks by treatment (framed→hairline, bare→plain).",
    },
    open: { type: "boolean", default: false, description: "Open from the window size to full bleed over the shot." },
    width: { type: "number", min: 0.4, max: 1, default: 0.62, description: "Window width as a fraction of the frame." },
  },
  supportsDark: true,
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, frames, ease } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { enter: "standard", exits: false });
  const g = ground(dark);
  const chromeOpt = opt<"brand" | ChromeStyle>(options, meta, "chrome");
  const chrome: ChromeStyle =
    chromeOpt !== "brand"
      ? chromeOpt
      : brand.imagery.treatment === "bare"
        ? "plain"
        : "hairline";
  const openToFull = opt<boolean>(options, meta, "open");
  const wFrac = opt<number>(options, meta, "width");

  const media = content.media?.[0];
  const w0 = Math.round(width * wFrac);
  const h0 = Math.round(w0 * (height / width));
  const x0 = (width - w0) / 2;
  const y0 = (height - h0) / 2;

  const open = openToFull
    ? interpolate(clock.frame, [frames("hero"), clock.duration - frames("short")], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: ease("enter"),
      })
    : 0;

  // Arrival: rise from below by the brand amplitude, no fade.
  const rise = (1 - clock.enter) * 60 * brand.motion.amplitude;

  return (
    <AbsoluteFill style={{ background: g.background }}>
      {media ? (
        <BrowserFrame
          url={content.url}
          chrome={chrome}
          dark={dark}
          left={interpolate(open, [0, 1], [x0, 0])}
          top={interpolate(open, [0, 1], [y0, 0]) + rise}
          width={interpolate(open, [0, 1], [w0, width])}
          height={interpolate(open, [0, 1], [h0, height])}
          style={{ clipPath: `inset(0 0 ${(1 - clock.enter) * 100}% 0)` }}
        >
          <Media media={media} />
        </BrowserFrame>
      ) : null}
      {content.label ? (
        <LabelFlash
          text={content.label}
          x={brand.spacing.margin}
          y={height - brand.spacing.safe.y - brand.typography.scale.label * 1.6}
          delay={frames("short")}
          hold={frames("hero")}
          dark={dark}
          variant={brand.motion.cursor ? "chip" : "bare"}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const BrowserScroll: Pattern = { meta, Component };

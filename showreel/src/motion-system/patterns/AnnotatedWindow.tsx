import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { BrowserFrame } from "../primitives/BrowserFrame";
import { Media } from "../primitives/Media";
import { LabelFlash } from "../primitives/LabelFlash";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * One build centred in a window, short callouts arriving around it. The
 * callouts come from `content.media[0].label`-style captions? No — from
 * `content.body` split on newlines, up to four. Slots are fixed: two left,
 * two right, so nothing collides with the window.
 */
export const meta: PatternMeta = {
  id: "annotated-window",
  name: "Annotated window",
  category: "product",
  description: "A website capture in a centred window with up to four short callouts arriving one at a time in fixed slots around it. Callouts come from `body`, one per line. Optional outlined tag above.",
  roles: ["detail", "proof"],
  compatibleContent: ["website", "single-video"],
  energy: "medium",
  duration: { min: 60, preferred: 84, max: 130 },
  constraints: { maxItems: 1, maxLines: 4, maxWords: 40 },
  avoidWhen: ["callouts are longer than ten words each", "no specific claims to make about the build", "opening the piece"],
  options: {
    calloutStyle: { type: "enum", values: ["window", "plain", "rule"], default: "plain", description: "window = mini chrome box; plain = bare type; rule = type with a hairline above." },
  },
  supportsDark: true,
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, ease, frames, stagger, type } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { exits: false });
  const g = ground(dark);
  const style = opt<"window" | "plain" | "rule">(options, meta, "calloutStyle");
  const media = content.media?.[0];
  const callouts = (content.body ?? "").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 4);

  const winW = Math.round(width * 0.49);
  const winH = Math.round(height * 0.574);
  const winX = (width - winW) / 2;
  const winY = (height - winH) / 2 + 20;
  const calW = Math.round(width * 0.18);
  const m = brand.spacing.margin * 0.75;
  const slots = [
    { x: m, y: height * 0.23 },
    { x: width - m - calW, y: height * 0.3 },
    { x: m, y: height * 0.6 },
    { x: width - m - calW, y: height * 0.65 },
  ];
  const winIn = progress(clock.frame, { duration: frames("standard"), easing: ease("enter") });

  return (
    <AbsoluteFill style={{ background: g.background }}>
      {content.label ? (
        <div style={{ position: "absolute", top: brand.spacing.safe.y * 0.6, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 600, height: 50 }}>
            <LabelFlash text={content.label} x={150} y={0} variant="outline" dark={dark} />
          </div>
        </div>
      ) : null}
      {media ? (
        <BrowserFrame
          url={content.url}
          left={winX}
          top={winY + (1 - winIn) * 40 * brand.motion.amplitude}
          width={winW}
          height={winH}
          dark={dark}
          chrome={brand.imagery.treatment === "bare" ? "plain" : "hairline"}
          style={{ clipPath: `inset(0 0 ${(1 - winIn) * 100}% 0)` }}
        >
          <Media media={media} />
        </BrowserFrame>
      ) : null}
      {callouts.map((text, i) => {
        const t = progress(clock.frame, { delay: frames("short") + i * stagger("loose") * 1.5, duration: frames("short"), easing: ease("enter") });
        if (t <= 0.001) return null;
        const s = slots[i];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: calW,
              opacity: t,
              transform: `translateY(${(1 - t) * 12 * brand.motion.amplitude}px)`,
              border: style === "window" ? `1px solid ${g.rule}` : undefined,
              borderTop: style === "rule" ? `1px solid ${g.foreground}` : undefined,
              background: style === "window" ? g.background : undefined,
            }}
          >
            {style === "window" ? (
              <div style={{ height: 26, borderBottom: `1px solid ${g.rule}`, display: "flex", alignItems: "center", gap: 6, padding: "0 9px" }}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: g.muted }} />
                ))}
              </div>
            ) : null}
            <div style={{ ...type("body"), padding: style === "window" ? "16px 18px" : style === "rule" ? "14px 0 0" : 0, color: g.foreground }}>{text}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const AnnotatedWindow: Pattern = { meta, Component };

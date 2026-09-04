import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { TextReveal } from "../primitives/TextReveal";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * One number, large, with a caption. The number either counts up or lands
 * whole through a mask — counting is a brand decision (data-led brands count,
 * editorial brands do not).
 */
export const meta: PatternMeta = {
  id: "stat-reveal",
  name: "Stat reveal",
  category: "typography",
  description: "One large figure with a short caption and optional label. Figure counts up from zero or lands whole; a hairline rule underlines it.",
  roles: ["proof", "statement", "detail"],
  compatibleContent: ["stat"],
  energy: "low",
  duration: { min: 45, preferred: 66, max: 100 },
  constraints: { maxWords: 10 },
  avoidWhen: ["no numeric fact is available", "opening the piece", "the number needs more than one sentence of context"],
  options: {
    count: { type: "boolean", default: true, description: "Count up from zero." },
    align: { type: "enum", values: ["left", "center"], default: "left", description: "Block alignment." },
  },
  supportsDark: true,
};

const parseStat = (value: string) => {
  const m = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!m) return null;
  const num = parseFloat(m[2].replace(/,/g, ""));
  if (Number.isNaN(num)) return null;
  const decimals = (m[2].split(".")[1] ?? "").length;
  return { prefix: m[1], num, suffix: m[3], decimals, grouped: m[2].includes(",") };
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, ease, frames, type } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { enter: "hero", exit: "short" });
  const g = ground(dark);
  const count = opt<boolean>(options, meta, "count");
  const align = opt<"left" | "center">(options, meta, "align");

  const stat = content.stat ?? { value: "0", caption: "" };
  const parsed = parseStat(stat.value);
  const m = brand.spacing.margin;
  const style = type("wordmark", brand.typography.scale.hero * 0.9);

  const countT = progress(clock.frame, { delay: frames("micro"), duration: frames("hero") * 1.4, easing: ease("enter") });
  const shown =
    parsed && count
      ? `${parsed.prefix}${(parsed.num * countT).toLocaleString("en-US", {
          minimumFractionDigits: parsed.decimals,
          maximumFractionDigits: parsed.decimals,
          useGrouping: parsed.grouped,
        })}${parsed.suffix}`
      : stat.value;

  const rule = progress(clock.frame, { delay: frames("standard"), duration: frames("standard"), easing: ease("enter") });
  const exitY = interpolate(clock.exit, [0, 1], [0, -40 * brand.motion.amplitude]);

  return (
    <AbsoluteFill style={{ background: g.background }}>
      <div
        style={{
          position: "absolute",
          left: align === "center" ? 0 : m,
          right: align === "center" ? 0 : m,
          top: 0,
          height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: align === "center" ? "center" : "flex-start",
          transform: `translateY(${exitY}px)`,
          opacity: 1 - clock.exit,
        }}
      >
        {content.label ? (
          <div style={{ ...type("label"), color: g.accent, marginBottom: brand.spacing.stack }}>
            <TextReveal lines={[content.label]} role="label" behaviour="clip-wipe" color={g.accent} duration="short" />
          </div>
        ) : null}
        {count && parsed ? (
          <div style={{ ...style, color: g.foreground, whiteSpace: "pre", fontVariantNumeric: "tabular-nums" }}>{shown}</div>
        ) : (
          <TextReveal lines={[stat.value]} role="wordmark" size={Number(style.fontSize)} color={g.foreground} align={align} />
        )}
        <div
          style={{
            height: 1,
            width: Math.min(width - 2 * m, brand.layout.maxWidth * 0.5),
            background: g.rule,
            marginTop: brand.spacing.stack,
            marginBottom: brand.spacing.stack,
            transform: `scaleX(${rule})`,
            transformOrigin: align === "center" ? "center" : "left",
          }}
        />
        <TextReveal
          lines={[stat.caption]}
          role="subhead"
          behaviour="clip-wipe"
          color={g.muted}
          align={align}
          delay={frames("standard")}
        />
      </div>
    </AbsoluteFill>
  );
};

export const StatReveal: Pattern = { meta, Component };

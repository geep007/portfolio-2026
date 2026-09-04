import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { useShotClock } from "../engine/timing";
import { Media } from "../primitives/Media";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * A flat plate with display type cut out of it; media plays through the
 * letters. The words are read first, the work fills them. SVG mask because
 * background-clip:text cannot take video as paint.
 */
export const meta: PatternMeta = {
  id: "knockout-statement",
  name: "Knockout statement",
  category: "typography",
  description:
    "Wordmark-scale type knocked out of a solid plate in the brand ground; a video or image plays inside the letters. The plate can leave (reveal) or the letters can fill solid (end card).",
  roles: ["hook", "statement", "close"],
  compatibleContent: ["short-headline", "single-video", "single-image"],
  energy: "high",
  duration: { min: 60, preferred: 90, max: 130 },
  constraints: { maxWords: 4, maxLines: 3 },
  avoidWhen: ["headline longer than four words", "no strong media available", "brand never uses knockout type"],
  options: {
    end: {
      type: "enum",
      values: ["hold", "plate-leaves", "fill"],
      default: "hold",
      description: "hold keeps the knockout; plate-leaves reveals the media; fill paints the letters solid for an end card.",
    },
    settle: { type: "number", min: 0, max: 0.1, default: 0.04, description: "Scale settle on the type over the shot." },
  },
  supportsDark: true,
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, type, frames, ease } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { enter: "hero", exits: false });
  const g = ground(dark);
  const end = opt<"hold" | "plate-leaves" | "fill">(options, meta, "end");
  const settleAmt = opt<number>(options, meta, "settle");

  const lines = content.headline ?? [];
  const media = content.media?.[0];
  const style = type("wordmark", lines.length > 2 ? brand.typography.scale.hero * 0.72 : undefined);
  const size = Number(style.fontSize);
  const lead = size * Number(style.lineHeight ?? 0.9);
  const cx = width / 2;
  const firstBaseline = height / 2 - ((lines.length - 1) * lead) / 2 + size * 0.34;
  const settle = 1 + settleAmt * (1 - clock.enter);

  const endFrames = frames("hero");
  const endT = interpolate(clock.frame, [clock.duration - endFrames, clock.duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease("exit"),
  });
  const plateY = end === "plate-leaves" ? -endT * height : 0;
  const filled = end === "fill" ? endT : 0;
  const maskId = `knockout-${lines.join("-").replace(/\W/g, "")}`;

  const text = (fill: string, opacity = 1) => (
    <g
      transform={`translate(${cx} 0) scale(${settle}) translate(${-cx} 0)`}
      opacity={opacity}
      style={{ ...style, textTransform: undefined } as React.CSSProperties}
    >
      {lines.map((line, i) => (
        <text
          key={line}
          x={cx}
          y={firstBaseline + i * lead}
          textAnchor="middle"
          fill={fill}
          style={{ fontFamily: style.fontFamily, fontWeight: style.fontWeight, fontSize: size, letterSpacing: style.letterSpacing }}
        >
          {brand.typography.roles.wordmark.casing === "upper" ? line.toUpperCase() : line}
        </text>
      ))}
    </g>
  );

  return (
    <AbsoluteFill style={{ background: g.background }}>
      {media ? <Media media={media} /> : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, transform: `translateY(${plateY}px)` }}
      >
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width={width} height={height} fill="white" />
            {text("black")}
          </mask>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill={g.background} mask={`url(#${maskId})`} />
        {filled > 0 ? text(g.foreground, filled) : null}
      </svg>
    </AbsoluteFill>
  );
};

export const KnockoutStatement: Pattern = { meta, Component };

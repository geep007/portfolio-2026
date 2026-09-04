import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { Media } from "../primitives/Media";
import { LabelFlash } from "../primitives/LabelFlash";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * UI fragments lifted off a flat colour field. The ground does the art
 * direction; the cards just have to be real. Cards sit on fixed cell slots
 * on the brand grid — three arrangements, by count.
 */
export const meta: PatternMeta = {
  id: "floating-cards",
  name: "Floating cards",
  category: "media",
  description: "2–3 landscape UI crops as cards on a flat accent or ink field, arriving staggered with a slow float. Optional label.",
  roles: ["reveal", "detail", "proof"],
  compatibleContent: ["ui-fragments", "image-set"],
  energy: "medium",
  duration: { min: 50, preferred: 70, max: 110 },
  constraints: { minItems: 2, maxItems: 3 },
  avoidWhen: ["media are full pages, not crops", "the brand never uses a full accent field", "more than three fragments"],
  options: {
    field: { type: "enum", values: ["accent", "ink", "ground"], default: "accent", description: "The flat field behind the cards." },
  },
  supportsDark: true,
};

/** Slots in 12×8 cells: [col,row,w,h]. */
const SLOTS: Record<number, [number, number, number, number][]> = {
  2: [[1, 1, 6, 4], [5, 4, 6, 3]],
  3: [[1, 1, 5, 4], [4, 4, 5, 3], [7, 1, 4, 2]],
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, ease, frames, stagger, radius } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { exits: false });
  const field = opt<"accent" | "ink" | "ground">(options, meta, "field");
  const bg =
    field === "accent" ? brand.colors.accent : field === "ink" ? brand.colors.inverse.background : ground(dark).background;
  const cards = (content.media ?? []).slice(0, 3);
  const slots = SLOTS[Math.max(2, cards.length)] ?? SLOTS[3];
  const cellW = width / 12;
  const cellH = height / 8;

  return (
    <AbsoluteFill style={{ background: bg }}>
      {cards.map((c, i) => {
        const [col, row, w, h] = slots[i];
        const t = progress(clock.frame, { delay: i * stagger("loose"), duration: frames("standard"), easing: ease("enter") });
        const float = brand.imagery.drift
          ? interpolate(clock.frame, [0, clock.duration], [0, -14 * brand.motion.amplitude], { extrapolateRight: "clamp" })
          : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: col * cellW,
              top: row * cellH,
              width: w * cellW,
              height: h * cellH,
              borderRadius: radius("medium"),
              overflow: "hidden",
              background: "#fff",
              boxShadow: brand.surfaces.shadow === "none" ? "none" : brand.surfaces.shadowValue,
              opacity: t,
              transform: `translateY(${(1 - t) * 40 * brand.motion.amplitude + float}px) scale(${interpolate(t, [0, 1], [0.96, 1])})`,
            }}
          >
            <Media media={c} />
          </div>
        );
      })}
      {content.label ? (
        <LabelFlash
          text={content.label}
          x={brand.spacing.margin}
          y={height - brand.spacing.safe.y - brand.typography.scale.label * 1.6}
          delay={frames("hero")}
          hold={frames("hero")}
          dark={field !== "ground" || dark}
          variant="bare"
          size={brand.typography.scale.label * 1.25}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const FloatingCards: Pattern = { meta, Component };

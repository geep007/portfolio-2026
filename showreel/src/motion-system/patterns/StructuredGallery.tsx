import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { Media } from "../primitives/Media";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * A row of tall media cards on the brand grid. Two arrivals:
 *   fly   — cards arrive from off-frame on staggered arcs with a little
 *           rotation, then the row drifts (Atomic's web gallery)
 *   rail  — cards clip open from their bottom edge in sequence, no rotation,
 *           no drift; a structured, architectural reveal.
 * The brand vocabulary chooses. Card treatment (radius, shadow, border) is
 * the brand's.
 */
export const meta: PatternMeta = {
  id: "structured-gallery",
  name: "Structured gallery",
  category: "media",
  description:
    "3–5 tall media cards in an evenly spaced row on the brand grid, arriving in sequence and panning slowly inside their frames. Optional label.",
  roles: ["proof", "reveal", "breathe"],
  compatibleContent: ["image-set"],
  energy: "medium",
  duration: { min: 60, preferred: 84, max: 130 },
  constraints: { minItems: 3, maxItems: 5 },
  avoidWhen: ["fewer than three images", "images are landscape UI crops (use floating-cards)", "the beat is a single statement"],
  options: {
    arrival: { type: "enum", values: ["fly", "rail"], default: "rail", description: "Arrival behaviour." },
    pan: { type: "boolean", default: true, description: "Slow pan down each image over the shot." },
  },
  supportsDark: true,
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, ease, frames, stagger, radius } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { exits: false });
  const g = ground(dark);
  const arrival = opt<"fly" | "rail">(options, meta, "arrival");
  const pan = opt<boolean>(options, meta, "pan");

  const items = (content.media ?? []).slice(0, 5);
  const n = Math.max(1, items.length);
  const m = brand.spacing.margin;
  const gap = brand.spacing.gap * 1.6;
  const cardW = (width - 2 * m - gap * (n - 1)) / n;
  const cardH = height - 2 * brand.spacing.safe.y;
  const top = brand.spacing.safe.y;

  const drift = brand.imagery.drift
    ? interpolate(clock.frame, [0, clock.duration], [20, -30], { extrapolateRight: "clamp", easing: ease("travel") })
    : 0;

  return (
    <AbsoluteFill style={{ background: g.background, overflow: "hidden" }}>
      {items.map((it, i) => {
        const delay = i * stagger(arrival === "fly" ? "loose" : "normal");
        const t = progress(clock.frame, { delay, duration: frames("standard"), easing: ease("enter") });
        const x = m + i * (cardW + gap);
        const fromX = arrival === "fly" ? (i % 2 === 0 ? -1 : 1) * 400 * brand.motion.amplitude : 0;
        const fromY = arrival === "fly" ? (i % 2 === 0 ? 1 : -1) * 300 * brand.motion.amplitude : 0;
        const rot = arrival === "fly" ? (1 - t) * (i % 2 === 0 ? -5 : 5) : 0;
        const panT = pan
          ? interpolate(clock.frame, [delay, clock.duration], [0, 0.18], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease("travel"),
            })
          : 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + (1 - t) * fromX,
              top: top + (1 - t) * fromY + drift,
              width: cardW,
              height: cardH,
              overflow: "hidden",
              borderRadius: radius(),
              background: brand.colors.inverse.background,
              border: brand.imagery.treatment === "bordered" ? `${brand.surfaces.border.width}px solid ${g.rule}` : undefined,
              boxShadow: brand.surfaces.shadow === "none" ? "none" : brand.surfaces.shadowValue,
              transform: `rotate(${rot}deg)`,
              opacity: arrival === "fly" ? t : 1,
              clipPath: arrival === "rail" ? `inset(${(1 - t) * 100}% 0 0 0)` : undefined,
            }}
          >
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${-panT * cardH}px)`, height: cardH * 1.4 }}>
              <Media media={{ ...it, position: it.position ?? "center top" }} push={0} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const StructuredGallery: Pattern = { meta, Component };

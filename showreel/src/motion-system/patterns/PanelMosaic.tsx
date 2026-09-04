import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { Media } from "../primitives/Media";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * A composed panel grid. Media and colour plates on the brand's cell grid,
 * each arriving on a stagger and drifting at its own rate.
 *
 * Positioning is by cell, never by pixel. Two fixed arrangements per media
 * count keep the composition deliberate; the agent picks a count, not a layout.
 */
export const meta: PatternMeta = {
  id: "panel-mosaic",
  name: "Panel mosaic",
  category: "layout",
  description:
    "2–5 media panels plus colour plates composed on the brand's column grid; panels arrive staggered and drift. One panel dominates. Optional short text plate.",
  roles: ["hook", "proof", "breathe"],
  compatibleContent: ["image-set", "single-video", "single-image"],
  energy: "medium",
  duration: { min: 50, preferred: 70, max: 120 },
  constraints: { minItems: 1, maxItems: 5, maxWords: 4 },
  avoidWhen: ["a single image should be read on its own", "brand layout is sparse and symmetric", "the beat needs body copy"],
  options: {
    gap: { type: "boolean", default: false, description: "Use the brand gap between panels instead of butting them." },
    plates: { type: "boolean", default: true, description: "Fill leftover cells with accent/ink plates." },
  },
  supportsDark: true,
};

type Cell = { col: number; row: number; w: number; h: number };

/** Arrangements on a 12×8 grid, by media count. Scaled to the brand grid. */
const LAYOUTS: Record<number, { media: Cell[]; plates: Cell[] }> = {
  1: { media: [{ col: 0, row: 0, w: 8, h: 8 }], plates: [{ col: 8, row: 0, w: 4, h: 3 }, { col: 8, row: 5, w: 4, h: 3 }] },
  2: { media: [{ col: 0, row: 0, w: 8, h: 6 }, { col: 8, row: 2, w: 4, h: 4 }], plates: [{ col: 8, row: 0, w: 4, h: 2 }, { col: 0, row: 6, w: 5, h: 2 }] },
  3: {
    media: [{ col: 0, row: 0, w: 8, h: 6 }, { col: 8, row: 2, w: 4, h: 4 }, { col: 5, row: 6, w: 3, h: 2 }],
    plates: [{ col: 8, row: 0, w: 4, h: 2 }, { col: 0, row: 6, w: 5, h: 2 }, { col: 8, row: 6, w: 4, h: 2 }],
  },
  4: {
    media: [{ col: 0, row: 0, w: 7, h: 5 }, { col: 7, row: 0, w: 5, h: 3 }, { col: 7, row: 3, w: 5, h: 5 }, { col: 4, row: 5, w: 3, h: 3 }],
    plates: [{ col: 0, row: 5, w: 4, h: 3 }],
  },
  5: {
    media: [{ col: 0, row: 0, w: 7, h: 5 }, { col: 7, row: 0, w: 5, h: 3 }, { col: 7, row: 3, w: 5, h: 5 }, { col: 4, row: 5, w: 3, h: 3 }, { col: 0, row: 5, w: 4, h: 3 }],
    plates: [],
  },
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, ease, frames, stagger } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { exits: false });
  const g = ground(dark);
  const useGap = opt<boolean>(options, meta, "gap");
  const plates = opt<boolean>(options, meta, "plates");

  const media = (content.media ?? []).slice(0, 5);
  const layout = LAYOUTS[Math.max(1, media.length)];
  const cellW = width / 12;
  const cellH = height / 8;
  const gap = useGap ? brand.spacing.gap : 0;
  const plateColors = [g.accent, brand.colors.secondary, brand.colors.semantic?.plateYellow ?? g.accent];
  const drift = brand.imagery.drift ? 16 * brand.motion.amplitude : 0;

  const panel = (c: Cell, i: number, child: React.ReactNode, bg: string) => {
    const delay = i * stagger("normal");
    const arrive = progress(clock.frame, { delay, duration: frames("standard"), easing: ease("travel") });
    const travel = interpolate(clock.frame, [0, clock.duration], [0, 1], { extrapolateRight: "clamp", easing: ease("travel") });
    const dir = i % 2 === 0 ? -1 : 1;
    return (
      <div
        key={`${c.col}-${c.row}-${i}`}
        style={{
          position: "absolute",
          left: c.col * cellW + gap / 2,
          top: c.row * cellH + gap / 2,
          width: c.w * cellW - gap,
          height: c.h * cellH - gap,
          overflow: "hidden",
          background: bg,
          borderRadius: useGap ? brand.surfaces.radius[brand.surfaces.mediaRadius] : 0,
          transform: `translateY(${(1 - arrive) * 22 * brand.motion.amplitude + dir * drift * travel}px)`,
          opacity: brand.surfaces.clipping === "soft" ? arrive : arrive > 0 ? 1 : 0,
          clipPath: brand.surfaces.clipping === "hard" ? `inset(0 0 ${(1 - arrive) * 100}% 0)` : undefined,
        }}
      >
        {child}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ background: g.background }}>
      {layout.media.map((c, i) =>
        media[i] ? panel(c, i, <Media media={media[i]} duration={clock.duration} />, brand.colors.inverse.background) : null,
      )}
      {plates
        ? layout.plates.map((c, i) => {
            const isText = i === layout.plates.length - 1 && content.headline?.length;
            return panel(
              c,
              media.length + i,
              isText ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: brand.typography.display.stack,
                    fontWeight: brand.typography.roles.headline.weight,
                    fontSize: Math.min(c.h * cellH * 0.4, brand.typography.scale.title * 1.6),
                    letterSpacing: brand.typography.roles.headline.tracking,
                    color: brand.colors.inverse.foreground,
                    padding: `0 ${brand.spacing.gap}px`,
                    textAlign: "center",
                  }}
                >
                  {content.headline!.join(" ")}
                </div>
              ) : null,
              plateColors[i % plateColors.length],
            );
          })
        : null}
    </AbsoluteFill>
  );
};

export const PanelMosaic: Pattern = { meta, Component };

import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { Media } from "../primitives/Media";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * Columns of phone screens. Columns overflow the frame on purpose — a grid
 * that fits reads as a slide, one that overflows reads as a catalogue.
 */
export const meta: PatternMeta = {
  id: "device-grid",
  name: "Device grid",
  category: "product",
  description: "6–18 mobile screenshots in columns that drift in alternating directions; screens arrive on a stagger. Proves responsiveness without saying the word.",
  roles: ["proof", "detail"],
  compatibleContent: ["image-set"],
  energy: "medium",
  duration: { min: 54, preferred: 74, max: 110 },
  constraints: { minItems: 6, maxItems: 18 },
  avoidWhen: ["images are not portrait screens", "fewer than six screens", "the brand has no mobile product"],
  options: {
    columns: { type: "number", min: 3, max: 6, default: 6, description: "Number of columns." },
    drift: { type: "boolean", default: true, description: "Columns travel vertically over the shot." },
  },
  supportsDark: true,
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, ease, frames, stagger, radius } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { exits: false });
  const g = ground(dark);
  const cols = opt<number>(options, meta, "columns");
  const drift = opt<boolean>(options, meta, "drift") && brand.imagery.drift;

  const items = (content.media ?? []).slice(0, 18);
  const perCol = Math.ceil(items.length / cols);
  const gap = brand.spacing.gap;
  const phoneW = Math.min(268, (width - 2 * brand.spacing.margin - gap * (cols - 1)) / cols);
  const phoneH = Math.round(phoneW * (844 / 390));
  const totalW = cols * phoneW + (cols - 1) * gap;
  const startX = (width - totalW) / 2;
  const t = interpolate(clock.frame, [0, clock.duration], [0, 1], { extrapolateRight: "clamp", easing: ease("travel") });
  const travel = drift ? 150 * brand.motion.amplitude : 0;

  return (
    <AbsoluteFill style={{ background: g.background, overflow: "hidden" }}>
      {new Array(cols).fill(0).map((_, ci) => {
        const col = items.slice(ci * perCol, (ci + 1) * perCol);
        const dir = ci % 2 === 0 ? -1 : 1;
        const colH = col.length * phoneH + (col.length - 1) * gap;
        const y = (height - colH) / 2 + dir * travel * (t - 0.5) * 2;
        return (
          <div key={ci} style={{ position: "absolute", left: startX + ci * (phoneW + gap), top: y, width: phoneW }}>
            {col.map((it, ri) => {
              const arrive = progress(clock.frame, {
                delay: ci * stagger("tight") + ri * stagger("tight"),
                duration: frames("standard"),
                easing: ease("enter"),
              });
              return (
                <div
                  key={ri}
                  style={{
                    position: "relative",
                    width: phoneW,
                    height: phoneH,
                    marginBottom: gap,
                    borderRadius: radius("large"),
                    overflow: "hidden",
                    background: brand.colors.inverse.background,
                    boxShadow: brand.surfaces.shadow === "none" ? "none" : brand.surfaces.shadowValue,
                    clipPath: brand.surfaces.clipping === "hard" ? `inset(${(1 - arrive) * 100}% 0 0 0)` : undefined,
                    opacity: brand.surfaces.clipping === "hard" ? 1 : arrive,
                  }}
                >
                  <Media media={it} push={0} />
                </div>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const DeviceGrid: Pattern = { meta, Component };

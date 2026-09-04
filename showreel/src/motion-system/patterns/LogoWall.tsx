import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * Logos as a roster. Two behaviours:
 *   drift — rows travel in opposite directions (a wall in motion)
 *   grid  — a static grid, logos appear in reading order on a stagger
 * Logos are normalised to one silhouette colour so a folder of mixed lockups
 * reads as a system.
 */
export const meta: PatternMeta = {
  id: "logo-wall",
  name: "Logo wall",
  category: "logo",
  description: "4–16 client or partner logos, normalised to one colour, as drifting rows or a static grid appearing in reading order.",
  roles: ["proof", "close"],
  compatibleContent: ["logo-set"],
  energy: "low",
  duration: { min: 48, preferred: 66, max: 100 },
  constraints: { minItems: 4, maxItems: 16 },
  avoidWhen: ["fewer than four logos", "opening the piece", "logos are unreadable at small size"],
  options: {
    behaviour: { type: "enum", values: ["drift", "grid"], default: "grid", description: "Rows in motion, or a grid appearing in order." },
    tags: { type: "boolean", default: false, description: "Show media labels as outlined tags between rows (drift only)." },
    silhouette: { type: "boolean", default: true, description: "Normalise logos to one colour. False keeps their own colours." },
    tiles: { type: "boolean", default: false, description: "Put each logo on a white rounded tile (grid only)." },
  },
  supportsDark: true,
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, ease, frames, stagger, type } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { exits: false });
  const g = ground(dark);
  const behaviour = opt<"drift" | "grid">(options, meta, "behaviour");
  const showTags = opt<boolean>(options, meta, "tags");
  const logos = (content.logos ?? []).slice(0, 16);
  const silhouette = opt<boolean>(options, meta, "silhouette");
  const tiles = opt<boolean>(options, meta, "tiles");
  const filter = silhouette ? (dark ? "brightness(0) invert(1)" : "brightness(0)") : undefined;
  const logoH = 52;

  if (behaviour === "grid") {
    const cols = logos.length <= 4 ? logos.length : logos.length <= 8 ? 4 : 5;
    const rows = Math.ceil(logos.length / cols);
    const m = brand.spacing.margin;
    const cellW = (width - 2 * m) / cols;
    const cellH = Math.min(220, (height - 2 * brand.spacing.safe.y) / rows);
    const top = (height - rows * cellH) / 2;
    return (
      <AbsoluteFill style={{ background: g.background }}>
        {logos.map((l, i) => {
          const t = progress(clock.frame, { delay: i * stagger("tight"), duration: frames("short"), easing: ease("enter") });
          const col = i % cols;
          const row = Math.floor(i / cols);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: m + col * cellW,
                top: top + row * cellH,
                width: cellW,
                height: cellH,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderTop: tiles ? undefined : `1px solid ${g.rule}`,
                padding: tiles ? brand.spacing.gap * 0.4 : 0,
                clipPath: tiles ? undefined : `inset(0 ${(1 - t) * 100}% 0 0)`,
                opacity: tiles ? t : 1,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: tiles ? "#FFFFFF" : undefined,
                  borderRadius: tiles ? brand.surfaces.radius.small : 0,
                  transform: tiles ? `translateY(${(1 - t) * 16 * brand.motion.amplitude}px)` : undefined,
                }}
              >
                <Img src={staticFile(l.src)} style={{ height: logoH, maxWidth: cellW * 0.6, objectFit: "contain", filter, opacity: silhouette ? 0.9 : 1 }} />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }

  // drift: split into up to three rows.
  const rowCount = logos.length <= 5 ? 1 : logos.length <= 10 ? 2 : 3;
  const perRow = Math.ceil(logos.length / rowCount);
  const rowsArr = new Array(rowCount).fill(0).map((_, r) => logos.slice(r * perRow, (r + 1) * perRow));
  const t = interpolate(clock.frame, [0, clock.duration], [0, 1], { extrapolateRight: "clamp", easing: ease("travel") });
  const fade = progress(clock.frame, { duration: frames("short") });
  const rowH = height / (rowCount + 1);

  return (
    <AbsoluteFill style={{ background: g.background, overflow: "hidden" }}>
      {rowsArr.map((row, ri) => {
        const travel = (ri % 2 === 0 ? -1 : 1) * 240 * brand.motion.amplitude;
        const y = rowH * (ri + 1) - logoH / 2;
        return (
          <React.Fragment key={ri}>
            <div
              style={{
                position: "absolute",
                top: y,
                left: 0,
                display: "flex",
                alignItems: "center",
                gap: 190,
                paddingLeft: brand.spacing.margin,
                transform: `translateX(${travel * t}px)`,
                opacity: fade,
              }}
            >
              {row.map((l, i) => (
                <Img key={i} src={staticFile(l.src)} style={{ height: logoH, filter, opacity: 0.92 }} />
              ))}
            </div>
            {showTags ? (
              <div
                style={{
                  position: "absolute",
                  top: y + 120,
                  left: 0,
                  display: "flex",
                  gap: 130,
                  paddingLeft: 40,
                  transform: `translateX(${-travel * 0.85 * t}px)`,
                  opacity: fade,
                }}
              >
                {row.map((l, i) =>
                  l.label ? (
                    <div key={i} style={{ ...type("label"), border: `1.5px solid ${g.muted}`, padding: "12px 20px", color: g.foreground, whiteSpace: "pre" }}>
                      {l.label}
                    </div>
                  ) : null,
                )}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

export const LogoWall: Pattern = { meta, Component };

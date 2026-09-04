import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { Media } from "../primitives/Media";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * A bento of figure plates alternating with photographs on the brand grid.
 * Tiles open in reading order; figures count up once their tile is open.
 */
export const meta: PatternMeta = {
  id: "stat-tiles",
  name: "Stat tiles",
  category: "layout",
  description: "Up to four figures (from `stats`) on plates, alternating with up to four photographs, in a 4×2 bento. Tiles open in reading order; figures count up.",
  roles: ["proof"],
  compatibleContent: ["stat", "image-set"],
  energy: "medium",
  duration: { min: 70, preferred: 100, max: 150 },
  constraints: { minItems: 0, maxItems: 4 },
  avoidWhen: ["fewer than two figures", "the brand has no plate colour"],
  options: {
    count: { type: "boolean", default: true, description: "Count figures up." },
    columns: { type: "number", min: 2, max: 4, default: 4, description: "Tiles per row." },
  },
  supportsDark: false,
};

const parse = (v: string) => {
  const m = v.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!m) return null;
  const num = parseFloat(m[2].replace(/,/g, ""));
  if (Number.isNaN(num)) return null;
  return { prefix: m[1], num, suffix: m[3], decimals: (m[2].split(".")[1] ?? "").length, grouped: m[2].includes(",") };
};

const Component: React.FC<PatternProps> = ({ content, options }) => {
  const { brand, ease, frames, stagger, type, radius } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { exits: false });
  const count = opt<boolean>(options, meta, "count");
  const cols = opt<number>(options, meta, "columns");

  const stats = (content.stats ?? (content.stat ? [content.stat] : [])).slice(0, 4);
  const photos = (content.media ?? []).slice(0, 4);
  const rows = 2;
  const m = brand.spacing.margin * 0.7;
  const gap = brand.spacing.gap * 0.6;
  const tileW = (width - 2 * m - gap * (cols - 1)) / cols;
  const tileH = (height - 2 * brand.spacing.safe.y * 0.7 - gap * (rows - 1)) / rows;
  const top = brand.spacing.safe.y * 0.7;
  const plate = brand.colors.semantic?.plate ?? brand.colors.secondary;

  // Checkerboard: plate on even cells of row 0, odd cells of row 1.
  const cells: { r: number; c: number; kind: "stat" | "photo"; i: number }[] = [];
  let si = 0;
  let pi = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isPlate = (r + c) % 2 === 0;
      if (isPlate && si < stats.length) cells.push({ r, c, kind: "stat", i: si++ });
      else if (!isPlate && pi < photos.length) cells.push({ r, c, kind: "photo", i: pi++ });
      else if (si < stats.length) cells.push({ r, c, kind: "stat", i: si++ });
      else if (pi < photos.length) cells.push({ r, c, kind: "photo", i: pi++ });
    }
  }

  return (
    <AbsoluteFill style={{ background: brand.colors.background }}>
      {cells.map((cell, k) => {
        const delay = k * stagger("normal");
        const open = progress(clock.frame, { delay, duration: frames("standard"), easing: ease("enter") });
        const x = m + cell.c * (tileW + gap);
        const y = top + cell.r * (tileH + gap);
        const s = cell.kind === "stat" ? stats[cell.i] : null;
        const parsed = s ? parse(s.value) : null;
        const countT = progress(clock.frame, { delay: delay + frames("short"), duration: frames("hero") * 1.2, easing: ease("enter") });
        const shown =
          s && parsed && count
            ? `${parsed.prefix}${(parsed.num * countT).toLocaleString("en-US", { minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals, useGrouping: parsed.grouped })}${parsed.suffix}`
            : s?.value;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: tileW,
              height: tileH,
              borderRadius: radius("medium"),
              overflow: "hidden",
              background: cell.kind === "stat" ? plate : brand.colors.inverse.background,
              opacity: brand.surfaces.clipping === "soft" ? open : 1,
              clipPath: brand.surfaces.clipping === "hard" ? `inset(${(1 - open) * 100}% 0 0 0 round ${radius("medium")}px)` : undefined,
              transform: `translateY(${(1 - open) * 24 * brand.motion.amplitude}px)`,
            }}
          >
            {cell.kind === "photo" ? (
              <Media media={photos[cell.i]} push={0} />
            ) : (
              <div style={{ position: "absolute", inset: 0, padding: tileW * 0.09, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ ...type("headline", Math.min(brand.typography.scale.title * 1.5, tileW * 0.19)), color: brand.colors.foreground, fontVariantNumeric: "tabular-nums" }}>
                  {shown}
                </div>
                <div style={{ ...type("label", brand.typography.scale.micro * 1.1), color: brand.colors.muted, opacity: countT }}>{s?.caption}</div>
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const StatTiles: Pattern = { meta, Component };

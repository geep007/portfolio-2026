import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, useShotClock } from "../engine/timing";
import { TextReveal } from "../primitives/TextReveal";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * Numbered vertical panels on a plate. One panel is open and carries the
 * headline + body; the others are narrow rails with a rotated label. Over
 * the shot the open panel can advance so each item gets its moment.
 *
 * Items come from `body`, one per line, formatted "Label | Headline | Body".
 */
export const meta: PatternMeta = {
  id: "pillar-index",
  name: "Pillar index",
  category: "layout",
  description: "2–4 numbered vertical panels on a plate; the open panel shows a headline and body, closed ones a rotated label on a rail. Items from `body`, one per line as `Label | Headline | Body`. Optionally advances through the items.",
  roles: ["section-intro", "detail", "reveal"],
  compatibleContent: ["short-headline", "body-copy"],
  energy: "low",
  duration: { min: 70, preferred: 110, max: 180 },
  constraints: { maxLines: 4 },
  avoidWhen: ["fewer than two items", "body lines are longer than thirty words"],
  options: {
    advance: { type: "boolean", default: true, description: "Move the open panel through the items over the shot." },
    railWidth: { type: "number", min: 40, max: 120, default: 64, description: "Closed rail width in px." },
  },
  supportsDark: false,
};

type Item = { label: string; headline: string; body: string };

const parseItems = (body?: string): Item[] =>
  (body ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 4)
    .map((l) => {
      const [label = "", headline = "", text = ""] = l.split("|").map((s) => s.trim());
      return { label, headline, body: text };
    });

const Component: React.FC<PatternProps> = ({ content, options }) => {
  const { brand, ease, frames, stagger, type, radius } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { exits: false });
  const advance = opt<boolean>(options, meta, "advance");
  const railW = opt<number>(options, meta, "railWidth");

  const items = parseItems(content.body);
  const n = Math.max(1, items.length);
  const m = brand.spacing.margin * 0.9;
  const plateX = m;
  const plateY = brand.spacing.safe.y * 0.8;
  const plateW = width - 2 * m;
  const plateH = height - 2 * plateY;
  const plate = brand.colors.semantic?.plate ?? brand.colors.secondary;

  const plateIn = progress(clock.frame, { duration: frames("standard"), easing: ease("enter") });
  // Which item is open: hold each for an equal share after the entrance.
  const perItem = (clock.duration - frames("hero")) / n;
  const openIdx = advance && n > 1 ? Math.min(n - 1, Math.max(0, Math.floor((clock.frame - frames("hero")) / perItem))) : 0;
  const openStart = frames("hero") + openIdx * perItem;
  const openT = advance ? progress(clock.frame, { delay: openIdx === 0 ? 0 : openStart, duration: frames("standard"), easing: ease("enter") }) : 1;

  const openW = plateW - railW * (n - 1);

  return (
    <AbsoluteFill style={{ background: brand.colors.background }}>
      {content.headline ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: brand.spacing.safe.y * 0.25, textAlign: "center" }}>
          <TextReveal lines={content.headline} role="subhead" align="center" color={brand.colors.foreground} duration="standard" style={{ alignItems: "center" }} />
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: plateX,
          top: plateY + (content.headline ? brand.typography.scale.title * 1.4 : 0),
          width: plateW,
          height: plateH - (content.headline ? brand.typography.scale.title * 1.4 : 0),
          background: plate,
          borderRadius: radius("large"),
          overflow: "hidden",
          opacity: plateIn,
          display: "flex",
        }}
      >
        {items.map((it, i) => {
          const isOpen = i === openIdx;
          const prevOpen = advance && i === openIdx - 1;
          // Widths: the open one takes the remaining width; a just-closed one shrinks.
          const w = isOpen ? interpolate(openT, [0, 1], [railW, openW]) : prevOpen ? interpolate(openT, [0, 1], [openW, railW]) : railW;
          const labelIn = progress(clock.frame, { delay: i * stagger("normal") + frames("short"), duration: frames("short"), easing: ease("enter") });
          return (
            <div
              key={i}
              style={{
                width: w,
                height: "100%",
                position: "relative",
                borderLeft: i > 0 ? `1px solid ${brand.colors.rule}` : undefined,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <div style={{ position: "absolute", top: 28, left: 20, ...type("label"), color: brand.colors.foreground, opacity: labelIn }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              {/* Rotated label on the rail, fades as the panel opens. */}
              <div
                style={{
                  position: "absolute",
                  left: railW / 2,
                  bottom: 24,
                  transform: "rotate(-90deg)",
                  transformOrigin: "left bottom",
                  whiteSpace: "nowrap",
                  ...type("subhead", brand.typography.scale.body * 0.95),
                  color: isOpen ? brand.colors.accent : brand.colors.foreground,
                  opacity: labelIn * (isOpen ? 1 - openT * 0.0 : 1),
                }}
              >
                {it.label}
              </div>
              {isOpen ? (
                <div style={{ position: "absolute", left: railW + 20, top: 28, width: openW - railW - 80, opacity: openT }}>
                  <TextReveal lines={[it.headline]} role="headline" size={brand.typography.scale.title * 1.25} color={brand.colors.foreground} delay={openIdx === 0 ? frames("short") : openStart} duration="standard" />
                  <div style={{ marginTop: brand.spacing.stack * 0.7, maxWidth: openW * 0.62 }}>
                    <TextReveal lines={[it.body]} role="body" behaviour="clip-wipe" color={brand.colors.muted} delay={(openIdx === 0 ? frames("short") : openStart) + frames("short")} duration="standard" style={{ whiteSpace: "normal" }} />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const PillarIndex: Pattern = { meta, Component };

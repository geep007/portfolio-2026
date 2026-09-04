import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { useShotClock } from "../engine/timing";
import { TextReveal, type TextBehaviour } from "../primitives/TextReveal";
import { RuleGrid } from "../primitives/RuleGrid";
import { LabelFlash } from "../primitives/LabelFlash";
import { opt, type Pattern, type PatternMeta, type PatternProps } from "./types";

/**
 * Large display type revealed through a mask, with an optional label above and
 * subhead below. The statement pattern. The brand's `lineBreaking`, alignment
 * and type roles do the styling; the vocabulary picks the behaviour.
 */
export const meta: PatternMeta = {
  id: "headline-reveal",
  name: "Headline reveal",
  category: "typography",
  description:
    "Display headline (1–3 lines) revealed line by line through a mask edge, optional mono label above and subhead below, on a flat ground.",
  roles: ["hook", "statement", "section-intro", "close"],
  compatibleContent: ["short-headline", "brand-statement"],
  energy: "medium",
  duration: { min: 40, preferred: 66, max: 110 },
  constraints: { maxWords: 12, maxLines: 3 },
  avoidWhen: ["body copy is long", "the beat needs to show product", "two headlines are on screen already"],
  options: {
    behaviour: {
      type: "enum",
      values: ["mask-rise", "mask-drop", "clip-wipe", "hard"],
      default: "mask-rise",
      description: "How each line arrives.",
    },
    grid: { type: "boolean", default: false, description: "Draw the brand's rule grid behind the type." },
    align: {
      type: "enum",
      values: ["brand", "left", "center"],
      default: "brand",
      description: "Alignment; `brand` uses the brand's layout alignment.",
    },
    position: {
      type: "enum",
      values: ["center", "lower", "upper"],
      default: "center",
      description: "Vertical placement of the block.",
    },
    emphasisLine: {
      type: "enum",
      values: ["none", "last", "first"],
      default: "none",
      description: "Set one headline line in the brand accent.",
    },
  },
  supportsDark: true,
};

const Component: React.FC<PatternProps> = ({ content, dark = false, options }) => {
  const { brand, ground, frames, stagger } = useBrand();
  const { width, height } = useVideoConfig();
  const clock = useShotClock(brand, { enter: "standard", exit: "short" });
  const g = ground(dark);

  const behaviour = opt<TextBehaviour>(options, meta, "behaviour");
  const grid = opt<boolean>(options, meta, "grid");
  const alignOpt = opt<"brand" | "left" | "center">(options, meta, "align");
  const position = opt<"center" | "lower" | "upper">(options, meta, "position");
  const align: "left" | "center" =
    alignOpt === "brand" ? (brand.layout.alignment === "center" ? "center" : "left") : alignOpt;

  const lines = content.headline ?? [];
  const emphasis = opt<"none" | "last" | "first">(options, meta, "emphasisLine");
  const lineColors = lines.map((_, i) =>
    (emphasis === "last" && i === lines.length - 1 && lines.length > 1) || (emphasis === "first" && i === 0)
      ? g.accent
      : undefined,
  );
  const m = brand.spacing.margin;
  const labelDelay = 0;
  const headDelay = content.label ? stagger("loose") : 0;
  const subDelay = headDelay + lines.length * stagger("normal") + frames("short");

  return (
    <AbsoluteFill style={{ background: g.background }}>
      {grid ? <RuleGrid dark={dark} inset /> : null}
      <div
        style={{
          position: "absolute",
          left: align === "center" ? 0 : m,
          right: align === "center" ? 0 : m,
          top: position === "upper" ? m : position === "lower" ? undefined : 0,
          bottom: position === "lower" ? m : position === "upper" ? undefined : 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: position === "center" ? "center" : "flex-start",
          alignItems: align === "center" ? "center" : "flex-start",
          height: position === "center" ? height : undefined,
          maxWidth: align === "center" ? width : brand.layout.maxWidth,
        }}
      >
        {content.label ? (
          <div style={{ position: "relative", height: brand.typography.scale.label * 1.4, marginBottom: brand.spacing.stack }}>
            <LabelFlash text={content.label} x={0} y={0} delay={labelDelay} dark={dark} variant="bare" />
          </div>
        ) : null}
        <TextReveal
          lines={lines}
          behaviour={behaviour}
          role="headline"
          align={align}
          color={g.foreground}
          lineColors={lineColors}
          delay={headDelay}
          exit={clock.exit}
        />
        {content.subhead ? (
          <div style={{ marginTop: brand.spacing.stack }}>
            <TextReveal
              lines={[content.subhead]}
              behaviour={behaviour === "hard" ? "hard" : "clip-wipe"}
              role="subhead"
              align={align}
              color={g.muted}
              delay={subDelay}
              exit={clock.exit}
            />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const HeadlineReveal: Pattern = { meta, Component };

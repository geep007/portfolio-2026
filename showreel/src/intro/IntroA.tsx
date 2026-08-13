import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, LINEAR_ISH, OUT } from "../theme";
import { resolveFonts } from "../typography";
import { loadFonts } from "../fonts";
import { Clip } from "../hero/components/Clip";
import { MaskText } from "../components/MaskText";
import { defaultIntroProps, type IntroProps } from "./introLayout";

loadFonts();

/**
 * Intro A — "Plate".
 *
 * One editorial split: type block left, a single tall panel of real footage
 * right. It replaces the bento grid because a grid asks the viewer to choose
 * where to look in the first second and gives every project the same weight;
 * here the headline is read first and the work is one confident object beside
 * it. Same composed-panel register as the rest of the reel, one panel instead
 * of six.
 *
 * The panel wipes up from its own bottom edge — a mask edge, not a fade — so
 * the arrival reads as typesetting rather than as a transition effect.
 */

const PANEL = { x: 904, y: 96, w: 956, h: 888 };
const MARGIN = 140;

export const IntroA: React.FC<Partial<IntroProps>> = (input) => {
  const p: IntroProps = { ...defaultIntroProps, ...input };
  const frame = useCurrentFrame();
  const d = p.durationInFrames;
  const type = resolveFonts(p);

  const panel = interpolate(frame, [6, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const rule = interpolate(frame, [2, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const chip = interpolate(frame, [46, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // The whole left column drifts a few pixels over the shot so the frame is
  // never completely static once the panel has landed.
  const drift = interpolate(frame, [0, d], [0, -14], {
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  return (
    <AbsoluteFill style={{ background: p.ground }}>
      {/* Accent bar behind the panel's outer edge: the only piece of brand
          colour in the frame, and it is what stops the right side reading as a
          floating screenshot. */}
      <div
        style={{
          position: "absolute",
          // Outside the panel's right edge, not under it — a stripe in the
          // margin, so it registers as a system mark rather than a shadow.
          left: PANEL.x + PANEL.w + 16,
          top: PANEL.y + 54,
          width: 30,
          height: PANEL.h - 54,
          background: p.accent,
          transform: `translateY(${(1 - panel) * 70}px)`,
          opacity: panel,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: PANEL.x,
          top: PANEL.y,
          width: PANEL.w,
          height: PANEL.h,
          overflow: "hidden",
          background: COLOR.groundDark,
          // Opens from its bottom edge upward.
          clipPath: `inset(${(1 - panel) * 100}% 0 0 0)`,
        }}
      >
        {/* Cropped past the client's own centred headline. At a looser crop the
            capture's copy ("50,000 Sq. Ft. …") sits beside my headline and
            reads as my claim — the panel has to be craft, not someone else's
            sentence. */}
        <Clip
          src={p.clip}
          startFrom={p.clipStartFrom}
          duration={d}
          from={1.16}
          to={1.28}
          origin="55% 38%"
          objectPosition="55% 38%"
        />
      </div>

      {/* Left column */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 300,
          width: PANEL.x - MARGIN - 120,
          transform: `translateY(${drift}px)`,
        }}
      >
        <div
          style={{
            fontFamily: type.mono,
            fontSize: 22,
            letterSpacing: type.monoTracking,
            textTransform: "uppercase",
            color: p.accent,
            clipPath: `inset(0 ${(1 - rule) * 100}% 0 0)`,
            marginBottom: 26,
          }}
        >
          {p.eyebrow}
        </div>

        <div
          style={{
            height: 1,
            background: COLOR.inkRule,
            transform: `scaleX(${rule})`,
            transformOrigin: "left center",
            marginBottom: 44,
          }}
        />

        <MaskText
          lines={p.headline}
          delay={12}
          stagger={6}
          duration={26}
          lineHeight={0.94}
          style={{
            fontFamily: type.display,
            fontWeight: type.displayWeight,
            fontSize: 148,
            letterSpacing: type.displayTracking,
            color: p.ink,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 890,
          fontFamily: type.mono,
          fontSize: 22,
          letterSpacing: type.monoTracking,
          textTransform: "uppercase",
          color: COLOR.onDark,
          background: p.accent,
          padding: "9px 14px",
          clipPath: `inset(0 ${(1 - chip) * 100}% 0 0)`,
        }}
      >
        {p.chip}
      </div>
    </AbsoluteFill>
  );
};

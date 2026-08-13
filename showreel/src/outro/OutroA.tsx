import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, OUT } from "../theme";
import { resolveFonts } from "../typography";
import { KnockoutPlate } from "../components/KnockoutPlate";
import { loadFonts } from "../fonts";
import { BrowserWindow } from "../hero/components/BrowserWindow";
import { Clip } from "../hero/components/Clip";
import { defaultOutroProps, type OutroProps } from "./outroLayout";

loadFonts();

/**
 * Outro A — "Knockout close", the intro run backwards.
 *
 * The reel is still playing inside browser chrome when the accent plate rises
 * over it and lands with the wordmark cut out, so the last thing on screen is
 * the name with the work still moving inside it. Contact and CTA land on the
 * plate afterwards.
 *
 * It ends holding the same plate the intro opens on, which is what lets the
 * hero loop: the final frame and frame 0 are the same object.
 */

const PLATE_IN = 10;

export const OutroA: React.FC<Partial<OutroProps>> = (input) => {
  const p: OutroProps = { ...defaultOutroProps, ...input };
  const frame = useCurrentFrame();
  const d = p.durationInFrames;
  const type = resolveFonts(p);

  const lines = p.wordmark.map((l) => l.toUpperCase());

  // The plate rises from below and lands. Nothing fades — the edge is the move.
  const rise = interpolate(frame, [PLATE_IN, PLATE_IN + 20], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // Keeps drifting after it lands, so the letters keep revealing new footage
  // instead of turning into a still.
  const settle = interpolate(frame, [PLATE_IN + 20, d], [1, 1.035], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // The window is already margined — the reel hands over mid-shot, it does not
  // start a new one.
  const margin = interpolate(frame, [0, PLATE_IN + 10], [64, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const line = interpolate(frame, [PLATE_IN + 26, PLATE_IN + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const chip = interpolate(frame, [PLATE_IN + 38, PLATE_IN + 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: p.ground }}>
      <BrowserWindow
        url={p.url}
        left={margin}
        top={margin}
        width={1920 - margin * 2}
        height={1080 - margin * 2}
        dark
      >
        <Clip
          src={p.clip}
          startFrom={p.clipStartFrom}
          duration={d}
          // Pushes in as the plate arrives, so what shows inside the letters is
          // the tightest, most abstract part of the clip.
          from={1.04}
          to={1.45}
          // Aimed at the striped circle, right of centre — at frame centre the
          // capture is flat cream and the letters stop reading as a window.
          origin="72% 22%"
          objectPosition="72% 22%"
        />
      </BrowserWindow>

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${rise * 100}%)`,
        }}
      >
        <KnockoutPlate
          lines={lines}
          maskId="outro-a-knockout"
          plate={p.accent}
          size={250}
          settle={settle}
          fontFamily={type.display}
          fontWeight={type.displayWeight}
          letterSpacing={type.knockoutTracking}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 812,
            textAlign: "center",
            fontFamily: type.display,
            fontWeight: type.displayMediumWeight,
            fontSize: 40,
            letterSpacing: "-0.02em",
            color: COLOR.onDark,
            opacity: line,
            transform: `translateY(${(1 - line) * 14}px)`,
          }}
        >
          {p.line}
        </div>

        <div
          style={{
            position: "absolute",
            left: 140,
            top: 900,
            fontFamily: type.mono,
            fontSize: 22,
            letterSpacing: type.monoTracking,
            textTransform: "uppercase",
            color: COLOR.onDark,
            border: `1px solid ${COLOR.onDarkRule}`,
            padding: "9px 14px",
            clipPath: `inset(0 ${(1 - chip) * 100}% 0 0)`,
          }}
        >
          {p.chip}
        </div>

        <div
          style={{
            position: "absolute",
            right: 140,
            top: 900,
            fontFamily: type.mono,
            fontSize: 22,
            letterSpacing: type.monoTracking,
            textTransform: "uppercase",
            color: COLOR.onDark,
            padding: "9px 0",
            clipPath: `inset(0 0 0 ${(1 - chip) * 100}%)`,
          }}
        >
          {p.contact}
        </div>
      </div>
    </AbsoluteFill>
  );
};

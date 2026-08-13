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
 * Outro B — "Knockout fills".
 *
 * Same plate arrival as A, then the letters close: the work drains out of them
 * and they paint solid, leaving a flat end card — mark, line, contact, CTA.
 * The type never moves while it happens, so the change reads as the window
 * shutting rather than as a cross-fade between two frames.
 *
 * Use this one where the reel is the last thing in a deck or an email and has
 * to end on a card someone can screenshot. A is the one to use when the reel
 * loops, because it ends on moving work.
 */

const PLATE_IN = 10;
const FILL = 44;

export const OutroB: React.FC<Partial<OutroProps>> = (input) => {
  const p: OutroProps = { ...defaultOutroProps, ...input };
  const frame = useCurrentFrame();
  const d = p.durationInFrames;
  const type = resolveFonts(p);

  const lines = p.wordmark.map((l) => l.toUpperCase());

  const rise = interpolate(frame, [PLATE_IN, PLATE_IN + 20], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const settle = interpolate(frame, [PLATE_IN + 20, d], [1, 1.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // Letters paint solid. Slower than the plate arrival: the fill is the last
  // beat of the reel and a quick one reads as a glitch.
  const filled = interpolate(frame, [FILL, FILL + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const margin = interpolate(frame, [0, PLATE_IN + 10], [64, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const line = interpolate(frame, [FILL + 10, FILL + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const chip = interpolate(frame, [FILL + 22, FILL + 32], [0, 1], {
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
          from={1.04}
          to={1.45}
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
          maskId="outro-b-knockout"
          plate={p.accent}
          size={250}
          settle={settle}
          filled={filled}
          fill={p.ground}
          fontFamily={type.display}
          fontWeight={type.displayWeight}
          letterSpacing={type.knockoutTracking}
        />

        {/* Rule, then the line under it: the card is set, not floated. */}
        <div
          style={{
            position: "absolute",
            left: 660,
            right: 660,
            top: 790,
            height: 1,
            background: COLOR.onDarkRule,
            transform: `scaleX(${line})`,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 820,
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
            top: 950,
            fontFamily: type.mono,
            fontSize: 22,
            letterSpacing: type.monoTracking,
            textTransform: "uppercase",
            color: p.accent,
            background: p.ground,
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
            top: 950,
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

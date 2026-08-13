import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, LINEAR_ISH, OUT } from "../theme";
import { resolveFonts } from "../typography";
import { KnockoutPlate } from "../components/KnockoutPlate";
import { loadFonts } from "../fonts";
import { BrowserWindow } from "../hero/components/BrowserWindow";
import { Clip } from "../hero/components/Clip";
import { defaultIntroProps, type IntroProps } from "./introLayout";

loadFonts();

/**
 * Intro B — "Knockout".
 *
 * The footage is only visible through the letters: a flat accent plate covers
 * the frame with the headline cut out of it, so the first thing on screen is
 * the words, and the work is what fills them. The plate then leaves upward and
 * the clip settles into a margined panel.
 *
 * Two reasons this exists next to A. It is legible at a glance at half width,
 * which a six-panel grid is not; and it earns the full-bleed moment instead of
 * opening on one, because the frame is already type before it is footage.
 *
 * Knockout is done with an SVG mask (white keeps, black cuts) rather than
 * `background-clip: text`, which cannot take a video as its paint.
 */

const PLATE_OUT = 44;

export const IntroB: React.FC<Partial<IntroProps>> = (input) => {
  const p: IntroProps = { ...defaultIntroProps, ...input };
  const frame = useCurrentFrame();
  const d = p.durationInFrames;
  const type = resolveFonts(p);

  const lines = p.headline.map((l) => l.toUpperCase());
  const SIZE = 250;

  // Slow settle on the type while the plate holds — the letters are a window,
  // so moving them moves the footage inside them.
  const settle = interpolate(frame, [0, PLATE_OUT], [0.965, 1], {
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const exit = interpolate(frame, [PLATE_OUT, PLATE_OUT + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // Lands composed rather than full-bleed: the clip pulls into a margin as the
  // plate clears, so the shot ends in the reel's panel register.
  const margin = interpolate(frame, [PLATE_OUT + 6, PLATE_OUT + 34], [0, 64], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const chip = interpolate(frame, [PLATE_OUT + 20, PLATE_OUT + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const eyebrow = interpolate(frame, [4, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  return (
    <AbsoluteFill style={{ background: p.ground }}>
      {/* The clip lands inside browser chrome. Without it the capture's own
          headline fills the frame under my chip and reads as my claim; with a
          URL bar on it, it is plainly a client's site. */}
      <BrowserWindow
        url={p.url}
        left={margin}
        top={margin}
        width={1920 - margin * 2}
        height={1080 - margin * 2}
        drawFrom={PLATE_OUT + 8}
        dark
      >
        <Clip
          src={p.clip}
          startFrom={p.clipStartFrom}
          duration={d}
          // Opens tight so the site's own type is unreadable texture inside the
          // letters, then pulls back once the plate is gone.
          from={1.7}
          to={1.04}
          // Cropped above the capture's caption band. Left centred, the client's
          // serif caption runs straight through the letters as readable foreign
          // type and the knockout stops reading as texture.
          origin="50% 26%"
          objectPosition="50% 26%"
        />
      </BrowserWindow>

      {/* The plate. Everything on it leaves together, in one piece. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${-exit * 100}%)`,
        }}
      >
        <KnockoutPlate
          lines={lines}
          maskId="intro-b-knockout"
          plate={p.accent}
          size={SIZE}
          settle={settle}
          fontFamily={type.display}
          fontWeight={type.displayWeight}
          letterSpacing={type.knockoutTracking}
        />

        <div
          style={{
            position: "absolute",
            left: 140,
            top: 120,
            fontFamily: type.mono,
            fontSize: 22,
            letterSpacing: type.monoTracking,
            textTransform: "uppercase",
            color: COLOR.onDark,
            clipPath: `inset(0 ${(1 - eyebrow) * 100}% 0 0)`,
          }}
        >
          {p.eyebrow}
        </div>
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

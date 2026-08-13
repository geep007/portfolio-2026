import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../../theme";
import { MaskText } from "../../components/MaskText";
import { DotField, Sparkles } from "./DotField";

/**
 * The playful ending.
 *
 * Same positioning line as the clean version, but the mascot is above it and its
 * eyes follow the cursor — so the last thing on screen looks back at the viewer,
 * then watches it leave.
 *
 * The artwork's pupils are fixed, so each eyeball is covered with a disc of the
 * illustration's own cream and a live pupil is drawn on top. These constants are
 * measured from the source file (1280x720) rather than guessed: covering the
 * wrong spot leaves a second set of eyes showing through.
 */

const ART_W = 1280;
const EYE = { lx: 640, rx: 795, y: 250, ball: 56, pupil: 26 };
const CREAM = "#FCF5EA";

const Pupil: React.FC<{
  cx: number;
  cy: number;
  ball: number;
  pupil: number;
  lookX: number;
  lookY: number;
  blink: number;
}> = ({ cx, cy, ball, pupil, lookX, lookY, blink }) => {
  const dx = lookX - cx;
  const dy = lookY - cy;
  const dist = Math.max(1, Math.hypot(dx, dy));
  // Travels a fraction of the eyeball so it never rides over the lens ring.
  const reach = Math.min(ball - pupil - 4, dist * 0.06);
  const px = cx + (dx / dist) * reach;
  const py = cy + (dy / dist) * reach;

  return (
    <>
      {/* Cover the artwork's fixed pupil with the illustration's own cream. */}
      <circle cx={cx} cy={cy} r={ball} fill={CREAM} />
      <circle cx={px} cy={py} r={pupil} fill={COLOR.cobalt} />
      <circle
        cx={px + pupil * 0.3}
        cy={py - pupil * 0.34}
        r={pupil * 0.26}
        fill={CREAM}
      />
      {/* Lid drops from the top of the eyeball. */}
      {blink > 0.01 ? (
        <>
          <rect
            x={cx - ball}
            y={cy - ball}
            width={ball * 2}
            height={ball * 2 * blink}
            fill={CREAM}
          />
          <line
            x1={cx - ball * 0.86}
            y1={cy - ball + ball * 2 * blink}
            x2={cx + ball * 0.86}
            y2={cy - ball + ball * 2 * blink}
            stroke={COLOR.cobalt}
            strokeWidth={7}
            strokeLinecap="round"
          />
        </>
      ) : null}
    </>
  );
};

export const MascotTitle: React.FC<{
  duration: number;
  title: {
    x: number;
    y: number;
    align: "left" | "center" | "right";
    name: string;
    line1: string;
    line2: string;
  };
  pattern?: boolean;
  cursorX: number;
  cursorY: number;
}> = ({ duration, title, pattern = true, cursorX, cursorY }) => {
  const frame = useCurrentFrame();

  const rise = interpolate(frame, [6, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // Two placed blinks. Random ones can land on the last frame and start the
  // loop on shut eyes.
  const blinkAt = (at: number) =>
    interpolate(frame, [at, at + 3, at + 6], [0, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const blink = Math.max(blinkAt(18), blinkAt(Math.max(28, duration - 12)));

  // Drops in and settles.
  const bob = interpolate(frame, [0, 16, 24, 32], [-90, 12, -5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  const appear = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const artW = 620;
  const scale = artW / ART_W;
  const artX = (1920 - artW) / 2;
  const artY = 90 + bob;

  const eyeCommon = {
    ball: EYE.ball * scale,
    pupil: EYE.pupil * scale,
    lookX: cursorX,
    lookY: cursorY,
    blink,
  };

  const block: React.CSSProperties =
    title.align === "center"
      ? { left: 0, right: 0 }
      : title.align === "right"
        ? { right: Math.max(0, 1920 - title.x - 1200), width: 1200 }
        : { left: title.x, width: 1200 };

  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {pattern ? (
        <DotField x={cursorX} y={cursorY} presence={0.85} opacity={0.9} />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: artX,
          top: artY,
          width: artW,
          opacity: appear,
        }}
      >
        <Img src={staticFile("media/mascot/mascot-full.png")} style={{ width: artW }} />
      </div>

      {/* Live eyes, sitting exactly on the artwork's own. */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: appear }}>
        <Pupil cx={artX + EYE.lx * scale} cy={artY + EYE.y * scale} {...eyeCommon} />
        <Pupil cx={artX + EYE.rx * scale} cy={artY + EYE.y * scale} {...eyeCommon} />
      </svg>

      <Sparkles
        frame={frame}
        points={[
          { x: artX + artW - 40, y: artY + 70, size: 34, delay: 18 },
          { x: artX + 40, y: artY + 250, size: 24, delay: 26 },
        ]}
      />

      <div style={{ position: "absolute", top: title.y + 300, textAlign: title.align, ...block }}>
        <MaskText
          lines={[title.name]}
          delay={4}
          duration={22}
          lineHeight={1.0}
          align={title.align}
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 96,
            letterSpacing: "-0.05em",
            color: COLOR.ink,
            textAlign: title.align,
          }}
        />
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT.display,
            fontWeight: 500,
            fontSize: 42,
            letterSpacing: "-0.03em",
            color: COLOR.ink,
            textAlign: title.align,
            clipPath: `inset(0 ${(1 - rise) * 100}% 0 0)`,
          }}
        >
          {title.line1}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT.mono,
            fontSize: 26,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: COLOR.cobalt,
            textAlign: title.align,
            clipPath: `inset(0 ${(1 - rise) * 100}% 0 0)`,
          }}
        >
          {title.line2}
        </div>
      </div>
    </AbsoluteFill>
  );
};

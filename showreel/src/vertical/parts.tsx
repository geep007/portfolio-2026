import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLOR, LINEAR_ISH, OUT } from "../theme";
import type { FontPairing } from "../typography";

/**
 * The 9:16 furniture. The landscape reel's Grid, Shutter and Frame are all
 * written against literal 1920x1080 coordinates, so they are re-cut here at
 * 1080x1920 rather than parameterised — one set of hardcoded numbers per aspect
 * is easier to read than one component that has to be told which world it is in.
 */

export const W = 1080;
export const H = 1920;
export const MARGIN = 72;

export const VGrid: React.FC<{ color?: string; drawIn?: number }> = ({
  color = COLOR.gridDark,
  drawIn = 0,
}) => {
  const frame = useCurrentFrame();
  const X = [MARGIN, 342, 612, 882, W - MARGIN];
  const Y = [240, 660, 1080, 1500];

  const p = (i: number) =>
    drawIn === 0
      ? 1
      : interpolate(frame, [i * 2, i * 2 + drawIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
        });

  return (
    <AbsoluteFill>
      {X.map((x, i) => (
        <div
          key={`v${x}`}
          style={{
            position: "absolute",
            left: x,
            top: 0,
            width: 1,
            height: H,
            background: color,
            transform: `scaleY(${p(i)})`,
            transformOrigin: "top",
          }}
        />
      ))}
      {Y.map((y, i) => (
        <div
          key={`h${y}`}
          style={{
            position: "absolute",
            left: 0,
            top: y,
            width: W,
            height: 1,
            background: color,
            transform: `scaleX(${p(i + X.length)})`,
            transformOrigin: "left",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/**
 * Top-edge progress bar.
 *
 * It is the one piece here that exists for the platform rather than for the
 * work: a feed viewer decides whether to stay in the first second, and a bar
 * that visibly has an end tells them how much is left. Accent on a hairline
 * track, full width, no label.
 */
export const ProgressBar: React.FC<{
  frame: number;
  total: number;
  accent: string;
}> = ({ frame, total, accent }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: W,
      height: 8,
      background: "rgba(250,250,250,0.14)",
    }}
  >
    <div
      style={{
        width: W,
        height: 8,
        background: accent,
        transform: `scaleX(${Math.min(1, frame / total)})`,
        transformOrigin: "left",
      }}
    />
  </div>
);

/**
 * Bottom mono strip, running continuously left.
 *
 * Constant motion at the bottom edge means the frame is never fully still even
 * on a held shot, which is what stops a paused-looking frame reading as a
 * buffering video mid-scroll.
 *
 * The wrap is done in percent of the row's own width, with the row holding two
 * identical copies: -50% is therefore exactly one copy, whatever the string
 * turns out to measure. Shifting by a hardcoded pixel figure instead leaves a
 * seam the moment the copy or the typeface changes, and both are props here.
 */
export const Ticker: React.FC<{
  text: string;
  font: string;
  tracking: string;
  color: string;
  /** Percent of one copy travelled per frame. */
  speed?: number;
}> = ({ text, font, tracking, color, speed = 0.28 }) => {
  const frame = useCurrentFrame();
  const unit = `${text} `.repeat(3);
  const shift = (frame * speed) % 50;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 44,
        overflow: "hidden",
        height: 30,
        whiteSpace: "pre",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          width: "max-content",
          transform: `translateX(${-shift}%)`,
          fontFamily: font,
          fontSize: 22,
          letterSpacing: tracking,
          textTransform: "uppercase",
          color,
        }}
      >
        <span>{unit}</span>
        <span>{unit}</span>
      </div>
    </div>
  );
};

/** The project panel: cobalt title bar, dark body, opens from its bottom edge. */
export const VPanel: React.FC<{
  title: string;
  left: number;
  top: number;
  width: number;
  height: number;
  accent: string;
  font: string;
  tracking: string;
  delay?: number;
  children: React.ReactNode;
}> = ({
  title,
  left,
  top,
  width,
  height,
  accent,
  font,
  tracking,
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const bar = 52;

  const open = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        background: COLOR.groundDark,
        overflow: "hidden",
        // Wipes up from its own bottom edge — a mask edge, not a fade.
        clipPath: `inset(${(1 - open) * 100}% 0 0 0)`,
      }}
    >
      <div
        style={{
          height: bar,
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            fontFamily: font,
            fontSize: 20,
            letterSpacing: tracking,
            textTransform: "uppercase",
            color: COLOR.onDark,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 14,
            letterSpacing: "0.16em",
            color: COLOR.onDark,
          }}
        >
          — □ ✕
        </div>
      </div>
      <div style={{ position: "relative", height: height - bar }}>{children}</div>
    </div>
  );
};

/**
 * Device stills in a row, arriving one after another.
 *
 * Used only on the responsive beat, because "it works on mobile" is the one
 * claim a single desktop panel cannot show.
 */
export const PhoneRow: React.FC<{
  files: string[];
  top: number;
  delay?: number;
  accent: string;
}> = ({ files, top, delay = 0, accent }) => {
  const frame = useCurrentFrame();
  const width = 268;
  const height = 420;
  const gap = 32;
  const total = files.length * width + (files.length - 1) * gap;
  const startX = (W - total) / 2;

  return (
    <>
      {files.map((file, i) => {
        const t = interpolate(
          frame,
          [delay + i * 6, delay + i * 6 + 20],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT },
        );
        return (
          <div
            key={file}
            style={{
              position: "absolute",
              left: startX + i * (width + gap),
              top,
              width,
              height,
              overflow: "hidden",
              background: COLOR.groundDark,
              border: `1px solid ${accent}`,
              transform: `translateY(${(1 - t) * 40}px)`,
              opacity: t,
            }}
          >
            <Img
              src={staticFile(`media/phones/${file}`)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "50% 0%",
              }}
            />
          </div>
        );
      })}
    </>
  );
};

/**
 * Mono readout that types on a character at a time.
 *
 * The spec line is the only place the reel makes a technical claim, so it gets
 * the one motion in the piece that reads as a machine writing rather than as a
 * designer animating.
 */
export const Readout: React.FC<{
  text: string;
  delay: number;
  font: string;
  tracking: string;
  color: string;
  left: number;
  top: number;
  size?: number;
}> = ({ text, delay, font, tracking, color, left, top, size = 24 }) => {
  const frame = useCurrentFrame();
  const chars = Math.round(
    interpolate(frame, [delay, delay + 26], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: LINEAR_ISH,
    }),
  );

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        fontFamily: font,
        fontSize: size,
        letterSpacing: tracking,
        textTransform: "uppercase",
        color,
        whiteSpace: "pre",
      }}
    >
      {text.slice(0, chars)}
      <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>_</span>
    </div>
  );
};

/** Convenience: the mono style used by every label in the vertical reel. */
export const monoStyle = (
  type: FontPairing,
  color: string,
  size = 24,
): React.CSSProperties => ({
  fontFamily: type.mono,
  fontSize: size,
  letterSpacing: type.monoTracking,
  textTransform: "uppercase",
  color,
});

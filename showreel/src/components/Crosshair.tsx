import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../theme";

/**
 * Inspection marker. Snaps to a point, throws measurement ticks, prints its own
 * coordinate. This is the reel's whole argument in one device: we look at the
 * specific pixel, and we can tell you which one it was.
 */
export const Crosshair: React.FC<{
  x: number;
  y: number;
  /** Where it flies in from, so the snap has direction. */
  fromX?: number;
  fromY?: number;
  delay?: number;
  size?: number;
  readout?: string;
  dark?: boolean;
}> = ({ x, y, fromX, fromY, delay = 0, size = 132, readout, dark = false }) => {
  const frame = useCurrentFrame();
  const accent = dark ? COLOR.cobaltOnDark : COLOR.cobalt;

  const snap = interpolate(frame, [delay, delay + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  const cx = interpolate(snap, [0, 1], [fromX ?? x, x]);
  const cy = interpolate(snap, [0, 1], [fromY ?? y, y]);

  // Ticks extend after the box has landed, never during — one idea at a time.
  const tick = interpolate(frame, [delay + 10, delay + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  const label = interpolate(frame, [delay + 18, delay + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const half = size / 2;
  const corner = 18;

  const cornerStyle = (
    top: boolean,
    left: boolean,
  ): React.CSSProperties => ({
    position: "absolute",
    width: corner,
    height: corner,
    [top ? "top" : "bottom"]: -1,
    [left ? "left" : "right"]: -1,
    borderTop: top ? `2px solid ${accent}` : undefined,
    borderBottom: top ? undefined : `2px solid ${accent}`,
    borderLeft: left ? `2px solid ${accent}` : undefined,
    borderRight: left ? undefined : `2px solid ${accent}`,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: cx - half,
        top: cy - half,
        width: size,
        height: size,
        opacity: snap,
      }}
    >
      <div style={cornerStyle(true, true)} />
      <div style={cornerStyle(true, false)} />
      <div style={cornerStyle(false, true)} />
      <div style={cornerStyle(false, false)} />

      {/* Measurement ticks reaching out of the box on the horizontal axis. */}
      <div
        style={{
          position: "absolute",
          top: half - 1,
          left: -80,
          width: 72,
          height: 1,
          background: accent,
          transform: `scaleX(${tick})`,
          transformOrigin: "right",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: half - 1,
          right: -80,
          width: 72,
          height: 1,
          background: accent,
          transform: `scaleX(${tick})`,
          transformOrigin: "left",
        }}
      />

      {readout ? (
        <div
          style={{
            position: "absolute",
            top: size + 12,
            left: 0,
            fontFamily: FONT.mono,
            fontSize: 17,
            letterSpacing: "0.06em",
            // Solid chip, not bare type: the readout has to sit on top of live
            // screenshots and stay legible without dodging their content.
            background: accent,
            color: COLOR.onDark,
            padding: "5px 9px",
            opacity: label,
            whiteSpace: "pre",
          }}
        >
          {readout}
        </div>
      ) : null}
    </div>
  );
};

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../theme";

/**
 * The deck's OS window. Cobalt title bar means "this is mine" (CASE-STUDY-SYSTEM.md §2),
 * so every project screen in the reel wears one.
 *
 * The window opens by scaling from 0.96 and un-clipping from the bottom — the media
 * inside is already moving, so the frame has to arrive without competing with it.
 */
export const Frame: React.FC<{
  title: string;
  left: number;
  top: number;
  width: number;
  height: number;
  delay?: number;
  children: React.ReactNode;
}> = ({ title, left, top, width, height, delay = 0, children }) => {
  const frame = useCurrentFrame();
  const bar = 52;

  const open = interpolate(frame, [delay, delay + 24], [0, 1], {
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
        border: `1px solid ${COLOR.cobalt}`,
        background: COLOR.groundDark,
        opacity: open,
        transform: `scale(${interpolate(open, [0, 1], [0.965, 1])})`,
        transformOrigin: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: bar,
          background: COLOR.cobalt,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 20,
            letterSpacing: "0.04em",
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
      <div
        style={{
          position: "absolute",
          top: bar,
          left: 0,
          width,
          height: height - bar,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

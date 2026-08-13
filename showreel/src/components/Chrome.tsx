import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../theme";

/**
 * The deck's chrome bar: name left, section right, at top:24 / left+right:40.
 * It persists across the whole reel so the cuts read as pages of one document.
 */
export const Chrome: React.FC<{ right: string; dark?: boolean }> = ({
  right,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const color = dark ? COLOR.onDarkMuted : COLOR.inkMuted;
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const base: React.CSSProperties = {
    position: "absolute",
    top: 24,
    fontFamily: FONT.mono,
    fontSize: 20,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color,
    opacity,
  };

  return (
    <AbsoluteFill>
      <div style={{ ...base, left: 40 }}>Geet Parmar</div>
      <div style={{ ...base, right: 40 }}>{right}</div>
    </AbsoluteFill>
  );
};

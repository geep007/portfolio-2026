import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, OUT } from "../theme";

/**
 * Cut cover: four cobalt bands sweep across in a 6-frame stagger, then leave.
 * Crossfades would soften the edit; this keeps every cut mechanical, which is the
 * register the whole reel is arguing for.
 */
const BANDS = 4;

export const Shutter: React.FC<{ duration?: number }> = ({ duration = 14 }) => {
  const frame = useCurrentFrame();
  const bandHeight = 1080 / BANDS;

  return (
    <AbsoluteFill>
      {new Array(BANDS).fill(0).map((_, i) => {
        const stagger = i * 2;
        const inT = interpolate(frame, [stagger, stagger + 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
        });
        const outT = interpolate(
          frame,
          [duration - 8 + stagger, duration - 2 + stagger],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT },
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * bandHeight,
              left: 0,
              width: 1920,
              height: bandHeight + 1,
              background: COLOR.cobalt,
              clipPath: `inset(0 ${(1 - inT) * 100}% 0 ${outT * 100}%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

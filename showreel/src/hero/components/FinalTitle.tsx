import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Grid } from "../../components/Grid";
import { DotField } from "./DotField";
import { MaskText } from "../../components/MaskText";
import { COLOR, FONT, OUT } from "../../theme";

/**
 * One positioning statement, held long enough to read at hero size, then handed
 * back to the top of the loop.
 *
 * No CTA baked in — the surrounding site UI owns that, so the frame stays
 * usable whatever the page puts underneath it.
 */
export const FinalTitle: React.FC<{
  duration: number;
  title: {
    x: number;
    y: number;
    align: "left" | "center" | "right";
    name: string;
    line1: string;
    line2: string;
  };
  /** The portfolio's dot field, lit by the cursor as it leaves. */
  pattern?: boolean;
  cursorX?: number;
  cursorY?: number;
}> = ({ duration, title, pattern = false, cursorX = -9999, cursorY = -9999 }) => {
  const frame = useCurrentFrame();

  const rule = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // The last handful of frames lift toward the opening shot's brightness so the
  // loop point is a continuation rather than a jump.
  const handoff = interpolate(frame, [duration - 8, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Grid drawIn={16} />
      {pattern ? (
        <DotField x={cursorX} y={cursorY} presence={0.8} opacity={0.85} />
      ) : null}

      {/*
        Centre ignores `x` and centres in the frame, which is also the safest
        option for a hero that gets cropped on narrow viewports.
      */}
      <div
        style={{
          position: "absolute",
          top: title.y,
          textAlign: title.align,
          ...(title.align === "center"
            ? { left: 0, right: 0 }
            : title.align === "right"
              ? { right: Math.max(0, 1920 - title.x - 1200), width: 1200 }
              : { left: title.x, width: 1200 }),
        }}
      >
        <MaskText
          lines={[title.name]}
          delay={2}
          duration={22}
          lineHeight={1.0}
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 116,
            letterSpacing: "-0.05em",
            color: COLOR.ink,
            textAlign: title.align,
          }}
          align={title.align}
        />

        <div
          style={{
            marginTop: 30,
            fontFamily: FONT.display,
            fontWeight: 500,
            fontSize: 52,
            letterSpacing: "-0.03em",
            color: COLOR.ink,
            clipPath: `inset(0 ${(1 - rule) * 100}% 0 0)`,
          }}
        >
          {title.line1}
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: FONT.mono,
            fontSize: 30,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: COLOR.cobalt,
            clipPath: `inset(0 ${(1 - rule) * 100}% 0 0)`,
          }}
        >
          {title.line2}
        </div>
      </div>

      <AbsoluteFill
        style={{ background: COLOR.groundLight, opacity: handoff * 0.35 }}
      />
    </AbsoluteFill>
  );
};

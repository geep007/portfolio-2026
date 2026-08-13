import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../theme";

/**
 * Bottom-left project block: wordmark in the deck's `{PROJECT` form, plus one
 * mono spec line. The spec line wipes in on a clip rather than typing — typing
 * costs frames this cut does not have.
 */
export const SpecLabel: React.FC<{
  project: string;
  spec: string;
  meta?: string;
  delay?: number;
  dark?: boolean;
  left?: number;
  bottom?: number;
  width?: number;
}> = ({
  project,
  spec,
  meta,
  delay = 0,
  dark = false,
  left = 120,
  bottom = 96,
  width = 900,
}) => {
  const frame = useCurrentFrame();
  const accent = dark ? COLOR.cobaltOnDark : COLOR.cobalt;
  const fg = dark ? COLOR.onDark : COLOR.ink;
  const muted = dark ? COLOR.onDarkMuted : COLOR.inkMuted;
  const rule = dark ? COLOR.onDarkRule : COLOR.inkRule;

  const name = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  const wipe = interpolate(frame, [delay + 8, delay + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <div style={{ position: "absolute", left, bottom, width }}>
      <div style={{ overflow: "hidden", height: 68, display: "flex", alignItems: "flex-end" }}>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 60,
            lineHeight: 1,
            letterSpacing: "-0.045em",
            color: fg,
            transform: `translateY(${(1 - name) * 100}%)`,
            whiteSpace: "pre",
          }}
        >
          <span style={{ color: accent }}>{"{"}</span>
          {project}
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: rule,
          marginTop: 18,
          marginBottom: 14,
          transform: `scaleX(${wipe})`,
          transformOrigin: "left",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 28,
          alignItems: "baseline",
          clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 21,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: accent,
            whiteSpace: "pre",
          }}
        >
          {spec}
        </div>
        {meta ? (
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 21,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: muted,
              whiteSpace: "pre",
            }}
          >
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
};

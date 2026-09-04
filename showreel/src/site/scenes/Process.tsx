import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../../theme";
import { Capture, Punch } from "../parts";
import type { SiteProps } from "../siteLayout";

/**
 * How the work gets made: the real process section drifting behind three chips
 * that snap in on the beat.
 */
export const Process: React.FC<{ process: SiteProps["process"] }> = ({ process }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Punch>
        <Capture
          src="process.png"
          width={1920}
          height={1396}
          position={0.35}
          duration={process.duration}
          travel={140}
          from={1.04}
          to={1.12}
        />
      </Punch>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 84,
          display: "flex",
          justifyContent: "center",
          gap: 22,
        }}
      >
        {process.steps.map((step, i) => {
          const start = 6 + i * 8;
          const t = interpolate(frame, [start, start + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: OUT,
          });
          return (
            <div
              key={step}
              style={{
                background: i === process.steps.length - 1 ? COLOR.cobalt : COLOR.groundLight,
                color: i === process.steps.length - 1 ? COLOR.onDark : COLOR.ink,
                border: `1px solid ${COLOR.inkRule}`,
                borderRadius: 999,
                padding: "18px 34px",
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                opacity: t,
                transform: `translateY(${(1 - t) * 26}px) scale(${0.94 + t * 0.06})`,
              }}
            >
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 20,
                  letterSpacing: "0.12em",
                  opacity: 0.7,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily: FONT.display,
                  fontWeight: 500,
                  fontSize: 36,
                  letterSpacing: "-0.02em",
                }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

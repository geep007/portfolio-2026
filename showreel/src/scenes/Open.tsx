import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chrome } from "../components/Chrome";
import { Grid } from "../components/Grid";
import { MaskText } from "../components/MaskText";
import { COLOR, FONT, OUT } from "../theme";

/**
 * 1.4s. The claim, stated once, on the deck's own grid. Everything after this is evidence.
 */
export const Open: React.FC = () => {
  const frame = useCurrentFrame();

  const ruleWipe = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Grid drawIn={20} />
      <Chrome right="Showreel 2026" />

      <div style={{ position: "absolute", left: 120, top: 340 }}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 26,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: COLOR.cobalt,
            marginBottom: 26,
            clipPath: `inset(0 ${(1 - ruleWipe) * 100}% 0 0)`,
          }}
        >
          {"// 04 PROJECTS · 01 STANDARD"}
        </div>

        <MaskText
          lines={["Every pixel", "accounted for."]}
          delay={6}
          stagger={6}
          duration={26}
          lineHeight={0.98}
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 132,
            letterSpacing: "-0.05em",
            color: COLOR.ink,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 900,
          height: 1,
          background: COLOR.inkRule,
          transform: `scaleX(${ruleWipe})`,
          transformOrigin: "left",
        }}
      />
    </AbsoluteFill>
  );
};

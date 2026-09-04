import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Grid } from "../../components/Grid";
import { MaskText } from "../../components/MaskText";
import { COLOR, FONT, OUT } from "../../theme";
import type { SiteProps } from "../siteLayout";

/**
 * The site's cobalt slab, held for two and a half seconds. Full stop, one idea,
 * no capture behind it — the only shot in the cut that is pure type.
 */
export const Thesis: React.FC<{ thesis: SiteProps["thesis"] }> = ({ thesis }) => {
  const frame = useCurrentFrame();
  const rule = interpolate(frame, [6, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.cobalt }}>
      <Grid dark />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 120 }}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 22,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLOR.onDarkMuted,
            marginBottom: 28,
            opacity: rule,
          }}
        >
          {thesis.tag}
        </div>
        <MaskText
          lines={thesis.lines}
          delay={2}
          stagger={6}
          duration={20}
          lineHeight={0.98}
          style={{
            fontFamily: FONT.display,
            fontWeight: 500,
            fontSize: 128,
            letterSpacing: "-0.035em",
            color: COLOR.onDark,
          }}
        />
        <div
          style={{
            marginTop: 40,
            height: 6,
            width: `${rule * 420}px`,
            background: COLOR.onDark,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

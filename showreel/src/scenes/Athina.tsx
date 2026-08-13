import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Chrome } from "../components/Chrome";
import { Crosshair } from "../components/Crosshair";
import { Frame } from "../components/Frame";
import { Grid } from "../components/Grid";
import { SpecLabel } from "../components/SpecLabel";
import { COLOR, FONT, OUT } from "../theme";

/**
 * 2.4s. The generative visuals are live p5.js sketches, not flattened exports —
 * the one fact about this build that a studio actually cares about.
 */
export const Athina: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 72], [1.06, 1.3], {
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const noteWipe = interpolate(frame, [22, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundDark }}>
      <Grid dark drawIn={16} />
      <Chrome right="03 / 04 · Athina.ai" dark />

      <Frame
        title="athina.ai"
        left={760}
        top={190}
        width={1040}
        height={620}
        delay={0}
      >
        <AbsoluteFill>
          <Img
            src={staticFile("media/athina-hero.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale})`,
              transformOrigin: "46% 55%",
            }}
          />
        </AbsoluteFill>
      </Frame>

      <Crosshair
        x={1290}
        y={560}
        fromX={1560}
        fromY={760}
        delay={16}
        size={132}
        readout="p5.js SKETCH · RUNNING LIVE"
        dark
      />

      <div style={{ position: "absolute", left: 120, top: 300, width: 560 }}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 26,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: COLOR.cobaltOnDark,
            marginBottom: 22,
          }}
        >
          {"// THE DETAIL"}
        </div>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 500,
            fontSize: 44,
            lineHeight: 1.14,
            letterSpacing: "-0.03em",
            color: COLOR.onDark,
            clipPath: `inset(0 ${(1 - noteWipe) * 100}% 0 0)`,
          }}
        >
          Generative visuals built as live sketches, not flattened exports.
        </div>
      </div>

      <SpecLabel
        project="ATHINA.AI"
        spec="Webflow · GSAP · p5.js"
        meta="Live in under 7 days"
        delay={8}
        dark
      />
    </AbsoluteFill>
  );
};

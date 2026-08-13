import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Chrome } from "../components/Chrome";
import { Frame } from "../components/Frame";
import { Grid } from "../components/Grid";
import { SpecLabel } from "../components/SpecLabel";
import { COLOR, FONT, LINEAR_ISH, OUT } from "../theme";

/**
 * 1.53s. The whole page, top to bottom, in one unbroken pan — the only shot in the
 * reel that shows scale rather than a single moment. Deliberately the fastest scene.
 */
export const Grow: React.FC = () => {
  const frame = useCurrentFrame();

  const panWidth = 700;
  // Source is 1400 x 6052, so at 700px wide the page is 3026px tall.
  const pageHeight = 3026;
  const y = interpolate(frame, [0, 46], [-60, -(pageHeight - 748) + 40], {
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  const noteWipe = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Grid drawIn={12} />
      <Chrome right="04 / 04 · EdelGive GROW+" />

      <Frame
        title="thegrowfund.org"
        left={120}
        top={140}
        width={panWidth}
        height={800}
        delay={0}
      >
        <Img
          src={staticFile("media/grow-fullpage.jpg")}
          style={{
            position: "absolute",
            left: 0,
            top: y,
            width: panWidth,
          }}
        />
      </Frame>

      <div style={{ position: "absolute", left: 920, top: 300, width: 700 }}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 26,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: COLOR.cobalt,
            marginBottom: 22,
          }}
        >
          {"// THE WHOLE PAGE"}
        </div>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 500,
            fontSize: 46,
            lineHeight: 1.14,
            letterSpacing: "-0.03em",
            color: COLOR.ink,
            clipPath: `inset(0 ${(1 - noteWipe) * 100}% 0 0)`,
          }}
        >
          Built with LastBench Studio. They designed it. I owned the build.
        </div>
      </div>

      <SpecLabel
        project="GROW+"
        spec="Webflow · CMS"
        meta="Studio partnership"
        delay={6}
        left={920}
        bottom={180}
        width={700}
      />
    </AbsoluteFill>
  );
};

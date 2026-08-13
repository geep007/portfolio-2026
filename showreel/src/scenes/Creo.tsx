import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Chrome } from "../components/Chrome";
import { Crosshair } from "../components/Crosshair";
import { Frame } from "../components/Frame";
import { Grid } from "../components/Grid";
import { SpecLabel } from "../components/SpecLabel";
import { COLOR, FONT, OUT } from "../theme";

/**
 * 2.53s. A measured push into the logo mark. The window sits left so the cut out of
 * Surreal (window right) reads as a page turn rather than a dissolve.
 */
export const Creo: React.FC = () => {
  const frame = useCurrentFrame();

  // Origin is the mark itself: 798/1600 x, 195/945 y in the source screenshot.
  const scale = interpolate(frame, [0, 76], [1.08, 1.42], {
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const noteWipe = interpolate(frame, [24, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Grid drawIn={16} />
      <Chrome right="02 / 04 · Creo Agency" />

      <Frame
        title="creo.agency"
        left={120}
        top={140}
        width={1040}
        height={620}
        delay={0}
      >
        <AbsoluteFill>
          <Img
            src={staticFile("media/creo-hero.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              transform: `scale(${scale})`,
              transformOrigin: "50% 21%",
            }}
          />
        </AbsoluteFill>
      </Frame>

      <Crosshair
        x={640}
        y={340}
        fromX={420}
        fromY={190}
        delay={18}
        size={124}
        readout="PRELOADER → HERO, ONE TIMELINE"
      />

      <div style={{ position: "absolute", left: 1240, top: 300, width: 560 }}>
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
          {"// THE HARD PART"}
        </div>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 500,
            fontSize: 44,
            lineHeight: 1.14,
            letterSpacing: "-0.03em",
            color: COLOR.ink,
            clipPath: `inset(0 ${(1 - noteWipe) * 100}% 0 0)`,
          }}
        >
          Native interactions couldn&rsquo;t sequence it. Rebuilt as one GSAP
          timeline.
        </div>
      </div>

      <SpecLabel
        project="CREO AGENCY"
        spec="Webflow · GSAP · CMS"
        meta="They designed · I built"
        delay={10}
      />
    </AbsoluteFill>
  );
};

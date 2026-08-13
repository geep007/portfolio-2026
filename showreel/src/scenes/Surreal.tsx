import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Chrome } from "../components/Chrome";
import { Crosshair } from "../components/Crosshair";
import { Frame } from "../components/Frame";
import { Grid } from "../components/Grid";
import { SpecLabel } from "../components/SpecLabel";
import { COLOR, FONT, LINEAR_ISH, OUT } from "../theme";

/**
 * 2.73s. Real captured scroll motion from the live site — not a mockup, not a
 * generated plate. The crosshair lands on the reveal edge while it is actually moving.
 */
export const Surreal: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow continuous push. It never settles, so the cut out of the scene has energy.
  const push = interpolate(frame, [0, 82], [1.0, 1.06], {
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  const noteWipe = interpolate(frame, [26, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundDark }}>
      <Grid dark drawIn={16} />
      <Chrome right="01 / 04 · Surreal" dark />

      <Frame
        title="letsgetsurreal.com"
        left={760}
        top={150}
        width={1040}
        height={660}
        delay={0}
      >
        <AbsoluteFill style={{ transform: `scale(${push})` }}>
          <OffthreadVideo
            src={staticFile("media/surreal-hero.mp4")}
            startFrom={24}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      </Frame>

      <Crosshair
        x={1180}
        y={520}
        fromX={1420}
        fromY={300}
        delay={20}
        size={150}
        readout="SCROLL-LINKED · 0.00 → 1.00"
        dark
      />

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 200,
          width: 560,
          fontFamily: FONT.mono,
          fontSize: 22,
          lineHeight: 1.55,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: COLOR.onDarkMuted,
          clipPath: `inset(0 ${(1 - noteWipe) * 100}% 0 0)`,
        }}
      >
        {"Hero reveal tied to scroll progress,\nnot to a timer."}
      </div>

      <SpecLabel
        project="SURREAL"
        spec="Webflow · GSAP"
        meta="Scroll-linked reveal"
        delay={12}
        dark
      />
    </AbsoluteFill>
  );
};

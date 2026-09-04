import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SiteFrame } from "../../components/SiteFrame";
import { COLOR, FONT, LINEAR_ISH, OUT } from "../../theme";
import { Capture, Punch } from "../parts";
import type { SiteProps } from "../siteLayout";

const STILL = 42;

/** The site's own header reel, inside the site's own browser frame. */
const Live: React.FC<{ hero: SiteProps["hero"]; url: string; duration: number }> = ({
  hero,
  url,
  duration,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [1.06, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  return (
    <SiteFrame url={url}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile("site/site-reel.mp4")}
          startFrom={hero.clipStartFrom}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 44,
          bottom: 44,
          background: COLOR.groundLight,
          padding: "18px 26px",
          display: "flex",
          gap: 18,
          alignItems: "center",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 999, background: COLOR.cobalt }} />
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: COLOR.ink,
          }}
        >
          {hero.eyebrow}
        </div>
      </div>
    </SiteFrame>
  );
};

/**
 * Landing. The real hero first — its own type, its own spacing — then straight
 * into the reel it plays, so the headline is read before it starts moving.
 */
export const Hero: React.FC<{
  hero: SiteProps["hero"];
  url: string;
}> = ({ hero, url }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [8, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Sequence durationInFrames={STILL} layout="none">
        <Punch>
          <Capture
            src="hero.png"
            width={1920}
            height={960}
            duration={STILL}
            from={1.0}
            to={1.05}
            travel={26}
          />
          {/* A cobalt rule wipes in under the headline the site already sets —
              the only mark added to the hero, because the page sets its own. */}
          <div
            style={{
              position: "absolute",
              left: 64,
              top: 424,
              height: 6,
              width: `${wipe * 560}px`,
              background: COLOR.cobalt,
            }}
          />
        </Punch>
      </Sequence>
      <Sequence from={STILL} durationInFrames={hero.duration - STILL} layout="none">
        <Punch amount={0.05}>
          <Live hero={hero} url={url} duration={hero.duration - STILL} />
        </Punch>
      </Sequence>
    </AbsoluteFill>
  );
};

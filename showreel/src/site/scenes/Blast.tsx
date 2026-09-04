import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLOR, FONT, OUT } from "../../theme";
import { Counter, Tag } from "../parts";
import type { SiteProps } from "../siteLayout";

/** Native size of public/site/page-strip.png. */
const STRIP_W = 1440;
const STRIP_H = 7575;
const SCALE = 1920 / STRIP_W;
const RENDERED = STRIP_H * SCALE;

/**
 * The whole page in four seconds. One continuous scroll from the hero to the
 * footer — fast out, hard landing — with the depth counted off in mono. It is
 * the shot that says "there is a lot here" without narrating any of it.
 */
export const Blast: React.FC<{ blast: SiteProps["blast"] }> = ({ blast }) => {
  const frame = useCurrentFrame();
  const travel = RENDERED - 1080;

  const t = interpolate(frame, [0, blast.duration - 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  const y = -travel * 0.92 * t;

  // Motion blur substitute: the strip stretches slightly while it is quickest.
  const speed = interpolate(frame, [0, 10, blast.duration - 30], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight, overflow: "hidden" }}>
      <Img
        src={staticFile("site/page-strip.png")}
        style={{
          width: 1920,
          height: RENDERED,
          transform: `translateY(${y}px) scaleY(${1 + speed * 0.012})`,
          transformOrigin: "center top",
        }}
      />

      {/* Scroll rail, right edge. */}
      <div
        style={{
          position: "absolute",
          right: 28,
          top: 120,
          bottom: 120,
          width: 4,
          background: COLOR.inkRule,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: `${t * 82}%`,
            width: 4,
            height: "18%",
            background: COLOR.cobalt,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 56,
          bottom: 56,
          background: COLOR.groundLight,
          padding: "20px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Tag delay={4}>{blast.label}</Tag>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <Counter to={10036} duration={blast.duration - 20} suffix="PX" />
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 500,
              fontSize: 34,
              letterSpacing: "-0.02em",
              color: COLOR.ink,
            }}
          >
            {blast.kicker.join("  ")}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

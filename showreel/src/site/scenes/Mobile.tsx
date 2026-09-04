import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Grid } from "../../components/Grid";
import { MaskText } from "../../components/MaskText";
import { COLOR, FONT, LINEAR_ISH, OUT } from "../../theme";
import { Tag } from "../parts";
import type { SiteProps } from "../siteLayout";

/** Native size of public/site/page-mobile.png (430 css px wide, captured at 2x). */
const SRC_W = 860;
const SRC_H = 18000;

const PHONE_W = 384;
const PHONE_H = 816;

/**
 * Same build, small screen. The phone runs the same capture the desktop shots
 * come from, so the claim is shown rather than stated.
 */
export const Mobile: React.FC<{ mobile: SiteProps["mobile"] }> = ({ mobile }) => {
  const frame = useCurrentFrame();
  const rendered = (PHONE_W / SRC_W) * SRC_H;

  const t = interpolate(frame, [0, mobile.duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });
  const rise = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Grid />
      <AbsoluteFill
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 120,
        }}
      >
        <div style={{ width: 620 }}>
          <Tag delay={2}>{mobile.label}</Tag>
          <div style={{ height: 20 }} />
          <MaskText
            lines={mobile.lines}
            delay={4}
            stagger={5}
            duration={18}
            lineHeight={1.0}
            style={{
              fontFamily: FONT.display,
              fontWeight: 500,
              fontSize: 78,
              letterSpacing: "-0.03em",
              color: COLOR.ink,
            }}
          />
        </div>
        <div
          style={{
            width: PHONE_W,
            height: PHONE_H,
            borderRadius: 44,
            border: `2px solid #0E0E0E`,
            overflow: "hidden",
            background: COLOR.groundLight,
            transform: `translateY(${(1 - rise) * 60}px)`,
            opacity: rise,
          }}
        >
          <Img
            src={staticFile("site/page-mobile.png")}
            style={{
              width: PHONE_W,
              height: rendered,
              transform: `translateY(${-(rendered - PHONE_H) * 0.42 * t}px)`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

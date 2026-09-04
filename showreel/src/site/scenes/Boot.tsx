import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Grid } from "../../components/Grid";
import { COLOR, FONT, OUT } from "../../theme";
import { Tag } from "../parts";
import type { SiteProps } from "../siteLayout";

/**
 * Cold open. The URL types itself and the address bar draws around it — the
 * cut starts where a visit starts, so everything after it reads as the site
 * rather than as a video about the site.
 */
export const Boot: React.FC<{ boot: SiteProps["boot"] }> = ({ boot }) => {
  const frame = useCurrentFrame();

  const chars = Math.round(
    interpolate(frame, [4, boot.duration - 20], [0, boot.type.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const typed = boot.type.slice(0, chars);
  const caret = frame % 16 < 9 && chars < boot.type.length ? 1 : 0;

  const barWidth = interpolate(frame, [0, 16], [0, 980], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  const load = interpolate(frame, [boot.duration - 22, boot.duration - 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Grid />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <Tag delay={2}>{boot.tag}</Tag>
        <div
          style={{
            width: barWidth,
            height: 96,
            borderRadius: 999,
            border: `1px solid ${COLOR.inkRule}`,
            background: "#F1F3FF",
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "0 34px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: COLOR.cobalt,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 38,
              letterSpacing: "0.06em",
              color: COLOR.ink,
              whiteSpace: "pre",
            }}
          >
            {typed}
            <span style={{ opacity: caret, color: COLOR.cobalt }}>█</span>
          </div>
        </div>
        {/* Page-load hairline: it fills, then the site slams in on the cut. */}
        <div style={{ width: 980, height: 3, background: COLOR.inkRule }}>
          <div style={{ width: `${load * 100}%`, height: 3, background: COLOR.cobalt }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { MaskText } from "../../components/MaskText";
import { COLOR, FONT, OUT } from "../../theme";
import { Capture, Punch } from "../parts";
import type { SiteProps } from "../siteLayout";

/**
 * The end card is the site's own contact section, dimmed, with the wordmark and
 * the URL over it. The last thing on screen is the address the cut opened on.
 */
export const Close: React.FC<{ close: SiteProps["close"]; url: string }> = ({
  close,
  url,
}) => {
  const frame = useCurrentFrame();

  const dim = interpolate(frame, [0, 20], [0.2, 0.86], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  const pill = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundDark }}>
      <Punch amount={0.04}>
        <Capture
          src="contact.png"
          width={1920}
          height={1413}
          position={0.55}
          duration={close.duration}
          travel={50}
          from={1.06}
          to={1.0}
        />
      </Punch>
      <AbsoluteFill style={{ background: COLOR.groundDark, opacity: dim }} />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", gap: 26 }}
      >
        <MaskText
          lines={[close.wordmark.join(" ")]}
          delay={2}
          duration={20}
          align="center"
          style={{
            fontFamily: FONT.display,
            fontWeight: 500,
            fontSize: 132,
            letterSpacing: "-0.035em",
            color: COLOR.onDark,
          }}
        />
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 24,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLOR.onDarkMuted,
            opacity: pill,
          }}
        >
          {close.line}
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 18,
            background: COLOR.cobalt,
            color: COLOR.onDark,
            borderRadius: 999,
            padding: "20px 38px",
            opacity: pill,
            transform: `translateY(${(1 - pill) * 20}px)`,
            fontFamily: FONT.display,
            fontWeight: 500,
            fontSize: 34,
            letterSpacing: "-0.01em",
          }}
        >
          {close.cta}
          <span style={{ fontFamily: FONT.mono, fontSize: 22, letterSpacing: "0.1em" }}>
            {url}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

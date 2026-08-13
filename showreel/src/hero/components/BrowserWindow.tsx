import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../../theme";

/**
 * Thin-bordered browser shell. Deliberately quieter than the capabilities deck's
 * cobalt OS window: in this reel the window is a container for the work, not a
 * piece of branding, so it stays a hairline and a URL.
 */
export const BrowserWindow: React.FC<{
  url: string;
  left: number;
  top: number;
  width: number;
  height: number;
  /** Frame within the shot when the chrome starts drawing itself on. */
  drawFrom?: number;
  dark?: boolean;
  dim?: number;
  scale?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  url,
  left,
  top,
  width,
  height,
  drawFrom = 0,
  dark = true,
  dim = 0,
  scale = 1,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const bar = 46;

  const draw = interpolate(frame, [drawFrom, drawFrom + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const border = dark ? "rgba(250,250,250,0.22)" : "rgba(51,51,51,0.2)";
  const barBg = dark ? "#141414" : "#EDEDED";
  const barFg = dark ? "rgba(250,250,250,0.6)" : "rgba(51,51,51,0.55)";

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        border: `1px solid ${border}`,
        background: dark ? COLOR.groundDark : COLOR.groundLight,
        overflow: "hidden",
        boxShadow: "0 40px 90px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      <div
        style={{
          height: bar,
          background: barBg,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 16px",
          clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: barFg,
              opacity: 0.5,
            }}
          />
        ))}
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 15,
            letterSpacing: "0.04em",
            color: barFg,
            marginLeft: 8,
          }}
        >
          {url}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: bar,
          left: 0,
          width,
          height: height - bar,
          overflow: "hidden",
        }}
      >
        {children}
        {dim > 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `rgba(10,10,10,${dim})`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

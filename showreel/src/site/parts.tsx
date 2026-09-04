import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLOR, FONT, LINEAR_ISH, OUT } from "../theme";

/** Mono chip in the site's own `( 00 )  LABEL` form. */
export const Tag: React.FC<{
  children: React.ReactNode;
  delay?: number;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, dark = false, style }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 22,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: dark ? COLOR.cobaltOnDark : COLOR.cobalt,
        opacity: t,
        transform: `translateY(${(1 - t) * 12}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * A real capture, panned. `position` is where in the tall image the shot sits
 * (0 top, 1 bottom); the push is what stops a screenshot reading as a still.
 */
export const Capture: React.FC<{
  src: string;
  /** Native size of the file, so the pan maths is exact. */
  width: number;
  height: number;
  position?: number;
  travel?: number;
  from?: number;
  to?: number;
  duration: number;
  style?: React.CSSProperties;
}> = ({
  src,
  width,
  height,
  position = 0,
  travel = 90,
  from = 1.02,
  to = 1.09,
  duration,
  style,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });
  const drift = interpolate(frame, [0, duration], [0, -travel], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  // The image is laid out at canvas width; anything taller than 1080 is panned
  // to the requested position rather than squashed.
  const rendered = (1920 / width) * height;
  const offset = -(Math.max(0, rendered - 1080) * position);

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: COLOR.groundLight, ...style }}>
      <Img
        src={staticFile(`site/${src}`)}
        style={{
          width: 1920,
          height: rendered,
          objectFit: "cover",
          transform: `translateY(${offset + drift}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      />
    </AbsoluteFill>
  );
};

/** Cut punch: a 4-frame scale snap on the shot, so every edit lands hard. */
export const Punch: React.FC<{ children: React.ReactNode; amount?: number }> = ({
  children,
  amount = 0.035,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 7], [1 + amount, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>{children}</AbsoluteFill>
  );
};

/** Mono readout that counts to a number — used for the scroll depth. */
export const Counter: React.FC<{
  to: number;
  duration: number;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ to, duration, suffix = "", style }) => {
  const frame = useCurrentFrame();
  const value = Math.round(
    interpolate(frame, [0, duration], [0, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: OUT,
    }),
  );

  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 22,
        letterSpacing: "0.12em",
        color: COLOR.cobalt,
        ...style,
      }}
    >
      {value.toLocaleString("en-US")}
      {suffix}
    </div>
  );
};

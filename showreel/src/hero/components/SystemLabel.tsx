import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../../theme";

/**
 * Interface feedback, not titling. Appears for well under a second, sits at a
 * readable size (the hero gets viewed at half width, so nothing critical is set
 * as texture), and never explains what the visual already proves.
 */
export const SystemLabel: React.FC<{
  text: string;
  x: number;
  y: number;
  delay?: number;
  hold?: number;
  variant?: "chip" | "bare";
  dark?: boolean;
  size?: number;
}> = ({
  text,
  x,
  y,
  delay = 0,
  hold = 20,
  variant = "chip",
  dark = true,
  size = 24,
}) => {
  const frame = useCurrentFrame();

  const inT = interpolate(frame, [delay, delay + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  const outT = interpolate(frame, [delay + hold, delay + hold + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  const shown = inT * (1 - outT);

  if (shown <= 0.001) {
    return null;
  }

  const chip = variant === "chip";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: FONT.mono,
        fontSize: size,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "pre",
        padding: chip ? "7px 12px" : 0,
        background: chip ? COLOR.cobalt : "transparent",
        color: chip ? COLOR.onDark : dark ? COLOR.onDark : COLOR.ink,
        // Clips open from the left like a field being filled, then clips shut.
        clipPath: `inset(0 ${(1 - shown) * 100}% 0 0)`,
      }}
    >
      {text}
    </div>
  );
};

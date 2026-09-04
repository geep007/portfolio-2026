import React from "react";
import { useCurrentFrame } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress } from "../engine/timing";

/**
 * LEVEL 1 · A short label that appears, holds, and leaves.
 *
 * Interface feedback, not titling. The brand's label role decides the face
 * and casing; `variant` decides whether it sits in a chip.
 */
export const LabelFlash: React.FC<{
  text: string;
  x: number;
  y: number;
  delay?: number;
  /** Frames on screen between entrance and exit. Omit to stay for the shot. */
  hold?: number;
  variant?: "chip" | "bare" | "outline";
  dark?: boolean;
  size?: number;
}> = ({ text, x, y, delay = 0, hold, variant = "bare", dark = false, size }) => {
  const { brand, ease, frames, ground, type } = useBrand();
  const frame = useCurrentFrame();
  const g = ground(dark);
  const micro = frames("micro");

  const inT = progress(frame, { delay, duration: micro, easing: ease("enter") });
  const outT =
    hold === undefined
      ? 0
      : progress(frame, { delay: delay + micro + hold, duration: micro, easing: ease("exit") });
  const shown = inT * (1 - outT);
  if (shown <= 0.001) {
    return null;
  }

  const chip = variant === "chip";
  const outline = variant === "outline";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        ...type("label", size),
        whiteSpace: "pre",
        padding: chip || outline ? "7px 12px" : 0,
        background: chip ? g.accent : "transparent",
        border: outline ? `1.5px solid ${g.accent}` : undefined,
        color: chip ? brand.colors.inverse.foreground : outline ? g.accent : g.foreground,
        clipPath: `inset(0 ${(1 - shown) * 100}% 0 0)`,
      }}
    >
      {text}
    </div>
  );
};

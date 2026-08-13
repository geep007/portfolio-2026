import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../../theme";
import { Clip } from "./Clip";

/**
 * UI fragments lifted off a flat colour ground.
 *
 * Cropping a live capture down to a single card and floating it on a solid
 * field is what makes product work look considered rather than screenshotted —
 * the ground colour does the art direction, the card just has to be real.
 */

export type Card = {
  src: string;
  startFrom?: number;
  /** Which part of the source frame to crop to. */
  objectPosition?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  delay?: number;
  /** Gentle float, px of vertical travel across the shot. */
  float?: number;
};

export const FloatingCards: React.FC<{
  cards: Card[];
  duration: number;
  background?: string;
  /** The small dark chip with an arrow, straight off the reference frames. */
  arrow?: { x: number; y: number; delay?: number };
}> = ({ cards, duration, background = COLOR.cobalt, arrow }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background }}>
      {cards.map((c, i) => {
        const delay = c.delay ?? 0;
        const t = interpolate(frame, [delay, delay + 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
        });
        const drift = interpolate(frame, [0, duration], [0, c.float ?? -14], {
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              width: c.w,
              height: c.h,
              borderRadius: c.radius ?? 18,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 30px 70px rgba(0,0,0,0.28)",
              opacity: t,
              transform: `translateY(${(1 - t) * 40 + drift}px) scale(${interpolate(
                t,
                [0, 1],
                [0.96, 1],
              )})`,
            }}
          >
            <Clip
              src={c.src}
              startFrom={c.startFrom ?? 14}
              duration={duration}
              from={1.02}
              to={1.08}
              objectPosition={c.objectPosition}
            />
          </div>
        );
      })}

      {arrow ? (
        <div
          style={{
            position: "absolute",
            left: arrow.x,
            top: arrow.y,
            width: 108,
            height: 108,
            borderRadius: 22,
            background: "#0E1428",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.display,
            fontSize: 46,
            color: COLOR.onDark,
            opacity: interpolate(frame, [arrow.delay ?? 0, (arrow.delay ?? 0) + 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
          }}
        >
          →
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

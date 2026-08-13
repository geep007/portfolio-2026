import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, LINEAR_ISH } from "../../theme";
import { Clip } from "./Clip";

/**
 * Composed panel grid — the reel's main register.
 *
 * Rather than one full-bleed capture, the frame is cut into panels that each
 * hold a different piece of work and drift at their own rate. It reads as a
 * designed layout instead of a screen recording, and it lets four projects
 * share a frame without a hard cut between them.
 *
 * Panels are placed on an explicit 12x8 cell grid so the composition stays
 * deliberate; nothing is randomly positioned.
 */

export type Panel = {
  /** Grid cell coordinates, 12 columns x 8 rows. */
  col: number;
  row: number;
  w: number;
  h: number;
  /** Footage, a flat colour block, or a type plate. */
  src?: string;
  startFrom?: number;
  color?: string;
  text?: string;
  textColor?: string;
  serif?: boolean;
  objectPosition?: string;
  /** Px of drift over the shot, positive = down/right. */
  driftX?: number;
  driftY?: number;
  /** Frame the panel arrives on. */
  delay?: number;
};

const CELL_W = 1920 / 12;
const CELL_H = 1080 / 8;

export const Mosaic: React.FC<{
  panels: Panel[];
  duration: number;
  background?: string;
  gap?: number;
}> = ({ panels, duration, background = COLOR.groundDark, gap = 0 }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background }}>
      {panels.map((p, i) => {
        const x = p.col * CELL_W + gap / 2;
        const y = p.row * CELL_H + gap / 2;
        const w = p.w * CELL_W - gap;
        const h = p.h * CELL_H - gap;

        const delay = p.delay ?? 0;
        // Panels slide in from their own drift direction, then keep drifting —
        // the arrival and the life of the panel are the same movement.
        const arrive = interpolate(frame, [delay, delay + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: LINEAR_ISH,
        });
        const travel = interpolate(frame, [0, duration], [0, 1], {
          extrapolateRight: "clamp",
          easing: LINEAR_ISH,
        });

        // Arrival is a small fixed slide, independent of the panel's drift —
        // tying the two together let panels with large drift open a visible
        // strip of ground at the frame edge while they were still arriving.
        const enter = (1 - arrive) * 22;
        const dx = (p.driftX ?? 0) * travel;
        const dy = (p.driftY ?? 0) * travel + enter;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              overflow: "hidden",
              background: p.color ?? COLOR.groundDark,
              transform: `translate(${dx}px, ${dy}px)`,
              opacity: arrive,
              display: p.text ? "flex" : undefined,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {p.src ? (
              <Clip
                src={p.src}
                startFrom={p.startFrom ?? 12}
                duration={duration}
                // Panels are already small crops of a full page; a strong push
                // on top of that cuts type mid-word. Keep the zoom shallow and
                // let the panel drift carry the movement instead.
                from={1.0}
                to={1.05}
                objectPosition={p.objectPosition}
              />
            ) : null}

            {p.text ? (
              <div
                style={{
                  fontFamily: p.serif ? "Georgia, 'Times New Roman', serif" : FONT.display,
                  fontWeight: p.serif ? 400 : 700,
                  fontSize: Math.min(h * 0.5, 96),
                  letterSpacing: p.serif ? "-0.01em" : "-0.045em",
                  color: p.textColor ?? COLOR.ink,
                  whiteSpace: "pre",
                  padding: "0 28px",
                }}
              >
                {p.text}
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

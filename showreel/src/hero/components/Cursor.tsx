import React from "react";
import { useCurrentFrame } from "remotion";
import { COLOR } from "../../theme";
import { cursorAt } from "../cursorPath";
import type { Timeline } from "../timeline";

/**
 * The protagonist. One arrow, one path, rendered above every shot so it survives
 * the cuts — that continuity is what makes seventeen shots read as one journey.
 *
 * The trail is three sampled ghosts, not a motion blur: enough to register
 * direction on fast moves, invisible when the cursor is settled.
 */

const Arrow: React.FC<{ scale: number; opacity: number; fill: string }> = ({
  scale,
  opacity,
  fill,
}) => (
  <svg
    width={34 * scale}
    height={40 * scale}
    viewBox="0 0 34 40"
    style={{ opacity, display: "block" }}
  >
    <path
      d="M2 2 L2 32 L10 25 L15 37 L21 34 L16 23 L27 22 Z"
      fill={fill}
      stroke={COLOR.onDark}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </svg>
);

export const Cursor: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  const frame = useCurrentFrame();
  const now = cursorAt(frame, timeline);

  if (now.opacity <= 0.001) {
    return null;
  }

  const pressed = now.state === "press";
  const dragging = now.state === "drag";
  const scale = pressed ? 0.86 : 1;

  const ghosts = [7, 14].map((back) => cursorAt(Math.max(0, frame - back), timeline));

  return (
    <>
      {ghosts.map((g, i) => {
        const dist = Math.hypot(g.x - now.x, g.y - now.y);
        // Only show the trail while the cursor is actually covering ground.
        const strength = Math.min(1, dist / 340) * (0.14 - i * 0.05);
        if (strength <= 0.01) {
          return null;
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: g.x,
              top: g.y,
              opacity: g.opacity * strength,
            }}
          >
            <Arrow scale={0.9} opacity={1} fill={COLOR.cobalt} />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: now.x,
          top: now.y,
          opacity: now.opacity,
        }}
      >
        <Arrow scale={scale} opacity={1} fill={dragging ? COLOR.cobaltOnDark : COLOR.cobalt} />
      </div>

      {pressed ? (
        <div
          style={{
            position: "absolute",
            left: now.x,
            top: now.y,
            width: 46,
            height: 46,
            marginLeft: -23,
            marginTop: -23,
            borderRadius: "50%",
            border: `2px solid ${COLOR.cobalt}`,
            opacity: now.opacity * 0.5,
          }}
        />
      ) : null}
    </>
  );
};

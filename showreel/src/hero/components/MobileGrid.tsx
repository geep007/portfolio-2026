import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLOR, LINEAR_ISH, OUT } from "../../theme";

/**
 * A wall of real phone screens.
 *
 * This is the only shot that proves the builds are responsive, and it does it
 * without saying the word: sixteen actual mobile captures from the four sites,
 * arranged in columns that drift in opposite directions.
 *
 * Columns run past the top and bottom of the frame on purpose — a grid that
 * fits exactly reads as a slide, one that overflows reads as a catalogue.
 */

export const MobileGrid: React.FC<{
  /** Filenames in public/media/phones, laid out column by column. */
  columns: string[][];
  duration: number;
  background?: string;
  phoneW?: number;
  gap?: number;
  /** Vertical travel per column; sign alternates automatically. */
  travel?: number;
}> = ({
  columns,
  duration,
  background = COLOR.groundDark,
  phoneW = 268,
  gap = 26,
  travel = 150,
}) => {
  const frame = useCurrentFrame();
  const phoneH = Math.round(phoneW * (844 / 390));

  const t = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  const totalW = columns.length * phoneW + (columns.length - 1) * gap;
  const startX = (1920 - totalW) / 2;

  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      {columns.map((col, ci) => {
        const dir = ci % 2 === 0 ? -1 : 1;
        const colH = col.length * phoneH + (col.length - 1) * gap;
        // Centre the column, then slide it; the overflow is the point.
        const baseY = (1080 - colH) / 2;
        const y = baseY + dir * travel * (t - 0.5) * 2;

        return (
          <div
            key={ci}
            style={{
              position: "absolute",
              left: startX + ci * (phoneW + gap),
              top: y,
              width: phoneW,
            }}
          >
            {col.map((src, ri) => {
              const delay = ci * 4 + ri * 3;
              const arrive = interpolate(frame, [delay, delay + 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: OUT,
              });

              return (
                <div
                  key={src}
                  style={{
                    width: phoneW,
                    height: phoneH,
                    marginBottom: gap,
                    borderRadius: 22,
                    overflow: "hidden",
                    background: "#fff",
                    opacity: arrive,
                    transform: `scale(${interpolate(arrive, [0, 1], [0.92, 1])})`,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
                  }}
                >
                  <Img
                    src={staticFile(`media/phones/${src}`)}
                    style={{ width: phoneW, height: phoneH, objectFit: "cover" }}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

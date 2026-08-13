import React from "react";
import { FONT } from "../theme";

/**
 * A flat colour plate with display type cut out of it.
 *
 * The letters are a window onto whatever sits behind the plate, so the first
 * thing read is the words and the thing filling them is the work. It is the
 * intro's register, factored out so the outros can close on the same device
 * rather than on a different idea.
 *
 * Knockout is an SVG mask (white keeps, black cuts) because `background-clip:
 * text` cannot take a video as its paint.
 */
export const KnockoutPlate: React.FC<{
  lines: string[];
  /** Unique per instance — two plates sharing a mask id collide. */
  maskId: string;
  plate: string;
  size?: number;
  /** Subtle scale on the type. Moving the letters moves what shows inside them. */
  settle?: number;
  /** 0 = knocked out, 1 = letters painted solid in `fill`. */
  filled?: number;
  fill?: string;
  /** Vertical centre of the type block. */
  centerY?: number;
  /** Display family. Defaults to the deck face; the intro/outro pass a pairing. */
  fontFamily?: string;
  fontWeight?: number;
  /** Tracking, which travels with the face — see typography.ts. */
  letterSpacing?: string;
  /** Canvas size. Defaults to the 16:9 reel; the vertical cut passes 1080x1920. */
  width?: number;
  height?: number;
}> = ({
  lines,
  maskId,
  plate,
  size = 250,
  settle = 1,
  filled = 0,
  fill = "#FAFAFA",
  centerY = 540,
  fontFamily = FONT.display,
  fontWeight = 700,
  // Looser than the reel's display tracking: at -0.05em the word space in a
  // two-word line closes up entirely.
  letterSpacing = "-0.03em",
  width = 1920,
  height = 1080,
}) => {
  const cx = width / 2;
  const lead = size * 0.9;
  const firstBaseline = centerY - ((lines.length - 1) * lead) / 2 + size * 0.34;

  const type: React.CSSProperties = {
    fontFamily,
    fontWeight,
    fontSize: size,
    letterSpacing,
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0 }}
    >
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width={width} height={height} fill="white" />
          <g transform={`translate(${cx} 0) scale(${settle}) translate(${-cx} 0)`}>
            {lines.map((line, i) => (
              <text
                key={line}
                x={cx}
                y={firstBaseline + i * lead}
                textAnchor="middle"
                fill="black"
                style={type}
              >
                {line}
              </text>
            ))}
          </g>
        </mask>
      </defs>

      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill={plate}
        mask={`url(#${maskId})`}
      />

      {/* Painting the same letters back on top closes the window without moving
          it — the type stays put and only what fills it changes. */}
      {filled > 0 ? (
        <g
          transform={`translate(${cx} 0) scale(${settle}) translate(${-cx} 0)`}
          opacity={filled}
        >
          {lines.map((line, i) => (
            <text
              key={line}
              x={cx}
              y={firstBaseline + i * lead}
              textAnchor="middle"
              fill={fill}
              style={type}
            >
              {line}
            </text>
          ))}
        </g>
      ) : null}
    </svg>
  );
};

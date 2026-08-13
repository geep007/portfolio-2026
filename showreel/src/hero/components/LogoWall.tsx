import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLOR, FONT, LINEAR_ISH } from "../../theme";

/**
 * Drifting client wall: logo rows travelling one way, outlined mono capability
 * tags travelling the other.
 *
 * Logos are forced to white silhouettes. The supplied files are a mix of colour,
 * knockout and mark-only lockups — at this size, consistency reads as a system
 * and the mix reads as a folder of downloads.
 */

type Row = {
  logos: { src: string; h: number }[];
  tags: string[];
  /** px travelled across the shot; sign sets direction. */
  travel: number;
  y: number;
};

export const LogoWall: React.FC<{ rows: Row[]; duration: number }> = ({
  rows,
  duration,
}) => {
  const frame = useCurrentFrame();

  const fade = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundDark, overflow: "hidden" }}>
      {rows.map((row, ri) => {
        const t = interpolate(frame, [0, duration], [0, 1], {
          extrapolateRight: "clamp",
          easing: LINEAR_ISH,
        });
        const shift = row.travel * t;

        return (
          <React.Fragment key={ri}>
            <div
              style={{
                position: "absolute",
                top: row.y,
                left: 0,
                display: "flex",
                alignItems: "center",
                gap: 190,
                paddingLeft: 120,
                transform: `translateX(${shift}px)`,
                opacity: fade,
              }}
            >
              {row.logos.map((l) => (
                <Img
                  key={l.src}
                  src={staticFile(`media/logos/${l.src}`)}
                  style={{
                    height: l.h,
                    filter: "brightness(0) invert(1)",
                    opacity: 0.92,
                  }}
                />
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                top: row.y + 150,
                left: 0,
                display: "flex",
                alignItems: "center",
                gap: 130,
                paddingLeft: 40,
                transform: `translateX(${-shift * 0.85}px)`,
                opacity: fade,
              }}
            >
              {row.tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    border: `1.5px solid rgba(250,250,250,0.55)`,
                    padding: "12px 20px",
                    fontFamily: FONT.mono,
                    fontSize: 26,
                    letterSpacing: "0.08em",
                    color: "rgba(250,250,250,0.86)",
                    whiteSpace: "pre",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

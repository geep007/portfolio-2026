import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../../theme";
import { BrowserWindow } from "./BrowserWindow";
import { Clip } from "./Clip";

/**
 * One build in the middle, callout windows around it naming what I actually
 * owned on it.
 *
 * This is where the partnership claim gets made without spending a shot on
 * explanation: the site stays the hero, the callouts are small chrome boxes
 * that arrive one at a time and read as annotations on real work.
 */

export type Callout = {
  text: string;
  x: number;
  y: number;
  w?: number;
  delay?: number;
};

export const Annotated: React.FC<{
  src: string;
  url: string;
  startFrom?: number;
  duration: number;
  tag?: string;
  callouts: Callout[];
  background?: string;
}> = ({
  src,
  url,
  startFrom = 12,
  duration,
  tag,
  callouts,
  background = COLOR.groundDark,
}) => {
  const frame = useCurrentFrame();

  const tagIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background }}>
      {tag ? (
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: tagIn,
          }}
        >
          <div
            style={{
              border: `1.5px solid ${COLOR.cobaltOnDark}`,
              color: COLOR.cobaltOnDark,
              fontFamily: FONT.mono,
              fontSize: 22,
              letterSpacing: "0.1em",
              padding: "8px 16px",
            }}
          >
            {tag}
          </div>
        </div>
      ) : null}

      <BrowserWindow url={url} left={490} top={200} width={940} height={620}>
        <Clip src={src} startFrom={startFrom} duration={duration} from={1.02} to={1.09} />
      </BrowserWindow>

      {callouts.map((c) => {
        const delay = c.delay ?? 0;
        const t = interpolate(frame, [delay, delay + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
        });
        if (t <= 0.001) {
          return null;
        }

        return (
          <div
            key={c.text}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              width: c.w ?? 340,
              border: `1px solid rgba(250,250,250,0.5)`,
              background: COLOR.groundDark,
              opacity: t,
              transform: `translateY(${(1 - t) * 12}px)`,
            }}
          >
            <div
              style={{
                height: 26,
                borderBottom: `1px solid rgba(250,250,250,0.32)`,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 9px",
              }}
            >
              {["#ED6A5E", "#F4BF4F", "#61C554"].map((dot) => (
                <div
                  key={dot}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: dot }}
                />
              ))}
            </div>
            <div
              style={{
                padding: "16px 18px",
                fontFamily: FONT.display,
                fontWeight: 500,
                fontSize: 26,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                color: COLOR.onDark,
              }}
            >
              {c.text}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

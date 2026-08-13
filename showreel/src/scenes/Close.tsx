import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Grid } from "../components/Grid";
import { MaskText } from "../components/MaskText";
import { COLOR, FONT, OUT } from "../theme";

/**
 * Client names set in the deck's mono, not logo files. The supplied logos are a mix
 * of colour, knockout and mark-only lockups — at 30px in a row they read as noise.
 */
const CLIENTS = [
  "Creo Agency",
  "Athina.ai",
  "Surreal",
  "EdelGive GROW+",
  "LastBench",
  "Boldcap",
];

/**
 * 1.4s. Name, positioning line, proof row. No call to action — this cut is a door
 * opener, and the deck is what closes.
 */
export const Close: React.FC = () => {
  const frame = useCurrentFrame();

  const ruleWipe = interpolate(frame, [6, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Grid drawIn={14} />

      <div style={{ position: "absolute", left: 120, top: 360 }}>
        <MaskText
          lines={["Geet Parmar"]}
          delay={2}
          duration={24}
          lineHeight={1.0}
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 128,
            letterSpacing: "-0.05em",
            color: COLOR.ink,
          }}
        />
        <div
          style={{
            marginTop: 26,
            fontFamily: FONT.mono,
            fontSize: 28,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            color: COLOR.cobalt,
            clipPath: `inset(0 ${(1 - ruleWipe) * 100}% 0 0)`,
          }}
        >
          Webflow &amp; creative development partner for design studios
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 760,
          height: 1,
          background: COLOR.inkRule,
          transform: `scaleX(${ruleWipe})`,
          transformOrigin: "left",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 810,
          display: "flex",
          alignItems: "center",
          gap: 40,
        }}
      >
        {CLIENTS.map((client, i) => {
          const t = interpolate(frame, [12 + i * 2, 26 + i * 2], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: OUT,
          });
          return (
            <React.Fragment key={client}>
              {i > 0 ? (
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 22,
                    color: COLOR.cobalt,
                    opacity: t,
                  }}
                >
                  ·
                </div>
              ) : null}
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 22,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  color: COLOR.inkMuted,
                  opacity: t,
                  transform: `translateY(${(1 - t) * 8}px)`,
                  whiteSpace: "pre",
                }}
              >
                {client}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

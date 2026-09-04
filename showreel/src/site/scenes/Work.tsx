import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { MaskText } from "../../components/MaskText";
import { COLOR, FONT, OUT } from "../../theme";
import { Capture, Punch, Tag } from "../parts";
import type { SiteProps } from "../siteLayout";

const CARD_SIZES: Record<string, { w: number; h: number }> = {
  "work-01.png": { w: 1920, h: 1067 },
  "work-02.png": { w: 1920, h: 1000 },
  "work-03.png": { w: 1920, h: 736 },
  "says.png": { w: 1920, h: 711 },
  "trusted.png": { w: 1920, h: 460 },
};

const TITLE = 34;

const Card: React.FC<{
  card: SiteProps["work"]["cards"][number];
  index: number;
  duration: number;
}> = ({ card, index, duration }) => {
  const frame = useCurrentFrame();
  const size = CARD_SIZES[card.src] ?? { w: 1920, h: 1080 };

  const bar = interpolate(frame, [4, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <Punch amount={0.05}>
      <Capture
        src={card.src}
        width={size.w}
        height={size.h}
        position={card.position}
        duration={duration}
        travel={40}
        from={1.03}
        to={1.1}
      />
      {/* Index + name ride on a cobalt bar that wipes in from the left edge. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 92,
          display: "flex",
          alignItems: "stretch",
          transform: `translateX(${(1 - bar) * -100}%)`,
        }}
      >
        <div
          style={{
            background: COLOR.cobalt,
            color: COLOR.onDark,
            fontFamily: FONT.mono,
            fontSize: 24,
            letterSpacing: "0.1em",
            display: "flex",
            alignItems: "center",
            padding: "0 22px",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
        <div
          style={{
            background: COLOR.groundLight,
            padding: "16px 30px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 500,
              fontSize: 42,
              letterSpacing: "-0.02em",
              color: COLOR.ink,
            }}
          >
            {card.name}
          </div>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 20,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: COLOR.inkMuted,
            }}
          >
            {card.spec}
          </div>
        </div>
      </div>
    </Punch>
  );
};

/** The work section: a title card, then one hard cut per build. */
export const Work: React.FC<{ work: SiteProps["work"] }> = ({ work }) => {
  const each = Math.floor((work.duration - TITLE) / Math.max(1, work.cards.length));

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Sequence durationInFrames={TITLE} layout="none">
        <Punch>
          <Capture
            src="trusted.png"
            width={1920}
            height={460}
            duration={TITLE}
            from={1.04}
            to={1.0}
            travel={0}
            style={{ opacity: 0.5 }}
          />
          <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 120 }}>
            <Tag delay={0}>{work.tag}</Tag>
            <MaskText
              lines={[work.heading]}
              delay={4}
              duration={18}
              style={{
                fontFamily: FONT.display,
                fontWeight: 500,
                fontSize: 120,
                letterSpacing: "-0.03em",
                color: COLOR.ink,
              }}
            />
          </AbsoluteFill>
        </Punch>
      </Sequence>
      {work.cards.map((card, i) => (
        <Sequence
          key={card.src + i}
          from={TITLE + i * each}
          durationInFrames={each}
          layout="none"
        >
          <Card card={card} index={i} duration={each} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

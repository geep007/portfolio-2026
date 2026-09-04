import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { COLOR, DESIGN, FONT, PHOTO, RING, SCALE } from "./tokens";
import { EASE, past, span, T, mix } from "./timeline";
import { BAND, gapAt, stripsAt, type Strip } from "./strips";
import { loadGrowFonts } from "./fonts";

/**
 * GROW+ — "What Holds It Up". 12.5s, 16:9.
 *
 * Reveal by removal. The frame never travels: no camera, no push, no parallax.
 * One horizontal strip of landscape is worked on six times — split, multiplied,
 * collapsed, turned into a mask, opened — and the tree ring arrives only after
 * the strip has finished its job, at object scale, where the band's edge was.
 *
 * Everything below is one persistent composition sharing one clock. The
 * geometry lives in `strips.ts`, the edit lives in `timeline.ts`, and this file
 * is only paint.
 */

/* ------------------------------------------------------------------ *
 * Paint helpers
 * ------------------------------------------------------------------ */

/** A clip that hides all but `reveal` of a box, anchored to one edge. */
const edgeClip = (reveal: number, anchor: "top" | "bottom") => {
  const hidden = `${(1 - reveal) * 100}%`;
  return anchor === "top" ? `inset(0% 0% ${hidden} 0%)` : `inset(${hidden} 0% 0% 0%)`;
};

const PhotoStrip: React.FC<{ strip: Strip }> = ({ strip }) => (
  <div
    style={{
      position: "absolute",
      left: strip.rect.x,
      top: strip.rect.y,
      width: strip.rect.w,
      height: strip.rect.h,
      opacity: strip.opacity,
      overflow: "hidden",
      clipPath: strip.reveal >= 1 ? undefined : edgeClip(strip.reveal, strip.anchor),
    }}
  >
    <img
      src={staticFile(PHOTO[strip.photo].src)}
      style={{
        position: "absolute",
        left: strip.cover.left,
        top: strip.cover.top,
        width: strip.cover.w,
        height: strip.cover.h,
        display: "block",
      }}
    />
  </div>
);

type BlockProps = {
  children: React.ReactNode;
  left: number;
  top: number;
  width?: number | "max-content";
  size: number;
  lineHeight: number | string;
  tracking: number;
  color: string;
  weight?: number;
  align?: "left" | "right";
  /** 0 → 1. Whole-block clip; never per word, never per character. */
  reveal?: number;
};

/** Type is compositional here: it appears, it does not perform. */
const Block: React.FC<BlockProps> = ({
  children,
  left,
  top,
  width,
  size,
  lineHeight,
  tracking,
  color,
  weight = 400,
  align = "left",
  reveal = 1,
}) => {
  if (reveal <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        fontFamily: FONT.family,
        fontWeight: weight,
        fontSize: size,
        lineHeight: typeof lineHeight === "number" ? `${lineHeight}px` : lineHeight,
        letterSpacing: `${tracking}em`,
        color,
        textAlign: align,
        whiteSpace: width === "max-content" ? "pre" : "pre-wrap",
        clipPath: reveal >= 1 ? undefined : edgeClip(reveal, "top"),
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * The band, as a boundary rather than a rectangle
 * ------------------------------------------------------------------ */

/**
 * The bone plate. It opens out of the collapsed band's own centre line to the
 * band's edges (that opening is what cuts through the word), holds, then keeps
 * opening to the whole frame. One boundary, two moves — never a dissolve, never
 * a flash, never a cut.
 */
const plateAt = (frame: number) => {
  const ink = span(frame, T.bandInk, EASE.settle);
  const open = span(frame, T.bandOpen, EASE.open);
  const middle = (BAND.top + BAND.bottom) / 2;
  return {
    visible: ink > 0,
    top: mix(mix(middle, BAND.top, ink), 0, open),
    bottom: mix(mix(middle, BAND.bottom, ink), DESIGN.height, open),
  };
};

const HEADLINE_04 = "institutional strength.";
const TYPE_04 = { left: 88, top: 266, size: 76, lineHeight: 92, tracking: -0.033 };

/* ------------------------------------------------------------------ *
 * The film
 * ------------------------------------------------------------------ */

export const WhatHoldsItUp: React.FC = () => {
  loadGrowFonts();
  const frame = useCurrentFrame();

  const strips = stripsAt(frame);
  const gap = gapAt(frame);
  const plate = plateAt(frame);

  const showBandType = past(frame, T.bandType[0]) && !past(frame, T.bandTypeOut);
  const bandTypeReveal = span(frame, T.bandType, EASE.settle);

  const ringVisible = past(frame, T.ringLand);
  const ringSettle = span(frame, T.ringSettle, EASE.settle);
  const beliefLive = ringVisible && !past(frame, T.beliefOut);

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.forest }}>
      <div
        style={{
          position: "absolute",
          width: DESIGN.width,
          height: DESIGN.height,
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          overflow: "hidden",
          backgroundColor: COLOR.forest,
        }}
      >
        {/* 01–04 · the landscape system */}
        {strips.map((strip) => (
          <PhotoStrip key={strip.key} strip={strip} />
        ))}

        {/* 01 · type sits low-left, unrelated to the strip. That is deliberate. */}
        {!past(frame, T.headlineOneOut) && (
          <Block
            left={88}
            top={524}
            width={340}
            size={29}
            lineHeight="130%"
            tracking={-0.022}
            color={COLOR.onForest}
            reveal={span(frame, T.headlineOne, EASE.settle)}
          >
            {"Programmes are what you see."}
          </Block>
        )}

        {/* 02 · "But." was underneath. The lower surface sliding away uncovers
            it — one edge, no animation of its own, and nothing happens to the
            word until the gap has cleared its top. */}
        {gap.top <= 206 && !past(frame, T.butOut) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `inset(0px 0px ${DESIGN.height - gap.bottom}px 0px)`,
            }}
          >
            <Block left={88} top={206} width="max-content" size={44} lineHeight={54} tracking={-0.032} color={COLOR.onForest}>
              But.
            </Block>
          </div>
        )}

        {/* 04 · first ink — the word on the forest field */}
        {showBandType && (
          <Block
            left={TYPE_04.left}
            top={TYPE_04.top}
            width="max-content"
            size={TYPE_04.size}
            lineHeight={TYPE_04.lineHeight}
            tracking={TYPE_04.tracking}
            color={COLOR.onForest}
            reveal={bandTypeReveal}
          >
            {HEADLINE_04}
          </Block>
        )}

        {/* 04–05 · the plate. Below its edge the same word is forest on bone. */}
        {plate.visible && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: plate.top,
              width: DESIGN.width,
              height: plate.bottom - plate.top,
              backgroundColor: COLOR.bone,
              overflow: "hidden",
            }}
          >
            {showBandType && (
              <Block
                left={TYPE_04.left}
                top={TYPE_04.top - plate.top}
                width="max-content"
                size={TYPE_04.size}
                lineHeight={TYPE_04.lineHeight}
                tracking={TYPE_04.tracking}
                color={COLOR.forest}
                reveal={bandTypeReveal}
              >
                {HEADLINE_04}
              </Block>
            )}
          </div>
        )}

        {/* 05–06 · the artefact. It lands once, where the band's edge was, and
            then never moves again. */}
        {ringVisible && (
          <div
            style={{
              position: "absolute",
              left: 486,
              top: 286,
              width: 200,
              height: 200,
              opacity: past(frame, T.ringUnderlay) ? 0.5 : 1,
              transform: `scale(${mix(1.012, 1, ringSettle)})`,
              backgroundImage: `url(${staticFile(RING.src)})`,
              backgroundSize: "contain",
              backgroundPosition: "50%",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}

        {/* 05 · two blocks facing the ring from opposite sides, sharing no
            baseline. The misalignment is the composition. */}
        {beliefLive && (
          <>
            <Block
              left={112}
              top={286}
              width={350}
              size={38}
              lineHeight="120%"
              tracking={-0.028}
              color={COLOR.ink}
              align="right"
              reveal={span(frame, T.beliefOne, EASE.settle)}
            >
              {"What we saw confirmed what we’ve always believed."}
            </Block>
            <Block
              left={716}
              top={376}
              width={370}
              size={38}
              lineHeight="120%"
              tracking={-0.028}
              color={COLOR.ink}
              reveal={span(frame, T.beliefTwo, EASE.settle)}
            >
              {"When nonprofits are supported at their foundation,"}
            </Block>
            <Block
              left={716}
              top={498}
              width="max-content"
              size={38}
              lineHeight="120%"
              tracking={-0.028}
              color={past(frame, T.flourishColour) ? COLOR.blue : COLOR.ink}
              reveal={span(frame, T.beliefTwo, EASE.settle)}
            >
              they flourish.
            </Block>
          </>
        )}

        {/* 06 · the closing lockup assembles around the ring and overlaps it. */}
        {past(frame, T.beliefOut) && (
          <>
            <Block
              left={88}
              top={296}
              width="max-content"
              size={82}
              lineHeight="110%"
              tracking={-0.033}
              color={COLOR.ink}
              reveal={span(frame, T.closingOne, EASE.settle)}
            >
              {"Let’s Build"}
            </Block>
            <Block
              left={88}
              top={388}
              width="max-content"
              size={82}
              lineHeight="110%"
              tracking={-0.033}
              color={COLOR.ink}
              reveal={span(frame, T.closingTwo, EASE.settle)}
            >
              Resilience Together
            </Block>

            {/* The yellow lands last, left to right, and nothing moves after it. */}
            <div
              style={{
                position: "absolute",
                left: 90,
                top: 544,
                width: 132,
                height: 38,
                backgroundColor: COLOR.yellow,
                clipPath: `inset(0% ${(1 - span(frame, T.yellowDraw, EASE.linear)) * 100}% 0% 0%)`,
              }}
            />
            <Block
              left={100}
              top={549}
              width="max-content"
              size={25}
              lineHeight={30}
              tracking={-0.02}
              color={COLOR.ink}
              weight={600}
              reveal={span(frame, T.closingMeta, EASE.settle)}
            >
              GROW+
            </Block>
            <Block
              left={250}
              top={552}
              width="max-content"
              size={20}
              lineHeight={24}
              tracking={-0.012}
              color={COLOR.inkMuted}
              reveal={span(frame, T.closingMeta, EASE.settle)}
            >
              askgrow@edelgive.org
            </Block>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, LINEAR_ISH, OUT } from "../theme";
import { resolveFonts } from "../typography";
import { loadFonts } from "../fonts";
import { Clip } from "../hero/components/Clip";
import { MaskText } from "../components/MaskText";
import { SiteFrame } from "../components/SiteFrame";
import { defaultIntroProps, type IntroProps } from "./introLayout";

loadFonts();

/**
 * Intro D — "Search".
 *
 * Opens on an empty field on a blank page, types the domain, and the answer
 * grows out of the field itself. The premise is that the viewer arrives at the
 * work the way a client does — by looking for someone — so the first beat is a
 * question rather than a claim.
 *
 * The typing is derived from the frame, never from state: character count is an
 * interpolation, so scrubbing backwards in the Studio untypes it and a
 * distributed render can start on any frame and get the same picture.
 *
 * The field does not fade into the panel — it *becomes* it. One rect is
 * interpolated from the field's box to the panel's box, which is why the beat
 * reads as a page loading rather than as two slides.
 */

/** The field, and the panel it grows into. Both measured inside the site frame. */
const FIELD = { x: 470, y: 470, w: 980, h: 92 };
/** Same panel Intro A lands on, so the two variants end on one register. */
const PANEL = { x: 904, y: 74, w: 956, h: 873 };

const TYPE_FROM = 8;
const TYPE_TO = 44;
/** Return is pressed; the field starts becoming the page. */
const ENTER = 52;

export const IntroD: React.FC<Partial<IntroProps>> = (input) => {
  const p: IntroProps = { ...defaultIntroProps, ...input };
  const frame = useCurrentFrame();
  const d = p.durationInFrames;
  const type = resolveFonts(p);

  const query = p.siteUrl;
  const typed = Math.round(
    interpolate(frame, [TYPE_FROM, TYPE_TO], [0, query.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: LINEAR_ISH,
    }),
  );

  // Blinks at 2Hz while the field is live, then stops — a caret still blinking
  // after the page has loaded is the tell of a fake.
  const caretOn = frame < ENTER && Math.floor(frame / 8) % 2 === 0;

  const grow = interpolate(frame, [ENTER, ENTER + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const box = {
    x: interpolate(grow, [0, 1], [FIELD.x, PANEL.x]),
    y: interpolate(grow, [0, 1], [FIELD.y, PANEL.y]),
    w: interpolate(grow, [0, 1], [FIELD.w, PANEL.w]),
    h: interpolate(grow, [0, 1], [FIELD.h, PANEL.h]),
  };

  // The query text rides the box up and out as the panel takes over.
  const queryOut = interpolate(frame, [ENTER, ENTER + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const label = interpolate(frame, [2, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const chip = interpolate(frame, [ENTER + 26, ENTER + 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <SiteFrame url={frame < ENTER ? "search" : p.siteUrl}>
      <AbsoluteFill style={{ background: p.ground }}>
        {/* Mono label above the field. Leaves with the field. */}
        <div
          style={{
            position: "absolute",
            left: FIELD.x,
            top: FIELD.y - 46,
            fontFamily: type.mono,
            fontSize: 20,
            letterSpacing: type.monoTracking,
            textTransform: "uppercase",
            color: COLOR.inkMuted,
            clipPath: `inset(0 ${(1 - label) * 100}% 0 0)`,
            opacity: queryOut,
          }}
        >
          {p.eyebrow}
        </div>

        {/* The field → the panel. One box, one interpolation. */}
        <div
          style={{
            position: "absolute",
            left: box.x,
            top: box.y,
            width: box.w,
            height: box.h,
            border: `1px solid ${grow > 0.5 ? "transparent" : COLOR.ink}`,
            background: grow > 0 ? COLOR.groundDark : p.ground,
            overflow: "hidden",
          }}
        >
          {/* The footage is already running underneath while the box is still
              a field — it is simply too small to read as anything but ink. */}
          <div style={{ position: "absolute", inset: 0, opacity: grow }}>
            <Clip
              src={p.clip}
              startFrom={p.clipStartFrom}
              duration={d}
              from={1.16}
              to={1.28}
              // Cropped past the capture's own centred headline, the same
              // crop Intro A uses: at a looser crop the client's wordmark
              // sits beside my headline and reads as my claim.
              origin="55% 38%"
              objectPosition="55% 38%"
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: 26,
              top: 0,
              height: FIELD.h,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: type.mono,
              fontSize: 30,
              letterSpacing: "0.06em",
              color: COLOR.ink,
              opacity: queryOut,
              whiteSpace: "pre",
            }}
          >
            {query.slice(0, typed)}
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 30,
                background: p.accent,
                opacity: caretOn ? 1 : 0,
              }}
            />
          </div>
        </div>

        {/* Headline lands on the page's own ground, left of the panel — not
            over the footage, so it never competes with the capture. */}
        <div style={{ position: "absolute", left: 140, top: 284, opacity: grow }}>
          <MaskText
            lines={p.headline}
            delay={ENTER + 12}
            stagger={6}
            duration={26}
            lineHeight={0.94}
            style={{
              fontFamily: type.display,
              fontWeight: type.displayWeight,
              fontSize: 148,
              letterSpacing: type.displayTracking,
              color: p.ink,
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 140,
            top: 853,
            fontFamily: type.mono,
            fontSize: 22,
            letterSpacing: type.monoTracking,
            textTransform: "uppercase",
            color: COLOR.onDark,
            background: p.accent,
            padding: "9px 14px",
            clipPath: `inset(0 ${(1 - chip) * 100}% 0 0)`,
          }}
        >
          {p.chip}
        </div>
      </AbsoluteFill>
    </SiteFrame>
  );
};

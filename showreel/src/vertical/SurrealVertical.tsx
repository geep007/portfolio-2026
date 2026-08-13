import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { COLOR, OUT } from "../theme";
import { loadFonts } from "../fonts";
import { KnockoutPlate } from "../components/KnockoutPlate";
import { MaskText } from "../components/MaskText";
import { Clip } from "../hero/components/Clip";
import { resolveFonts, type FontPairing } from "../typography";
import {
  H,
  MARGIN,
  monoStyle,
  PhoneRow,
  ProgressBar,
  Readout,
  Ticker,
  VGrid,
  VPanel,
  W,
} from "./parts";
import {
  defaultSurrealProps,
  verticalTimeline,
  type VerticalProps,
  type VerticalShot,
} from "./verticalLayout";

loadFonts();

/**
 * The 9:16 project reel — one build, four claims, an ask.
 *
 * Shape of the edit, and why:
 *
 * - It opens on the knockout, not on footage. A feed is a wall of moving video,
 *   so a flat cobalt plate with the client's name cut out of it is the thing
 *   that actually interrupts a scroll; the work showing through the letters is
 *   what earns the next second.
 * - Every shot is a claim in display type with the proof under it. Muted
 *   autoplay is the default state, so a shot that only shows a site scrolling
 *   says nothing — the sentence has to carry it and the panel has to confirm it.
 * - Nothing crossfades. Panels wipe from an edge, labels type on, the cut is a
 *   cut. Same register as the landscape reel, which is the point: it should be
 *   obvious the two came out of the same shop.
 * - It ends on the ask, held long enough to read and act on, over a plate that
 *   matches frame 0 — so a loop reads as a return rather than as a restart.
 *
 * Everything is a prop. Copy, clips, crops, timing and typeface are all edited
 * from the Studio props panel and written back to Root.tsx.
 */

const PANEL = { x: MARGIN, y: 690, w: W - MARGIN * 2, h: 620 };
const INSET = { x: 470, y: 1370, w: 538, h: 340 };

/** Chrome that survives every cut: progress, header, ticker. */
const Furniture: React.FC<{
  p: VerticalProps;
  type: FontPairing;
  total: number;
  index: number;
  count: number;
}> = ({ p, type, total, index, count }) => {
  const frame = useCurrentFrame();

  return (
    <>
      <ProgressBar frame={frame} total={total} accent={p.accent} />

      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: 56,
          display: "flex",
          justifyContent: "space-between",
          ...monoStyle(type, COLOR.onDarkMuted, 24),
        }}
      >
        <span style={{ color: p.accent }}>{p.project}</span>
        <span>{p.url}</span>
        <span>
          {String(index).padStart(2, "0")}/{String(count).padStart(2, "0")}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: 108,
          height: 1,
          background: COLOR.onDarkRule,
        }}
      />

      <Ticker
        text={p.ticker}
        font={type.mono}
        tracking={type.monoTracking}
        color={COLOR.onDarkMuted}
      />
    </>
  );
};

/** One beat: claim in display type, footage under it, spec typed out last. */
const Shot: React.FC<{
  p: VerticalProps;
  type: FontPairing;
  shot: VerticalShot;
  index: number;
  total: number;
}> = ({ p, type, shot, index, total }) => {
  const frame = useCurrentFrame();
  const d = shot.durationInFrames;

  // The whole type block drifts up a few pixels across the shot, so the frame
  // keeps moving even while the claim is being read.
  const drift = interpolate(frame, [0, d], [0, -18], {
    extrapolateRight: "clamp",
  });

  const bar = interpolate(frame, [4, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundDark }}>
      <VGrid drawIn={14} />

      <Furniture
        p={p}
        type={type}
        total={total}
        index={index + 1}
        count={p.shots.length}
      />

      {/* Accent rule, then the claim. The rule is what stops the headline
          floating in the middle of the frame with nothing holding it. */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 200,
          width: 180,
          height: 8,
          background: p.accent,
          transform: `scaleX(${bar}) translateY(${drift}px)`,
          transformOrigin: "left",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: 250,
          transform: `translateY(${drift}px)`,
        }}
      >
        <MaskText
          lines={shot.headline}
          delay={6}
          stagger={5}
          duration={22}
          lineHeight={0.98}
          style={{
            fontFamily: type.display,
            fontWeight: type.displayWeight,
            fontSize: 96,
            letterSpacing: type.displayTracking,
            color: COLOR.onDark,
          }}
        />
      </div>

      <Readout
        text={shot.spec}
        delay={22}
        font={type.mono}
        tracking={type.monoTracking}
        color={p.accent}
        left={MARGIN}
        top={620}
      />

      <VPanel
        title={p.url}
        left={PANEL.x}
        top={PANEL.y}
        width={PANEL.w}
        height={PANEL.h}
        accent={p.accent}
        font={type.mono}
        tracking={type.monoTracking}
        delay={2}
      >
        <Clip
          src={shot.clip}
          startFrom={shot.clipStartFrom}
          duration={d}
          from={shot.from}
          to={shot.to}
          origin={shot.objectPosition}
          objectPosition={shot.objectPosition}
        />
      </VPanel>

      {shot.phones.length > 0 ? (
        <PhoneRow files={shot.phones} top={1350} delay={14} accent={p.accent} />
      ) : (
        <>
          {/* Detail inset: the same footage, pushed much harder and cropped to
              a different part of the frame. Two speeds of one shot reads as
              looking closer at the work rather than as a second clip. */}
          <div
            style={{
              position: "absolute",
              left: MARGIN,
              top: INSET.y + 40,
              ...monoStyle(type, COLOR.onDarkMuted, 22),
              width: 340,
              lineHeight: 1.5,
            }}
          >
            {"DETAIL\n2.0×"}
          </div>
          <div
            style={{
              position: "absolute",
              left: INSET.x,
              top: INSET.y,
              width: INSET.w,
              height: INSET.h,
              overflow: "hidden",
              border: `1px solid ${p.accent}`,
              clipPath: `inset(0 ${(1 - bar) * 100}% 0 0)`,
            }}
          >
            <Clip
              src={shot.clip}
              startFrom={shot.clipStartFrom + 12}
              duration={d}
              from={1.9}
              to={2.2}
              origin={shot.detailPosition}
              objectPosition={shot.detailPosition}
            />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

export const SurrealVertical: React.FC<Partial<VerticalProps>> = (input) => {
  const p: VerticalProps = { ...defaultSurrealProps, ...input };
  const type = resolveFonts(p);
  const t = verticalTimeline(p);

  return (
    <AbsoluteFill style={{ background: COLOR.groundDark }}>
      {t.shots.map(({ from, duration, shot }, i) => (
        <Sequence key={`${shot.clip}-${from}`} from={from} durationInFrames={duration}>
          <Shot p={p} type={type} shot={shot} index={i} total={t.total} />
        </Sequence>
      ))}

      {/* Hook and close sit on top of the shot stack rather than between the
          sequences: both are full-bleed plates, and letting the first shot be
          already running underneath the opening plate means the cut out of the
          hook lands mid-motion instead of on a cold first frame. */}
      <Sequence from={t.hook.from} durationInFrames={t.hook.duration}>
        <Hook p={p} type={type} />
      </Sequence>

      <Sequence from={t.cta.from} durationInFrames={t.cta.duration}>
        <Cta p={p} type={type} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Opening plate: project name knocked out of accent, work moving inside it. */
const Hook: React.FC<{ p: VerticalProps; type: FontPairing }> = ({ p, type }) => {
  const frame = useCurrentFrame();
  const d = p.hookDuration;

  const settle = interpolate(frame, [0, d], [0.94, 1.02], {
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // Leaves upward in the last 14 frames, uncovering a shot already in motion.
  const exit = interpolate(frame, [d - 14, d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const chip = interpolate(frame, [22, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const eyebrow = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ transform: `translateY(${-exit * 100}%)` }}>
      <AbsoluteFill style={{ background: COLOR.groundDark }}>
        <Clip
          src={p.hookClip}
          startFrom={p.hookStartFrom}
          duration={d}
          // Pulls back rather than in: the letters start on texture and end on
          // something recognisable, which is the order that holds a scroll.
          from={1.5}
          to={1.18}
          origin={p.hookPosition}
          objectPosition={p.hookPosition}
        />
      </AbsoluteFill>

      <KnockoutPlate
        lines={p.hook.map((l) => l.toUpperCase())}
        maskId="surreal-vertical-hook"
        plate={p.accent}
        width={W}
        height={H}
        // Sized to the longest line at 1080 wide, not to the tallest stack —
        // one word touching both margins reads as an accident.
        size={176}
        centerY={900}
        settle={settle}
        fontFamily={type.display}
        fontWeight={type.displayWeight}
        letterSpacing={type.knockoutTracking}
      />

      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 150,
          ...monoStyle(type, COLOR.onDark, 26),
          clipPath: `inset(0 ${(1 - eyebrow) * 100}% 0 0)`,
        }}
      >
        {p.eyebrow}
      </div>

      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 1660,
          ...monoStyle(type, p.accent, 26),
          background: p.ground,
          padding: "10px 16px",
          clipPath: `inset(0 ${(1 - chip) * 100}% 0 0)`,
        }}
      >
        {p.hookChip}
      </div>
    </AbsoluteFill>
  );
};

/** Closing card: plate rises, letters fill solid, the ask lands last. */
const Cta: React.FC<{ p: VerticalProps; type: FontPairing }> = ({ p, type }) => {
  const frame = useCurrentFrame();
  const d = p.ctaDuration;
  const last = p.shots[p.shots.length - 1];

  const rise = interpolate(frame, [0, 18], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const settle = interpolate(frame, [18, d], [1, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // The letters close on the work — the reel ends on a flat card someone can
  // screenshot, with the handle still legible in a paused frame.
  const filled = interpolate(frame, [34, 54], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const line = interpolate(frame, [44, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const cta = interpolate(frame, [56, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: COLOR.groundDark }}>
        {last ? (
          <Clip
            src={last.clip}
            startFrom={last.clipStartFrom}
            duration={d}
            from={1.3}
            to={1.6}
            origin={last.objectPosition}
            objectPosition={last.objectPosition}
          />
        ) : null}
      </AbsoluteFill>

      <AbsoluteFill style={{ transform: `translateY(${rise * 100}%)` }}>
        <KnockoutPlate
          lines={p.wordmark.map((l) => l.toUpperCase())}
          maskId="surreal-vertical-cta"
          plate={p.accent}
          width={W}
          height={H}
          size={200}
          centerY={860}
          settle={settle}
          filled={filled}
          fill={p.ground}
          fontFamily={type.display}
          fontWeight={type.displayWeight}
          letterSpacing={type.knockoutTracking}
        />

        <div
          style={{
            position: "absolute",
            left: 200,
            right: 200,
            top: 1060,
            height: 1,
            background: COLOR.onDarkRule,
            transform: `scaleX(${line})`,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: MARGIN,
            right: MARGIN,
            top: 1100,
            textAlign: "center",
            fontFamily: type.display,
            fontWeight: type.displayMediumWeight,
            fontSize: 44,
            letterSpacing: "-0.02em",
            color: COLOR.onDark,
            opacity: line,
            transform: `translateY(${(1 - line) * 14}px)`,
          }}
        >
          {p.line}
        </div>

        <div
          style={{
            position: "absolute",
            left: MARGIN,
            top: 1600,
            ...monoStyle(type, p.accent, 28),
            background: p.ground,
            padding: "12px 18px",
            clipPath: `inset(0 ${(1 - cta) * 100}% 0 0)`,
          }}
        >
          {p.cta}
        </div>

        <div
          style={{
            position: "absolute",
            left: MARGIN,
            top: 1690,
            ...monoStyle(type, COLOR.onDark, 28),
            clipPath: `inset(0 ${(1 - cta) * 100}% 0 0)`,
          }}
        >
          {p.handle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

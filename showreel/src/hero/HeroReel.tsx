import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  getRemotionEnvironment,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLOR, FONT, OUT } from "../theme";
import { loadFonts } from "../fonts";
import { Annotated } from "./components/Annotated";
import { BrowserWindow } from "./components/BrowserWindow";
import { Clip } from "./components/Clip";
import { Cursor } from "./components/Cursor";
import { FigmaFrame } from "./components/FigmaFrame";
import { FinalTitle } from "./components/FinalTitle";
import { Gallery3D } from "./components/Gallery3D";
import { MascotTitle } from "./components/MascotTitle";
import { FloatingCards } from "./components/FloatingCards";
import { LogoWall } from "./components/LogoWall";
import { CircleReveal, MaskReveal } from "./components/MaskReveal";
import { Mosaic } from "./components/Mosaic";
import { SystemLabel } from "./components/SystemLabel";
import { MobileGrid } from "./components/MobileGrid";
import { WebGallery } from "./components/WebGallery";
import { EditLayer } from "./EditLayer";
import { cursorAt } from "./cursorPath";
import { defaultHeroProps, timelineOf, type HeroProps } from "./layout";
import { ShotTransition } from "./components/ShotTransition";

loadFonts();

/* Project palettes, sampled from the sites themselves. The reel borrows the
 * work's own colours for its panel fields so the brand system stays connective
 * tissue rather than a wrapper. */
const GROW_CREAM = "#EEEDE1";
const GROW_TEAL = "#0E5049";
const CREO_GREEN = "#233D36";
const CREO_STONE = "#DFDBD8";

/* ------------------------------------------------------------------ *
 * HOOK
 * ------------------------------------------------------------------ */

/**
 * 01 · Opens on a composed grid, not a full-bleed capture: the largest panel is
 * hands building a light sculpture, with colour fields and a type plate around
 * it. Beautiful and about making things, inside one frame.
 */
const MosaicOpen: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => {
  return (
    <Mosaic
      duration={d}
      background={COLOR.groundDark}
      panels={[
        {
          col: 0,
          row: 0,
          w: 8,
          h: 6,
          src: p.clips.mosaicMain,
          startFrom: 22,
          driftY: -18,
        },
        { col: 8, row: 0, w: 4, h: 2, color: CREO_GREEN, driftX: 14, delay: 4 },
        {
          col: 8,
          row: 2,
          w: 4,
          h: 4,
          src: p.clips.mosaicSide,
          startFrom: 28,
          driftY: 20,
          delay: 8,
        },
        { col: 0, row: 6, w: 5, h: 2, color: GROW_TEAL, driftX: -16, delay: 10 },
        {
          col: 5,
          row: 6,
          w: 3,
          h: 2,
          src: p.clips.mosaicCorner,
          startFrom: 20,
          driftX: 12,
          delay: 14,
        },
        {
          col: 8,
          row: 6,
          w: 4,
          h: 2,
          color: "#F4E39B",
          text: p.openPlate,
          textColor: "#1A1A1A",
          serif: true,
          driftY: 16,
          delay: 18,
        },
      ]}
    />
  );
};

/**
 * 02 · The panels clear and the cursor draws a design frame out of the empty
 * ground. Local frames 8→30 match the cursor keyframes.
 */
const FRAME_RECT = { x: 470, y: 250, w: 980, h: 580 };

const CursorSelect: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [8, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <div
        style={{
          position: "absolute",
          left: FRAME_RECT.x,
          top: FRAME_RECT.y,
          width: FRAME_RECT.w * draw,
          height: FRAME_RECT.h * draw,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile("media/creo-hero-still.png")}
          style={{
            width: FRAME_RECT.w,
            height: FRAME_RECT.h,
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />
      </div>

      <FigmaFrame
        x={FRAME_RECT.x}
        y={FRAME_RECT.y}
        width={FRAME_RECT.w}
        height={FRAME_RECT.h}
        name="creo — home"
        draw={draw}
      />
      <SystemLabel
        text="Design"
        x={p.labelDesign.x}
        y={p.labelDesign.y}
        delay={16}
        hold={22}
        variant="bare"
        dark={false}
        size={30}
      />
    </AbsoluteFill>
  );
};

/**
 * 03 · FIGMA → LIVE. The cursor clicks outside the frame at local 26: handles
 * drop, browser chrome draws on, the site starts moving, and the window opens
 * to full bleed. Same rectangle throughout — the same object becoming real.
 */
const FigmaToLive: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => {
  const frame = useCurrentFrame();
  const PUBLISH = 26;

  const live = frame >= PUBLISH;
  const selected = interpolate(frame, [PUBLISH - 2, PUBLISH + 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const open = interpolate(frame, [PUBLISH + 14, d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      {live ? (
        <BrowserWindow
          url="creo-agency.com"
          left={interpolate(open, [0, 1], [FRAME_RECT.x, 0])}
          top={interpolate(open, [0, 1], [FRAME_RECT.y, 0])}
          width={interpolate(open, [0, 1], [FRAME_RECT.w, 1920])}
          height={interpolate(open, [0, 1], [FRAME_RECT.h, 1080])}
          drawFrom={PUBLISH}
          dark={false}
        >
          <Clip src={p.clips.creoLive} startFrom={8} duration={d} from={1.0} to={1.06} />
        </BrowserWindow>
      ) : (
        <div
          style={{
            position: "absolute",
            left: FRAME_RECT.x,
            top: FRAME_RECT.y,
            width: FRAME_RECT.w,
            height: FRAME_RECT.h,
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile("media/creo-hero-still.png")}
            style={{
              width: FRAME_RECT.w,
              height: FRAME_RECT.h,
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        </div>
      )}

      <FigmaFrame
        x={FRAME_RECT.x}
        y={FRAME_RECT.y}
        width={FRAME_RECT.w}
        height={FRAME_RECT.h}
        name="creo — home"
        selected={selected}
      />

      <SystemLabel text="Studio → dev" x={p.labelStudioDev.x} y={p.labelStudioDev.y} delay={4} hold={18} />
      <SystemLabel text="Live ↗" x={p.labelStudioDev.x} y={p.labelStudioDev.y} delay={PUBLISH + 4} hold={16} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * ACCEL
 * ------------------------------------------------------------------ */

/** 04 · The build we just published, now annotated with what I owned on it. */
const CreoAnnotated: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => {
  return (
    <Annotated
      src={p.clips.creoAnnotated}
      url="creo-agency.com"
      startFrom={16}
      duration={d}
      tag={p.creoTag}
      background={CREO_STONE}
      callouts={p.creoCallouts}
    />
  );
};

/** 05 · The striped circle pushed toward frame centre — link one of the chain. */
const CIRCLE_A = { cx: 1150, cy: 560 };

const CreoCircle: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => {
  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Clip
        src={p.clips.creoCircle}
        startFrom={18}
        duration={d}
        from={1.08}
        to={1.26}
        origin="62% 58%"
        objectPosition="62% 58%"
      />
    </AbsoluteFill>
  );
};

/** 06 · MATCH CUT — stripes to tree rings, opening into an editorial mosaic. */
const GrowMosaic: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => {
  return (
    <AbsoluteFill style={{ background: GROW_CREAM }}>
      <CircleReveal cx={CIRCLE_A.cx} cy={CIRCLE_A.cy} from={150} to={1800} duration={20}>
        <Mosaic
          duration={d}
          background={GROW_CREAM}
          panels={[
            {
              col: 0,
              row: 0,
              w: 7,
              h: 5,
              src: p.clips.growHero,
              startFrom: 14,
              driftY: -7,
            },
            {
              col: 7,
              row: 0,
              w: 5,
              h: 3,
              src: p.clips.growStory,
              startFrom: 22,
              driftX: 6,
              delay: 8,
            },
            {
              col: 7,
              row: 3,
              w: 5,
              h: 5,
              src: p.clips.growWorks,
              startFrom: 30,
              driftY: 9,
              delay: 14,
            },
            {
              col: 0,
              row: 5,
              w: 4,
              h: 3,
              color: GROW_TEAL,
              text: "Editorial",
              textColor: GROW_CREAM,
              serif: true,
              driftX: -6,
              delay: 20,
            },
            {
              col: 4,
              row: 5,
              w: 3,
              h: 3,
              src: p.clips.growMission,
              startFrom: 18,
              driftY: 7,
              delay: 26,
            },
          ]}
        />
      </CircleReveal>
    </AbsoluteFill>
  );
};

/** 07 · Product UI cropped to floating cards on a cobalt field. */
const AthinaCards: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => {
  return (
    <>
      <FloatingCards
        duration={d}
        background={COLOR.cobalt}
        arrow={{ x: 1620, y: 470, delay: 34 }}
        cards={p.athinaCards.map((c, i) => ({
          ...c,
          startFrom: [16, 24, 20][i] ?? 16,
          objectPosition: ["50% 30%", "50% 40%", "50% 45%"][i] ?? "50% 40%",
          float: [-16, -8, -20][i] ?? -12,
        }))}
      />
      <SystemLabel
        text="Interact"
        x={p.labelInteract.x}
        y={p.labelInteract.y}
        delay={30}
        hold={20}
        variant="bare"
        size={30}
      />
    </>
  );
};

/** 08 · Pull back: the whole Athina build, annotated. Precision, not a demo. */
const AthinaAnnotated: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => {
  return (
    <Annotated
      src={p.clips.athinaAnnotated}
      url="athina.ai"
      startFrom={14}
      duration={d}
      tag={p.athinaTag}
      callouts={p.athinaCallouts}
    />
  );
};

/** 09 · MATCH CUT — Athina's gradient sphere becomes Surreal's WebGL globe. */
const SPHERE = { cx: 1180, cy: 470 };

const SurrealGlobe: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => {
  return (
    <AbsoluteFill style={{ background: COLOR.groundDark }}>
      <CircleReveal cx={SPHERE.cx} cy={SPHERE.cy} from={120} to={1900} duration={18}>
        <Clip src={p.clips.surrealGlobe} startFrom={30} duration={d} from={1.1} to={1.02} />
      </CircleReveal>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * RESOLVE
 * ------------------------------------------------------------------ */

/** 10 · From one build to the whole roster. Marks and capabilities, drifting. */
const Wall: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => (
  <LogoWall duration={d} rows={p.logoRows} />
);

/**
 * 11 · The whole body of work arrives at once: four full-page designs fly in on
 * staggered arcs and settle into a gallery, then keep scrolling.
 */

const Gallery: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => (
  <>
    {p.galleryStyle === "carousel3d" ? (
      <Gallery3D
        // Each design twice, so the ring is dense enough that something always
        // faces the camera — four panels at 90 degrees leaves front and back
        // edge-on and the frame reads as two floating slabs.
        panels={[...p.gallery, ...p.gallery].map((g) => ({ src: g.src }))}
        duration={d}
        background={COLOR.groundDark}
      />
    ) : (
      <WebGallery items={p.gallery} duration={d} background={COLOR.groundLight} />
    )}
    <SystemLabel
      text="Ship"
      x={p.labelShip.x}
      y={p.labelShip.y}
      delay={30}
      hold={26}
      variant="bare"
      dark={p.galleryStyle === "carousel3d"}
      size={30}
    />
  </>
);

/**
 * 12 · Sixteen real phone captures. The only shot that proves the builds are
 * responsive, and it never has to use the word.
 */

const Phones: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => (
  <MobileGrid columns={p.phoneColumns} duration={d} background={COLOR.groundDark} />
);

/** 13 · The exhale. One long editorial composition, no labels, no cursor. */
const CalmHold: React.FC<{ p: HeroProps; d: number }> = ({ p, d }) => {
  return (
    <AbsoluteFill style={{ background: GROW_CREAM }}>
      <MaskReveal direction="up" duration={18}>
        <Clip src={p.clips.calmHold} startFrom={10} duration={d} from={1.02} to={1.12} />
      </MaskReveal>
    </AbsoluteFill>
  );
};

/**
 * 14 · The closing frame, in two flavours. Both are fed the cursor's live
 * position: the clean one lights the portfolio's dot field with it, the playful
 * one has the mascot's eyes follow it out of frame.
 */
const Ending: React.FC<{
  p: HeroProps;
  d: number;
  cursorX: number;
  cursorY: number;
}> = ({ p, d, cursorX, cursorY }) =>
  p.ending === "playful" ? (
    <MascotTitle
      duration={d}
      title={p.title}
      pattern={p.showPattern}
      cursorX={cursorX}
      cursorY={cursorY}
    />
  ) : (
    <FinalTitle
      duration={d}
      title={p.title}
      pattern={p.showPattern}
      cursorX={cursorX}
      cursorY={cursorY}
    />
  );

/* ------------------------------------------------------------------ */

export const HeroReel: React.FC<Partial<HeroProps>> = (input) => {
  const p: HeroProps = { ...defaultHeroProps, ...input };
  const timeline = timelineOf(p);

  // Top-level, so this is the absolute frame — inside a Sequence it would be
  // shot-relative and the cursor would jump back to the start of every shot.
  const absoluteFrame = useCurrentFrame();
  const cursor = cursorAt(absoluteFrame, timeline);

  /**
   * Scene per shot id. Rendering from the timeline rather than a hardcoded list
   * is what makes a shot deletable: switch it off and it is simply not here,
   * and every later shot slides up to close the gap.
   */
  const sceneFor = (id: string, d: number): React.ReactNode =>
    ({
      "mosaic-open": <MosaicOpen p={p} d={d} />,
      "cursor-select": <CursorSelect p={p} d={d} />,
      "creo-figma-to-live": <FigmaToLive p={p} d={d} />,
      "creo-annotated": <CreoAnnotated p={p} d={d} />,
      "creo-circle": <CreoCircle p={p} d={d} />,
      "grow-mosaic": <GrowMosaic p={p} d={d} />,
      "athina-cards": <AthinaCards p={p} d={d} />,
      "athina-annotated": <AthinaAnnotated p={p} d={d} />,
      "surreal-globe": <SurrealGlobe p={p} d={d} />,
      "logo-wall": <Wall p={p} d={d} />,
      "web-gallery": <Gallery p={p} d={d} />,
      "mobile-grid": <Phones p={p} d={d} />,
      "calm-hold": <CalmHold p={p} d={d} />,
      "final-title": (
        <Ending p={p} d={d} cursorX={cursor.x} cursorY={cursor.y} />
      ),
    })[id];

  const last = timeline.shots[timeline.shots.length - 1];

  return (
    <AbsoluteFill style={{ background: COLOR.groundDark }}>
      {timeline.shots.map((s, i) => {
        const scene = sceneFor(s.id, s.duration);
        if (!scene) {
          return null;
        }
        return (
          <Sequence
            key={s.id}
            from={s.from}
            // Held past its own end for the length of the next shot's
            // transition, so a reveal has something real to open over.
            durationInFrames={s.duration + s.outroFrames}
          >
            <ShotTransition
              type={i === 0 ? "cut" : s.transition}
              duration={s.transitionFrames}
              seed={s.id}
            >
              {scene}
            </ShotTransition>
          </Sequence>
        );
      })}

      {/*
        The loop seam. The cursor is exiting right, so the opening panel wipes in
        behind it and the last frame lands on what the first frame shows — a hero
        that loops without a visible jump from light title to dark footage.
      */}
      {last ? (
        <Sequence from={Math.max(0, timeline.total - 12)} durationInFrames={12}>
          <MaskReveal direction="right" duration={12}>
            <AbsoluteFill style={{ background: COLOR.groundDark }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 1280,
                  height: 810,
                  overflow: "hidden",
                }}
              >
                <Clip
                  // Must track the opening shot or the loop stops matching.
                  src={p.clips.mosaicMain}
                  startFrom={10}
                  duration={12}
                  from={1.04}
                  to={1.04}
                />
              </div>
            </AbsoluteFill>
          </MaskReveal>
        </Sequence>
      ) : null}

      {/* Above every cut, on one unbroken path. */}
      <Cursor timeline={timeline} />

      {/*
        Belt and braces: the overlay is off during any render, so a stray
        editMode:true saved into defaultProps can never leak into an export.
        This is why the render script does NOT pass --props to force it off —
        doing that would replace the defaultProps the Studio saves, silently
        throwing away every edit made in the editor.
      */}
      {p.editMode && !getRemotionEnvironment().isRendering ? (
        <EditLayer props={p} timeline={timeline} />
      ) : null}
    </AbsoluteFill>
  );
};

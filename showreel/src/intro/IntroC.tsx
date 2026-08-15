import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLOR, LINEAR_ISH, OUT } from "../theme";
import { resolveFonts } from "../typography";
import { loadFonts } from "../fonts";
import { MaskText } from "../components/MaskText";
import { SiteFrame } from "../components/SiteFrame";
import { defaultIntroCProps, type IntroCProps } from "./introLayout";

loadFonts();

/**
 * Intro C — "CRT".
 *
 * The site's hero object, moving: the vintage monitor photograph from the
 * atomicdesignz.com artboard, with the blue screen replaced by real footage of
 * a build. It exists because A and B both open on a rectangle of capture; this
 * one opens on an object in a room, so the first second reads as photography
 * and the work arrives *inside* something rather than as another panel.
 *
 * The screen boots rather than cuts — blue plate, a scanline flash, then the
 * clip — because the whole conceit is a device being switched on.
 *
 * Screen geometry is measured off the source photograph (1280×720: the blue
 * plate spans x 480→797, y 122→363) and scaled by 1.5 to the 1920×1080 canvas,
 * then bled 3px on every side — the plate's edge is antialiased, and at the
 * exact measurement a blue hairline survives around the footage.
 * If the photograph is ever re-exported, re-measure — nothing here infers it.
 *
 * How the footage sits in that rect is `screenFit` / `screenZoom` /
 * `screenZoomTo` / `screenPosition`, all editable in the Studio: the tube is
 * 4:3 and the captures are 16:9, so the fit is a judgement call per clip, not
 * a constant. This is why the screen does not use the shared `Clip` component,
 * which is hardcoded to cover.
 */

const PHOTO = "media/crt-monitor.png";
const SCREEN = { x: 717, y: 180, w: 483, h: 369 };

/** Frame the picture tube lights up on. */
const BOOT = 16;

export const IntroC: React.FC<Partial<IntroCProps>> = (input) => {
  const p: IntroCProps = { ...defaultIntroCProps, ...input };
  const frame = useCurrentFrame();
  const d = p.durationInFrames;
  const type = resolveFonts(p);

  // Slow push on the whole photograph, anchored on the tube. Small on purpose:
  // this is a locked-off product shot, not a dolly.
  const push = interpolate(frame, [0, d], [1.0, 1.085], {
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  // Power-on: the picture opens from a horizontal line, the way a tube does.
  const boot = interpolate(frame, [BOOT, BOOT + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // One frame of blown-out white as the beam strikes, then gone.
  const flash = interpolate(frame, [BOOT, BOOT + 2, BOOT + 9], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rule = interpolate(frame, [4, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // The screen's own push, separate from the camera push on the photograph.
  const screenScale = interpolate(frame, [0, d], [p.screenZoom, p.screenZoomTo], {
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  const chip = interpolate(frame, [BOOT + 30, BOOT + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <SiteFrame url={p.siteUrl}>
      <AbsoluteFill style={{ background: "#F4F3EF", overflow: "hidden" }}>
        {/* Photograph and screen share one transform so the footage stays
            registered to the tube through the push. */}
        <AbsoluteFill
          style={{
            transform: `scale(${push})`,
            transformOrigin: `${SCREEN.x + SCREEN.w / 2}px ${SCREEN.y + SCREEN.h / 2}px`,
          }}
        >
          <Img
            src={staticFile(PHOTO)}
            style={{
              width: 1920,
              height: 1080,
              objectFit: "cover",
              objectPosition: "center center",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: SCREEN.x,
              top: SCREEN.y,
              width: SCREEN.w,
              height: SCREEN.h,
              overflow: "hidden",
              // The tube's corners are soft, not square.
              borderRadius: 6,
              background: p.accent,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                // The bars `contain` leaves are the unlit tube, not the plate.
                background: COLOR.groundDark,
                // Opens from the centre line outward.
                clipPath: `inset(${(1 - boot) * 50}% 0 ${(1 - boot) * 50}% 0)`,
              }}
            >
              <OffthreadVideo
                src={staticFile(`media/${p.clip}`)}
                startFrom={p.clipStartFrom}
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: p.screenFit,
                  objectPosition: p.screenPosition,
                  transform: `scale(${screenScale})`,
                  transformOrigin: p.screenPosition,
                }}
              />
            </div>

            {/* Scanlines + a soft edge burn. Both are what stop the clip
                reading as a rectangle pasted onto a photograph. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)",
                opacity: 0.55 * boot,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxShadow:
                  "inset 0 0 40px rgba(0,0,0,0.45), inset 0 0 6px rgba(255,255,255,0.35)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#FFFFFF",
                opacity: flash,
              }}
            />
          </div>
        </AbsoluteFill>

        {/* Type sits on the seamless white of the set, left of the plinth —
            the one region of the photograph with nothing in it. */}
        <div style={{ position: "absolute", left: 96, top: 132, width: 560 }}>
          <div
            style={{
              fontFamily: type.mono,
              fontSize: 20,
              letterSpacing: type.monoTracking,
              textTransform: "uppercase",
              color: p.accent,
              clipPath: `inset(0 ${(1 - rule) * 100}% 0 0)`,
              marginBottom: 22,
            }}
          >
            {p.eyebrow}
          </div>
          <div
            style={{
              height: 1,
              background: COLOR.inkRule,
              transform: `scaleX(${rule})`,
              transformOrigin: "left center",
              marginBottom: 36,
            }}
          />
          <MaskText
            lines={p.headline}
            delay={BOOT + 4}
            stagger={6}
            duration={26}
            lineHeight={0.94}
            style={{
              fontFamily: type.display,
              fontWeight: type.displayWeight,
              fontSize: 116,
              letterSpacing: type.displayTracking,
              color: p.ink,
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 96,
            top: 880,
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

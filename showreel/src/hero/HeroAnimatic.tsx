import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLOR, FONT } from "../theme";
import { cursorAt } from "./cursorPath";
import { SHOTS, TOTAL_FRAMES, roleBudget } from "./shots";
import { buildTimeline, defaultShotEntries } from "./timeline";

/**
 * Timing rig. Same shot table as the finished reel, but each shot is a held
 * still with its own readout — so pacing can be judged before a single
 * transition is built. If a cut feels wrong here it will feel wrong finished.
 */

const PLATE: Record<string, string> = {
  "mosaic-open": "surreal-facility",
  "cursor-select": "creo-hero",
  "creo-figma-to-live": "creo-hero",
  "creo-annotated": "creo-portfolio",
  "creo-circle": "creo-circle",
  "grow-mosaic": "grow-hero",
  "athina-cards": "athina-panels",
  "athina-annotated": "athina-observe",
  "surreal-globe": "surreal-globe",
  "logo-wall": "creo-services",
  "window-stack": "athina-data",
  "quad-ship": "creo-portfolio",
  "calm-hold": "grow-mission",
  "final-title": "",
};

const PHASE_COLOR = {
  hook: "#1A2EF2",
  accel: "#F26A1A",
  resolve: "#12A150",
} as const;

const Card: React.FC<{ index: number }> = ({ index }) => {
  const s = SHOTS[index];
  const plate = PLATE[s.id];

  return (
    <AbsoluteFill style={{ background: COLOR.groundDark }}>
      {plate ? (
        <Img
          src={staticFile(`media/anim/${plate}.jpg`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.45,
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          padding: 80,
          justifyContent: "space-between",
          fontFamily: FONT.mono,
          color: COLOR.onDark,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26 }}>
          <span>
            {String(index + 1).padStart(2, "0")} / {SHOTS.length} · {s.id}
          </span>
          <span style={{ color: PHASE_COLOR[s.phase] }}>
            {s.phase.toUpperCase()} · {s.role.toUpperCase()}
          </span>
        </div>

        <div>
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: 78,
              letterSpacing: "-0.04em",
              marginBottom: 20,
            }}
          >
            {s.project === "none" ? "SYSTEM" : s.project.toUpperCase()}
          </div>
          <div style={{ fontSize: 28, marginBottom: 10, color: COLOR.cobaltOnDark }}>
            CUT: {s.cut.toUpperCase()}
          </div>
          <div style={{ fontSize: 26, opacity: 0.75, maxWidth: 1200 }}>{s.note}</div>
          <div style={{ fontSize: 26, marginTop: 20, opacity: 0.6 }}>
            {(s.duration / 30).toFixed(2)}s · f{s.from}–{s.from + s.duration}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Timeline: React.FC = () => {
  const frame = useCurrentFrame();
  const budget = roleBudget();

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div style={{ padding: "0 80px 24px", fontFamily: FONT.mono, fontSize: 22, color: COLOR.onDarkMuted }}>
        craft {(budget.craft / 30).toFixed(1)}s · process {(budget.process / 30).toFixed(1)}s ·
        positioning {(budget.positioning / 30).toFixed(1)}s
      </div>
      <div style={{ display: "flex", height: 26, width: "100%" }}>
        {SHOTS.map((s) => (
          <div
            key={s.id}
            style={{
              width: `${(s.duration / TOTAL_FRAMES) * 100}%`,
              background: PHASE_COLOR[s.phase],
              opacity: frame >= s.from && frame < s.from + s.duration ? 1 : 0.28,
              borderRight: "1px solid rgba(0,0,0,0.5)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: `${(frame / TOTAL_FRAMES) * 100}%`,
          width: 2,
          height: 26,
          background: "#fff",
        }}
      />
    </AbsoluteFill>
  );
};

/** Ghost of the real cursor path, so choreography can be checked at this stage too. */
const CursorGhost: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cursorAt(frame, buildTimeline(defaultShotEntries));
  const size = c.state === "press" ? 26 : 32;

  return (
    <div
      style={{
        position: "absolute",
        left: c.x,
        top: c.y,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${COLOR.cobaltOnDark}`,
        background: c.state === "drag" ? COLOR.cobaltOnDark : "transparent",
        opacity: interpolate(c.opacity, [0, 1], [0, 1]),
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};

export const HeroAnimatic: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLOR.groundDark }}>
      {SHOTS.map((s, i) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.duration}>
          <Card index={i} />
        </Sequence>
      ))}
      <CursorGhost />
      <Timeline />
    </AbsoluteFill>
  );
};

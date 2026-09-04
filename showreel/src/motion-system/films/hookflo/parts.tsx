import React from "react";
import { useBrand } from "../../brand/BrandProvider";
import { G, SOURCE_TILE, type Delivery } from "./score";

/**
 * Film-specific parts for "The Missing Dot".
 *
 * These are the 20% custom glue the brief allows for. They are NOT patterns and
 * they are not going into `patterns/`: a log row and a Slack card are content
 * for one film, not a reusable shot behaviour. What IS generalisable out of
 * this file is noted at the bottom of PROCESS.md.
 *
 * Every one of them reads colour and type from `useBrand()` and takes progress
 * as a number, never a frame — the composition owns time, the parts own shape.
 */

const sem = (b: ReturnType<typeof useBrand>["brand"], k: string) =>
  b.colors.semantic?.[k] ?? b.colors.foreground;

/* ------------------------------------------------------------------ *
 * The one light in the world. Fixed for the whole film.
 * ------------------------------------------------------------------ */
export const Bloom: React.FC = () => {
  const { brand } = useBrand();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 560,
        background: `radial-gradient(940px 440px at 50% -120px, ${sem(brand, "bloom")}, transparent 72%)`,
      }}
    />
  );
};

/* ------------------------------------------------------------------ *
 * A marker. The film's protagonist: eight of these start as the mark's
 * dots, become row rails, and go home at the end.
 * ------------------------------------------------------------------ */
export const Marker: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
}> = ({ x, y, size, color, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      opacity,
    }}
  />
);

/** The empty slot: a hairline ring where a marker should be and is not. */
export const EmptySlot: React.FC<{ x: number; y: number; size: number; opacity?: number }> = ({
  x,
  y,
  size,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 1px rgba(250,250,250,0.09)",
      opacity,
    }}
  />
);

/* ------------------------------------------------------------------ *
 * Chips and tiles — the only places semantic colour is allowed.
 * ------------------------------------------------------------------ */
export const Chip: React.FC<{ kind: "ok" | "bad" | "lav" | "pending"; label: string; t: number }> = ({
  kind,
  label,
  t,
}) => {
  const { brand, type } = useBrand();
  const map = {
    ok: { fg: sem(brand, "ok"), bg: sem(brand, "okPlate") },
    bad: { fg: sem(brand, "fail"), bg: sem(brand, "failPlate") },
    lav: { fg: brand.colors.background, bg: brand.colors.accent },
    pending: { fg: "#71717A", bg: "rgba(255,255,255,0.05)" },
  }[kind];
  return (
    <span
      style={{
        ...type("label", 15),
        textTransform: "none",
        letterSpacing: "0.02em",
        color: map.fg,
        background: map.bg,
        padding: "4px 12px",
        borderRadius: brand.surfaces.radius.small - 2,
        // Chips clip open from the left. They never fade and never scale.
        clipPath: `inset(0 ${(1 - t) * 100}% 0 0)`,
      }}
    >
      {label}
    </span>
  );
};

export const SourceTile: React.FC<{ source: Delivery["source"]; size?: number; muted?: boolean }> = ({
  source,
  size = 28,
  muted,
}) => {
  const { brand, type } = useBrand();
  const s = SOURCE_TILE[source];
  return (
    <span
      style={{
        ...type("label", size * 0.43),
        textTransform: "none",
        letterSpacing: "0.02em",
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: brand.surfaces.radius.small - 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: muted ? "#3F3F46" : s.fg,
        background: muted ? "rgba(255,255,255,0.03)" : s.bg,
      }}
    >
      {s.tag}
    </span>
  );
};

/* ------------------------------------------------------------------ *
 * A log row. Content only — the marker is drawn by the composition, in
 * frame space, because it has to survive leaving this row entirely.
 * ------------------------------------------------------------------ */
export const Row: React.FC<{
  d: Delivery;
  /** 0-1: how much of the row's content has been written. */
  t: number;
  /** 0-1 on the status chip. 0 = no chip at all. */
  chip: number;
  chipKind: "ok" | "bad" | "lav" | "pending";
  chipLabel: string;
  /** Seconds-ago to print. */
  age: number;
  /** The failing row before Hookflo finds it: present, but unattended. */
  ghost?: boolean;
  lit?: boolean;
  compact?: boolean;
  width: number;
}> = ({ d, t, chip, chipKind, chipLabel, age, ghost, lit, compact, width }) => {
  const { brand, type } = useBrand();
  const padX = compact ? 20 : G.row.padX;
  const nameSize = compact ? 16 : 19;
  const evSize = compact ? 15 : 18;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height: G.row.h,
        display: "flex",
        alignItems: "center",
        gap: compact ? 14 : 20,
        padding: `0 ${padX}px`,
        boxSizing: "border-box",
        // Content is written, not faded: each row clips open left to right.
        clipPath: `inset(0 ${(1 - t) * 100}% 0 0)`,
      }}
    >
      {/* the marker's seat — the marker itself lives in frame space */}
      <span style={{ flex: `0 0 ${G.row.dot}px`, width: G.row.dot }} />
      <span
        style={{
          flex: `0 0 ${compact ? 150 : 190}px`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          ...type("body", nameSize),
          letterSpacing: "-0.015em",
          color: ghost ? "#3F3F46" : lit ? brand.colors.foreground : "#D4D4D8",
        }}
      >
        <SourceTile source={d.source} size={compact ? 24 : 28} muted={ghost} />
        {d.name}
      </span>
      <span
        style={{
          flex: 1,
          ...type("label", evSize),
          textTransform: "none",
          letterSpacing: "-0.005em",
          color: ghost ? "#3F3F46" : lit ? "#FFFFFF" : "#A1A1AA",
        }}
      >
        {d.event}
      </span>
      {!compact && (
        <span
          style={{
            flex: "0 0 128px",
            textAlign: "right",
            ...type("label", 16),
            textTransform: "none",
            letterSpacing: "0",
            color: ghost ? "#2E2E33" : "#52525B",
          }}
        >
          {age <= 0 ? "now" : `${age}s ago`}
        </span>
      )}
      {/*
        The timestamp column is dropped when the panel is narrow, but the status
        chip never is: it is the evidence the alert card is making a claim about.
      */}
      <span style={{ flex: "0 0 104px", display: "flex", justifyContent: "flex-end" }}>
        {chip > 0 ? <Chip kind={chipKind} label={chipLabel} t={chip} /> : null}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Window chrome. The site's tell that a thing is running.
 * ------------------------------------------------------------------ */
export const Chrome: React.FC<{ pre: string; host: string; post: string; compact?: boolean }> = ({
  pre,
  host,
  post,
  compact,
}) => {
  const { brand, type } = useBrand();
  return (
    <div
      style={{
        height: G.panel.chrome,
        background: sem(brand, "chrome"),
        borderBottom: `1px solid ${brand.colors.rule}`,
        display: "flex",
        alignItems: "center",
        padding: `0 ${compact ? 18 : 22}px`,
        gap: 9,
        position: "relative",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: "#3F3F46" }} />
      ))}
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          ...type("label", compact ? 13 : 15),
          textTransform: "none",
          letterSpacing: "0",
          color: "#71717A",
          background: brand.colors.background,
          border: `1px solid ${brand.colors.rule}`,
          borderRadius: brand.surfaces.radius.small - 1,
          padding: "5px 16px",
        }}
      >
        {pre}
        <span style={{ color: "#E4E4E7" }}>{host}</span>
        {post}
      </span>
    </div>
  );
};

/** The status strip along the bottom of the window. It always reads something. */
export const Strip: React.FC<{ left: string; leftColor?: string; compact?: boolean }> = ({
  left,
  leftColor,
  compact,
}) => {
  const { brand, type } = useBrand();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: G.panel.strip,
        borderTop: `1px solid ${brand.colors.rule}`,
        background: sem(brand, "chrome"),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `0 ${compact ? 20 : 26}px`,
        ...type("label", compact ? 14 : 16),
        textTransform: "none",
        letterSpacing: "0",
        color: "#A1A1AA",
      }}
    >
      <span style={{ color: leftColor ?? "#A1A1AA" }}>{left}</span>
      <span style={{ color: brand.colors.accent }}>hookflo</span>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * The alert. Writes itself line by line; shuts toward its own marker.
 * ------------------------------------------------------------------ */
export const AlertCard: React.FC<{
  /** 0-1 open, 0-1 shut. */
  open: number;
  shut: number;
  /** Per-line write progress, 0-1. */
  lines: number[];
  resolved: boolean;
}> = ({ open, shut, lines, resolved }) => {
  const { brand, type } = useBrand();
  const accent = resolved ? brand.colors.accent : sem(brand, "fail");
  return (
    <div
      style={{
        position: "absolute",
        left: G.card.x,
        top: G.card.y,
        width: G.card.w,
        border: `1px solid ${brand.colors.rule}`,
        borderRadius: brand.surfaces.radius.medium,
        background: sem(brand, "panelSolid"),
        overflow: "hidden",
        boxShadow: brand.surfaces.shadowValue,
        // Opens downward from its header, shuts back up into it.
        clipPath: `inset(0 ${shut * 100}% ${(1 - open) * 100}% 0)`,
      }}
    >
      <div
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 24px",
          borderBottom: `1px solid ${brand.colors.rule}`,
          ...type("label", 15),
          letterSpacing: "0.16em",
          color: brand.colors.muted,
        }}
      >
        <span style={{ width: 11, height: 11, borderRadius: 3, background: accent }} />
        <span>#eng-alerts</span>
        <span style={{ marginLeft: "auto", letterSpacing: "0.1em", color: "#52525B" }}>via hookflo</span>
      </div>
      <div style={{ padding: "24px 24px 22px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            height: 32,
            ...type("body", 21),
            letterSpacing: "-0.02em",
            color: "#E4E4E7",
            clipPath: `inset(0 ${(1 - (lines[0] ?? 0)) * 100}% 0 0)`,
          }}
        >
          {/* the marker's seat inside the card — the marker itself arrives here */}
          <span style={{ width: 15, flex: "0 0 15px" }} />
          Stripe · invoice.payment_failed
        </div>
        <div
          style={{
            ...type("subhead", 30),
            fontWeight: 400,
            letterSpacing: "-0.035em",
            lineHeight: 1.12,
            color: "#FFFFFF",
            margin: "18px 0 12px",
            clipPath: `inset(0 ${(1 - (lines[1] ?? 0)) * 100}% 0 0)`,
          }}
        >
          Delivery failed — signature could not be verified.
        </div>
        <div
          style={{
            ...type("label", 16),
            textTransform: "none",
            letterSpacing: "0",
            color: "#71717A",
            lineHeight: 1.75,
            clipPath: `inset(0 ${(1 - (lines[2] ?? 0)) * 100}% 0 0)`,
          }}
        >
          410 · endpoint secret rotated
          <br />
          03:14:06 · 1 of 1 240 deliveries today
        </div>
      </div>
      <div
        style={{
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          borderTop: `1px solid ${brand.colors.rule}`,
          clipPath: `inset(0 ${(1 - (lines[3] ?? 0)) * 100}% 0 0)`,
        }}
      >
        <span style={{ ...type("label", 15), textTransform: "none", letterSpacing: "0", color: "#71717A" }}>
          now
        </span>
        <span
          style={{
            ...type("label", 15),
            textTransform: "none",
            letterSpacing: "0",
            color: brand.colors.accent,
            border: `1px solid rgba(196,181,253,0.35)`,
            borderRadius: brand.surfaces.radius.small - 1,
            padding: "7px 15px",
          }}
        >
          View log ↗
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * The baseline: a hairline across the bottom margin with the clock on it.
 * It is the only thing present in every single frame of the film.
 * ------------------------------------------------------------------ */
export const Baseline: React.FC<{ left: string; right: string; t?: number }> = ({
  left,
  right,
  t = 1,
}) => {
  const { brand, type } = useBrand();
  return (
    <div
      style={{
        position: "absolute",
        left: G.margin,
        right: G.margin,
        bottom: 74,
        borderTop: `1px solid ${brand.colors.rule}`,
        paddingTop: 18,
        display: "flex",
        justifyContent: "space-between",
        ...type("label", 17),
        textTransform: "none",
        letterSpacing: "0",
        color: "#71717A",
        clipPath: `inset(0 ${(1 - t) * 100}% 0 0)`,
      }}
    >
      <span>{left}</span>
      <span style={{ color: brand.colors.accent }}>{right}</span>
    </div>
  );
};

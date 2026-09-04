import React from "react";
import { useBrand } from "../../brand/BrandProvider";
import { C, G, ruleY } from "./score";

/**
 * The film's own components.
 *
 * Every one takes progress as a number in 0–1, never a frame. The composition
 * owns time; these own shape. That is what makes the refinement pass a matter
 * of editing cues rather than reading render code.
 *
 * No hex value appears here. Colours resolve through `useBrand()`; the only
 * literals are geometry, and geometry comes from the Score.
 */

/**
 * One accessor so every part below reads the same way. `semantic` and `mono`
 * are optional on `BrandSystem` because not every brand has them; Athina does,
 * and asserting it once here beats a guard in every component.
 */
const useAthina = () => {
  const { brand } = useBrand();
  return {
    brand,
    s: brand.colors.semantic!,
    mono: (brand.typography.mono ?? brand.typography.body).stack,
    sans: brand.typography.body.stack,
    display: brand.typography.display.stack,
  };
};

/* ------------------------------------------------------------------ *
 * Rules and dots — the mark at any scale.
 * ------------------------------------------------------------------ */

/** A knockout: the rect where rules stop so type can sit on black. */
export type Knockout = { x: number; y: number; w: number; h: number };

/**
 * Where rule `i` sits, at a given contraction.
 *
 * One expression, exported, because the dot has to sit exactly on a rule at
 * every frame including mid-contraction — deriving its y separately is how a
 * dot drifts off its line.
 */
export const ruleYAt = (i: number, collapse = 0, originY = G.rules.originY) =>
  G.rules.originY * (1 - collapse) +
  originY * collapse +
  i * G.rules.pitch * (1 - collapse * 0.72);

/**
 * The rule stack. Rules wipe in from the left at staggered offsets and knock
 * out where text lands, resuming as ghost columns beyond it — the site's own
 * band, which is also its logo.
 *
 * `wipe` is a per-rule 0–1 array so the composition can stagger them from the
 * Score without this component knowing what a frame is.
 */
export const Rules: React.FC<{
  wipe: number[];
  knockouts?: Knockout[];
  /** Global luminance of the stack, 0–1. */
  level?: number;
  /** Per-rule luminance. At the end, only the traversed rules stay lit. */
  levels?: number[];
  /**
   * 0 = full bleed, 1 = contracted to `collapseTo`. The pull-back: the field
   * shrinks to the glyph's own size. Same drawing, never assembled.
   */
  collapse?: number;
  collapseTo?: { cx: number; hw: number; originY: number };
}> = ({ wipe, knockouts = [], level = 1, levels, collapse = 0, collapseTo }) => {
  const { brand, s, mono, sans, display } = useAthina();
  const { pitch, originY, count, thickness, bleedRight, knockoutPadX } = G.rules;

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const t = wipe[i] ?? 0;
        const lum = level * (levels?.[i] ?? 1);
        if (t <= 0 || lum <= 0) return null;

        /** The rule's own extent, contracting toward the glyph. */
        const cx = collapseTo?.cx ?? bleedRight / 2;
        const hw = collapseTo?.hw ?? bleedRight / 2;
        const left = 0 + (cx - hw - 0) * collapse;
        const right = bleedRight + (cx + hw - bleedRight) * collapse;

        const y = ruleYAt(i, collapse, collapseTo?.originY ?? originY);
        const width = right * t;

        /** Rules do not draw through a knockout; they resume past it. */
        const cuts = knockouts.filter((k) => y >= k.y && y <= k.y + k.h);
        const segments: [number, number][] = [];
        let cursor = left;
        for (const k of cuts.sort((a, b) => a.x - b.x)) {
          const from = Math.max(0, k.x - knockoutPadX);
          if (from > cursor) segments.push([cursor, from]);
          cursor = Math.max(cursor, k.x + k.w + knockoutPadX);
        }
        segments.push([cursor, right]);

        return segments.map(([a, b], s) => {
          const x0 = a;
          const x1 = Math.min(b, width);
          if (x1 <= x0) return null;
          return (
            <div
              key={`${i}-${s}`}
              style={{
                position: "absolute",
                left: x0,
                top: y,
                width: x1 - x0,
                height: thickness,
                background: brand.colors.rule,
                opacity: lum,
              }}
            />
          );
        });
      })}
    </>
  );
};

/**
 * One inference. Mounted once at the eclipse and never unmounted: only its x,
 * its rule index and its scale animate. It is always ON a rule.
 */
export const Dot: React.FC<{ x: number; y: number; r: number; level?: number }> = ({
  x, y, r, level = 1,
}) => {
  const { brand, s, mono, sans, display } = useAthina();
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r + G.rules.thickness / 2,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: brand.colors.primary,
        opacity: level,
      }}
    />
  );
};

/* ------------------------------------------------------------------ *
 * Light.
 * ------------------------------------------------------------------ */

/**
 * A matte sphere lit on one terminator. The brand's only light source, and the
 * only thing in the film with a gradient on it.
 *
 * `angle` is the terminator rotation in degrees; `level` is how lit it is.
 * Never scales, never bounces, never gains a rim light.
 */
export const Sphere: React.FC<{
  cx: number; cy: number; r: number; angle: number; level: number;
}> = ({ cx, cy, r, angle, level }) => {
  if (level <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `linear-gradient(${angle}deg, rgba(255,255,255,${0.96 * level}) 0%, rgba(226,226,226,${0.7 * level}) 28%, rgba(90,90,90,${0.28 * level}) 58%, rgba(0,0,0,1) 82%)`,
      }}
    />
  );
};

/* ------------------------------------------------------------------ *
 * Type. Surfaces by luminance; never scales, rotates or lands word by word.
 * ------------------------------------------------------------------ */

export const Kicker: React.FC<{ level: number }> = ({ level }) => {
  const { brand, s, mono, sans, display } = useAthina();
  const g = G.kicker;
  return (
    <div
      style={{
        position: "absolute",
        left: g.x,
        top: g.y,
        fontFamily: mono,
        fontSize: g.size,
        letterSpacing: g.tracking,
        color: brand.colors.muted,
        opacity: level,
      }}
    >
      {C.kicker}
    </div>
  );
};

/**
 * The headline. Two lines, large-left. Exactly one word may carry tan — the
 * brand's one-tinted-word rule — and the line is allowed to sit below
 * legibility rather than being lifted clear of what occludes it.
 */
export const Headline: React.FC<{
  lines: string[];
  /** 0 = near-black on black, 1 = full white. */
  level: number;
  tanLevel?: number;
  tanWord?: string;
}> = ({ lines, level, tanLevel = 0, tanWord }) => {
  const { brand, s, mono, sans, display } = useAthina();
  const g = G.headline;
  const role = brand.typography.roles.headline;

  /** Near-black is a real level here, not a faded white. */
  const mix = (t: number) => {
    const from = 0x1c;
    const v = Math.round(from + (0xff - from) * t);
    return `rgb(${v},${v},${v})`;
  };

  return (
    <div
      style={{
        position: "absolute",
        left: g.x,
        top: g.lineY[0],
        width: g.maxWidth,
        /**
         * Near-black is a real level for this brand, so `mix(0)` is #1C1C1C and
         * still visible. Presence is therefore separate from level: the line
         * can sit at the bottom of the ramp and be there, or be gone.
         */
        opacity: Math.min(1, level * 8),
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: display,
            fontSize: g.size,
            fontWeight: role.weight,
            letterSpacing: role.tracking,
            lineHeight: `${g.lineHeight}px`,
            color: mix(level),
            whiteSpace: "pre",
          }}
        >
          {tanWord && line.includes(tanWord) ? (
            <>
              {line.split(tanWord)[0]}
              <span style={{ color: tanLevel > 0 ? brand.colors.accent : mix(level), opacity: 1 }}>
                {tanWord}
              </span>
              {line.split(tanWord)[1]}
            </>
          ) : (
            line
          )}
        </div>
      ))}
    </div>
  );
};

/** The 13px grey block far right — the faintest thing in frame. */
export const BodyBlock: React.FC<{ lines: string[]; level: number }> = ({ lines, level }) => {
  const { brand, s, mono, sans, display } = useAthina();
  const g = G.bodyBlock;
  return (
    <div
      style={{
        position: "absolute",
        left: g.x,
        top: g.y,
        width: g.width,
        fontFamily: sans,
        fontSize: g.size,
        lineHeight: `${g.lineHeight}px`,
        color: brand.colors.muted,
        opacity: level,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Product. Daylight inside a night page: flat, square to camera, at true
 * density, cropped only at the bottom of frame.
 * ------------------------------------------------------------------ */

export const Panel: React.FC<{
  rect: { x: number; y: number; w: number; h: number; radius: number };
  /** 0 = black, 1 = full daylight. Panels wash up and drain; they never move. */
  level: number;
  label?: string;
  children?: React.ReactNode;
}> = ({ rect, level, label, children }) => {
  const { brand, s, mono, sans, display } = useAthina();
    if (level <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: rect.radius,
        background: s.panel,
        overflow: "hidden",
        opacity: level,
      }}
    >
      {label ? <PanelMark label={label} /> : null}
      {children}
    </div>
  );
};

/**
 * The panel's identification: the dot-and-rule glyph plus a real label. The
 * brand pairs a surface with its mark; an unmarked panel reads as a generic
 * dashboard from any company.
 */
const PanelMark: React.FC<{ label: string }> = ({ label }) => {
  const { brand, s, mono, sans, display } = useAthina();
  const g = G.panelMark;
  return (
    <>
      <div style={{ position: "absolute", left: g.dx, top: g.dy }}>
        <Glyph size={g.glyphSize} tone={s.panelInk} dotTone={brand.colors.primary} />
      </div>
      <div
        style={{
          position: "absolute",
          left: g.dx + g.labelDx,
          top: g.dy - 2,
          fontFamily: mono,
          fontSize: g.labelSize,
          letterSpacing: "0.04em",
          color: s.panelMuted,
        }}
      >
        {label}
      </div>
    </>
  );
};

/**
 * The mark, drawn: short stacked rules with one dot riding one line. Used at
 * panel scale and, at the end, at editorial scale — the same drawing, never
 * assembled from parts.
 */
export const Glyph: React.FC<{ size: number; tone: string; dotTone: string }> = ({
  size, tone, dotTone,
}) => {
  const bar = size;
  const h = Math.max(1, size / 12);
  const gap = size / 3;
  return (
    <div style={{ position: "relative", width: size * 1.5, height: gap * 2 + h }}>
      {[0, 1].map((i) => (
        <React.Fragment key={i}>
          <div
            style={{
              position: "absolute", left: i === 0 ? size * 0.4 : 0, top: i * gap,
              width: bar * 0.75, height: h, background: tone,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: i === 0 ? 0 : size * 1.25,
              top: i * gap - h,
              width: h * 3, height: h * 3, borderRadius: "50%", background: dotTone,
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * The eval grid. Mounted once; rows and numbers are present from the start and
 * only the tint washes in behind them. Nothing counts up — a measured value
 * appears measured.
 */
export const EvalGrid: React.FC<{
  rowLevel: number[];
  peachTint: number;
  greenTint: number;
}> = ({ rowLevel, peachTint, greenTint }) => {
  const { brand, s, mono, sans, display } = useAthina();
    const g = G.evalGrid;
  const p = G.panels.eval;
  const rows = C.evalGrid.rows;

  const localX = (x: number) => x - p.x;
  const localY = (y: number) => y - p.y;

  return (
    <>
      {C.evalGrid.header.map((h, i) => (
        <div
          key={h}
          style={{
            position: "absolute",
            left: localX(Object.values(g.colX)[i]),
            top: localY(g.headerY),
            fontFamily: mono,
            fontSize: g.cellSize - 2,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: s.panelMuted,
          }}
        >
          {h}
        </div>
      ))}

      {rows.map((row, i) => {
        const y = localY(g.rowY[i]);
        const level = rowLevel[i] ?? 0;
        if (level <= 0) return null;
        const tint = row.tint === "peach" ? peachTint : row.tint === "green" ? greenTint : 0;
        const tintColor = row.tint === "peach" ? s.scoreBad : s.scoreGood;

        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute", left: 0, top: y - 5,
                width: p.w, height: 1, background: s.panelRule, opacity: level * 0.8,
              }}
            />
            {/* The tint is a wash BEHIND a number that is already there. */}
            {tint > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: localX(g.colX.score) + g.tintRect.dx,
                  top: y - 3,
                  width: g.tintRect.w,
                  height: g.tintRect.h,
                  background: tintColor,
                  opacity: tint * level,
                  borderRadius: 3,
                }}
              />
            ) : null}
            {(["experiment", "model", "metric"] as const).map((col) => (
              <div
                key={col}
                style={{
                  position: "absolute",
                  left: localX(g.colX[col]),
                  top: y,
                  fontFamily:
                    col === "experiment" ? sans : mono,
                  fontSize: g.cellSize,
                  color: col === "experiment" ? s.panelInk : s.panelMuted,
                  opacity: level,
                }}
              >
                {col === "experiment" ? `${row.experiment} ${i + 1}` : row[col]}
              </div>
            ))}
            <div
              style={{
                position: "absolute",
                left: localX(g.colX.score),
                top: y,
                fontFamily: mono,
                fontSize: g.cellSize,
                color: s.panelInk,
                opacity: level,
              }}
            >
              {row.score}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/** A bar chart at true density. Bars raise from the baseline; they do not pop. */
export const Bars: React.FC<{
  rect: { x: number; y: number; w: number; h: number; bars: number; barGap: number };
  origin: { x: number; y: number };
  levels: number[];
  color: string;
  seed?: number;
}> = ({ rect, origin, levels, color, seed = 1 }) => {
  const bw = (rect.w - rect.barGap * (rect.bars - 1)) / rect.bars;
  return (
    <>
      {Array.from({ length: rect.bars }, (_, i) => {
        const t = levels[i] ?? 0;
        if (t <= 0) return null;
        /** Deterministic heights — a render must not differ between passes. */
        const n = Math.abs(Math.sin((i + 1) * 12.9898 * seed) * 43758.5453) % 1;
        const h = rect.h * (0.28 + n * 0.72) * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: rect.x - origin.x + i * (bw + rect.barGap),
              top: rect.y - origin.y + (rect.h - h),
              width: bw,
              height: h,
              background: color,
              borderRadius: 1,
            }}
          />
        );
      })}
    </>
  );
};

/**
 * A row of equal stroke-only pills sharing borders, with exactly one active.
 * The row is static; only the active stroke slides between adjacent pills.
 */
export const PillRow: React.FC<{
  origin: { x: number; y: number };
  level: number;
  /** Fractional index of the active pill, so it can slide between neighbours. */
  active: number;
}> = ({ origin, level, active }) => {
  const { brand, s, mono, sans, display } = useAthina();
    const g = G.monitor.pills;
  const pw = g.w / g.count;
  if (level <= 0) return null;

  return (
    <>
      {C.monitor.pills.map((label, i) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: g.x - origin.x + i * pw,
            top: g.y - origin.y,
            width: pw,
            height: g.h,
            border: `${g.stroke}px solid ${s.panelRule}`,
            borderRadius: i === 0 || i === g.count - 1 ? g.h / 2 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: sans,
            fontSize: 14,
            color: s.panelMuted,
            opacity: level,
            boxSizing: "border-box",
          }}
        >
          {label}
        </div>
      ))}
      {/* One active stroke, sliding. Not a moving pill — a moving outline. */}
      <div
        style={{
          position: "absolute",
          left: g.x - origin.x + active * pw,
          top: g.y - origin.y,
          width: pw,
          height: g.h,
          border: `${g.stroke}px solid ${s.panelInk}`,
          borderRadius: g.h / 2,
          opacity: level,
          boxSizing: "border-box",
        }}
      />
    </>
  );
};

/**
 * The persona list. Inactive members stay in place at low opacity rather than
 * being hidden or slid away — the site never carousels them.
 */
export const PersonaList: React.FC<{ origin: { x: number; y: number }; level: number }> = ({
  origin, level,
}) => {
  const { brand, s, mono, sans, display } = useAthina();
    const g = G.monitor.persona;
  if (level <= 0) return null;

  return (
    <>
      {C.monitor.personas.map((p, i) => (
        <div
          key={p}
          style={{
            position: "absolute",
            left: g.x - origin.x,
            top: g.y - origin.y + i * g.lineHeight,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: sans,
            fontSize: g.size,
            color: s.panelInk,
            opacity: level * (i === g.activeIndex ? 1 : 0.28),
          }}
        >
          <Glyph size={10} tone={s.panelInk} dotTone={i === g.activeIndex ? brand.colors.primary : s.panelMuted} />
          {p}
        </div>
      ))}
    </>
  );
};

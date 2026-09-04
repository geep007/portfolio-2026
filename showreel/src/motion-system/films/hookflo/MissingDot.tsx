import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BrandProvider, useBrand } from "../../brand/BrandProvider";
import { TextReveal } from "../../primitives/TextReveal";
import { progress } from "../../engine/timing";
import { hookflo } from "../../brands/hookflo/brand";
import { hookfloVocabulary } from "../../brands/hookflo/vocabulary";
import {
  AlertCard,
  Baseline,
  Bloom,
  Chrome,
  EmptySlot,
  Marker,
  Row,
  Strip,
} from "./parts";
import {
  CUE,
  DELIVERIES,
  FAIL_ROW,
  G,
  TOTAL,
  clockAt,
  markCentre,
  rowMarker,
  rowTop,
  stateAt,
} from "./score";

/**
 * HOOKFLO — "The Missing Dot"
 *
 * One continuous system, not a sequence of scenes. There is no <Scene1/>,
 * no <Sequence>, no ShotTransition: every element below is mounted for the
 * whole 600 frames and reads its own state from the frame. That is the point
 * of the film — the panel, the markers and the failing row are the *same
 * objects* throughout, so continuity is structural rather than choreographed.
 *
 * Read `../../brands/hookflo/direction.ts` before changing anything here.
 * Read `score.ts` for every frame number; there are none in this file.
 */

const ease = {
  /** Progress helper bound to a brand easing, so no component hand-rolls one. */
  at: (frame: number, from: number, len: number, fn: (t: number) => number) =>
    progress(frame, { delay: from, duration: len, easing: fn }),
};

const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { brand, ease: E, type } = useBrand();
  const state = stateAt(frame);
  const sem = (k: string) => brand.colors.semantic?.[k] ?? brand.colors.foreground;

  const enter = E("enter");
  const linear = E("scan");
  const route = E("route");

  /* ---------------------------------------------------------------- *
   * PANEL — mounted once. Only x and width ever change.
   * ---------------------------------------------------------------- */
  const contract = ease.at(frame, CUE.contract, CUE.contractLen, route);
  const restore = ease.at(frame, CUE.restore, CUE.restoreLen, route);
  const narrow = Math.max(0, contract - restore);
  const panelX = interpolate(narrow, [0, 1], [G.panel.open.x, G.panel.contracted.x]);
  const panelW = interpolate(narrow, [0, 1], [G.panel.open.w, G.panel.contracted.w]);
  const compact = narrow > 0.5;

  /** The panel clips open vertically from its own centre. Nothing fades. */
  const open = ease.at(frame, CUE.panelOpen, CUE.panelOpenLen, enter);
  /** …and gives its content back at the end, in the same way. */
  const close = ease.at(frame, CUE.collapseText, 14, enter);
  const panelVisible = Math.max(0, open - close);

  /* ---------------------------------------------------------------- *
   * BRIGHTNESS — the film's edit. Rows are dimmed as a group and lit
   * individually; nothing ever fades in.
   * ---------------------------------------------------------------- */
  const dimmed = Math.max(
    0,
    ease.at(frame, CUE.dim, CUE.dimLen, linear) - ease.at(frame, CUE.restore, CUE.restoreLen, enter),
  );
  const rowDim = interpolate(dimmed, [0, 1], [1, 0.12]);
  const litFail = ease.at(frame, CUE.litRow, 8, enter);

  /* ---------------------------------------------------------------- *
   * THE MARKERS — eight of them, one per grid position that has a dot.
   * They begin as the mark, become the row rails, and go home.
   * ---------------------------------------------------------------- */
  const markerState = (gridIndex: number) => {
    const rowIndex = gridIndex; // grid position i seats delivery i, hole included
    const from = markCentre(gridIndex, G.markOpen);
    const seat = rowMarker(rowIndex);
    const to = { x: panelX + seat.x, y: G.panel.y + seat.y };
    const home = markCentre(gridIndex, G.markClose);

    const write = ease.at(frame, CUE.markWrite + gridIndex * CUE.markStep, 10, enter);
    const migrate = ease.at(frame, CUE.migrate + gridIndex * CUE.migrateStep, CUE.migrateLen, enter);
    const collapse = ease.at(frame, CUE.collapse + gridIndex * CUE.collapseStep, CUE.collapseLen, enter);

    /*
      Orthogonal, not diagonal. Nine dots flying on their own diagonals read as
      scatter; taken one axis at a time they read as a grid unfolding into a
      list. Out: spread vertically into row order, then align left onto the
      rail. Home: leave the rail first, then settle back onto the grid rows.
    */
    const leg = (t: number, a: number, b: number) =>
      interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const x = interpolate(leg(migrate, 0.45, 1), [0, 1], [from.x, to.x]);
    const y = interpolate(leg(migrate, 0, 0.55), [0, 1], [from.y, to.y]);
    const size = interpolate(migrate, [0, 1], [G.markOpen.dot, G.row.dot]);

    return {
      x: interpolate(leg(collapse, 0, 0.55), [0, 1], [x, home.x]),
      y: interpolate(leg(collapse, 0.45, 1), [0, 1], [y, home.y]),
      size: interpolate(collapse, [0, 1], [size, G.markClose.dot]),
      opacity: write,
      /**
       * White belongs to the mark, not to the log: the dot goes lavender when
       * it takes a row seat and only comes back white at the very end, when
       * the alerted marker lands on top of it.
       */
      white:
        gridIndex === G.white
          ? Math.max(0, ease.at(frame, CUE.markWhite, 8, enter) - migrate + collapse)
          : 0,
    };
  };

  /* ---------------------------------------------------------------- *
   * THE MARKER HOOKFLO DRAWS — written into the empty slot at DETECT,
   * routed out to the alert, brought home, and finally landed white on
   * the grid position that in the logo is the white dot: the caught one.
   * ---------------------------------------------------------------- */
  const failSeat = rowMarker(FAIL_ROW);
  const failHome = { x: panelX + failSeat.x, y: G.panel.y + failSeat.y };
  const failWrite = ease.at(frame, CUE.failDot, 10, enter);

  const out = ease.at(frame, CUE.travel, CUE.travelLen, route);
  const back = ease.at(frame, CUE.travelBack, CUE.travelLen, route);
  const away = Math.max(0, out - back);

  /**
   * The route: right out of the panel along its own row, then up, then in.
   * Three orthogonal legs, walked in order. No arcs — this brand is square.
   */
  const gutterX = 985;
  const cardEdge = G.card.x;
  const cardMarkerY = G.card.y + 60 + 24 + 16;
  const legs = [
    { x: G.panel.contracted.x + G.panel.contracted.w + 1, y: failHome.y },
    { x: gutterX, y: failHome.y },
    { x: gutterX, y: cardMarkerY },
    { x: cardEdge + 24 + 7.5, y: cardMarkerY },
  ];
  const walk = (t: number) => {
    const start = failHome;
    const pts = [start, ...legs];
    const segs = pts.length - 1;
    const s = Math.min(segs - 1, Math.floor(t * segs));
    const local = t * segs - s;
    return {
      x: interpolate(local, [0, 1], [pts[s].x, pts[s + 1].x]),
      y: interpolate(local, [0, 1], [pts[s].y, pts[s + 1].y]),
    };
  };
  const routed = walk(away);

  const alerted = ease.at(frame, CUE.alerted, 8, enter);
  const failCollapse = ease.at(frame, CUE.collapseAlerted, CUE.collapseAlertedLen, enter);
  const failWhiteHome = markCentre(G.white, G.markClose);
  const failColor =
    failWhiteHome && failCollapse > 0.92
      ? "#FFFFFF"
      : alerted > 0.5
        ? brand.colors.accent
        : sem("fail");
  const failMarker = {
    x: interpolate(failCollapse, [0, 1], [routed.x, failWhiteHome.x]),
    y: interpolate(failCollapse, [0, 1], [routed.y, failWhiteHome.y]),
    size: interpolate(failCollapse, [0, 1], [G.row.dot, G.markClose.dot]),
  };

  /* ---------------------------------------------------------------- *
   * ROWS — content only. Order is append-only and no row ever moves.
   * ---------------------------------------------------------------- */
  const rowContent = (i: number) => ease.at(frame, CUE.rowContent[i], 10, enter);
  const rowChip = (i: number) => ease.at(frame, CUE.rowContent[i] + CUE.verifyDelay, 8, enter);
  const contentGone = ease.at(frame, CUE.collapseText, 12, enter);

  /* ---------------------------------------------------------------- *
   * SCAN — one hairline, constant speed, stopping on the failing row.
   * ---------------------------------------------------------------- */
  const scan = ease.at(frame, CUE.scanFrom, CUE.scanTo - CUE.scanFrom, linear);
  const scanY = interpolate(
    scan,
    [0, 1],
    [G.panel.chrome + G.panel.padTop, rowTop(FAIL_ROW)],
  );
  // The head leaves as soon as Hookflo has written its marker. Leaving it
  // parked through the hold turns a reading head into a decoration.
  const scanVisible = frame >= CUE.scanFrom && frame < CUE.failDot + 12 ? 1 : 0;

  /* ---------------------------------------------------------------- *
   * ALERT + RECEIPT
   * ---------------------------------------------------------------- */
  const cardOpen = ease.at(frame, CUE.card, 16, enter);
  const cardShut = ease.at(frame, CUE.cardShut, CUE.cardShutLen, enter);
  const cardLines = [0, 1, 2, 3].map((i) => ease.at(frame, CUE.card + 8 + i * CUE.cardStep, 10, enter));
  const receipt = ease.at(frame, CUE.receipt, 14, enter);

  /* ---------------------------------------------------------------- *
   * TYPE — three moments only.
   * ---------------------------------------------------------------- */
  const eyebrow = Math.max(
    0,
    ease.at(frame, CUE.eyebrow, 14, enter) - ease.at(frame, CUE.panelOpen, 8, enter),
  );
  const topLabel = ease.at(frame, CUE.topLabel, 12, enter);
  const wordmark = ease.at(frame, CUE.wordmark, 14, enter);

  const label =
    state === "scan" || state === "detect"
      ? "webhook.failed · signature could not be verified"
      : state === "route"
        ? "Routing to channel"
        : "Live deliveries · last 60 seconds";
  const labelColor = state === "scan" || state === "detect" ? sem("fail") : brand.colors.muted;

  /** Real counts, not decoration: the failing delivery is not counted delivered. */
  const arrived = CUE.rowContent.filter((f, i) => frame >= f && i !== FAIL_ROW).length;
  const counterHead = `${arrived} delivered · `;
  const counterTail =
    frame < CUE.failLabel ? "0 failed" : frame < CUE.alerted ? "1 failed" : "1 alerted";
  const counterAccent =
    frame < CUE.failLabel ? "#3F3F46" : frame < CUE.alerted ? sem("fail") : brand.colors.accent;

  const stripText =
    frame >= CUE.failLabel && frame < CUE.alerted ? "1 delivery unverified" : "Monitoring for failures…";
  const stripColor = frame >= CUE.failLabel && frame < CUE.alerted ? sem("fail") : undefined;

  const panelBottom = G.panel.y + G.panel.h;

  return (
    <AbsoluteFill style={{ background: brand.colors.background }}>
      <Bloom />

      {/* ---------------- the instrument ---------------- */}
      <div
        style={{
          position: "absolute",
          left: panelX,
          top: G.panel.y,
          width: panelW,
          height: G.panel.h,
          border: `1px solid ${brand.colors.rule}`,
          borderRadius: brand.surfaces.radius.medium,
          background: sem("panel"),
          overflow: "hidden",
          boxShadow: brand.surfaces.shadowValue,
          clipPath: `inset(${(1 - panelVisible) * 50}% 0 ${(1 - panelVisible) * 50}% 0)`,
        }}
      >
        <Chrome
          pre="https://"
          host="hookflo.com"
          post={compact ? "/logs" : "/dashboard"}
          compact={compact}
        />

        {DELIVERIES.map((d, i) => {
          const isFail = i === FAIL_ROW;
          const t = rowContent(i);
          const lit = isFail ? litFail : 0;
          const rowOpacity = interpolate(
            Math.max(0, dimmed - (isFail ? lit : 0)),
            [0, 1],
            [1, 0.10],
          );
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: rowTop(i),
                width: panelW,
                height: G.row.h,
                opacity: Math.min(rowOpacity, 1) * (1 - contentGone),
                boxShadow: i > 0 ? "inset 0 1px 0 rgba(39,39,42,0.8)" : undefined,
              }}
            >
              <Row
                d={d}
                width={panelW}
                compact={compact}
                t={t}
                age={Math.max(0, d.age + Math.floor((frame - 264) / 30))}
                ghost={isFail && frame < CUE.litRow}
                lit={isFail && frame >= CUE.litRow}
                chip={isFail ? ease.at(frame, CUE.failChip, 10, enter) : rowChip(i)}
                chipKind={isFail ? (alerted > 0.5 ? "lav" : "bad") : "ok"}
                chipLabel={isFail ? (alerted > 0.5 ? "alerted" : "410") : "200"}
              />
            </div>
          );
        })}

        {/* the reading head */}
        {scanVisible ? (
          <div
            style={{
              position: "absolute",
              left: 1,
              right: 1,
              top: scanY,
              height: 1,
              background: brand.colors.accent,
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -1,
                top: -9,
                width: 8,
                height: 19,
                background: brand.colors.accent,
              }}
            />
          </div>
        ) : null}

        <Strip left={stripText} leftColor={stripColor} compact={compact} />
      </div>

      {/* ---------------- markers, in frame space ---------------- */}
      {DELIVERIES.map((_, i) => {
        if (i === G.hole) {
          // The mark's missing dot. It seats the delivery that never arrives.
          const seat = rowMarker(i);
          const migrate = ease.at(frame, CUE.migrate + i * CUE.migrateStep, CUE.migrateLen, enter);
          const from = markCentre(i, G.markOpen);
          const legX = interpolate(migrate, [0.45, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const legY = interpolate(migrate, [0, 0.55], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(legX, [0, 1], [from.x, panelX + seat.x]);
          const y = interpolate(legY, [0, 1], [from.y, G.panel.y + seat.y]);
          const size = interpolate(migrate, [0, 1], [G.markOpen.dot, G.row.dot]);
          return (
            <EmptySlot
              key={`slot-${i}`}
              x={x}
              y={y}
              size={size}
              opacity={frame < CUE.failDot ? 1 : 0}
            />
          );
        }
        const m = markerState(i);
        return (
          <Marker
            key={`m-${i}`}
            x={m.x}
            y={m.y}
            size={m.size}
            color={m.white > 0.5 ? "#FFFFFF" : sem("lavenderLight")}
            opacity={m.opacity * (state === "mark" ? 1 : interpolate(dimmed, [0, 1], [1, 0.28]))}
          />
        );
      })}

      {/*
        The route it walks. The stroke is drawn only in the gutter — inside the
        panel the marker slides along its own row, and a line through the row's
        own text would read as a strikethrough rather than as a route.
      */}
      {out > 0.02 && back < 0.98 ? (
        <svg
          width={G.frame.w}
          height={G.frame.h}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <path
            d={`M${legs[0].x},${legs[0].y} ${legs.slice(1).map((l) => `L${l.x},${l.y}`).join(" ")}`}
            fill="none"
            stroke={sem("fail")}
            strokeWidth={2}
            strokeDasharray="1200 1200"
            /* drawn from the panel edge on the way out, erased from it on the way home */
            strokeDashoffset={(1 - out) * 1200 - back * 1200}
            opacity={0.9}
          />
        </svg>
      ) : null}

      {/* ---------------- the alert ---------------- */}
      {cardOpen > 0 && cardShut < 1 ? (
        <AlertCard open={cardOpen} shut={cardShut} lines={cardLines} resolved={alerted > 0.5} />
      ) : null}

      {/* the marker Hookflo draws — above the card, because it arrives inside it */}
      <Marker
        x={failMarker.x}
        y={failMarker.y}
        size={failMarker.size}
        color={failColor}
        opacity={failWrite}
      />
      {receipt > 0 && cardShut < 1 ? (
        <div
          style={{
            position: "absolute",
            left: G.receipt.x,
            top: G.receipt.y,
            ...type("label", 16),
            textTransform: "none",
            letterSpacing: "0",
            color: "#52525B",
            lineHeight: 1.8,
            clipPath: `inset(0 ${(1 - receipt) * 100}% 0 0)`,
          }}
        >
          delivered to #eng-alerts <span style={{ color: sem("ok") }}>1.4s</span> after failure
        </div>
      ) : null}

      {/* ---------------- type ---------------- */}
      {eyebrow > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 646,
            textAlign: "center",
            ...type("label", 18),
            color: brand.colors.muted,
            clipPath: `inset(0 ${(1 - eyebrow) * 100}% 0 0)`,
          }}
        >
          Failure-first webhook observability
        </div>
      ) : null}

      {panelVisible > 0.1 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: panelX,
              top: 154,
              ...type("label", 18),
              color: labelColor,
              clipPath: `inset(0 ${(1 - topLabel) * 100}% 0 0)`,
            }}
          >
            {label}
          </div>
          <div
            style={{
              position: "absolute",
              left: panelX,
              top: panelBottom + 42,
              ...type("label", 17),
              textTransform: "none",
              letterSpacing: "0",
              color: "#3F3F46",
              clipPath: `inset(0 ${(1 - topLabel) * 100}% 0 0)`,
            }}
          >
            <span>{counterHead}</span>
            <span style={{ color: counterAccent }}>{counterTail}</span>
          </div>
        </>
      ) : null}

      {/* ---------------- the close ---------------- */}
      {wordmark > 0 ? (
        <div
          style={{
            position: "absolute",
            left: G.wordmark.x,
            top: G.wordmark.y,
            ...type("wordmark", G.wordmark.size),
            color: "#FFFFFF",
            clipPath: `inset(0 ${(1 - wordmark) * 100}% 0 0)`,
          }}
        >
          Hookflo
        </div>
      ) : null}

      {frame >= CUE.headline ? (
        <div style={{ position: "absolute", left: G.headline.x, top: G.headline.y }}>
          <TextReveal
            lines={["Monitor every", "webhook event."]}
            behaviour="mask-rise"
            role="headline"
            size={G.headline.size}
            align="left"
            delay={CUE.headline}
            duration="standard"
            stagger="tight"
            lineColors={[brand.colors.foreground, brand.colors.accent]}
          />
        </div>
      ) : null}

      <Baseline
        left={
          state === "mark"
            ? `${clockAt(frame)} · monitoring for failures…`
            : clockAt(frame)
        }
        right="hookflo.com"
      />
    </AbsoluteFill>
  );
};

export const MissingDot: React.FC = () => (
  <BrandProvider brand={hookflo} vocabulary={hookfloVocabulary}>
    <Film />
  </BrandProvider>
);

export const MISSING_DOT_TOTAL = TOTAL;

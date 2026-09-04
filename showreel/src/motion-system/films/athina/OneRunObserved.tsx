import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BrandProvider, useBrand } from "../../brand/BrandProvider";
import { progress } from "../../engine/timing";
import { athina } from "../../brands/athina/brand";
import {
  BodyBlock, Bars, Dot, EvalGrid, Glyph, Headline, Kicker,
  PersonaList, PillRow, Panel, Rules, Sphere, ruleYAt, type Knockout,
} from "./parts";
import { C, CUE, G, SCORE, TOTAL, cue, ruleY, startOf, stateAt } from "./score";

/**
 * Athina — "One Run, Observed".
 *
 * One peach dot is one inference. It is mounted once at the eclipse and never
 * unmounted; it rides a single rule through an eval grid, a SQL result and a
 * production monitor, and the rules it travelled resolve at the end into the
 * nav glyph. The mark was the path the whole time.
 *
 * One component, mounted once, 540 frames. No `<Sequence>`, no scene
 * components: every element reads its own state from the frame. That is what a
 * continuity film requires and what a `CompositionPlan` cannot express.
 *
 * Every number here comes from `score.ts`, which reads
 * `projects/athina/first/score.json`. If a value looks arbitrary, it is in the
 * Score and can be changed there without opening this file.
 */

/** Normalised progress for a cue and its `…Len` partner. */
const at = (frame: number, name: string, lenName?: string, ease?: (t: number) => number) =>
  progress(frame, {
    delay: cue(name),
    duration: lenName ? cue(lenName) : 20,
    easing: ease,
  });

const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { brand, ease } = useBrand();
  const s = brand.colors.semantic!;
  const state = stateAt(frame);

  const enter = ease("enter");
  const travel = ease("travel");
  const step = ease("step");
  const world = ease("world");
  const tint = ease("tint");

  /* ---------------------------------------------------------------- *
   * The pull-back. `glyph` is not a new drawing: it is the same rule stack
   * contracted to the glyph's own size, with only the rules the dot actually
   * travelled left lit. Expressed as the field contracting rather than as a
   * CSS scale, because full-bleed rules at the Score's original 0.42 still
   * read as a hatch block rather than as a mark.
   * ---------------------------------------------------------------- */
  const pull = at(frame, "pullBack", "pullBackLen", world);
  const gOut = G.glyphOut as typeof G.glyphOut & {
    litRules: number[]; glyphCx: number; glyphHalfWidth: number;
    glyphDotOffsets: number[]; glyphOriginY: number;
  };

  /* ---------------------------------------------------------------- *
   * Light. Three spheres, mounted at 0, never unmounted: they fall to black
   * by luminance. Only the terminator rotates. By the time the dot exists,
   * every sphere is dark — the dot is the lit object from `rules` onward.
   * ---------------------------------------------------------------- */
  const drift = progress(frame, { delay: 0, duration: startOf("eclipse") + 30, easing: travel });
  const terminator = at(frame, "terminatorRotate", "terminatorRotateLen", world);
  const converge = at(frame, "crescentConverge", "crescentConvergeLen", world);
  const outerFall = at(frame, "outerSpheresFall", "outerSpheresFallLen", travel);

  /* ---------------------------------------------------------------- *
   * The rule stack. Rules wipe from the left at staggered offsets; the
   * carrier rule the dot rides has its own cue and never leaves.
   * ---------------------------------------------------------------- */
  const ruleWipe = Array.from({ length: G.rules.count }, (_, i) => {
    if (i === G.rules.carrierIndex) {
      return at(frame, "carrierRuleWipe", "carrierRuleWipeLen", enter);
    }
    /** Staggered by distance from the carrier, so the grid grows around it. */
    const order = Math.abs(i - G.rules.carrierIndex);
    return progress(frame, {
      delay: cue("ruleWipeStart") + order * cue("ruleWipeStep"),
      duration: cue("ruleWipeLen"),
      easing: enter,
    });
  });

  /* ---------------------------------------------------------------- *
   * The dot. Its y is quantised to a rule index — never interpolated
   * diagonally — and its x travels only along the line it is on.
   * ---------------------------------------------------------------- */
  const dotBorn = at(frame, "dotMount", undefined, enter);
  const stepToQuery = at(frame, "dotStepQuery", "dotStepQueryLen", step);
  const stepToObserve = at(frame, "dotStepObserve", "dotStepObserveLen", step);

  const ruleIndex =
    G.dot.ruleIndexByState.eclipse +
    Math.round(stepToQuery) * 1 +
    Math.round(stepToObserve) * 1;

  const travelScore = at(frame, "dotTravelScore", "dotTravelScoreLen", travel);
  const travelQuery = at(frame, "dotTravelQuery", "dotTravelQueryLen", travel);
  const homeward = at(frame, "pullBack", "pullBackLen", world);

  const dotX =
    G.dot.xByState.eclipse +
    (G.dot.xByState.score - G.dot.xByState.eclipse) * travelScore +
    (G.dot.xByState.query - G.dot.xByState.score) * travelQuery +
    (G.dot.xByState.glyph - G.dot.xByState.query) * homeward;

  /**
   * The dot is always ON its rule — including while the field contracts, so
   * its y is derived from the same expression the rules use, never from a
   * separate animation that could drift off the line.
   */
  const collapsedRuleY = (i: number) => ruleYAt(i, pull, gOut.glyphOriginY);
  const dotY = collapsedRuleY(ruleIndex);
  const dotR = G.dot.radius + (G.dot.glyphRadius - G.dot.radius) * pull;

  /* ---------------------------------------------------------------- *
   * Type. Surfaces and recedes by luminance only.
   * ---------------------------------------------------------------- */
  const kicker = at(frame, "kickerSurface", "kickerSurfaceLen", enter);
  const headlineEdge = at(frame, "headlineEdgeLift", "headlineEdgeLiftLen", enter);
  const headlineRecede = at(frame, "headlineRecede", "headlineRecedeLen", travel);
  const headlineBack = at(frame, "headlineResurface", "headlineResurfaceLen", enter);
  const tanWord = at(frame, "tanWordLift", "tanWordLiftLen", enter);
  const rightReduce = at(frame, "rightColumnReduce", "rightColumnReduceLen", travel);

  /** Near-black at rest, lifted only at the edges, then pushed back down. */
  const headlineLevel = Math.max(
    0,
    headlineEdge * 0.16 * (1 - headlineRecede) + headlineBack * 0.62,
  );

  const bodyIn = at(frame, "bodyBlockSurface", "bodyBlockSurfaceLen", enter);
  const bodyRaise = at(frame, "bodyBlockRaise", "bodyBlockRaiseLen", enter);
  const bodyLevel = Math.max(bodyIn * 0.5, bodyRaise * 0.85) * (1 - rightReduce * 0.55);

  /** The headline and body change copy at state boundaries, in place. */
  const headlineLines =
    frame < startOf("rules") ? C.headlines.claim
      : frame < startOf("observe") ? C.headlines.rules
      : C.headlines.observe;

  const bodyLines =
    frame < startOf("rules") ? C.body.claim
      : frame < startOf("score") ? C.body.rules
      : frame < startOf("query") ? C.body.score
      : frame < startOf("observe") ? C.body.query
      : frame < startOf("glyph") ? C.body.query
      : C.body.glyph;

  /* ---------------------------------------------------------------- *
   * Product. Panels wash up from black and drain back to it; none of them
   * unmounts, so `observe` shows the whole read stacked.
   * ---------------------------------------------------------------- */
  const drain = at(frame, "panelsDrainToBlack", "panelsDrainToBlackLen", travel);

  const evalWash = at(frame, "evalPanelWash", "evalPanelWashLen", enter);
  const evalDim = at(frame, "evalPanelDim", "evalPanelDimLen", travel);
  const evalLevel = Math.max(0, evalWash * (1 - evalDim * 0.72) * (1 - drain));

  const evalRows = C.evalGrid.rows.map((_, i) =>
    progress(frame, {
      delay: cue("evalRowsResolve") + i * cue("evalRowsStep"),
      duration: 14,
      easing: enter,
    }),
  );
  const peachTint = at(frame, "tintWash", "tintWashLen", tint);
  const greenTint = at(frame, "greenTintWash", "greenTintWashLen", tint);

  const queryWash = at(frame, "queryPanelWash", "queryPanelWashLen", enter);
  const queryLevel = Math.max(0, queryWash * (1 - drain));
  const sqlLine = at(frame, "sqlLineSurface", "sqlLineSurfaceLen", enter);
  const runControl = at(frame, "runControlSurface", undefined, enter);
  const status = at(frame, "statusResolve", undefined, enter);
  const resultTint = at(frame, "resultRowTint", "resultRowTintLen", tint);
  const sqlBars = Array.from({ length: G.sql.barChart.bars }, (_, i) =>
    progress(frame, { delay: cue("barChartRaise") + i * cue("barChartStep"), duration: 12, easing: enter }),
  );

  const obsWash = at(frame, "observePanelWash", "observePanelWashLen", enter);
  const obsLevel = Math.max(0, obsWash * (1 - drain));
  const gradient = at(frame, "gradientWashBehind", "gradientWashBehindLen", enter);
  const passRate = at(frame, "passRateResolve", undefined, enter);
  const statLevels = C.monitor.stats.map((_, i) =>
    progress(frame, { delay: cue("passRateResolve") + i * cue("statFiguresStep"), duration: 12, easing: enter }),
  );
  const histLevels = Array.from({ length: G.monitor.histograms[0].bars }, (_, i) =>
    progress(frame, { delay: cue("histogramRaise") + i * cue("histogramStep"), duration: 10, easing: enter }),
  );
  const pills = at(frame, "pillRowSurface", "pillRowSurfaceLen", enter);
  const pillSlide = at(frame, "activePillSlide", "activePillSlideLen", step);
  const personas = at(frame, "personaLineSurface", "personaLineSurfaceLen", enter);

  const wordmark = at(frame, "wordmarkSurface", "wordmarkSurfaceLen", enter);

  /**
   * Type sits in clearings cut out of the rule field. Only the headline needs
   * one: the body block now sits above the stack, and the panels cover rules
   * by z-order rather than by knocking holes in them.
   */
  const knockouts: Knockout[] =
    pull > 0.02
      ? []
      : [
          {
            x: G.headline.x,
            y: G.headline.lineY[0] - 24,
            w: G.headline.maxWidth,
            h: G.headline.lineHeight * 2 + 40,
          },
        ];

  /** At the end, only the rules the dot travelled stay lit. */
  const ruleLevels = Array.from({ length: G.rules.count }, (_, i) =>
    gOut.litRules.includes(i) ? 1 : 1 - pull,
  );

  /** The headline is gone before the payoff lands, not fading under it. */
  const glyphHeadline = headlineLevel * (1 - Math.min(1, pull * 1.8));

  return (
    <AbsoluteFill style={{ background: brand.colors.background }}>
      <AbsoluteFill>
        <Rules
          wipe={ruleWipe}
          knockouts={knockouts}
          levels={ruleLevels}
          collapse={pull}
          collapseTo={{ cx: gOut.glyphCx, hw: gOut.glyphHalfWidth, originY: gOut.glyphOriginY }}
        />

        {/* Product panels, stacked in the order they were read. */}
        <Panel rect={G.panels.eval} level={evalLevel} label={C.panelLabels.eval}>
          <EvalGrid rowLevel={evalRows} peachTint={peachTint} greenTint={greenTint} />
        </Panel>

        <Panel rect={G.panels.query} level={queryLevel} label={C.panelLabels.query}>
          <div
            style={{
              position: "absolute",
              left: G.sql.editorX - G.panels.query.x,
              top: G.sql.lineY - G.panels.query.y,
              fontFamily: (brand.typography.mono ?? brand.typography.body).stack,
              fontSize: G.sql.size,
              color: s.panelInk,
              opacity: sqlLine,
              whiteSpace: "pre",
            }}
          >
            {C.sql.query}
          </div>
          <div
            style={{
              position: "absolute",
              left: G.sql.runControl.x - G.panels.query.x,
              top: G.sql.runControl.y - G.panels.query.y,
              width: G.sql.runControl.w,
              height: G.sql.runControl.h,
              borderRadius: G.sql.runControl.h / 2,
              border: `1px solid ${s.panelRule}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: brand.typography.body.stack, fontSize: 14,
              color: s.panelInk, opacity: runControl, boxSizing: "border-box",
            }}
          >
            {C.sql.runControl}
          </div>
          <div
            style={{
              position: "absolute",
              left: G.sql.statusX - G.panels.query.x,
              top: G.sql.statusY - G.panels.query.y,
              display: "flex", gap: 20,
              fontFamily: (brand.typography.mono ?? brand.typography.body).stack,
              fontSize: 15, color: s.panelMuted, opacity: status,
            }}
          >
            <span>{C.sql.status}</span>
            <span>{C.sql.rows}</span>
          </div>
          {/* The rows the query returned — the failing half of the dataset. */}
          <div
            style={{
              position: "absolute",
              left: G.sql.resultRowX - G.panels.query.x,
              top: G.sql.resultRowY - G.panels.query.y + 150,
              width: G.sql.resultRowW * resultTint,
              height: 22,
              background: s.scoreBad,
              opacity: resultTint * 0.9,
              borderRadius: 3,
            }}
          />
          <Bars
            rect={G.sql.barChart}
            origin={G.panels.query}
            levels={sqlBars}
            color={s.chartBlue}
            seed={1.7}
          />
        </Panel>

        {/*
          The one saturated field in the film. It sits behind the panel glass
          and is clipped to it: a rounded window with the wash inside, so no
          saturated pixel reaches the black editorial frame.
        */}
        {gradient > 0 && obsLevel > 0 ? (
          <div
            style={{
              position: "absolute",
              left: G.monitor.gradient.x,
              top: G.monitor.gradient.y,
              width: G.monitor.gradient.w,
              height: G.monitor.gradient.h,
              borderRadius: G.panels.observe.radius,
              overflow: "hidden",
              opacity: gradient * (1 - drain),
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -G.monitor.gradient.blur,
                filter: `blur(${G.monitor.gradient.blur}px)`,
                background:
                  "conic-gradient(from 210deg at 40% 60%, #7CC0F0, #9BD3A6, #F3CFC0, #E48AA6, #C9AE86, #7CC0F0)",
              }}
            />
          </div>
        ) : null}

        <Panel rect={G.panels.observe} level={obsLevel} label={C.panelLabels.observe}>
          <div
            style={{
              position: "absolute",
              left: G.monitor.passRate.x - G.panels.observe.x,
              top: G.monitor.passRate.y - G.panels.observe.y,
              fontFamily: (brand.typography.mono ?? brand.typography.body).stack,
              fontSize: G.monitor.passRate.size,
              letterSpacing: "-0.03em",
              color: s.panelInk,
              opacity: passRate,
            }}
          >
            {C.monitor.passRate}
            <span
              style={{
                fontFamily: brand.typography.body.stack,
                fontSize: 19,
                /** The figure is tracked tight; its label must not inherit that. */
                letterSpacing: "normal",
                color: s.panelMuted,
                marginLeft: 16,
              }}
            >
              {C.monitor.passRateLabel}
            </span>
          </div>

          {C.monitor.stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                position: "absolute",
                left: G.monitor.stats[i].x - G.panels.observe.x,
                top: G.monitor.stats[i].y - G.panels.observe.y,
                opacity: statLevels[i],
              }}
            >
              <div
                style={{
                  fontFamily: (brand.typography.mono ?? brand.typography.body).stack,
                  fontSize: G.monitor.stats[i].size,
                  color: s.panelInk,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontFamily: brand.typography.body.stack, fontSize: 13, color: s.panelMuted }}>
                {stat.label}
              </div>
            </div>
          ))}

          <Bars rect={G.monitor.histograms[0]} origin={G.panels.observe} levels={histLevels} color={s.chartBlue} seed={2.3} />
          <Bars rect={G.monitor.histograms[1]} origin={G.panels.observe} levels={histLevels} color={s.chartGreen} seed={3.1} />

          <PillRow
            origin={G.panels.observe}
            level={pills}
            active={G.monitor.pills.activeIndex - 1 + pillSlide}
          />
          <PersonaList origin={G.panels.observe} level={personas} />
        </Panel>

        {/* Light. Behind nothing, in front of type — occlusion is allowed. */}
        {G.spheres.map((sp, i) => {
          /**
           * The middle sphere is the one that becomes the dot: it hands its
           * light over as the dot is born and is black immediately after.
           */
          const lit = i === 1 ? 1 - dotBorn : 1 - outerFall;
          const cx = sp.cx + sp.driftX * drift + (G.eclipseDisc.cx - sp.cx) * (i === 1 ? converge : 0);
          const cy = sp.cy + sp.driftY * drift + (G.eclipseDisc.cy - sp.cy) * (i === 1 ? converge : 0);
          const r = sp.r + (G.eclipseDisc.r - sp.r) * (i === 1 ? converge : 0);
          return (
            <Sphere
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              angle={112 + terminator * 120}
              level={lit * (1 - drain * 0)}
            />
          );
        })}

        {/*
          The dots parked on the rules the run passed through. They are not new
          objects appearing: each is the position the dot occupied on that rule,
          travelling in as the field contracts.
        */}
        {pull > 0
          ? gOut.litRules.slice(0, 2).map((idx, i) => {
              const fromX = i === 0 ? G.dot.xByState.score : G.dot.xByState.query;
              const toX = gOut.glyphCx + gOut.glyphDotOffsets[i];
              return (
                <Dot
                  key={idx}
                  x={fromX + (toX - fromX) * pull}
                  y={collapsedRuleY(idx)}
                  r={G.dot.radius + (G.dot.glyphRadius - G.dot.radius) * pull}
                  level={pull}
                />
              );
            })
          : null}

        {/* One inference, mounted once. */}
        {dotBorn > 0 ? <Dot x={dotX} y={dotY} r={dotR} level={dotBorn} /> : null}
      </AbsoluteFill>

      {/* Editorial layer — outside the world transform, so it does not scale. */}
      <Kicker level={kicker} />
      <Headline
        lines={headlineLines}
        level={glyphHeadline}
        tanLevel={tanWord}
        tanWord={frame >= startOf("rules") ? C.tanWord : undefined}
      />
      <BodyBlock lines={bodyLines} level={bodyLevel} />

      {/* The wordmark surfaces beside the glyph the path drew. */}
      {wordmark > 0 ? (
        <div
          style={{
            position: "absolute",
            left: gOut.wordmarkX,
            top: gOut.wordmarkY - gOut.wordmarkSize / 2,
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            fontFamily: brand.typography.display.stack,
            fontSize: gOut.wordmarkSize,
            letterSpacing: "-0.02em",
            opacity: wordmark,
          }}
        >
          <span style={{ fontWeight: 600, color: brand.colors.foreground }}>{C.wordmark.bold}</span>
          <span style={{ fontWeight: 300, color: brand.colors.muted }}>{C.wordmark.light}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const OneRunObserved: React.FC = () => (
  <BrandProvider brand={athina}>
    <Film />
  </BrandProvider>
);

export { TOTAL, SCORE };

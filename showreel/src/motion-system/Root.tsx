import React from "react";
import { Composition } from "remotion";
import { BRANDS, brandById } from "./brands";
import {
  BrandLaunchFilm,
  LAUNCH_TEST_CONTENT,
  launchDuration,
  launchSchema,
  type LaunchProps,
} from "./compositions/BrandLaunchFilm";
import { PlanFilm, planTimeline } from "./compositions/render";
import { PLAN_COMPOSITIONS } from "./compositions/plans";
import { MissingDot, MISSING_DOT_TOTAL } from "./films/hookflo/MissingDot";
import { OneRunObserved, TOTAL as ATHINA_TOTAL } from "./films/athina/OneRunObserved";

/**
 * Motion-system compositions, registered next to the legacy reels.
 *
 * `Launch-<brand>`: the same test content through every brand — the abstraction test.
 * `Plan-<id>`: hand-written CompositionPlans (see compositions/plans.ts).
 */
const Launch: React.FC<LaunchProps> = (p) => <BrandLaunchFilm {...p} bundle={brandById(p.brand)} />;

export const MotionSystemCompositions: React.FC = () => (
  <>
    {/*
      Authored film, not a plan. "The Missing Dot" is one continuous system —
      see films/hookflo/score.ts and brands/hookflo/direction.ts.
    */}
    <Composition
      id="Hookflo-MissingDot"
      component={MissingDot}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={MISSING_DOT_TOTAL}
    />
    {/*
      Athina — "One Run, Observed". The first film generated end to end through
      the artifact pipeline: see projects/athina/ for the brief, direction,
      storyboard and score it was built from.
    */}
    <Composition
      id="Athina-OneRunObserved"
      component={OneRunObserved}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={ATHINA_TOTAL}
    />
    {Object.keys(BRANDS).map((id) => (
      <Composition
        key={id}
        id={`Launch-${id}`}
        component={Launch}
        schema={launchSchema}
        defaultProps={{ ...LAUNCH_TEST_CONTENT, brand: id }}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={launchDuration({ ...LAUNCH_TEST_CONTENT, brand: id }, brandById(id))}
        calculateMetadata={({ props }) => ({
          durationInFrames: launchDuration(props, brandById(props.brand)),
        })}
      />
    ))}
    {PLAN_COMPOSITIONS.map(({ id, plan, width, height }) => {
      const bundle = brandById(plan.brand);
      const total = planTimeline(plan, bundle.vocabulary, bundle.brand).total;
      return (
        <Composition
          key={id}
          id={id}
          component={PlanFilm}
          defaultProps={{ plan, brand: bundle.brand, vocabulary: bundle.vocabulary }}
          fps={plan.fps ?? 30}
          width={width}
          height={height}
          durationInFrames={total}
        />
      );
    })}
  </>
);

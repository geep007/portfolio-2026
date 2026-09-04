import React from "react";

/**
 * The mascot lifted out of `mascot/Mascot Redesign Concept (1).svg`.
 *
 * The source file draws the creature on top of a cream plate and a white card.
 * Both are dropped here — the AVAL bundle ships packed alpha, so the mascot has
 * to sit on whatever the page background happens to be.
 *
 * The original is four paths: the body (which includes the ears, legs and
 * tail), the two eyes, and the sparkle. They are kept as separate elements so
 * the poses below can move them independently.
 */

/** Body, ears, legs, tail — one path in the source artwork. */
const BODY_D =
  "m132.9 101c-1.3-0.3-2.6-0.4-3.8-0.4s-2.5 0.1-3.7 0.4-2.9 1-4.4 1.3c-2.3 0.3-4.5-0.4-6.4-1.9l-4.1-9.3c1.4-1.5 2.5-3.6 3-5.5h0.9c1.3 0.1 2.3-1 2.3-2.2v-2.4c0-1.3-1.1-2.4-2.3-2.5h-0.8c-1.2-5-5.3-9.3-11.4-10.8l-11.5-32.3h-20.2l-5.7 15c-3-3.4-6.1-4.8-7.9-3.8-0.9 0.5-1.9 1.9 0.2 4.6 0.8 1.3 2.2 3.9 2 5.9-2.5-2.2-5.1-2.6-6.1-1-0.8 1.3 0.4 3.1 1.5 5.3-4.4 1.3-12.5 8-13.5 18.5 0 0.5 0.1 1-0.3 1.3-0.8 0.6-1.2 1.5-1.1 2.5 0.1 1.1 1 2 2.1 1.9h6c0.5 4 2.2 5.3 2.5 5.4l-13.5 37.3h21.6l6-18.7h32.1l5.7 18.7h21.4l-4.7-13.3c1-1 3.2-4 1.4-5.6-0.7-0.7-2.2-0.5-3.1 0l-1.6-4.5c5 0.9 8.1-2.3 12.6-3.2 3.1-0.6 5.9-0.4 4.8-0.7m-15.3 9.5c0.6-0.4 1.6-0.5 1.9-0.1 0.4 0.6-0.6 2.2-1.1 2.8l-0.8-2.7zm-61.6-47.8c0.5-0.1 0.8-0.7 0.5-1.1-0.6-1.5-2.5-3.7-2-4.7 0.5-0.6 2.5 0.2 4.7 2 0.5 0.5 1.2 0.3 1.3-0.3 0.5-2.8-0.9-6.1-2.5-8.5-1.8-3.1 0.9-3.6 5 0.4l1.2 1.5-5.3 15.5c-6 1.9-9.4 5.6-11.2 10.5h-1.5l-3.7 1.9c0.8-7.5 7.6-15.4 13.5-17.2m17.3 19.3c0 5.6-4.6 11-11 11-5.3 0-11.3-4.2-11.3-11.1 0-5.6 4.6-11 11.1-10.9 6.3 0 11.3 4.9 11.2 11m14.6 13h-14.5c-1.4 0-2.3-0.3-2.8-0.9 3.8-2.6 6.3-6.9 6.3-12.1 0-0.6 0-1.4-0.1-2 0.9-1.1 2.2-1.7 3.6-1.7 1.6 0 3 0.3 3.8 1.5-0.1 0.7-0.1 1.4-0.1 2.2 0 4.4 2.6 9 6.3 11.9-0.4 0.7-1.3 1.1-2.5 1.1m-12.3-18.9c-0.3-0.7-0.7-1.5-1.2-2.2l6.1-19.4 5.8 19.5c-0.4 0.6-0.8 1.4-1.2 2.1-1.2-0.8-2.6-1.5-4.6-1.5-1.9 0-3.6 0.5-4.9 1.5m23.5 16.9c-5.7 0.1-11.4-4.5-11.4-11-0.1-5.9 4.4-11 11.3-11 5.1 0 11 3.9 11.1 10.6 0.1 6.3-4.6 11-11 11.4";

/** Left eye. Centre measured off the source path so blinks scale in place. */
const EYE_LEFT_D =
  "m65.6 76.8c-1 0-1.9 0.3-2.9 0.9 1.1-0.1 2.2 0.7 2.2 1.8 0 1-0.8 2-1.9 2-0.9 0-2-0.6-2-2.4-0.5 0.8-0.8 1.5-0.8 2.9 0 2.6 2.2 5.5 5.4 5.5 2.5 0 5.1-1.9 5.1-5.1 0-2.8-2.2-5.6-5.1-5.6m2.8 8.3c-0.6 0-1.1-0.5-1-1.1 0-0.5 0.5-1 1-1s1.1 0.5 1.1 1.1-0.4 1-1.1 1";
const EYE_LEFT_CENTER = { x: 65, y: 82 };

/** Right eye. */
const EYE_RIGHT_D =
  "m95.6 76.8c-1 0-1.7 0.2-2.6 0.8h0.1c1 0 1.8 0.9 1.8 2 0 0.9-0.9 1.8-1.9 1.8-1.1 0-2-0.9-2-2.2-0.5 0.7-0.8 1.6-0.8 2.7 0 2.9 2.3 5.5 5.4 5.5 2.5 0 5.4-2 5.4-5.3 0-2.5-2.1-5.3-5.4-5.3m2.8 8.3c-0.7 0-1-0.3-1-1s0.7-1.1 1-1.1c0.5 0 1.1 0.5 1.1 1 0 0.8-0.6 1.1-1.1 1.1";
const EYE_RIGHT_CENTER = { x: 95, y: 82 };

/** The four-point sparkle floating off the mascot's back. */
const SPARKLE_D =
  "m113.7 65.6c-0.6 0.4-0.6 1.4 0.3 1.5 3.7 0.5 4.5 2.4 4.9 5.4 0.2 1 1.5 1 1.6 0 0.4-3.5 1.9-4.9 5-5.5 0.9-0.1 1-1.4 0-1.5-3-0.6-4.8-2-5.1-6-0.2-1-1.5-1.1-1.7 0-0.3 3.5-1.7 5.4-5 6.1m6-2.1 0.3-1.3 0.4 0.8c0.6 1.8 2 2.8 3.1 3.2-1.6 0.7-3 2.3-3.5 3.9-0.6-2.1-2-3.5-4-3.9 1.5-0.3 3-1.4 3.7-2.7";
const SPARKLE_CENTER = { x: 120, y: 66 };

/**
 * Every value a frame of mascot animation is allowed to vary.
 *
 * Keeping the pose as plain data (rather than baking easing into the artwork)
 * is what makes the AVAL graph authorable: two frames are interchangeable to
 * the format's `portalFrames` exactly when their `Pose` is identical, so the
 * timeline in `MascotTimeline.tsx` can reason about pose equality directly.
 */
export type Pose = {
  /** Uniform scale about the mascot's centre. */
  scale: number;
  /** Vertical offset in viewBox units. Negative is up. */
  bob: number;
  /** Rotation in degrees about the mascot's centre. Negative leans forward. */
  tilt: number;
  /** Vertical squash of both eyes. 0 is a closed blink, 1 is neutral. */
  eyeOpen: number;
  /** Extra size on the eyes, on top of the blink squash. */
  eyeScale: number;
  /** Sparkle size multiplier. */
  sparkleScale: number;
  /** Sparkle rotation in degrees. */
  sparkleTilt: number;
  /** Whole-mascot opacity, used only by the intro pop. */
  opacity: number;
};

export const NEUTRAL: Pose = {
  scale: 1,
  bob: 0,
  tilt: 0,
  eyeOpen: 1,
  eyeScale: 1,
  sparkleScale: 1,
  sparkleTilt: 0,
  opacity: 1,
};

/** Where the mascot pivots — roughly the centre of mass of the body path. */
const PIVOT = { x: 84, y: 100 };

export const MascotArt: React.FC<{ pose: Pose; color: string }> = ({
  pose,
  color,
}) => {
  const eye = (d: string, c: { x: number; y: number }) => (
    <path
      d={d}
      fill={color}
      transform={`translate(${c.x} ${c.y}) scale(${pose.eyeScale} ${
        pose.eyeScale * pose.eyeOpen
      }) translate(${-c.x} ${-c.y})`}
    />
  );

  return (
    // The source viewBox is the whole card; this one crops to the creature and
    // leaves a margin so the pop overshoot and the lean never clip the edge.
    <svg
      viewBox="14 30 140 140"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible", opacity: pose.opacity }}
    >
      <g
        transform={`translate(${PIVOT.x} ${PIVOT.y + pose.bob}) rotate(${
          pose.tilt
        }) scale(${pose.scale}) translate(${-PIVOT.x} ${-PIVOT.y})`}
      >
        <path d={BODY_D} fillRule="evenodd" clipRule="evenodd" fill={color} />
        {eye(EYE_LEFT_D, EYE_LEFT_CENTER)}
        {eye(EYE_RIGHT_D, EYE_RIGHT_CENTER)}
        <path
          d={SPARKLE_D}
          fill={color}
          transform={`translate(${SPARKLE_CENTER.x} ${
            SPARKLE_CENTER.y
          }) rotate(${pose.sparkleTilt}) scale(${
            pose.sparkleScale
          }) translate(${-SPARKLE_CENTER.x} ${-SPARKLE_CENTER.y})`}
        />
      </g>
    </svg>
  );
};

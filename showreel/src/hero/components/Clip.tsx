import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { LINEAR_ISH } from "../../theme";

/**
 * A piece of captured site footage, framed for the reel.
 *
 * Every shot gets a slow continuous push. The captures are constant-rate scroll
 * recordings, so without one the frame sits dead still while its contents move —
 * which reads as a screen recording rather than as a camera.
 */
export const Clip: React.FC<{
  src: string;
  /** Which frame of the source clip to start on. */
  startFrom?: number;
  /** Push over the life of the shot. */
  from?: number;
  to?: number;
  duration: number;
  origin?: string;
  /** Crop tighter than full-bleed, e.g. to isolate a circle for a match cut. */
  objectPosition?: string;
  style?: React.CSSProperties;
}> = ({
  src,
  startFrom = 0,
  from = 1.0,
  to = 1.06,
  duration,
  origin = "center center",
  objectPosition = "center center",
  style,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <OffthreadVideo
        src={staticFile(`media/${src}`)}
        startFrom={startFrom}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          transform: `scale(${scale})`,
          transformOrigin: origin,
        }}
      />
    </AbsoluteFill>
  );
};

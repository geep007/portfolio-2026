import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLOR } from "../theme";
import { MascotArt } from "./MascotArt";
import { poseAt } from "./timeline";

/**
 * The mascot master render. Rendered as a PNG sequence with a transparent
 * background and compiled into a packed-alpha AVAL bundle, so there is
 * deliberately no ground colour here.
 *
 *   npm run render:mascot
 */
export const Mascot: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <MascotArt pose={poseAt(frame)} color={COLOR.cobalt} />
    </AbsoluteFill>
  );
};

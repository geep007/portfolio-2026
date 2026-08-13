import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, OUT } from "../../theme";
import { BrowserWindow } from "./BrowserWindow";
import { Clip } from "./Clip";

type Layer = { url: string; src: string; startFrom?: number };

/**
 * Three builds stacked in depth. Subtle perspective only — a hard 3D tilt would
 * make the motion treatment the most interesting thing on screen, which is the
 * one failure mode the brief calls out.
 *
 * `pull` (0–1) brings the back layer to the front, driven by the cursor drag.
 */
export const WindowStack: React.FC<{
  layers: [Layer, Layer, Layer];
  duration: number;
  pullFrom?: number;
  pullTo?: number;
}> = ({ layers, duration, pullFrom = 8, pullTo = 24 }) => {
  const frame = useCurrentFrame();

  const pull = interpolate(frame, [pullFrom, pullTo], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  // Depth 0 = front. Front and back trade places as `pull` runs; the middle
  // layer stays put so the swap has something to read against.
  const depths = [pull * 2, 1, 2 - pull * 2];

  return (
    <AbsoluteFill style={{ background: COLOR.groundDark }}>
      {layers.map((layer, i) => {
        const d = depths[i];
        const scale = 1 - d * 0.09;
        const offsetX = d * 150;
        const offsetY = d * 62;
        // Keep the back layers readable — they are work, not wallpaper.
        const dim = d * 0.2;
        const z = Math.round((3 - d) * 10);

        return (
          <div key={layer.url} style={{ position: "absolute", inset: 0, zIndex: z }}>
            <BrowserWindow
              url={layer.url}
              left={300 + offsetX}
              top={180 + offsetY}
              width={1180}
              height={680}
              scale={scale}
              dim={dim}
            >
              <Clip
                src={layer.src}
                startFrom={layer.startFrom ?? 10}
                duration={duration}
                from={1.02}
                to={1.08}
              />
            </BrowserWindow>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

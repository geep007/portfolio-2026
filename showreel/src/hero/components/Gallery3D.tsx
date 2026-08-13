import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLOR, LINEAR_ISH, OUT } from "../../theme";

/**
 * A 3D carousel of project screens.
 *
 * Panels sit on a cylinder and the whole ring turns; panels facing away are
 * dimmed and scaled by their depth so the volume reads without a hard 3D look.
 *
 * Built on CSS 3D transforms rather than WebGL. Remotion renders frame by frame
 * in headless Chrome, where a WebGL context needs GPU flags that vary by
 * machine and can silently fall back to software; CSS 3D is composited the same
 * way every time. If a shader effect is ever needed, `@remotion/three` is the
 * route — this is the version that renders reliably today.
 */

export type Panel3D = {
  /** File in public/media/gallery. */
  src: string;
  label?: string;
};

export const Gallery3D: React.FC<{
  panels: Panel3D[];
  duration: number;
  background?: string;
  /** Cylinder radius in px. Larger = flatter arc. */
  radius?: number;
  panelW?: number;
  panelH?: number;
  /** Full turns across the shot. */
  turns?: number;
}> = ({
  panels,
  duration,
  background = COLOR.groundDark,
  radius = 600,
  panelW = 340,
  panelH = 440,
  turns = 0.42,
}) => {
  const frame = useCurrentFrame();
  const count = Math.max(1, panels.length);
  const step = 360 / count;

  const spin = interpolate(frame, [0, duration], [0, turns * 360], {
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  // The ring arrives by tilting up and pulling in, rather than fading.
  const build = interpolate(frame, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  const tilt = interpolate(build, [0, 1], [26, 8]);
  const zoom = interpolate(build, [0, 1], [0.72, 1]);

  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          perspective: 1500,
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform: `scale(${zoom}) rotateX(${tilt}deg) rotateY(${spin}deg)`,
          }}
        >
          {panels.map((p, i) => {
            const angle = i * step;
            // Where this panel faces once the ring has turned. 0 = toward camera.
            const facing = ((angle + spin) % 360 + 360) % 360;
            const toCamera = Math.cos((facing * Math.PI) / 180);
            const depth = (toCamera + 1) / 2; // 0 back, 1 front

            const arrive = interpolate(frame, [i * 4, i * 4 + 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            });

            return (
              <div
                key={`${p.src}-${i}`}
                style={{
                  position: "absolute",
                  left: -panelW / 2,
                  top: -panelH / 2,
                  width: panelW,
                  height: panelH,
                  transform: `rotateY(${angle}deg) translateZ(${radius * arrive}px)`,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  opacity: arrive * (0.35 + depth * 0.65),
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: `0 30px 70px rgba(0,0,0,${0.2 + depth * 0.25})`,
                }}
              >
                <Img
                  src={staticFile(`media/gallery/${p.src}`)}
                  style={{
                    width: panelW,
                    height: panelH,
                    objectFit: "cover",
                    objectPosition: "center top",
                  }}
                />
                {/* Panels turning away darken rather than just fading. */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `rgba(10,10,10,${(1 - depth) * 0.55})`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

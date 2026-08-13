import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLOR, LINEAR_ISH, OUT } from "../../theme";

/**
 * Whole web designs flying into a gallery.
 *
 * Each card is a real full-page screenshot, tall, so what settles into the
 * layout is the actual site rather than a crop of one viewport. They arrive
 * from off-frame on staggered arcs and land on a shared baseline, then the
 * whole row drifts upward — the page keeps scrolling after the layout resolves.
 */

export type GalleryItem = {
  src: string;
  /** Final resting position and size. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Where it flies in from, relative to its resting place. */
  fromX: number;
  fromY: number;
  rotate?: number;
  delay?: number;
  /** How far down its own page the card is cropped to, 0–1. */
  pan?: number;
};

export const WebGallery: React.FC<{
  items: GalleryItem[];
  duration: number;
  background?: string;
}> = ({ items, duration, background = COLOR.groundLight }) => {
  const frame = useCurrentFrame();

  // Once everything has landed the whole gallery keeps creeping upward, so the
  // shot never sits still.
  const drift = interpolate(frame, [0, duration], [30, -46], {
    extrapolateRight: "clamp",
    easing: LINEAR_ISH,
  });

  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      {items.map((it, i) => {
        const delay = it.delay ?? 0;
        const t = interpolate(frame, [delay, delay + 26], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
        });

        const x = it.x + (1 - t) * it.fromX;
        const y = it.y + (1 - t) * it.fromY + drift;
        const rot = (1 - t) * (it.rotate ?? 0);

        // Slow pan down the page inside each card, so the screenshots read as
        // live pages rather than as pinned images.
        const pan = interpolate(frame, [delay, duration], [0, it.pan ?? 0.12], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: LINEAR_ISH,
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: it.w,
              height: it.h,
              overflow: "hidden",
              borderRadius: 10,
              background: "#fff",
              opacity: t,
              transform: `rotate(${rot}deg) scale(${interpolate(t, [0, 1], [0.9, 1])})`,
              boxShadow: "0 34px 80px rgba(0,0,0,0.22)",
            }}
          >
            <Img
              src={staticFile(`media/gallery/${it.src}`)}
              style={{
                position: "absolute",
                left: 0,
                top: `-${pan * 100}%`,
                width: it.w,
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

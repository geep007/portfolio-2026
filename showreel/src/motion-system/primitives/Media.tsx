import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import type { MediaRef } from "../compositions/plan";

/**
 * LEVEL 1 · A piece of media, framed for the brand.
 *
 * Image or video (inferred from the extension), cover-cropped, with the
 * brand's continuous push applied. `brand.imagery.push` is the scale delta
 * over the shot; 0 means the frame sits still, which some brands want.
 *
 * Path convention: `src` is relative to public/. The old `Clip` prepended
 * `media/`; here the plan states the full path so nothing is implied.
 */
const isVideo = (src: string, kind?: MediaRef["kind"]) =>
  kind ? kind === "video" : /\.(mp4|webm|mov)$/i.test(src);

export const Media: React.FC<{
  media: MediaRef;
  /** Override the brand push. `0` = still. */
  push?: number;
  /** Frames the push runs over; defaults to the enclosing Sequence. */
  duration?: number;
  origin?: string;
  style?: React.CSSProperties;
}> = ({ media, push, duration, origin = "center center", style }) => {
  const { brand, ease } = useBrand();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const d = duration ?? durationInFrames;
  const amount = push ?? brand.imagery.push;

  const scale = interpolate(frame, [0, Math.max(1, d)], [1, 1 + amount], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease("travel"),
  });

  const common: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: media.position ?? "center center",
    transform: `scale(${scale})`,
    transformOrigin: origin,
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      {isVideo(media.src, media.kind) ? (
        <OffthreadVideo
          src={staticFile(media.src)}
          startFrom={media.startFrom ?? 0}
          muted
          style={common}
        />
      ) : (
        <Img src={staticFile(media.src)} style={common} />
      )}
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT } from "../theme";

/**
 * The site's own browser frame — the one the atomicdesignz.com artboards wear:
 * hairline ink border, pale cobalt-tinted bar, three hollow dots, the URL in
 * mono. It wraps a whole composition, so the intro reads as a page of the site
 * rather than as a video that happens to show work.
 *
 * Distinct from `BrowserWindow`, which is a dark chrome placed *inside* a shot
 * to label a client's capture. This one is the outer edge of the frame. Never
 * nest the two — one window per plane.
 *
 * Values scaled from the Paper artboard (1260 wide) to 1920: bar 39→59px,
 * dots 9→14px, url 13→20px.
 */

export const SITE_FRAME_BAR = 59;

const BORDER = "#0E0E0E";

export const SiteFrame: React.FC<{
  url: string;
  children: React.ReactNode;
}> = ({ url, children }) => {
  return (
    <AbsoluteFill
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 9,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: SITE_FRAME_BAR,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "0 21px",
          background: "#F1F3FF",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div style={{ display: "flex", gap: 9 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                border: `1px solid ${BORDER}`,
                flexShrink: 0,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 20,
            lineHeight: "27px",
            letterSpacing: "0.1em",
            color: "rgb(14 14 14 / 55%)",
          }}
        >
          {url}
        </div>
      </div>

      {/* The children still lay out against the full 1920×1080 canvas; the bar
          eats the bottom 59px, which is ground in every intro. Scaling the
          content to fit instead would leave slivers at the sides and shrink
          the type, so the frame crops rather than rescales. */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};

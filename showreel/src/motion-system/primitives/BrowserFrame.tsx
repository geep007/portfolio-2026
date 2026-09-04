import React from "react";
import { useCurrentFrame } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress } from "../engine/timing";

/**
 * LEVEL 1 · A website inside a window.
 *
 * One primitive replaces the three old chromes (BrowserWindow, SiteFrame,
 * Frame). The brand decides the style:
 *   hairline — 1px border, muted bar, three dots, URL in the label face
 *   plain    — no bar at all, just the brand's media radius + border. For
 *              brands where a fake browser would read as a stock template.
 *   titled   — solid accent title bar with the URL as a title (the deck window)
 *
 * The bar draws on from the left over `short`, so a window arriving reads as
 * being built rather than pasted.
 */
export type ChromeStyle = "hairline" | "plain" | "titled";

export const BrowserFrame: React.FC<{
  url?: string;
  left: number;
  top: number;
  width: number;
  height: number;
  chrome?: ChromeStyle;
  dark?: boolean;
  drawFrom?: number;
  scale?: number;
  /** 0–1 darkening over the content. */
  dim?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  url,
  left,
  top,
  width,
  height,
  chrome = "hairline",
  dark = false,
  drawFrom = 0,
  scale = 1,
  dim = 0,
  children,
  style,
}) => {
  const { brand, ease, frames, ground, type, radius } = useBrand();
  const frame = useCurrentFrame();
  const g = ground(dark);
  const draw = progress(frame, { delay: drawFrom, duration: frames("short"), easing: ease("enter") });

  const bar = chrome === "plain" ? 0 : chrome === "titled" ? 52 : 46;
  const shadow = brand.surfaces.shadow === "none" ? "none" : brand.surfaces.shadowValue;
  const border =
    brand.surfaces.border.style === "none"
      ? "none"
      : `${brand.surfaces.border.width}px solid ${chrome === "titled" ? g.accent : g.rule}`;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        border,
        borderRadius: radius(),
        background: g.background,
        overflow: "hidden",
        boxShadow: shadow,
        ...style,
      }}
    >
      {bar > 0 ? (
        <div
          style={{
            height: bar,
            background: chrome === "titled" ? g.accent : dark ? "#141414" : "#EDEDED",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 16px",
            clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`,
          }}
        >
          {chrome === "hairline"
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: g.muted,
                    opacity: 0.5,
                  }}
                />
              ))
            : null}
          {url ? (
            <div
              style={{
                ...type("label", brand.typography.scale.micro),
                color: chrome === "titled" ? brand.colors.inverse.foreground : g.muted,
                marginLeft: chrome === "hairline" ? 8 : 0,
              }}
            >
              {url}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          top: bar,
          left: 0,
          width,
          height: height - bar,
          overflow: "hidden",
        }}
      >
        {children}
        {dim > 0 ? (
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${dim})` }} />
        ) : null}
      </div>
    </div>
  );
};

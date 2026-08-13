import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT, OUT } from "../../theme";

/**
 * Design-tool selection chrome: name tag, hairline bounds, eight handles.
 *
 * Drawn as its own layer over whatever it is selecting, so the same frame can
 * hold a static composition and then a live site without the contents changing —
 * which is the entire point of the Figma → live transition.
 */
export const FigmaFrame: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  /** 0–1: how drawn the box is (for the cursor dragging it out). */
  draw?: number;
  /** 0–1: how present the selection chrome is (drops to 0 on publish). */
  selected?: number;
  showSize?: boolean;
}> = ({ x, y, width, height, name, draw = 1, selected = 1, showSize = true }) => {
  const frame = useCurrentFrame();
  const accent = COLOR.cobalt;

  const w = width * draw;
  const h = height * draw;

  if (selected <= 0.001) {
    return null;
  }

  const handle = (hx: number, hy: number) => (
    <div
      key={`${hx}-${hy}`}
      style={{
        position: "absolute",
        left: hx - 5,
        top: hy - 5,
        width: 10,
        height: 10,
        background: COLOR.onDark,
        border: `1.5px solid ${accent}`,
        opacity: selected,
      }}
    />
  );

  // Handles only appear once the box has actually been drawn out.
  const handlesIn = draw > 0.98 ? 1 : 0;
  const pulse = interpolate(frame % 30, [0, 15, 30], [1, 0.86, 1]);

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `1.5px solid ${accent}`,
          opacity: selected,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: -30,
          left: 0,
          fontFamily: FONT.mono,
          fontSize: 20,
          letterSpacing: "0.04em",
          color: accent,
          opacity: selected * handlesIn * pulse,
          whiteSpace: "pre",
        }}
      >
        {name}
      </div>

      {showSize ? (
        <div
          style={{
            position: "absolute",
            bottom: -34,
            left: w / 2 - 70,
            width: 140,
            textAlign: "center",
            fontFamily: FONT.mono,
            fontSize: 18,
            letterSpacing: "0.04em",
            color: COLOR.onDark,
            background: accent,
            padding: "4px 0",
            opacity: selected * handlesIn,
          }}
        >
          {Math.round(w)} × {Math.round(h)}
        </div>
      ) : null}

      {handlesIn
        ? [
            handle(0, 0),
            handle(w / 2, 0),
            handle(w, 0),
            handle(0, h / 2),
            handle(w, h / 2),
            handle(0, h),
            handle(w / 2, h),
            handle(w, h),
          ]
        : null}
    </div>
  );
};

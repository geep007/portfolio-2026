import React, { useCallback, useEffect, useRef, useState } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { getStaticFiles, saveDefaultProps, updateDefaultProps } from "@remotion/studio";
import { COLOR, FONT } from "../theme";
import {
  hotspotsAt,
  mediaSpotsAt,
  moveAtPath,
  setAtPath,
  type HeroProps,
} from "./layout";
import type { Timeline } from "./timeline";

/**
 * Drag-to-position overlay for the Studio preview.
 *
 * Remotion's props panel can already edit these numbers, but typing coordinates
 * to place a callout is the wrong loop. This puts a handle on the thing itself:
 * drag it, and the composition's defaultProps are rewritten in Root.tsx — so the
 * change is real code, survives a restart, and shows up in the next render.
 *
 * While dragging it calls `updateDefaultProps` (live, unsaved) and on release
 * `saveDefaultProps` (written to disk). Nothing renders unless `editMode` is on,
 * and it is skipped entirely during a render.
 */

const COMPOSITION_ID = "HeroReel";

export const EditLayer: React.FC<{ props: HeroProps; timeline: Timeline }> = ({
  props,
  timeline,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  // The preview is scaled to fit its panel; a drag of N screen px is N/scale
  // composition px. Measured live because the panel resizes.
  const scaleRef = useRef(1);
  useEffect(() => {
    const measure = () => {
      if (ref.current) {
        scaleRef.current = ref.current.getBoundingClientRect().width / width;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [width]);

  const spots = hotspotsAt(props, frame, timeline);
  const media = mediaSpotsAt(props, frame, timeline);
  const [picking, setPicking] = useState<{ path: string; folder: string } | null>(null);

  /** Persist whatever is currently in the unsaved props to Root.tsx. */
  const persist = useCallback(() => {
    saveDefaultProps({
      compositionId: COMPOSITION_ID,
      defaultProps: ({ unsavedDefaultProps }) => unsavedDefaultProps,
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[EditLayer] could not save defaultProps", err);
    });
  }, []);

  /**
   * Files available for a slot. `getStaticFiles` lists everything under
   * public/, so it picks up anything dropped in there while the Studio is
   * running — no restart, no code edit.
   */
  const filesFor = (folder: string) => {
    const prefix = folder ? `media/${folder}/` : "media/";
    return getStaticFiles()
      .map((f) => f.name)
      .filter((n) => n.startsWith(prefix))
      .filter((n) => !n.slice(prefix.length).includes("/"))
      .filter((n) => /\.(mp4|webm|png|jpg|jpeg|svg|webp)$/i.test(n))
      .map((n) => n.slice(prefix.length))
      .sort();
  };

  const choose = (path: string, file: string) => {
    updateDefaultProps({
      compositionId: COMPOSITION_ID,
      defaultProps: ({ unsavedDefaultProps }) =>
        setAtPath(
          unsavedDefaultProps as unknown as HeroProps,
          path,
          file,
        ) as unknown as Record<string, unknown>,
    });
    setPicking(null);
    // The update above is async in the store; persist on the next tick.
    setTimeout(persist, 60);
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent, path: string, startX: number, startY: number) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(path);

      const originX = e.clientX;
      const originY = e.clientY;
      let latest = { x: startX, y: startY };

      const onMove = (ev: PointerEvent) => {
        const scale = scaleRef.current || 1;
        latest = {
          x: startX + (ev.clientX - originX) / scale,
          y: startY + (ev.clientY - originY) / scale,
        };
        updateDefaultProps({
          compositionId: COMPOSITION_ID,
          defaultProps: ({ unsavedDefaultProps }) =>
            moveAtPath(
              unsavedDefaultProps as unknown as HeroProps,
              path,
              latest.x,
              latest.y,
            ) as unknown as Record<string, unknown>,
        });
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        setDragging(null);
        // Persist to Root.tsx. Read from unsaved so we keep the dragged value.
        saveDefaultProps({
          compositionId: COMPOSITION_ID,
          defaultProps: ({ unsavedDefaultProps }) => unsavedDefaultProps,
        }).catch((err) => {
          // eslint-disable-next-line no-console
          console.error("[EditLayer] could not save defaultProps", err);
        });
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [],
  );

  return (
    <AbsoluteFill ref={ref} style={{ cursor: dragging ? "grabbing" : "default" }}>
      {spots.map((s) => {
        const active = dragging === s.path || hover === s.path;
        return (
          <div
            key={s.path}
            onPointerDown={(e) => onPointerDown(e, s.path, s.x, s.y)}
            onPointerEnter={() => setHover(s.path)}
            onPointerLeave={() => setHover(null)}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.w,
              height: s.h,
              border: `2px dashed ${active ? COLOR.cobalt : "rgba(26,46,242,0.45)"}`,
              background: active ? "rgba(26,46,242,0.12)" : "transparent",
              cursor: "grab",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -30,
                left: -2,
                background: COLOR.cobalt,
                color: COLOR.onDark,
                fontFamily: FONT.mono,
                fontSize: 16,
                padding: "3px 8px",
                whiteSpace: "pre",
                opacity: active ? 1 : 0.75,
              }}
            >
              {s.label} · {Math.round(s.x)},{Math.round(s.y)}
            </div>
          </div>
        );
      })}

      {media.map((m) => (
        <div
          key={m.path}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPicking({ path: m.path, folder: m.media?.folder ?? "" });
          }}
          style={{
            position: "absolute",
            left: m.x,
            top: m.y,
            width: m.w,
            height: m.h,
            border: `2px solid ${picking?.path === m.path ? "#F26A1A" : "rgba(242,106,26,0.6)"}`,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              background: "#F26A1A",
              color: COLOR.onDark,
              fontFamily: FONT.mono,
              fontSize: 15,
              padding: "3px 7px",
              whiteSpace: "pre",
            }}
          >
            {m.label} · {m.media?.current}
          </div>
        </div>
      ))}

      {picking ? (
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 90,
            width: 460,
            maxHeight: 900,
            overflow: "hidden",
            background: COLOR.groundDark,
            border: `2px solid #F26A1A`,
            padding: 16,
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 17,
              color: "#F26A1A",
              marginBottom: 12,
              whiteSpace: "pre-wrap",
            }}
          >
            REPLACE {picking.path}
            {"\n"}from public/media/{picking.folder || ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filesFor(picking.folder).map((f) => (
              <div
                key={f}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  choose(picking.path, f);
                }}
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 17,
                  color: COLOR.onDark,
                  padding: "7px 10px",
                  background: "rgba(250,250,250,0.07)",
                  cursor: "pointer",
                }}
              >
                {f}
              </div>
            ))}
          </div>
          <div
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPicking(null);
            }}
            style={{
              marginTop: 12,
              fontFamily: FONT.mono,
              fontSize: 16,
              color: COLOR.onDarkMuted,
              cursor: "pointer",
            }}
          >
            ✕ close
          </div>
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 24,
          top: 24,
          background: COLOR.cobalt,
          color: COLOR.onDark,
          fontFamily: FONT.mono,
          fontSize: 18,
          padding: "8px 12px",
        }}
      >
        EDIT MODE · blue = drag to move · orange = click to replace
      </div>
    </AbsoluteFill>
  );
};

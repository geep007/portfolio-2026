import React, { createContext, useContext, useMemo } from "react";
import type { BrandSystem, TypeRole } from "./schema";
import type { MotionVocabulary } from "./vocabulary";
import { easingOf, type EasingName } from "../engine/easing";
import {
  framesOf,
  staggerOf,
  type DurationTier,
  type StaggerTier,
} from "../engine/timing";
import { loadBrandFonts } from "../engine/fonts";

/**
 * The active brand, available to every motion component.
 *
 *   <BrandProvider brand={atomic}>
 *     <LaunchFilm />
 *   </BrandProvider>
 *
 * Components call `useBrand()` and get the BrandSystem plus resolved helpers
 * (easings as functions, durations as frames, type roles as CSS). No component
 * imports a brand file directly.
 *
 * Outside a provider `useBrand()` throws — a component rendered without a brand
 * is a bug, not a case to paper over with defaults.
 */

export type BrandContextValue = {
  brand: BrandSystem;
  vocabulary?: MotionVocabulary;
  /** Named easing → function. */
  ease: (name?: EasingName) => (t: number) => number;
  /** Semantic duration → frames at this brand's tempo. */
  frames: (tier: DurationTier | number) => number;
  stagger: (tier: StaggerTier | number) => number;
  /** A type role as ready-to-spread CSS. */
  type: (role: keyof BrandSystem["typography"]["roles"], size?: number) => React.CSSProperties;
  /** Colour set for the light or inverse ground. */
  ground: (dark?: boolean) => {
    background: string;
    foreground: string;
    muted: string;
    rule: string;
    accent: string;
  };
  radius: (size?: BrandSystem["surfaces"]["mediaRadius"]) => number;
};

const Ctx = createContext<BrandContextValue | null>(null);

const faceStack = (brand: BrandSystem, face: TypeRole["face"]) => {
  const t = brand.typography;
  if (face === "mono") return (t.mono ?? t.body).stack;
  if (face === "display") return t.display.stack;
  return t.body.stack;
};

export const roleStyle = (
  brand: BrandSystem,
  roleName: keyof BrandSystem["typography"]["roles"],
  size?: number,
): React.CSSProperties => {
  const role = brand.typography.roles[roleName];
  const scale = brand.typography.scale;
  const defaultSize =
    roleName === "headline"
      ? scale.display
      : roleName === "wordmark"
        ? scale.hero
        : roleName === "subhead"
          ? scale.title
          : roleName === "label"
            ? scale.label
            : scale.body;
  return {
    fontFamily: faceStack(brand, role.face),
    fontWeight: role.weight,
    fontSize: size ?? defaultSize,
    letterSpacing: role.tracking,
    lineHeight: role.lineHeight,
    textTransform:
      role.casing === "upper" ? "uppercase" : role.casing === "lower" ? "lowercase" : "none",
  };
};

export const BrandProvider: React.FC<{
  brand: BrandSystem;
  vocabulary?: MotionVocabulary;
  children: React.ReactNode;
}> = ({ brand, vocabulary, children }) => {
  loadBrandFonts(brand);

  const value = useMemo<BrandContextValue>(
    () => ({
      brand,
      vocabulary,
      ease: (name) => easingOf(brand, name),
      frames: (tier) => framesOf(brand, tier),
      stagger: (tier) => staggerOf(brand, tier),
      type: (role, size) => roleStyle(brand, role, size),
      ground: (dark = false) =>
        dark
          ? {
              background: brand.colors.inverse.background,
              foreground: brand.colors.inverse.foreground,
              muted: brand.colors.inverse.muted,
              rule: brand.colors.inverse.rule,
              accent: brand.colors.inverse.accent,
            }
          : {
              background: brand.colors.background,
              foreground: brand.colors.foreground,
              muted: brand.colors.muted,
              rule: brand.colors.rule,
              accent: brand.colors.accent,
            },
      radius: (size) => brand.surfaces.radius[size ?? brand.surfaces.mediaRadius],
    }),
    [brand, vocabulary],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useBrand = (): BrandContextValue => {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error(
      "useBrand() called outside <BrandProvider>. Wrap the composition in a brand.",
    );
  }
  return v;
};

/** For code paths that may run with or without a brand (legacy components). */
export const useOptionalBrand = () => useContext(Ctx);

import type React from "react";
import type { Beat, ContentKind, Energy, PatternCategory } from "../brand/vocabulary";
import type { BeatContent } from "../compositions/plan";

/**
 * LEVEL 2 · Motion patterns.
 *
 * A pattern is a React component that takes CONTENT and renders a complete
 * shot, reading everything visual from `useBrand()` and its own duration from
 * the enclosing Sequence. It carries metadata so an agent can pick it without
 * reading the implementation.
 */

export type PatternProps = {
  content: BeatContent;
  /** Render on the brand's inverse ground. Patterns that cannot ignore it. */
  dark?: boolean;
  /** Pattern-specific options, validated by `meta.options`. */
  options?: Record<string, unknown>;
};

export type PatternOptionSpec =
  | { type: "enum"; values: string[]; default: string; description: string }
  | { type: "number"; min: number; max: number; default: number; description: string }
  | { type: "boolean"; default: boolean; description: string };

export type PatternMeta = {
  id: string;
  name: string;
  category: PatternCategory;
  description: string;
  roles: Beat[];
  compatibleContent: ContentKind[];
  energy: Energy;
  /** Frames at tempo 1.0. Brands scale via their vocabulary. */
  duration: { min: number; preferred: number; max: number };
  constraints?: {
    maxWords?: number;
    maxLines?: number;
    maxItems?: number;
    minItems?: number;
  };
  avoidWhen: string[];
  /** Options a plan may set. Anything not listed is rejected. */
  options?: Record<string, PatternOptionSpec>;
  /** Does the pattern support `dark`? */
  supportsDark: boolean;
};

export type Pattern = {
  meta: PatternMeta;
  Component: React.FC<PatternProps>;
};

/** Read a typed option with its declared default. */
export const opt = <T,>(
  options: Record<string, unknown> | undefined,
  meta: PatternMeta,
  key: string,
): T => {
  const spec = meta.options?.[key];
  const v = options?.[key];
  if (v !== undefined) return v as T;
  return (spec?.default ?? undefined) as T;
};

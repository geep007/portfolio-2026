import type { Pattern, PatternMeta } from "./types";
import { HeadlineReveal } from "./HeadlineReveal";
import { KnockoutStatement } from "./KnockoutStatement";
import { BrowserScroll } from "./BrowserScroll";
import { PanelMosaic } from "./PanelMosaic";
import { StructuredGallery } from "./StructuredGallery";
import { LogoWall } from "./LogoWall";
import { StatReveal } from "./StatReveal";
import { LogoOutro } from "./LogoOutro";
import { DeviceGrid } from "./DeviceGrid";
import { FloatingCards } from "./FloatingCards";
import { SplitReveal } from "./SplitReveal";
import { AnnotatedWindow } from "./AnnotatedWindow";
import { PhotoStatement } from "./PhotoStatement";
import { StatTiles } from "./StatTiles";
import { PillarIndex } from "./PillarIndex";

/**
 * Every LEVEL 2 pattern the engine knows. A brand's vocabulary is a subset of
 * these ids with brand-specific guidance; a plan may only name ids that are
 * both here and in the brand's vocabulary.
 */
export const PATTERNS: Record<string, Pattern> = Object.fromEntries(
  [
    HeadlineReveal,
    KnockoutStatement,
    BrowserScroll,
    PanelMosaic,
    StructuredGallery,
    LogoWall,
    StatReveal,
    LogoOutro,
    DeviceGrid,
    FloatingCards,
    SplitReveal,
    AnnotatedWindow,
    PhotoStatement,
    StatTiles,
    PillarIndex,
  ].map((p) => [p.meta.id, p]),
);

export const patternById = (id: string): Pattern | undefined => PATTERNS[id];

export const allPatternMeta = (): PatternMeta[] => Object.values(PATTERNS).map((p) => p.meta);

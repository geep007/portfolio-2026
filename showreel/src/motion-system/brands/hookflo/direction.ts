/**
 * The brief for ONE film, as data.
 *
 * The content now lives in `projects/hookflo/missing-dot/creative-direction.json`
 * — the canonical `CreativeDirection` artifact. This file is the code-side
 * handle on it, so a composition or a check can import the direction without
 * knowing where artifacts are stored.
 *
 * `CreativeDirection` itself is no longer declared here: it was promoted to
 * `core/schemas/creative-direction.ts` because it is general. BrandSystem says
 * what Hookflo is; a CreativeDirection says what one piece is.
 *
 * Nothing in here is consumed by the engine. It is consumed by whoever (human
 * or agent) writes and reviews `films/hookflo/MissingDot.tsx`, and it is what
 * the visual critique is scored against.
 */
import directionJson from "../../../../projects/hookflo/missing-dot/creative-direction.json";
import type { CreativeDirection } from "../../core/schemas/creative-direction";

export const missingDot = directionJson as unknown as CreativeDirection;
export type { CreativeDirection };

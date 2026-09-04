import type { BrandSystem } from "../brand/schema";
import type { MotionVocabulary } from "../brand/vocabulary";
import { atomic } from "./atomic/brand";
import { atomicVocabulary } from "./atomic/vocabulary";
import { edelgive } from "./edelgive/brand";
import { hookflo } from "./hookflo/brand";
import { edelgiveVocabulary } from "./edelgive/vocabulary";
import { hookfloVocabulary } from "./hookflo/vocabulary";

/**
 * Every brand the engine can render. A plan names one by `identity.id`.
 */
export type BrandBundle = { brand: BrandSystem; vocabulary: MotionVocabulary };

export const BRANDS: Record<string, BrandBundle> = {
  atomic: { brand: atomic, vocabulary: atomicVocabulary },
  edelgive: { brand: edelgive, vocabulary: edelgiveVocabulary },
  hookflo: { brand: hookflo, vocabulary: hookfloVocabulary },
};

export const brandById = (id: string): BrandBundle => {
  const b = BRANDS[id];
  if (!b) {
    throw new Error(`Unknown brand "${id}". Known: ${Object.keys(BRANDS).join(", ")}`);
  }
  return b;
};

/**
 * Pure artifact helpers — addressing and patching.
 *
 * These exist so a future UI can regenerate ONE thing. The pipeline's unit of
 * work is not "the film"; it is an address like `score.cues.travel` or
 * `storyboard.states.drop.visual`, and a stage that changes one address must
 * not invalidate the rest.
 */

/** `states.drop.visual`, `cues.rowContent.3`, `geometry.panel.open.x`. */
export type Address = string;

const parts = (a: Address) => a.split(".").filter(Boolean);

export const getAt = (obj: unknown, address: Address): unknown =>
  parts(address).reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    if (Array.isArray(acc)) {
      const i = Number(key);
      /** Arrays of objects address by `id` first, then by index. */
      const byId = acc.find((x) => x && typeof x === "object" && (x as { id?: string }).id === key);
      return byId ?? (Number.isFinite(i) ? acc[i] : undefined);
    }
    return (acc as Record<string, unknown>)[key];
  }, obj);

/** Immutable set. Returns a new object; the original is untouched. */
export const setAt = <T>(obj: T, address: Address, value: unknown): T => {
  const [head, ...rest] = parts(address);
  if (head === undefined) return value as T;

  if (Array.isArray(obj)) {
    const i = obj.findIndex(
      (x) => x && typeof x === "object" && (x as { id?: string }).id === head,
    );
    const idx = i >= 0 ? i : Number(head);
    if (!Number.isFinite(idx) || idx < 0 || idx >= obj.length) {
      throw new Error(`No element "${head}" in array at ${address}`);
    }
    const next = obj.slice();
    next[idx] = rest.length ? setAt(obj[idx], rest.join("."), value) : value;
    return next as unknown as T;
  }

  const src = (obj ?? {}) as Record<string, unknown>;
  return {
    ...src,
    [head]: rest.length ? setAt(src[head], rest.join("."), value) : value,
  } as T;
};

/**
 * Stable stringify — key order must not change a hash, or every cache check
 * becomes a false miss.
 */
export const stable = (v: unknown): string => {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o)
    .sort()
    .filter((k) => o[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${stable(o[k])}`)
    .join(",")}}`;
};

/** FNV-1a over the stable form. Cache invalidation, not cryptography. */
export const hashOf = (v: unknown): string => {
  const s = stable(v);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};

/**
 * Hash an artifact's content only — provenance is excluded so that re-stamping
 * a date does not look like a content change.
 */
export const contentHash = (artifact: Record<string, unknown>) => {
  const { provenance: _p, ...rest } = artifact;
  return hashOf(rest);
};

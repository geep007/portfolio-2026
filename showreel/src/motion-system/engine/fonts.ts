import { continueRender, delayRender, staticFile } from "remotion";
import type { BrandSystem, FontFace } from "../brand/schema";

/**
 * Inject a brand's font files with @font-face and hold the render until they
 * are parsed. Idempotent per brand id — call it from any composition that uses
 * the brand; the second call is free.
 *
 * Generalises the old `fonts.ts`, which knew only the Atomic faces.
 */
const injected = new Set<string>();

const faceCss = (f: FontFace) =>
  (f.files ?? [])
    .map(
      (file) => `
    @font-face {
      font-family: "${f.family}";
      src: url("${staticFile(file.path)}") format("${formatOf(file.path)}");
      font-weight: ${file.weight};
      font-style: ${file.style ?? "normal"};
      font-display: block;
    }`,
    )
    .join("\n");

const formatOf = (path: string) => {
  if (path.endsWith(".otf")) return "opentype";
  if (path.endsWith(".woff2")) return "woff2";
  if (path.endsWith(".woff")) return "woff";
  return "truetype";
};

export const loadBrandFonts = (brand: BrandSystem) => {
  const key = brand.identity.id;
  if (injected.has(key) || typeof document === "undefined") {
    return;
  }
  injected.add(key);

  const faces = [brand.typography.display, brand.typography.body, brand.typography.mono].filter(
    (f): f is FontFace => Boolean(f && f.files && f.files.length > 0),
  );
  if (faces.length === 0) {
    return;
  }

  const handle = delayRender(`Loading ${brand.identity.name} fonts`);
  const style = document.createElement("style");
  style.setAttribute("data-brand-fonts", key);
  style.textContent = faces.map(faceCss).join("\n");
  document.head.appendChild(style);
  document.fonts.ready.then(() => continueRender(handle));
};

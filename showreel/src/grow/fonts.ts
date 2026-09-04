import { continueRender, delayRender, staticFile } from "remotion";
import { FONT } from "./tokens";

/**
 * Sora, the GROW+ display face, injected once and the render held until it is
 * parsed. Same mechanism as `motion-system/engine/fonts.ts`; that one takes a
 * BrandSystem, and this film is not a brand.
 */
let injected = false;

export const loadGrowFonts = () => {
  if (injected || typeof document === "undefined") return;
  injected = true;

  const handle = delayRender("Loading Sora");
  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: "Sora";
      src: url("${staticFile(FONT.file)}") format("truetype");
      font-weight: 100 800;
      font-style: normal;
      font-display: block;
    }`;
  document.head.appendChild(style);
  document.fonts.ready.then(() => continueRender(handle));
};

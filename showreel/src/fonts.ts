import { continueRender, delayRender, staticFile } from "remotion";

let injected = false;

/**
 * The deck fonts are local desktop licences, not webfonts, so they are copied into
 * public/fonts and injected by hand. Rendering is held until they are actually parsed —
 * otherwise the first frames measure against a fallback and every letter-space is wrong.
 */
export const loadFonts = () => {
  if (injected || typeof document === "undefined") {
    return;
  }
  injected = true;

  const handle = delayRender("Loading deck fonts");

  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: "Neue Haas Display";
      src: url("${staticFile("fonts/NeueHaasDisplay-Roman.ttf")}") format("truetype");
      font-weight: 400;
      font-display: block;
    }
    @font-face {
      font-family: "Neue Haas Display";
      src: url("${staticFile("fonts/NeueHaasDisplay-Medium.ttf")}") format("truetype");
      font-weight: 500;
      font-display: block;
    }
    @font-face {
      font-family: "Neue Haas Display";
      src: url("${staticFile("fonts/NeueHaasDisplay-Bold.ttf")}") format("truetype");
      font-weight: 700;
      font-display: block;
    }
    @font-face {
      font-family: "Tronica Mono";
      src: url("${staticFile("fonts/Tronica-Mono.otf")}") format("opentype");
      font-weight: 400;
      font-display: block;
    }
  `;
  document.head.appendChild(style);

  document.fonts.ready.then(() => continueRender(handle));
};

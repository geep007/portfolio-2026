import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { Shutter } from "../components/Shutter";
import { loadFonts } from "../fonts";
import { COLOR } from "../theme";
import { Blast } from "./scenes/Blast";
import { Boot } from "./scenes/Boot";
import { Close } from "./scenes/Close";
import { Hero } from "./scenes/Hero";
import { Mobile } from "./scenes/Mobile";
import { Process } from "./scenes/Process";
import { Thesis } from "./scenes/Thesis";
import { Work } from "./scenes/Work";
import { siteTimeline, type SiteProps } from "./siteLayout";

loadFonts();

const SHUTTER = 12;

/**
 * atomicdesignz.com in twenty-three seconds: open the URL, land on the site,
 * fall through the whole page, three builds, the argument, the process, the
 * phone, the address again. Every frame is a real capture of the live site.
 *
 * Copy and timing live in `Root.tsx` defaultProps; the shapes are in
 * `siteLayout.ts`. Cuts are cuts — the cobalt shutter straddles each one, and
 * nothing crossfades.
 */
export const SiteReel: React.FC<SiteProps> = (props) => {
  const { scenes, total } = siteTimeline(props);
  const at = (id: string) => scenes.find((s) => s.id === id)!;

  const boot = at("boot");
  const hero = at("hero");
  const blast = at("blast");
  const work = at("work");
  const thesis = at("thesis");
  const process = at("process");
  const mobile = at("mobile");
  const close = at("close");

  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      {/* Music, with a short fade at each end so the cut never starts or stops
          on a chopped bar. `audioStartInSeconds` picks the bar it starts on. */}
      <Audio
        src={staticFile(props.music)}
        startFrom={Math.round(props.audioStartInSeconds * 30)}
        volume={(f) =>
          props.volume *
          interpolate(f, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) *
          interpolate(f, [total - 26, total - 2], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      <Sequence from={boot.from} durationInFrames={boot.duration} layout="none">
        <Boot boot={props.boot} />
      </Sequence>
      <Sequence from={hero.from} durationInFrames={hero.duration} layout="none">
        <Hero hero={props.hero} url={props.url} />
      </Sequence>
      <Sequence from={blast.from} durationInFrames={blast.duration} layout="none">
        <Blast blast={props.blast} />
      </Sequence>
      <Sequence from={work.from} durationInFrames={work.duration} layout="none">
        <Work work={props.work} />
      </Sequence>
      <Sequence from={thesis.from} durationInFrames={thesis.duration} layout="none">
        <Thesis thesis={props.thesis} />
      </Sequence>
      <Sequence from={process.from} durationInFrames={process.duration} layout="none">
        <Process process={props.process} />
      </Sequence>
      <Sequence from={mobile.from} durationInFrames={mobile.duration} layout="none">
        <Mobile mobile={props.mobile} />
      </Sequence>
      <Sequence from={close.from} durationInFrames={close.duration} layout="none">
        <Close close={props.close} url={props.url} />
      </Sequence>

      {/* Cut covers, centred on every scene boundary except the first. */}
      {scenes.slice(1).map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.from - SHUTTER / 2}
          durationInFrames={SHUTTER}
          layout="none"
        >
          <Shutter duration={SHUTTER} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

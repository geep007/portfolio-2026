import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Shutter } from "./components/Shutter";
import { loadFonts } from "./fonts";
import { Athina } from "./scenes/Athina";
import { Close } from "./scenes/Close";
import { Creo } from "./scenes/Creo";
import { Grow } from "./scenes/Grow";
import { Open } from "./scenes/Open";
import { Surreal } from "./scenes/Surreal";
import { COLOR, SCENE } from "./theme";

loadFonts();

/** A shutter straddles each cut, centred on the boundary. */
const CUTS = [
  SCENE.surreal.from,
  SCENE.creo.from,
  SCENE.athina.from,
  SCENE.grow.from,
  SCENE.close.from,
];

const SHUTTER = 14;

export const ShowreelShort: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLOR.groundLight }}>
      <Sequence from={SCENE.open.from} durationInFrames={SCENE.open.duration}>
        <Open />
      </Sequence>
      <Sequence from={SCENE.surreal.from} durationInFrames={SCENE.surreal.duration}>
        <Surreal />
      </Sequence>
      <Sequence from={SCENE.creo.from} durationInFrames={SCENE.creo.duration}>
        <Creo />
      </Sequence>
      <Sequence from={SCENE.athina.from} durationInFrames={SCENE.athina.duration}>
        <Athina />
      </Sequence>
      <Sequence from={SCENE.grow.from} durationInFrames={SCENE.grow.duration}>
        <Grow />
      </Sequence>
      <Sequence from={SCENE.close.from} durationInFrames={SCENE.close.duration}>
        <Close />
      </Sequence>

      {CUTS.map((cut) => (
        <Sequence
          key={cut}
          from={cut - SHUTTER / 2}
          durationInFrames={SHUTTER}
          layout="none"
        >
          <Shutter duration={SHUTTER} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

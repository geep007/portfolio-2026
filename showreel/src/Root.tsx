import React from "react";
import { Composition } from "remotion";
import { HeroAnimatic } from "./hero/HeroAnimatic";
import { HeroReel } from "./hero/HeroReel";
import { heroSchema } from "./hero/layout";
import { IntroA } from "./intro/IntroA";
import { IntroB } from "./intro/IntroB";
import { IntroC } from "./intro/IntroC";
import { IntroD } from "./intro/IntroD";
import { introCSchema, introSchema } from "./intro/introLayout";
import { OutroA } from "./outro/OutroA";
import { OutroB } from "./outro/OutroB";
import { outroSchema } from "./outro/outroLayout";
import { buildTimeline } from "./hero/timeline";
import { TOTAL_FRAMES } from "./hero/shots";
import { ShowreelShort } from "./ShowreelShort";
import { SiteReel } from "./site/SiteReel";
import { siteSchema, siteTimeline } from "./site/siteLayout";
import { SurrealVertical } from "./vertical/SurrealVertical";
import { Mascot } from "./mascot/Mascot";
import { SigMark } from "./sig/SigMark";
import { FPS as MASCOT_FPS, TOTAL as MASCOT_TOTAL } from "./mascot/timeline";
import { verticalSchema, verticalTimeline } from "./vertical/verticalLayout";
import { FPS, TOTAL } from "./theme";
import { MotionSystemCompositions } from "./motion-system/Root";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShowreelShort"
        component={ShowreelShort}
        durationInFrames={TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
      {/*
        `schema` + `defaultProps` are what make this composition editable in the
        Studio: the props panel renders a field per value, and the drag overlay
        (`editMode`) writes coordinates straight back into the defaultProps
        below. Both persist to this file, so edits survive a restart and land in
        the next render.
      */}
      {/*
        The site reel: atomicdesignz.com itself, cut to music. Every shot is a
        real capture of the live site (see public/site/), so the only things
        worth editing are the words and the timing — both of which are props
        below. Same rule as HeroReel: this object literal has to stay hardcoded
        or the Studio cannot save edits back into it.
      */}
      <Composition
        id="SiteReel"
        component={SiteReel}
        durationInFrames={690}
        fps={FPS}
        width={1920}
        height={1080}
        schema={siteSchema}
        defaultProps={{
          url: "atomicdesignz.com",
          music: "audio/hot-pursuits.mp3",
          audioStartInSeconds: 16,
          volume: 0.9,
          boot: {
            duration: 54,
            tag: "( 00 )  STORY-LED WEBSITES FOR COMPLEX BRANDS",
            type: "atomicdesignz.com",
          },
          hero: {
            duration: 120,
            clipStartFrom: 90,
            eyebrow: "THE HEADER PLAYS ITS OWN REEL",
            headline: ["We tell stories on the web"],
          },
          blast: {
            duration: 120,
            label: "ONE PAGE, TOP TO BOTTOM",
            kicker: ["of scroll."],
          },
          work: {
            duration: 138,
            tag: "( 01 )  SELECTED WORK",
            heading: "Five recent builds.",
            cards: [
              {
                src: "work-01.png",
                name: "Surreal",
                spec: "WEBFLOW · GSAP · WEBGL",
                position: 0.5,
              },
              {
                src: "work-02.png",
                name: "Athina AI",
                spec: "WEBFLOW · CMS · MOTION",
                position: 0.35,
              },
              {
                src: "work-03.png",
                name: "Creo & Juana de Arco",
                spec: "PORTFOLIO · SHOPIFY · ECOMMERCE",
                position: 0.4,
              },
            ],
          },
          thesis: {
            duration: 78,
            tag: "( 02 )  WHY WE DO IT THIS WAY",
            lines: ["Specs don't sell.", "Stories do."],
          },
          process: {
            duration: 78,
            tag: "( 03 )  HOW WE WORK",
            steps: ["Find the story", "Design it", "Build it"],
          },
          mobile: {
            duration: 48,
            label: "SAME BUILD, EVERY SCREEN",
            lines: ["Down to", "320 pixels."],
          },
          close: {
            duration: 54,
            wordmark: ["Atomic", "Designz"],
            line: "Story-led websites, built in Webflow",
            cta: "Work with us",
          },
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: siteTimeline(props).total,
        })}
      />
      <Composition
        id="HeroReel"
        component={HeroReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        schema={heroSchema}
        // NOTE: this must stay a hardcoded object literal. Remotion rewrites it
        // by codemod when the Studio saves, and refuses to save at all if it is
        // a variable reference — which silently breaks every drag and every
        // asset swap in the editor.
        defaultProps={{
          editMode: true,
          ending: "playful" as const,
          galleryStyle: "carousel3d" as const,
          showPattern: true,
          shots: [
            {
              id: "mosaic-open",
              enabled: true,
              duration: 66,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "cursor-select",
              enabled: true,
              duration: 54,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "creo-figma-to-live",
              enabled: true,
              duration: 70,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "creo-annotated",
              enabled: true,
              duration: 70,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "creo-circle",
              enabled: true,
              duration: 60,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "grow-mosaic",
              enabled: true,
              duration: 70,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "athina-cards",
              enabled: true,
              duration: 70,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "athina-annotated",
              enabled: true,
              duration: 66,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "surreal-globe",
              enabled: true,
              duration: 64,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "web-gallery",
              enabled: true,
              duration: 80,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "mobile-grid",
              enabled: true,
              duration: 74,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "logo-wall",
              enabled: true,
              duration: 56,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "calm-hold",
              enabled: true,
              duration: 60,
              transition: "cut" as const,
              transitionFrames: 12,
            },
            {
              id: "final-title",
              enabled: true,
              duration: 40,
              transition: "cut" as const,
              transitionFrames: 12,
            },
          ],
          openPlate: "Built to move",
          labelBuiltToMove: { x: 140, y: 880 },
          labelDesign: { x: 140, y: 880 },
          labelStudioDev: { x: 470, y: 880 },
          labelInteract: { x: 150, y: 760 },
          labelShip: { x: 140, y: 900 },
          creoTag: "STUDIO PARTNERSHIP",
          creoCallouts: [
            {
              text: "Motion specced in FigJam, rebuilt as one GSAP timeline",
              x: 90,
              y: 250,
              w: 340,
              delay: 14,
            },
            {
              text: "Preloader hands off to the hero on complete",
              x: 1470,
              y: 330,
              w: 360,
              delay: 22,
            },
            {
              text: "Filterable CMS the team runs without me",
              x: 90,
              y: 640,
              w: 340,
              delay: 30,
            },
            { text: "Dropbox video integration", x: 1470, y: 700, w: 360, delay: 38 },
          ],
          athinaTag: "LIVE IN UNDER 7 DAYS",
          athinaCallouts: [
            {
              text: "Generative visuals as live p5.js sketches, not exports",
              x: 90,
              y: 260,
              w: 340,
              delay: 12,
            },
            {
              text: "Component library their team builds pages with",
              x: 1470,
              y: 350,
              w: 360,
              delay: 22,
            },
            {
              text: "Shipped two days before the investor pitch",
              x: 90,
              y: 660,
              w: 340,
              delay: 32,
            },
          ],
          athinaCards: [
            { src: "athina-observe.mp4", x: 150, y: 210, w: 780, h: 460, delay: 2 },
            { src: "athina-panels.mp4", x: 700, y: 470, w: 800, h: 440, delay: 14 },
            { src: "athina-data.mp4", x: 1090, y: 160, w: 620, h: 250, delay: 24 },
          ],
          clips: {
            mosaicMain: "surreal-facility.mp4",
            mosaicSide: "surreal-carousel.mp4",
            mosaicCorner: "creo-portfolio.mp4",
            creoLive: "surreal-carousel.mp4",
            creoAnnotated: "creo-portfolio.mp4",
            creoCircle: "creo-circle.mp4",
            growHero: "grow-hero.mp4",
            growStory: "grow-story.mp4",
            growWorks: "grow-works.mp4",
            growMission: "grow-mission.mp4",
            athinaAnnotated: "athina-observe.mp4",
            surrealGlobe: "surreal-globe.mp4",
            calmHold: "grow-mission.mp4",
          },
          gallery: [
            {
              src: "surreal.jpg",
              x: 60,
              y: 150,
              w: 400,
              h: 700,
              fromX: -520,
              fromY: 120,
              rotate: -6,
              delay: 0,
              pan: 0.16,
            },
            {
              src: "creo.jpg",
              x: 510,
              y: 90,
              w: 430,
              h: 790,
              fromX: -180,
              fromY: -420,
              rotate: 4,
              delay: 7,
              pan: 0.2,
            },
            {
              src: "athina.jpg",
              x: 990,
              y: 130,
              w: 430,
              h: 760,
              fromX: 220,
              fromY: 460,
              rotate: -4,
              delay: 14,
              pan: 0.18,
            },
            {
              src: "grow.jpg",
              x: 1470,
              y: 180,
              w: 400,
              h: 690,
              fromX: 560,
              fromY: -160,
              rotate: 6,
              delay: 21,
              pan: 0.22,
            },
          ],
          phoneColumns: [
            ["surreal-01.jpg", "creo-02.jpg", "athina-03.jpg"],
            ["athina-01.jpg", "grow-02.jpg", "surreal-04.jpg"],
            ["creo-03.jpg", "athina-04.jpg", "grow-04.jpg"],
            ["grow-01.jpg", "surreal-05.jpg", "creo-05.jpg"],
            ["athina-06.jpg", "creo-06.jpg", "grow-05.jpg"],
            ["surreal-06.jpg", "athina-03.jpg", "creo-02.jpg"],
          ],
          logoRows: [
            {
              y: 96,
              travel: -240,
              logos: [
                { src: "creo.svg", h: 56 },
                { src: "athina.png", h: 46 },
                { src: "surreal.png", h: 60 },
                { src: "growplus.png", h: 62 },
              ],
              tags: ["BRANDING STUDIO", "AI / YC W23", "EXPERIENTIAL", "NONPROFIT"],
            },
            {
              y: 440,
              travel: 260,
              logos: [
                { src: "lastbench.svg", h: 50 },
                { src: "edelgive.png", h: 52 },
                { src: "creo.svg", h: 56 },
                { src: "surreal.png", h: 60 },
              ],
              tags: ["WEBFLOW", "GSAP", "P5.JS", "ADVANCED CMS"],
            },
            {
              y: 784,
              travel: -180,
              logos: [
                { src: "growplus.png", h: 62 },
                { src: "athina.png", h: 46 },
                { src: "lastbench.svg", h: 50 },
                { src: "creo.svg", h: 56 },
              ],
              tags: ["SHOPIFY", "WEBGL", "COMPONENT LIBRARIES", "MOTION"],
            },
          ],
          title: {
            x: 60,
            y: 241,
            align: "center" as const,
            name: "Atomic Designz",
            line1: "",
            line2: "creative dev partner",
          },
        }}
        // Length follows the edit: switch a shot off in the props panel and the
        // composition gets shorter by exactly that many frames.
        calculateMetadata={({ props }) => ({
          durationInFrames: buildTimeline(props.shots).total,
        })}
      />
      {/*
        The two intro variants. They are standalone compositions, not shots in
        HeroReel, so each renders to its own file and can be judged, sent and
        retimed on its own. Same rules as HeroReel apply: the defaultProps have
        to stay hardcoded object literals or the Studio cannot save edits back.
      */}
      <Composition
        id="IntroA"
        component={IntroA}
        durationInFrames={90}
        fps={FPS}
        width={1920}
        height={1080}
        schema={introSchema}
        defaultProps={{
          clip: "surreal-carousel.mp4",
          clipStartFrom: 34,
          url: "letsgetsurreal.com",
          siteUrl: "atomicdesignz.com",
          eyebrow: "ATOMIC DESIGNZ · WEBFLOW & CREATIVE DEV",
          headline: ["Built", "to move"],
          chip: "SELECTED WORK 2026",
          ground: "#FAFAFA",
          accent: "#1A2EF2",
          ink: "#333333",
          durationInFrames: 90,
          fontPairing: "deck",
          displayFontOverride: "",
          monoFontOverride: "",
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames,
        })}
      />
      <Composition
        id="IntroB"
        component={IntroB}
        durationInFrames={100}
        fps={FPS}
        width={1920}
        height={1080}
        schema={introSchema}
        defaultProps={{
          clip: "creo-circle.mp4",
          clipStartFrom: 6,
          url: "creo-agency.com",
          siteUrl: "atomicdesignz.com",
          eyebrow: "",
          headline: ["Atomic", "Designz"],
          chip: "SELECTED WORK 2026",
          ground: "#FAFAFA",
          accent: "#1A2EF2",
          ink: "#333333",
          durationInFrames: 100,
          fontPairing: "deck",
          displayFontOverride: "",
          monoFontOverride: "",
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames,
        })}
      />
      <Composition
        id="IntroC"
        component={IntroC}
        durationInFrames={110}
        fps={FPS}
        width={1920}
        height={1080}
        schema={introCSchema}
        defaultProps={{
          clip: "surreal-globe.mp4",
          clipStartFrom: 20,
          url: "",
          siteUrl: "atomicdesignz.com",
          eyebrow: "",
          headline: [],
          chip: "",
          ground: "#FAFAFA",
          accent: "#1A2EF2",
          ink: "#333333",
          durationInFrames: 110,
          fontPairing: "deck" as const,
          displayFontOverride: "",
          monoFontOverride: "",
          screenFit: "contain" as const,
          screenZoom: 1,
          screenZoomTo: 1,
          screenPosition: "50% 50%",
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames,
        })}
      />
      <Composition
        id="IntroD"
        component={IntroD}
        durationInFrames={120}
        fps={FPS}
        width={1920}
        height={1080}
        schema={introSchema}
        defaultProps={{
          clip: "surreal-carousel.mp4",
          clipStartFrom: 34,
          url: "letsgetsurreal.com",
          siteUrl: "atomicdesignz.com",
          eyebrow: "WHO BUILDS THIS?",
          headline: ["Built", "to move"],
          chip: "SELECTED WORK 2026",
          ground: "#FAFAFA",
          accent: "#1A2EF2",
          ink: "#333333",
          durationInFrames: 120,
          fontPairing: "deck",
          displayFontOverride: "",
          monoFontOverride: "",
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames,
        })}
      />
      {/*
        The two outro variants, same standalone rules as the intros. Both close
        on the intro's knockout plate so the reel ends on the device it opens
        with; A holds the letters open on moving work, B fills them solid.
      */}
      <Composition
        id="OutroA"
        component={OutroA}
        durationInFrames={100}
        fps={FPS}
        width={1920}
        height={1080}
        schema={outroSchema}
        defaultProps={{
          clip: "creo-circle.mp4",
          clipStartFrom: 6,
          url: "creo-agency.com",
          wordmark: ["Atomic", "Designz"],
          line: "Webflow & creative development partner",
          chip: "BOOKING 2026",
          contact: "hello@atomicdesignz.com",
          ground: "#FAFAFA",
          accent: "#1A2EF2",
          ink: "#333333",
          durationInFrames: 100,
          fontPairing: "deck",
          displayFontOverride: "",
          monoFontOverride: "",
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames,
        })}
      />
      <Composition
        id="OutroB"
        component={OutroB}
        durationInFrames={110}
        fps={FPS}
        width={1920}
        height={1080}
        schema={outroSchema}
        defaultProps={{
          clip: "surreal-globe.mp4",
          clipStartFrom: 6,
          url: "creo-agency.com",
          wordmark: ["Atomic", "Designz"],
          line: "Webflow & creative development partner",
          chip: "Showreel 2026",
          contact: "geet@atomicdesignz.com",
          ground: "#FAFAFA",
          accent: "#1A2EF2",
          ink: "#333333",
          durationInFrames: 110,
          fontPairing: "deck" as const,
          displayFontOverride: "tronica mono",
          monoFontOverride: "",
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames,
        })}
      />
      {/*
        The vertical cut. 1080x1920, one project, sized for a Reel: the feed is
        where this actually gets watched, and a letterboxed 16:9 reel in a 9:16
        slot is a third of a screen of black. Length follows the props, so
        adding or cutting a beat retimes the composition.
      */}
      <Composition
        id="SurrealVertical"
        component={SurrealVertical}
        durationInFrames={540}
        fps={FPS}
        width={1080}
        height={1920}
        schema={verticalSchema}
        defaultProps={{
          project: "SURREAL",
          url: "letsgetsurreal.com",
          eyebrow: "WEBFLOW BUILD · 2026",
          hook: ["LETS", "GET", "SURREAL"],
          hookChip: "BUILT BY ATOMIC DESIGNZ",
          hookClip: "surreal-carousel.mp4",
          hookStartFrom: 116,
          hookPosition: "50% 45%",
          hookDuration: 66,
          shots: [
            {
              clip: "surreal-hero.mp4",
              clipStartFrom: 26,
              objectPosition: "50% 40%",
              detailPosition: "50% 30%",
              from: 1.02,
              to: 1.14,
              headline: ["Hero tied to", "scroll.", "Not to a timer."],
              spec: "GSAP SCROLLTRIGGER · 0.00 → 1.00",
              phones: [],
              durationInFrames: 108,
            },
            {
              clip: "surreal-carousel.mp4",
              clipStartFrom: 34,
              objectPosition: "55% 38%",
              detailPosition: "30% 55%",
              from: 1.16,
              to: 1.03,
              headline: ["Drag it.", "It follows."],
              spec: "INERTIA CAROUSEL · POINTER + TOUCH",
              phones: [],
              durationInFrames: 96,
            },
            {
              clip: "surreal-globe.mp4",
              clipStartFrom: 20,
              objectPosition: "50% 34%",
              detailPosition: "62% 55%",
              from: 1.04,
              to: 1.22,
              headline: ["A globe", "that runs in", "the browser."],
              spec: "WEBGL · 60FPS ON A PHONE",
              phones: [],
              durationInFrames: 96,
            },
            {
              clip: "surreal-facility.mp4",
              clipStartFrom: 20,
              objectPosition: "50% 45%",
              detailPosition: "50% 45%",
              from: 1.2,
              to: 1.02,
              headline: ["Same build.", "Down to 320px."],
              spec: "FLUID TYPE · NO SEPARATE MOBILE SITE",
              phones: ["surreal-01.jpg", "surreal-04.jpg", "surreal-05.jpg"],
              durationInFrames: 90,
            },
          ],
          wordmark: ["ATOMIC", "DESIGNZ"],
          line: "Webflow & creative development partner",
          cta: "DM TO BUILD YOURS",
          handle: "@atomicdesignz",
          ctaDuration: 84,
          ticker: "SURREAL · WEBFLOW · GSAP · WEBGL · ATOMIC DESIGNZ ·",
          ground: "#FAFAFA",
          accent: "#1A2EF2",
          ink: "#333333",
          fontPairing: "deck",
          displayFontOverride: "",
          monoFontOverride: "",
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: verticalTimeline(props).total,
        })}
      />
      <Composition
        id="HeroAnimatic"
        component={HeroAnimatic}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      {/*
        The mascot master for the AVAL bundle. One timeline holding every state
        body and the transition between them; `aval/mascot/motion.json` slices
        it back apart by frame range. Rendered square, on transparency, as a PNG
        sequence — see `npm run render:mascot`.
      */}
      <Composition
        id="Mascot"
        component={Mascot}
        durationInFrames={MASCOT_TOTAL}
        fps={MASCOT_FPS}
        width={512}
        height={512}
      />
      {/*
        Email-signature mark. Square, seamless 3s loop, rendered as a PNG
        sequence and packed into a GIF — see `npm run render:sig`.
      */}
      <Composition
        id="SigMark"
        component={SigMark}
        durationInFrames={90}
        fps={30}
        width={288}
        height={288}
      />
      {/* Brand Motion System — see motion-system/ARCHITECTURE.md */}
      <MotionSystemCompositions />
    </>
  );
};

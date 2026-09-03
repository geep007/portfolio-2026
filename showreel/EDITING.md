# Editing the hero reel

```bash
cd showreel
npm run edit        # opens Remotion Studio at http://localhost:3000
```

Pick **HeroReel** in the left sidebar.

---

## 1. Move things by dragging

In the right-hand **Props** panel, set `editMode` to **true**.

Dashed cobalt boxes appear around everything movable in the shot under the
playhead. Drag one and it moves; let go and the new coordinate is written into
`src/Root.tsx`. It is real code — it survives a restart and it is what the next
render uses.

Only the current shot's items are grabbable, so scrub to the shot you want
before you start dragging. What is draggable where:

| Scrub to | You can drag |
|---|---|
| 0:00–2:12 | the "Built to move" plate label |
| 2:12–4:00 | the DESIGN label |
| 4:00–6:10 | the STUDIO → DEV / LIVE ↗ chip |
| 6:10–8:20 | all four Creo callout windows |
| 13:00–15:10 | the three Athina cards, the INTERACT label |
| 15:10–17:16 | all three Athina callout windows |
| 19:20–22:10 | the SHIP label (web gallery) |
| 28:20–30:00 | the whole title block |

**Turn `editMode` back to false when you're done.** The overlay is skipped during
any render anyway, so a stray `true` cannot leak into an export.

---

## 2. Replace a video, image or logo

With `editMode` on, **orange** boxes mark every swappable piece of media in the
current shot — blue is drag-to-move, orange is click-to-replace. Each box is
labelled with the slot and the file it is currently using.

Click one and a list of available files appears. Click a file and it swaps
immediately and saves itself to `src/Root.tsx`.

| Scrub to | Replaceable |
|---|---|
| 0:00–2:12 | the three opening mosaic panels |
| 4:00–6:10 | the Creo clip that goes live |
| 6:10–8:20 | the Creo clip behind the callouts |
| 8:40–10:20 | the Creo circle clip |
| 10:20–13:00 | all four GROW mosaic panels |
| 13:00–15:10 | the three Athina cards |
| 15:10–17:16 | the Athina clip behind the callouts |
| 17:16–19:20 | the Surreal globe clip |
| 19:20–22:10 | the four web-gallery designs |
| 22:10–24:20 | all eighteen phone screens |
| 24:20–26:16 | all twelve logos |

### Adding a new file

Drop it into the right folder and it appears in the picker straight away — the
Studio watches `public/` and no restart is needed.

| Folder | For |
|---|---|
| `public/media/` | scroll-motion clips (`.mp4`) |
| `public/media/gallery/` | tall page designs for the gallery shot |
| `public/media/phones/` | mobile screens for the grid shot |
| `public/media/logos/` | client logos (`.svg` / `.png`) |

Logos are forced to white silhouettes, so a colour logo will still sit
consistently with the rest of the wall.

### Adding a logo, a row, or a tag

The picker swaps a logo in place. To **add** one, use the props panel:
`logoRows` → a row → `logos` → the **+** button. Each logo has a `src` and an
`h` (its height in px, 46–62 suits the current wall). The same **+** works on
`tags` for the outlined capability labels, and on `logoRows` itself for a whole
new row — a row needs a `y` (vertical position) and a `travel` (how far it
drifts; alternate the sign so rows move against each other).

The same applies elsewhere: `gallery` and `phoneColumns` are ordinary arrays,
so you can add or remove entries the same way.

---

## 2b. Looks you can switch on

These are single fields in the props panel — flip one and the whole shot changes.

| Field | Options | What it does |
|---|---|---|
| `ending` | `clean` / `playful` | The closing frame. `playful` swaps in the mascot, whose eyes follow the cursor and blink, on the cream ground from the brand artwork. |
| `galleryStyle` | `flat` / `carousel3d` | The web-gallery shot. `carousel3d` puts the designs on a rotating 3D cylinder instead of the flat fly-in. |
| `showPattern` | on / off | The portfolio's dot-field pattern behind the closing frame, lit by the cursor as it leaves. |
| `title.align` | `left` / `center` / `right` | Alignment of the closing block. |

### About the pattern

`DotField` is a port of your portfolio's own `atomic-designz/src/scripts/dot-field.ts`
— same lattice spacing, same lift radius, same cobalt. The original is driven by
a rAF loop chasing the real pointer; here it is computed from the frame number
and fed the reel's cursor instead, because a rAF loop would desync from
Remotion's frame-by-frame rendering and give a different result on every pass.

### About the 3D

The carousel is built on CSS 3D transforms, not WebGL. Remotion renders in
headless Chrome, where a WebGL context depends on GPU flags that vary per
machine and can quietly fall back to software; CSS 3D composites identically
every time. Real shader work would mean adding `@remotion/three` — worth doing
if you want it, but this is the version that renders reliably today.

---

## 3. Delete a shot, retime it, or change how it arrives

Open **`shots`** in the props panel. One row per shot, in order:

| Field | What it does |
|---|---|
| `enabled` | Uncheck to **delete** the shot. Everything after it slides up to close the gap and the video gets shorter by exactly that many frames. |
| `duration` | Length in frames (30 = 1 second). |
| `transition` | How this shot arrives over the one before it. |
| `transitionFrames` | How long that takes. 12–20 is the useful range. |

Nothing needs renumbering — positions are computed from the order and the
durations, and the composition's length follows automatically. Delete the
`creo-circle` shot and the reel becomes 28.00s on its own.

### Transition types

| Type | Looks like |
|---|---|
| `cut` | Hard cut. The default, and right for most of this reel. |
| `fade` | Straight crossfade into the previous shot. |
| `wipe` | Hard edge travels left to right. |
| `iris` | Circle opens from the centre. |
| `blinds` | Eight horizontal bands open at once. |
| `pixelate` | Black/white/cobalt cells clear in a scattered order — the deck's pixel confetti. |
| `shutter` | Four cobalt bands sweep across and hand over the new shot. |

**Leave these three on `cut`:** `grow-mosaic`, `surreal-globe` and
`athina-cards`. Those cuts already carry the reel's match cuts — circle to
circle, sphere to globe, card to panel. A transition on top fights the match
and the effect is lost.

The cursor keeps up on its own. Its choreography is stored against shot ids
rather than absolute frames, so deleting or retiming a shot re-resolves the path
instead of desyncing it.

---

## 4. Change wording and numbers

Same **Props** panel, `editMode` off. Every field is live — the preview updates
as you type. Press **Save** in the panel to write it to `src/Root.tsx`.

- `openPlate` — the serif line in the opening mosaic
- `creoTag` / `athinaTag` — the outlined chip at the top of the annotated shots
- `creoCallouts` / `athinaCallouts` — each has `text`, `x`, `y`, `w`, and
  `delay` (frames after the shot starts before it appears)
- `athinaCards` — `src`, `x`, `y`, `w`, `h`, `delay` per floating card
- `logoRows` — the client wall: each row has a `y`, a `travel`, its `logos`
  and its outlined capability `tags`
- `clips` — which video file each shot uses, by slot
- `gallery` / `phoneColumns` — the designs and phone screens in those two shots
- `title` — the closing block's three lines, its position, and `align`
  (`left` / `center` / `right`; centre ignores `x` and centres in the frame,
  which is also safest for narrow crops)

Number fields are drag-scrubbable: grab the number and pull sideways.

> Keep the copy honest. Every claim in here traces to the verified facts in
> `../CASE-STUDY-SYSTEM.md` §9. If you add one, check it against that file
> first — the reel is shown to studios who may ask.

---

## 5. Change the shot order or add a shot

Order and the list of shots themselves live in `src/hero/shots.ts`, which also
carries each shot's phase, role and the note on *why* it sits next to the one
before it. Reordering means moving entries there; the props panel handles
length and on/off but not sequence.

After a structural change, check the pacing on the **HeroAnimatic** composition
— same timing data, rendered as held stills with the phase bar and the
craft / process / positioning budget along the bottom. If a cut feels wrong
there it will feel wrong finished.

## 6. Swap footage and screenshots

Everything lives in `public/media/`. Replace a file with the same name and the
reel picks it up.

- `*.mp4` — the scroll-motion clips
- `gallery/*.jpg` — the four tall page designs in the web-gallery shot
- `phones/*.jpg` — the sixteen mobile screens in the grid shot
- `logos/*` — the client wall

To pull fresh captures from the live sites:

```bash
cd ../capture
node harvest.js creo             # scroll-motion clips
node harvest.js creo stills      # full-page shot + six phone screens
```

Sites: `surreal`, `creo`, `athina`, `grow`. Output lands in
`../captures/<site>/`; copy what you want into `showreel/public/media/`.

Gallery cards are cropped out of the full-page shot, because the top of a page
is not always its best 1900px — Surreal's is solid black, so its card is cut
from further down:

```bash
ffmpeg -i full-surreal.jpg -vf "crop=760:1900:0:4550" gallery/surreal.jpg
```

---

## 7. Render

```bash
npm run render      # HeroReel → out/hero-reel-30s.mp4
npm run animatic    # the timing rig, for checking pacing
```

## What is not draggable

Mosaic panels (opening and GROW shots) sit on a 12x8 cell grid defined in
`HeroReel.tsx` — `col`, `row`, `w`, `h` in cells. Editing those by hand keeps the
compositions on-grid; free-dragging them would let the layout drift off it.


---

## Requirements for saving from the Studio

Saving works by rewriting `src/Root.tsx`, and Remotion is strict about it. Three
things have to hold, and all three are already set up here — this is only for
if the project is ever moved or rebuilt:

1. **`defaultProps` in `Root.tsx` must be a hardcoded object literal**, not a
   variable. Remotion refuses to save against a reference, and every drag and
   swap fails silently.
2. **Prettier must be installed** (`devDependency`), because the rewrite is
   formatted with it.
3. **A Prettier config must exist** — `.prettierrc` in `showreel/`.

If the props panel shows a "Can't save default props" warning, it will name
which of the three is missing.

`src/hero/layout.ts` keeps a second copy of the defaults as a fallback for
partial `--props` on the CLI. `Root.tsx` is the copy the editor writes to and
the one that ships.

---

## Intros and outros (added 13 Aug 2026; C and D added 15 Aug 2026)

Six standalone compositions, separate from `HeroReel`, each rendering to its
own file. They are separate on purpose: the first and last frames get judged on
their own, so they are edited and exported on their own, then cut in once
chosen.

| Composition | Render | What it is |
|---|---|---|
| `IntroA` | `npm run render:intro-a` → `out/intro-a.mp4` | Editorial split — type block left, one tall panel of work right |
| `IntroB` | `npm run render:intro-b` → `out/intro-b.mp4` | Knockout — the work shows only through the letters, then the plate leaves |
| `IntroC` | `npm run render:intro-c` → `out/intro-c.mp4` | CRT — the site's monitor photograph, footage booting inside the tube |
| `IntroD` | `npm run render:intro-d` → `out/intro-d.mp4` | Search — a field types the domain, then grows into the page |
| `OutroA` | `npm run render:outro-a` → `out/outro-a.mp4` | The knockout arriving instead of leaving; ends on the mark with work still moving inside it |
| `OutroB` | `npm run render:outro-b` → `out/outro-b.mp4` | Same arrival, then the letters fill solid — a flat end card |

Pick `OutroA` when the reel loops (it ends on movement) and `OutroB` when it is
the last thing in a deck or an email (it ends on a card that can be screenshot).

Everything is a prop, edited in the Studio props panel and saved back into
`src/Root.tsx`: the clip and which frame it starts on, the URL on the browser
chrome, the headline / wordmark lines, the copy, the colours, and
`durationInFrames` — the composition length follows that prop, so retiming is
an edit, not a code change.

Two things learned the hard way and worth keeping:

- **Watch what the capture says.** A crop that includes a client's own headline
  puts their sentence under my chip and it reads as my claim. Intro A is cropped
  past it; Intro B and both outros use `creo-circle.mp4`, which is abstract, so
  no foreign type ever appears inside the letters.
- **One window per plane.** `SiteFrame` (`src/components/SiteFrame.tsx`) is the
  outer browser chrome from the atomicdesignz.com artboards and wraps a whole
  composition — Intros A, C and D wear it. `BrowserWindow` is the dark chrome
  placed *inside* a shot to label a client capture (Intro B). Never nest them.
  `SiteFrame` eats the bottom 59px of the canvas, so geometry inside it is
  measured against 1021, not 1080.
- **Intro C's screen is measured, not inferred.** The blue plate in
  `public/media/crt-monitor.png` spans x 480→797, y 122→363 at 1280×720, scaled
  ×1.5 in `IntroC.tsx`. Re-export the photograph and those numbers move.
- `KnockoutPlate` (`src/components/KnockoutPlate.tsx`) is shared by Intro B and
  both outros — an SVG mask, because `background-clip: text` cannot take a video
  as its paint. Each instance needs its own `maskId`.

---

# Editing the site reel (`SiteReel`)

The 23-second cut of atomicdesignz.com, with *Hot Pursuits* under it.

```bash
cd showreel
npm run edit          # Studio → pick SiteReel in the sidebar
npm run render:site   # → out/site-reel-23s.mp4
```

## Where everything is

| What | Where |
|---|---|
| **All copy and all timings** | `src/Root.tsx` → the `SiteReel` `defaultProps` block |
| Prop shapes / what is editable | `src/site/siteLayout.ts` |
| Shot order, cuts, music | `src/site/SiteReel.tsx` |
| One scene each | `src/site/scenes/*.tsx` |
| Captures of the live site | `public/site/` |

Every field in `defaultProps` is also a form field in the Studio's right-hand
**Props** panel — change the words there, hit save, and it writes itself back
into `Root.tsx`.

## The eight shots

| # | Scene | Frames | What it is | Text you can change |
|---|---|---|---|---|
| 1 | `boot` | 54 | URL types itself into an address bar | `tag`, `type` |
| 2 | `hero` | 120 | Real hero, then the site's own header reel | `eyebrow`, `clipStartFrom` |
| 3 | `blast` | 120 | The whole page scrolled top to bottom | `label`, `kicker` |
| 4 | `work` | 138 | Title card + three builds, one hard cut each | `tag`, `heading`, `cards[]` |
| 5 | `thesis` | 78 | Cobalt slab, pure type | `tag`, `lines` |
| 6 | `process` | 78 | Process section + 01/02/03 chips | `steps` |
| 7 | `mobile` | 48 | Phone running the same capture | `label`, `lines` |
| 8 | `close` | 54 | Contact section, wordmark, CTA | `wordmark`, `line`, `cta` |

`duration` on any scene retimes the whole cut — the composition length is the
sum of the eight, so shortening one shortens the video.

## Music

`music`, `audioStartInSeconds` (16s is where the drums land) and `volume` are
props. Fades are automatic: 8 frames in, ~1s out.

## Swapping a work card

Each entry in `work.cards` is `{ src, name, spec, position }`. `src` is a file
in `public/site/`; `position` is 0 (top of that capture) to 1 (bottom).

## Re-capturing the site

The stills are real full-page screenshots, taken with reveals already fired:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1920,10100 --virtual-time-budget=20000 \
  --screenshot=full.png https://www.atomicdesignz.com/
```

Then crop each section out of `full.png` at 1920 wide into `public/site/`.
`page-strip.png` is the same capture scaled to 1440 wide; `page-mobile.png` is
the 430px-wide run of the same command.

---

# Brand Motion System (added 3 Sep 2026)

`src/motion-system/` is the brand-agnostic engine that the reels above are
being migrated onto. Start at `src/motion-system/ARCHITECTURE.md`; agents start
at `src/motion-system/agent/AGENT_MOTION_GUIDE.md`. Compositions in the Studio
sidebar: `Launch-atomic` / `Launch-edelgive` (same content, two brands) and
`Plan-*` (hand-written plans). `theme.ts` now derives from
`motion-system/brands/atomic/brand.ts` — edit the brand, not the theme.

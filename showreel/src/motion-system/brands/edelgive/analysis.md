# EdelGive Foundation — brand analysis

Source: https://www.edelgive.org (home, /what-we-do), inspected 2026-09-03 in Chrome at 1560px.
Webflow build (Relume-style section classes), jQuery, one Webflow IX2 interaction. No GSAP, no Lenis.

> Naming: the brief calls this brand "Adelgill"; the site and logo say **EdelGive**. The brand id is `edelgive`.

## Brand character

Warm · Grounded · Editorial · Institutional · Humane · Calm · Trustworthy

A philanthropy platform, not a product. The site reads like a foundation's annual report set on a website: serif headlines, generous white space, landscape photography of rural India, soft blush plates, one deep navy. Nothing is fast. Nothing is clever. Everything is legible.

## Typography

**Display: PT Serif Caption**, weight 400 only, tracking -0.01em, line-height 1.2.
- h1 56px, h2 48/40px, h3 24px. Sizes are modest — the largest type on the site is a stat figure, not a headline.
- Sentence case throughout. Two-line headlines centred over photography; left-aligned in split sections.
- Second line of a headline occasionally set in terracotta ("Three Interconnected Pillars") — a single-colour emphasis, never bold.

**Body/UI: Manrope**, 400/500/600, 16px, line-height 1.5. 20.8px lead paragraph. Labels ("Beyond Grants") are 14px Manrope in terracotta, sentence case — no mono, no uppercase anywhere.

Observed behaviour: type never animates on the live site. It is simply there.

## Colour

| Role | Value | Where |
|---|---|---|
| ground | `#FFFBFC` / `#FEFCFB` | page |
| plate | `#F7F0EE` / `#F5EAE6` | stat tiles, cards, pillar block |
| navy (primary) | `#1D3459` | headings, buttons, footer |
| navy deep | `#24377E` | rare |
| terracotta (accent) | `#C6623D` | eyebrow labels, emphasis line, vertical tab labels |
| ink | `#000` | body |
| rule | `rgba(0,0,0,0.15)` | hairlines |
| white | `#FFF` | type on photography, logo tiles |

Palette is four colours. Photography supplies everything else (greens, skies, marigold, sari red).

## Layout

- Fixed 1170px content column, centred. Symmetric almost everywhere.
- Section rhythm: full-bleed photo section → paper section → full-bleed → paper. The paper sections are separated from photo sections by a **hand-drawn wave edge** (SVG, ~30px amplitude), never a straight line.
- Grids: 4-col stat bento (alternating plate / photo tiles, 2 rows), 5-col logo grid on white tiles, 3-col card rows.
- Split sections: label + h2 left, body right (two-column text, no image).
- Pillar accordion: horizontal panels with numbered "01 02 03" and rotated serif labels along a vertical rail.
- Density: sparse. Lots of vertical air (section padding ~112px).

## Surfaces

- Radius everywhere: 16px images, 32px cards, 40px the pillar block, 100px pills (buttons, nav). Soft object, never sharp.
- Buttons: pill, navy fill white text (primary) / 5% black fill navy text (secondary). 0.2s ease.
- Shadows: near-none (one 2px/5px 4% shadow on the floating nav).
- Photography full-bleed with a dark scrim (~35–45%) under white centred type.
- CTA card: photograph cut out over a watercolour wash in pale blue, rounded 40px.
- Frosted floating nav pill.

## Imagery

- Landscape photography: fields, hills, sky, people at work. Always warm, golden or dusk light.
- Portrait photos of people in stat tiles, 16px radius, cover-cropped.
- Report covers as cards. Watercolour washes as decorative fill.
- No UI screenshots, no mockups, no devices.

## Existing interactions

- Hover: button background 0.2s, nav link colour. One IX2 on the logo section.
- No scroll reveals, no parallax, no cursor effects, no marquee. Hero background is a still (a video element exists but is not the hero).
- Transitions: `transform 0.18s cubic-bezier(0.2,0,0,1)` — that one curve is the site's only motion signature: a quick, soft ease-out.

## Motion characteristics (inferred)

Slow, settled, no overshoot. Motion should feel like pages of a report turning, or a photo dissolving into daylight. Type does not race. Numbers may count — the site's stat tiles are its only high-energy content.

## Proposed motion translation

| Website characteristic | Motion interpretation |
|---|---|
| Serif headline centred over dimmed landscape | **Photo statement**: full-bleed image with a slow push, scrim rises, headline lines rise inside a mask on a slow stagger, pill CTA lands last. The hero as a shot. |
| Hand-drawn wave edge between sections | **Wave transition**: the next shot rises under a wave edge that sweeps up the frame. The brand's transition, replacing cuts. |
| Stat bento (plate / photo alternating) | **Stat tiles**: 2×4 grid, tiles clip open in reading order, figures count up in serif. |
| Numbered pillars with rotated labels | **Pillar index**: three vertical rails, one open with headline + body; labels rotated on the rail. Sequential reveal along the vertical grid. |
| Terracotta second line | Headline emphasis: last line in accent. Built into `headline-reveal` via the brand's `emphasisLine` option. |
| Rounded plates, 16/32/40 | All media containers carry the brand radius; masks are inset-rounded, not hard rectangles. |
| Pill buttons | CTA is a pill in `logo-outro`. |
| Logos on white tiles | `logo-wall` grid behaviour, tiles kept, logos NOT silhouetted (partners' colours stay). |
| No scroll motion, 0.18s ease-out | Tempo 1.35, `enter` ≈ cubic-bezier(0.2,0,0,1), exit = gentle fade. Fade is allowed for this brand. |
| Photography full-bleed | Media reveals are soft (opacity + slow scale), not clipped, except where a wave edge does the cut. |

## Proposed vocabulary (11)

photo-statement · headline-reveal (serif, centred, emphasis) · stat-tiles · stat-reveal · pillar-index · split-reveal (rounded media, wide type) · structured-gallery (rail arrival, rounded) · logo-wall (grid, tiles) · browser-scroll (plain chrome, rounded) · logo-outro (pill CTA) · panel-mosaic (gapped, rounded, plates in blush) — used sparingly.

Transitions: wave (preferred) · fade · cut · push-up.

## Avoid

- Uppercase, mono, tracking-tight grotesk, any "system label" register.
- Hard rectangular masks, black grounds, cobalt or saturated accent fields.
- Cursors, selection chrome, browser windows as the hero, device grids.
- Fast cuts under 1.5s, overshoot, drift rows, 3D.
- Gradients other than the watercolour wash motif.

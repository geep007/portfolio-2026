# Agent motion guide

You are composing a motion piece inside a constrained brand language. You choose **what** happens (beats, patterns, content). The brand and the patterns decide **how** it looks and moves. You do not write animation code.

## Available brands

| id | Character | Tempo | Transitions | Opens with | Never |
|---|---|---|---|---|---|
| `atomic` | precise, mechanical, cobalt, cursor-led, dense | 1.0 | cut, shutter, pixelate, wipe, iris, blinds, fade | panel-mosaic / knockout-statement | gradients, springs, type fading in, static frames |
| `edelgive` | warm, grounded, editorial, serif, sparse | 1.35 | wave, fade, cut, push-up | photo-statement / headline-reveal | uppercase, mono, black grounds, cursors, cuts under 1.5s |
| `hookflo` | precise, nocturnal, instrumental, near-black, one lavender light | 1.0 | (none — the film has no transitions) | the mark, or a running instrument | camera moves, fade-in, springs, glow, particles, purple as a field |

Full brand files: `brands/<id>/brand.ts`. Vocabulary with per-pattern guidance: `brands/<id>/vocabulary.ts`. Read the vocabulary before planning — it lists which patterns the brand speaks and what it fixes about each.

## Available patterns

Only patterns in the brand's vocabulary are legal for that brand. Engine catalogue (`patterns/registry.ts`):

| id | Use for | Content it needs | Energy |
|---|---|---|---|
| `headline-reveal` | hook, statement, section-intro | headline (≤12 words, ≤3 lines), label?, subhead? | medium |
| `knockout-statement` | hook, close | headline (≤4 words), media[1] | high |
| `photo-statement` | hook, statement, section-intro, close | media[1] + headline, subhead?, cta? | low |
| `stat-reveal` | proof, detail | stat {value, caption}, label? | low |
| `stat-tiles` | proof | stats[2–4] + media[0–4] | medium |
| `split-reveal` | section-intro, reveal, detail | headline + media[1], label?, subhead? | medium |
| `panel-mosaic` | hook, proof, breathe | media[1–5], headline? (≤4 words) | medium |
| `structured-gallery` | proof, breathe | media[3–5] tall | medium |
| `floating-cards` | reveal, detail | media[2–3] landscape UI crops | medium |
| `pillar-index` | section-intro, detail | body: `Label | Headline | Body` per line (2–4) | low |
| `browser-scroll` | reveal, proof | media[1] website capture, url? | medium |
| `annotated-window` | detail, proof | media[1] + body (≤4 lines of ≤10 words) | medium |
| `device-grid` | proof | media[6–18] phone screens | medium |
| `logo-wall` | proof, close | logos[4–16] | low |
| `logo-outro` | close | logo or headline, subhead?, cta?, url? | low |

## How to choose

1. **Start from the beat list**, not from patterns: hook → (statement) → reveal → proof → (detail / breathe) → close. A 10s piece has 3 beats; 15s has 4–5; 25s has 6–7.
2. **Look up the brand's `preferences[beat]`** and take the first pattern whose content you actually have. Do not force content into a pattern (no stat-tiles without figures, no gallery with two images).
3. **Never repeat a pattern back to back.** Alternate registers: type → media → layout → type.
4. **Energy curve**: open medium/high, drop for detail, lift once for proof, land low. EdelGive stays low throughout by design; Atomic peaks in the middle.
5. **One idea per beat.** If a beat has a headline and three images and a stat, split it.
6. Set `dark` only where the brand uses an inverse ground (Atomic: yes, for mosaic/gallery; EdelGive: never).

## Content constraints

- Headlines: ≤12 words total, ≤3 lines, break lines yourself. Atomic likes 2 short lines; EdelGive likes 2 fuller lines.
- Labels: one short phrase. Atomic sets them uppercase mono; EdelGive sentence case in terracotta. Write them in sentence case and let the brand case them (Atomic will uppercase).
- Media paths are under `public/`: `media/...`. Videos: give `startFrom` so the clip opens mid-motion. Images: give `position` for the crop.
- Stats: `value` as it should read (`"Rs. 1,429 Crore"`, `"300+"`); the pattern counts the number inside it.

## Timing rules

- Omit `duration` and the beat gets the vocabulary's preferred length at the brand's tempo. Set `duration` (frames) only to pin a beat; set plan `duration` (seconds) to fit the rest.
- Never shorter than the vocabulary `min`. Transitions: omit for the brand default; only names in `brand.motion.transitions` render (others become cuts).
- The first beat's transition is always a cut.

## Composition principles

- Taste over configurability: use the options a pattern declares, and only when the vocabulary does not already fix them.
- The brand's `rules.never` list is a hard constraint. Read it.
- A close beat ends on a still frame — `logo-outro` or `photo-statement` with a CTA. Not a gallery.
- Do not open on logos, stats or a dense gallery.

## Output

A `CompositionPlan` (see `compositions/plan.ts`) registered in `compositions/plans.ts`:

```ts
register("Plan-edelgive-intro", {
  brand: "edelgive",
  intent: "foundation-intro",
  format: "16:9",
  duration: 9,
  story: [
    { beat: "hook",  pattern: "photo-statement", content: { media: [{ src: "media/edelgive/land-fields.jpg" }], headline: ["How we work", "towards change"], cta: "Learn more" } },
    { beat: "proof", pattern: "stat-tiles", transition: "wave", content: { stats: [{ value: "300+", caption: "Grassroot NGOs supported" }], media: [...] } },
    { beat: "close", pattern: "logo-outro", transition: "fade", content: { logo: { src: "media/logos/edelgive.png" }, cta: "Become a funder", url: "edelgive.org" } },
  ],
});
```

Then `npx remotion still Plan-edelgive-intro out/check.png --frame=60` to look, `npx remotion render Plan-edelgive-intro out/intro.mp4` to ship. `validatePlan(plan, vocabulary, brand)` in `compositions/render.tsx` lists anything illegal.

## What not to do

- Do not invent pattern ids or options. Undeclared options fail validation.
- Do not put colours, fonts, sizes or pixel positions in content.
- Do not write React to "fix" a pattern for one plan. If a pattern is missing a behaviour a brand needs, that is a new vocabulary entry or a new pattern — a design decision, made once.
- Do not use a brand's `never` list as a challenge.

---

## Two composition modes

This guide's `CompositionPlan` is the **edit** model: ordered shots with
transitions, beats that can be reordered or switched off. It is right when the
film is a sequence of shots.

It is the wrong model when the film is **one continuous system** — where
reordering the beats would destroy the causality, and where every apparent cut
is a state change of persistent geometry. Both authored films to date were that
kind, and both correctly used no plan, no `ShotTransition` and no
`buildTimeline`.

For those, write a **Score** (`core/schemas/score.ts`): named state boundaries,
a flat cue sheet, a geometry table. See `skills/score.md`. The reference
implementation is `projects/hookflo/missing-dot/score.json` with its typed view
at `films/hookflo/score.ts`.

Choose by asking one question: *could these beats be reordered?* Yes → plan.
No → score.

## Two rules that outrank everything in this file

**Progress, not frames.** Every component a film defines takes `t: number` in
0–1, never a frame number. The composition owns time; the parts own shape. It
makes a refinement pass trivial and makes the parts previewable in isolation.

**No frame number and no coordinate in composition code.** They live in the
Score. Hookflo's entire refinement pass touched cues and geometry without
reading the render code, and that is only possible if the rule is absolute.

## For films translated from a design file

**Adopt the design file's coordinate space and scale once at the root.** GROW+
is authored in the Paper artboard's own 1240×698 and scaled by `1920/1240` in
one `transform`, so a rect in the code and a rect in the keyframe are literally
the same number. Checking the render against the approved design becomes reading
two numbers rather than eyeballing two images. It removes an entire class of
error for the cost of one transform. See `skills/design-translation.md`.

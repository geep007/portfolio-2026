# Hookflo — PROCESS

What we learned taking hookflo.com from a website to a 20-second film, and what
of it belongs back in the Brand Motion System.

> **Not pipeline input.** This is a research and debugging document, written at
> the end, for humans. No generation stage reads it (`core/stages.ts` lists
> `prose-research` in every stage's `neverReads`). Everything here that
> generation actually needs now has a field in a structured artifact:
> `brand-brief.failureModes`, `storyboard.critique`, `render-state.limits`,
> `creative-direction.forbiddenBehaviours`. The migrated artifacts for this
> film live in `projects/hookflo/`.

Artefacts, in order of production:

| | file |
|---|---|
| Visual archaeology | `source-study.html` (+ `source/*.jpg`) |
| Design logic | `source-study.html` §5 (nine rules) and §6 (how to ruin it) |
| Motion logic | `motion-analysis.md` |
| Three directions + scoring | `directions.md` |
| The chosen brief | `direction.ts` (`CreativeDirection`) |
| Brand + vocabulary | `brand.ts`, `vocabulary.ts` |
| Storyboard (rev 2) | `../../../../storyboards/hookflo/missing-dot/index.html` |
| Storyboard self-critique | same file, §4 |
| Film | `../../films/hookflo/{score.ts, parts.tsx, MissingDot.tsx}` |
| Render + QA | `out/hookflo/missing-dot.mp4`, `out/hookflo/frames/`, `out/hookflo/contact-sheet.png` |

---

## What the website taught us

**The single most valuable thing on the site was the logo, and it was almost
missed.** The nav SVG is a 3×3 grid of nine positions holding eight dots: the
top-right position is *empty* and the bottom-centre dot is *white*. Read as a
field of webhook deliveries that is a stream in which one is missing and one is
caught — which is precisely the product. No metaphor had to be invented; the
brand had already drawn one and then used it as a logo without ever animating
it.

The lesson generalises: **before extracting tokens, read the mark as a diagram.**
A mark that encodes the product is a gift, and it is exactly the kind of thing a
token-extraction pass throws away as "logo asset, PNG".

Second: **this brand's grammar is containment, not scale.** The conventional
SaaS hero puts an oversized dashboard bleeding off the right edge to imply that
the product is bigger than the viewport. Hookflo does the opposite — a small,
fully-enclosed terminal that is *typing while you read*, with a status strip
saying "Monitoring for failures…". Its claim is vigilance, not size. Everything
downstream (no camera moves, no bleeds, no off-frame entrances) follows from
noticing that one inversion.

Third: **brightness is a hierarchy channel here, not an effect.** The scroll-
linked paragraph — words at 35% grey lifting to white as the scroll passes —
turned out to be the most transferable idea on the site. It gave the film a way
to show a dense field and then direct attention *inside* it, which is what an
observability product does. It also removed fade-in from the vocabulary
entirely, which turned out to be a load-bearing constraint.

Fourth: **the eyebrow says FAILURE-FIRST, and every screenshot on the site is
green.** That tension is the brand. A film in which nothing goes wrong would have
been an accurate rendering of the site's *surface* and a total misreading of its
*argument*.

## What visual rules were extracted

Nine, all sourced from compositions rather than from CSS (`source-study.html` §5):
contain · show it running · one light overhead · one accent per view · semantic
colour rationed to chip scale · brightness is hierarchy · labels above in mono ·
asymmetry only inside containers · the mark is a grid with a hole.

The rules that most changed the output were **one accent per view** (which killed
several storyboard ideas that had a lavender scan head *and* a lavender chip in
the same frame) and **semantic colour rationed to chip scale** (which is why the
failure never becomes a red screen — the most obvious motion-design move, and
completely wrong for this brand).

## What motion rules were inferred

From `motion-analysis.md`, the ones that survived into the film:

- **Cadence, not stagger.** Rows arrive on a fixed 12-frame interval. A stagger
  with an ease implies a designer placed the items; an interval implies a
  machine emitted them. The interval breaks exactly once — the drop misses a
  beat — and that break carries more than any effect could.
- **The failure is not announced.** No flash, no shake, no push-in. The film
  carries on over the empty row for two seconds. Announcing it would have been
  claiming the problem is visible, which is the opposite of the product.
- **Scan is linear.** No ease at either end. An eased reading head is a
  spotlight; a constant one is a process.
- **Orthogonal travel only.** The brand's containers are strictly rectangular,
  so the routed marker walks right angles. This was tested against a bezier
  version and the curve immediately read as another brand.
- **The hard stop.** The most important cut in the film is not a cut: at 0:09
  all motion ceases in one frame and every row drops to 10%. The change of
  agent — from *your app emitting* to *Hookflo looking* — is felt, not stated.

## What creative directions were considered

Three, scored on ten criteria in `directions.md`:

- **A · The Missing Dot** (49/50) — the mark, given time.
- **B · Silent Night / 03:14** (39) — a real-time night-shift film with a mono
  clock as protagonist. Good idea; needs 40 seconds of monotony to earn its
  break and at 20s just reads as slow.
- **C · The Scan** (38) — the site's scroll-illumination at full commitment.
  The most beautiful mechanism and the weakest story: a viewer who does not
  already know the product learns nothing.

## Why the final concept won

Two criteria decided it. **Brand specificity**: A is derived from something that
could belong to no other company — the hole in Hookflo's own mark. **Continuity**:
A carries one object through seven states without ever cutting away, which is
exactly the capability this experiment was meant to test.

The losers were not discarded whole. C's scan head became A's detection
mechanism — it was the correct brand-native way to move attention across a dense
field, and A needed exactly that. B's mono clock became the persistent baseline
that runs under every frame including the stillness, which is what makes seven
states read as one continuous event rather than as seven shots.

## What the storyboard changed after self-critique

Rev 1 was rendered at full size and inspected as static design. Seven problems,
all the same problem: **the frames had the brand's colours and type but were
behaving like a diagram rather than like Hookflo.** Documented in full in the
storyboard's §4; the load-bearing three:

- **Source names were bare text.** The site always pairs a source with its mark.
  Without them the rows read as an abstract diagram of a log rather than as a
  log. Fixed with 28px monogram tiles in each service's own colour at low
  saturation. This was the single largest gain in the whole project — it is the
  difference between "motion graphics about webhooks" and "a product".
- **No mono label above the panel.** A direct violation of the brand's own rule
  R7, and it left the top sixth of every frame empty. Adding a label that
  rewrites three times (*Live deliveries* → *webhook.failed* → *Routing to
  channel*) gave the film its entire voice without a word of narration.
- **The route path was drawn straight across the dimmed rows**, reading as a
  rendering mistake. Moved into the gutter between the two panels — which also
  gave the previously-empty gutter a job.

Also: a dead 200px inside the panel was closed up (this brand keeps its negative
space *outside* containers, never inside them), the scan line was aligned to the
row it stops on, the ending was restacked as the site's own hero (lockup above,
headline below, both on the margin), and a running counter — *8 delivered · 0
failed* → *1 failed* → *1 alerted* — was added, because without it the DROP
beat's central claim (*the system does not know yet*) was invisible in a still.

## What the motion critique changed

After the first full render and contact sheet, one refinement pass. All four
changes were removals or simplifications; nothing was added.

1. **Diagonal migration read as scatter.** Nine dots each flying its own diagonal
   from the mark to its row looked like a particle effect — precisely the thing
   the brand file forbids. Rebuilt as two orthogonal legs (spread vertically into
   row order, then align left onto the rail; reversed on the way home). It now
   reads as a grid unfolding into a list, and it matches the film's own route
   grammar.
2. **The scan head parked on the row it had found** and struck through the text
   for 40 frames. It now leaves once Hookflo has written its marker: a reading
   head that stays is a decoration.
3. **The failing row lost its status chip when the panel contracted**, right at
   the moment the alert card claims `410`. The timestamp column still drops in
   the narrow panel; the chip never does, because it is the evidence.
4. **Cut the one sentence in the film that was a claim rather than evidence** —
   "email · slack · webhook — all channels acknowledged". It was the most
   advertising-shaped thing in the piece.

Deliberately *not* changed: the panel stays dead-centre for four of the seven
states. That is the most symmetrical choice available and normally a warning
sign, but the panel is one persistent object being re-read, and moving it
between states would break the film's only structural idea.

## What existing motion components were useful

Roughly 75/25 reuse to custom glue.

**Used as-is and load-bearing:**

- `BrandProvider` / `useBrand` — every colour, type role and easing in the film
  resolves through it. No component in `films/hookflo/` names a hex value except
  the four ecosystem monogram colours, which are other companies' brands and
  therefore content.
- `engine/easing.ts` — the brand's three named curves plus a `scan` (linear) and
  a `route` (cubic-in-out) extra. Naming the curves in the brand file meant the
  refinement pass could change *character* without touching the composition.
- `engine/timing.ts` `progress()` — every animated value in the film is one call
  to it. This is the highest-value thing in the engine: it removed every
  hand-rolled `interpolate(frame, [a, b], …, {clamp})` from the film.
- `engine/fonts.ts` — Geist and Geist Mono declared in `brand.ts`, injected and
  render-blocked automatically. Zero film-side code.
- `primitives/TextReveal` — the closing headline, `mask-rise`, per-line colours.
  It is a good sign that the one moment of display typography in the film needed
  no new primitive.
- `brand/schema.ts` — took a fourth brand with no changes at all, including a
  brand whose `inverse` ground is a lavender slab used once. The `semantic`
  colour map absorbed everything the schema had no field for (chrome, plates,
  bloom, ok/fail) without a schema change, which is the right pressure valve.

**Not used, correctly:**

- `compositions/plan.ts` + `render.tsx`. A `CompositionPlan` is a list of shots
  with transitions between them, and this film has neither. Forcing it would
  have destroyed the continuity that is the entire concept.
- `transitions/ShotTransition`. There are no transitions in the film.
- `engine/timeline.ts` `buildTimeline`. Its value is that beats can be reordered
  or switched off; here reordering the beats would destroy the causality.
  `score.ts` is the honest alternative: named state boundaries plus a cue sheet.
- Every LEVEL-2 pattern. `browser-scroll` was the closest fit and is in
  Hookflo's vocabulary, but the film needed a window whose *contents* it drove
  frame-by-frame, not a window that scrolls a screenshot.

## What required custom glue

`films/hookflo/` — three files, ~700 lines:

- `score.ts` — every frame number and every coordinate in the film, and nothing
  else. No frame number appears in the composition. This turned out to be the
  most useful decision in the build: the entire refinement pass touched cues and
  geometry without reading the render code.
- `parts.tsx` — `Marker`, `EmptySlot`, `Chip`, `SourceTile`, `Row`, `Chrome`,
  `Strip`, `AlertCard`, `Baseline`, `Bloom`. All take *progress as a number*,
  never a frame: the composition owns time, the parts own shape.
- `MissingDot.tsx` — one component, mounted once, 600 frames. No `<Sequence>`,
  no scene components. Every element reads its own state from the frame.

The custom work that could not have come from the system: the marker identity
chain (mark dot → row rail → the slot Hookflo fills → routed packet → the card's
leading marker → the mark's white dot), the two-leg orthogonal migration, the
gutter-only route stroke, and the failing row holding its y-position from the
moment it arrives until the end.

## What felt generic and was removed

- A red full-frame flash at the moment of the drop (storyboard rev 0, cut before
  it was drawn — see rule "the failure is not announced").
- A bezier route for the travelling dot. Read as another brand within one frame.
- Fade-in on the alert card. Replaced with a clip that opens downward from the
  card's own header, and shuts back into it.
- Per-row entrance staggers with an ease. Replaced with the metronome.
- A second lavender accent in the SCAN state (a lit head *and* a lit chip).
- The one advertising sentence in the film, cut in the refinement pass.
- Keeping the white dot white while it served as a row marker: it competed with
  the red marker for attention. White is now a property of the mark only, and
  comes back at the end when the alerted marker lands on it — which also gives
  the ending its meaning: **the white dot in Hookflo's mark is the event it
  caught, and the hole is still there because there will always be another.**

## What should become reusable system logic

Ranked by confidence.

1. **`useScanReveal` — a LEVEL-1 primitive.** A constant-speed reading head over
   a list, raising brightness as it passes, with an optional halt target. This
   is genuinely brand-independent (EdelGive would run it slowly over a page of a
   report; Atomic would run it fast over a grid), it replaces fade-in, and it is
   the single most reusable idea recovered from this brand.
2. **`CreativeDirection` as a first-class type.** `direction.ts` did real work:
   `forbiddenBehaviours` and `visualDensityArc` were checked against every
   storyboard frame and against the render. It belongs next to `BrandSystem` in
   `brand/`, not in a brand folder. BrandSystem = identity; CreativeDirection =
   this film.
3. **A `Score` alternative to `CompositionPlan`.** Some films are shot lists;
   some are one continuous system. The engine currently only models the first.
   `score.ts`'s shape — named states with boundaries, a flat cue sheet, a
   geometry table — should be a supported second mode, so continuity films are
   not off-road.
4. **Progress-not-frames as an enforced convention for parts.** Every part in
   `parts.tsx` takes `t: number`. It made the refinement pass trivial and made
   the parts trivially previewable. Worth writing into
   `agent/AGENT_MOTION_GUIDE.md` as a rule.
5. **A `StatusChip` primitive.** Semantic state at chip scale, clip-opening, is
   not Hookflo-specific — any brand with product UI needs it, and it is the
   correct place to enforce "semantic colour is never a field".
6. **The "how to ruin this brand" section as a required archaeology output.**
   Writing the failure modes *before* designing was more useful than the rules
   were. It is the artefact that killed the floating-cards idea, the glow, and
   the camera push before any time was spent on them.

## What should remain brand/film-specific

- The delivery log, the Slack alert card and the source monogram tiles. They are
  content for one film about one product.
- The marker identity chain. It only exists because Hookflo's mark has a hole in
  it; generalising it would produce a pattern nobody could use honestly.
- The two-leg orthogonal migration. It is right because *this* brand's grammar is
  rectangular. A brand with organic geometry should not inherit it.
- `03:14`, the counter wording, and the `410 · endpoint secret rotated` copy.
- Hookflo's ban on camera movement. That is a brand rule, not an engine rule.

## Honest limits

- **No sound.** The score assumes a metronome that misses a beat at the drop and
  a Slack knock at the alert; both are described in the storyboard's motion
  notes and neither exists in the render. The film reads without them, but the
  drop is designed to be *heard* before it is seen.
- **The ending's meaning is thin without the setup.** That the alerted marker
  lands on the mark's white dot is legible only to a viewer who registered the
  white dot in the first three seconds. It holds for 40 frames at the open,
  which is the most that can be spent on it in a 20-second piece.
- **`DELIVERIES` and the cue sheet are hand-written data.** Structured cleanly
  enough that copy, timing and events could be lifted into an editor later, but
  no editor was built — correctly, per the brief.

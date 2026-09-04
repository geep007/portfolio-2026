# Hookflo — motion analysis

Companion to `source-study.html`. The question here is not *what animations does
hookflo.com have* (it has few: a marquee, a typing terminal, a scroll-linked
illumination). It is:

> If this visual language existed through TIME instead of only SPACE, how would it behave?

---

## 1 · Source observation → interpretation → motion verb

**Every object lives inside a hairline panel and nothing bleeds off the frame.**
→ This brand's world is made of *enclosures*. A thing is either inside a container
or it does not exist. Enclosure is how it asserts control over other people's
events.
→ **VERB: contain.** Objects never enter from off-screen. They are revealed
*within* an existing panel, or a panel clips open to hold them. No element ever
crosses the frame edge. Camera never moves, because moving the camera would
imply a world larger than the frame — and this brand's whole claim is that
nothing escapes it.

**The hero pairs a static claim with a terminal that is actively typing, caret blinking, status strip reading “Monitoring for failures…”.**
→ The brand's proof of life is not scale, it is *ongoing activity*. It wants you
to believe something is watching right now.
→ **VERB: run.** There must be a continuous low-level tick underneath the whole
film — a caret, a clock, rows arriving — that never stops even during the quiet
beats. Stillness in this brand means *the composition* is still, not that the
world stopped.

**A paragraph sits at ~35% grey and is lifted to white word by word as the scroll passes over it.**
→ Attention is modelled as illumination. Nothing appears or disappears; things
are either being attended to or they are not.
→ **VERB: scan.** The primary reveal mechanism for this brand is a constant-speed
reading head passing over already-present material and raising its brightness.
This replaces fade-in entirely — and crucially it lets a film show *a lot* of
information and then direct attention inside it, which is exactly what an
observability product does.

**Semantic colour exists only at chip scale: an 8px green dot, a 70px `Connect` button, a red destructive token that never appears as an area.**
→ State changes are *small and precise*. The brand does not dramatise them.
→ **VERB: flip.** A status change is one small object changing colour while
nothing else in the frame moves. The drama comes from the stillness around it,
not from the size of the change. A full-frame red flash would be a different
company.

**Every row on the site is: dot · label · relative time · source. Repeated at three scales — feed rail, notification card, dashboard table.**
→ The atom of the product is a *log line*, and the brand already thinks in
ordered vertical sequence.
→ **VERB: arrive / accumulate.** Time in this brand is a stack that grows
downward-to-upward on a metronome. Not a stagger written by a designer — an
interval. Rows should arrive on a fixed beat, because irregular timing would
imply a human placed them.

**One lavender bloom, always above the top edge of a section, centred, never around an object.**
→ Light is a fixed fact of the world, not an effect applied to a subject.
→ **VERB: (do not animate).** The bloom is set dressing and must stay
constant across the whole piece. If light moves, this becomes cinematic — and
cinematic is not what a console is.

**The mark is a 3×3 dot field with one position empty and one dot white.**
→ The identity already encodes the product: a stream of deliveries where one is
missing and one is caught.
→ **VERB: collapse / expand.** The film's spatial logic can be a single
continuous transform between two readings of the same geometry — the mark, and
the event log. Everything else follows from moving between those two scales.

**The site's containers are strictly rectangular; asymmetry only ever happens inside one.**
→ Structural, not organic.
→ **VERB: clip.** Reveals are rectangular `inset()` clips aligned to the panel's
own edges. No circular wipes, no organic masks, no soft feathering, no blur.

**The one inverted surface — a grainy lavender slab with a serif line — appears exactly once, last.**
→ The brand saves one raised voice for the end.
→ **VERB: resolve.** A film should spend its whole length in the dark instrument
and change register only in the final beat. That register change *is* the
ending; nothing else needs to signal it.

**Toggles are all on, statuses all Active, timestamps all recent — but the eyebrow reads FAILURE-FIRST.**
→ The tension in the brand: a calm surface whose entire reason for existing is
that something will go wrong.
→ **VERB: drop.** The film needs an absence — something that should have
happened and did not, presented *without emphasis at the moment it occurs*. If
the failure is highlighted as it happens, the film has lied about the problem.
The whole point is that nothing marks it. Emphasis may only arrive afterwards,
from Hookflo.

---

## 2 · The verb set

| verb | what it means here | forbidden neighbour |
|---|---|---|
| **arrive** | a row enters the log from below on a fixed interval | staggered fade-up |
| **verify** | a pending chip resolves to `200` | a checkmark animation |
| **drop** | a row arrives empty and is *not* marked | a red flash, a shake |
| **scan** | constant-speed head lifts brightness of what it passes | a spotlight, a vignette |
| **detect** | one small object changes colour, alone | a full-frame alarm state |
| **route** | an object travels an orthogonal path between panels | an arc, a bezier swoop |
| **write** | a card composes itself line by line | a card fading in whole |
| **flip** | a chip changes state in place | a chip morphing shape |
| **resolve** | red becomes lavender in the same position | a new element replacing it |
| **collapse** | rows compress back into the 3×3 field | a cut to a logo |
| **hold** | nothing moves for 30–45 frames | filler drift |

## 3 · Timing character

- **Cadence, not stagger.** Sibling objects arrive on an interval (2–4 frames at
  tempo 1.0), like a machine emitting them, not on a designer's ease.
- **Amplitude 0.5.** Travel distances are half the engine reference. Things
  move a little, precisely.
- **No overshoot anywhere.** `overshoot: 0` in the brand file is a hard constraint.
- **expo-out in, expo-in out.** Quick departure from rest, long settle — the
  curve of a UI responding, not of an object with mass.
- **Linear for scans and marquees.** A reading head that eases is a spotlight.
- **cubic-in-out for routing.** Symmetric and mechanical: a packet moving, not a
  creature.
- **Hold after every state change.** The brand's compositions are read, not
  glanced at. The quiet beats are where the product becomes legible.

## 4 · What this rules out before a single frame is designed

No camera move. No parallax. No depth. No particles. No glowing lines between
nodes. No 3D card tumble. No fade as an entrance for anything. No spring. No
scaling type. No soft mask. No second serif. No purple field. No moment where
the failure is announced with drama at the instant it occurs.

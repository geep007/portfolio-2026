# Hookflo — three creative directions, and the choice

Written before any Remotion code. All three are 16:9, ~18s, no voiceover, no
assets beyond what can be drawn from the brand file.

---

## Direction A — **THE MISSING DOT**

**Core idea.** The Hookflo mark is a 3×3 dot field with one position empty and
one dot white. Read it as a stream of deliveries in which one is missing and one
is caught — because that is literally what it is. The film is one continuous
transform between the mark and a live event log: the logo opens into the log, a
delivery goes missing inside it, Hookflo catches it, and the log collapses back
into the mark.

**Product truth.** *The event that doesn't arrive is the one that matters.*

**Motion thesis.** One geometry, six states. Nothing is ever created or
destroyed on screen; dots become rows become a dot becomes an alert becomes a
dot again. The film is a single object being re-read.

**Hero motif.** The dot. Its position in the frame is the through-line, and the
gap in the mark is the story.

**Typography role.** Almost silent. Two moments of display type — a mono label
at the open, and the site's own headline at the close. Everything in between is
UI type: mono timestamps, chips, source names. Type reports; it does not narrate.

**Product/UI role.** The log *is* the film. Not a screenshot of the dashboard —
a rebuild of its atom (dot · source · event · time · status) at frame scale, so
it is legible at 1920 and behaves correctly under motion.

**Imagery role.** None. No photography, no illustration. The only imagery is the
ecosystem marks (Stripe / Clerk / Supabase / GitHub) as source chips inside rows,
at low contrast, doing a job.

**Spatial logic.** A single centred panel that changes width and role: full mark
(small, centre) → log panel (wide, centre) → log column (narrow, left) + alert
card (right) → log panel → mark. Camera static throughout. Nothing crosses the
frame edge.

**Pacing arc.** still → cadence builds → **absence, unmarked** → hard stop →
scan (slow) → detection (one beat) → route (mechanical) → resolution → still.
Two long holds: on the empty row, and on the final mark.

**Transition logic.** There are no transitions. Every cut is a state change of
persistent geometry: the panel resizes, brightness redistributes, one object
travels. The only hard cut in the film is the moment the log stops.

**Sound thinking.** A room tone and a metronome tick per arriving row. The tick
*misses one beat* at the drop — the failure is audible as a silence before it is
visible. Slack's knock at the alert. Nothing at the end but room tone.

**Storyboard (6 beats).**
1. `IDLE` — mark, small, centred, lit from above. Label under it. Nothing moves but a caret.
2. `ARRIVE` — mark expands into a log panel; rows arrive on a metronome, all green `200`.
3. `DROP` — a row arrives with an empty dot slot and no status chip. It is *not* marked. Rows keep coming over it. Then everything stops.
4. `SCAN` — all rows dim to 12%; a hairline reading head travels down and halts on the empty row. A red dot writes into the empty slot; the chip resolves to `410 · signature`. Hold.
5. `ROUTE` — panel contracts to a left column; the red dot travels an orthogonal path to the right, where a Slack alert card writes itself line by line.
6. `RESOLVE` — the log returns to full brightness with the row now filled and lavender; rows collapse into the 3×3 field; mark + wordmark + `Monitor every webhook event.` + the site's own status strip.

**Why it belongs to this brand.** It is the logo, given time. It obeys contain,
scan-illumination, chip-scale semantic colour, one-accent-per-view, machine
cadence and static camera without any of them being imposed — they are what the
idea needs. And it is failure-first: the failure happens at the exact centre of
the film, unannounced.

**What it intentionally avoids.** Any camera move. Any element entering from
off-frame. Any fade. Any dramatisation of the failure at the moment it occurs.

---

## Direction B — **SILENT NIGHT / 03:14**

**Core idea.** A time-of-day film. The dashboard is running at 03:14 and nobody
is looking. Timestamps are the protagonist: they tick, they accumulate, and
between `03:14:02` and `03:14:09` a payment webhook fails. The film follows the
seven seconds nobody was awake for, then shows the Slack message that made them
awake anyway.

**Product truth.** *You are not watching. Hookflo is.*

**Motion thesis.** Real time made visible. The film runs at 1:1 with a mono
clock in the corner for its entire length; every event is stamped, and the piece
is edited to the clock rather than to a beat.

**Hero motif.** The mono timestamp — 8 characters, monospace, always bottom-left.

**Typography role.** Dominant. Mono numerals are the largest type in the film.
Display type appears only in the last two seconds.

**Product/UI role.** One window, one continuous shot, everything happening
inside it. Effectively a screen recording that has been art-directed.

**Imagery role.** None; the only non-type element is the phone-shaped Slack
notification at the end.

**Spatial logic.** One fixed window, frame-filling, for 15 of 18 seconds. Then
it dims and the alert composes over it.

**Pacing arc.** monotonous → monotonous → *a gap in the monotony* → alert →
resolution. Deliberately flat for a long time so the break lands.

**Transition logic.** None. One shot, one dissolve of brightness at the end.

**Sound thinking.** A clock. Literally just a clock, and a Slack knock.

**Storyboard (5 beats).** `03:14:00` clock and empty log → four deliveries arrive
and resolve → `03:14:06` one hangs at `pending` and never resolves → clock keeps
running, seven seconds of nothing → Slack card writes in, log resolves, mark.

**Why it belongs.** It takes the site's nocturnal register literally, and the
site's own relative timestamps (`2m ago`, `10m ago`) are already the product's
voice.

**What it avoids.** All decoration. It is almost anti-designed.

---

## Direction C — **THE SCAN**

**Core idea.** Make the site's scroll-linked illumination the entire grammar. A
wall of 40+ log lines at 12% brightness fills the frame from frame one — far too
much to read. A reading head travels across and down, lifting lines to full
white as it passes. Everything the film says, it says by choosing what to
illuminate. The last thing it illuminates is one red line.

**Product truth.** *There is more happening in your app than you can look at.*

**Motion thesis.** Nothing enters, nothing leaves. Attention is the only moving
part in the film.

**Hero motif.** The scan head — a single 1px lavender rule.

**Typography role.** Everything is type, and type never moves. Only its
brightness changes.

**Product/UI role.** The log as a wall — density as the subject.

**Imagery role.** None.

**Spatial logic.** A single full-frame grid of lines, fixed for the whole film,
with the scan head as the only travelling object. Ends by dimming everything
except one line, which is then framed by a panel that draws itself around it.

**Pacing arc.** overwhelming density → rhythmic scanning → sudden narrowing →
one line → mark.

**Transition logic.** Brightness only. No cuts at all.

**Sound thinking.** A continuous filtered tone that sharpens as the head passes,
silence at the narrowing.

**Storyboard (4 beats).** dense dim wall → scan sweeps, lifting rows → head stops
on a red row while everything else drops to 6% → panel draws itself around that
row and the alert composes inside it → mark.

**Why it belongs.** It is the single most brand-specific *mechanism* on the site,
used at full commitment.

**What it avoids.** Any narrative structure at all — which is also its problem.

---

## Selection

Scored 1–5 on the ten criteria, then chosen.

| | A · Missing Dot | B · 03:14 | C · The Scan |
|---|---|---|---|
| 1 Brand specificity | **5** — it is the logo | 4 | **5** — it is the scroll behaviour |
| 2 Product clarity | **5** — problem→mechanism→result complete | 4 | 2 — shows density, not mechanism |
| 3 Visual originality | 4 | 4 | **5** |
| 4 Motion potential | **5** — six real state changes | 2 — deliberately monotonous | 3 — one gesture |
| 5 Reads in 10–20s | **5** | 3 — needs its own dead time to work | 4 |
| 6 Fit with available assets | **5** — needs nothing but the brand file | **5** | **5** |
| 7 Understandable without VO | **5** | 4 | 2 — "what am I looking at?" |
| 8 Avoids generic SaaS motion | **5** | **5** | **5** |
| 9 Visual continuity potential | **5** — one persistent object throughout | 4 | 3 — nothing to carry between beats |
| 10 Strength of a single idea | **5** | 4 | 4 |
| **total** | **49** | **39** | **38** |

**Chosen: A — THE MISSING DOT.**

Not close. B's monotony is a real idea but it needs 40 seconds of boredom to earn
its break, and at 18s it just reads as slow. C has the most beautiful mechanism
and the weakest story — a viewer who does not already know the product learns
nothing from it.

A wins on the two criteria that matter most for this experiment: it is derived
from something that could only belong to Hookflo (the hole in its own mark), and
it carries one object through six states without ever cutting away, which is
exactly the continuity the brief asks the motion system to prove it can do.

**What was taken from the losers.** C's scan head is folded into A as beat 4's
detection mechanism — it is the correct brand-native way to move attention
across a dense field, and A needed exactly that. B's mono clock is kept as the
persistent background tick that runs under the whole film, and the `410` failure
in A is stamped rather than announced. Neither is a compromise; both are the
part of those directions that was actually about Hookflo.

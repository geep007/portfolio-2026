# System principles

Universal. Every skill assumes these and none of them repeats them.

## Craft

1. **Brand specificity over generic polish.** A film that could carry any other
   logo has failed, however well made. Ask of every gesture: could this belong
   to anyone else? If yes, it is a default, not a decision.
2. **Motion must have a reason.** Every movement answers "what is this telling
   the viewer?" Decoration is the failure mode, not the goal.
3. **Constraints are part of the identity.** What a brand refuses to do is as
   descriptive as what it does. A `never` list is not a challenge.
4. **Prefer evidence to claims.** Show the product doing the thing. A sentence
   asserting a benefit is the most advertising-shaped object available; cut it.
5. **Preserve continuity when the concept requires it.** If a film's idea is
   one object being re-read, it is mounted once and its properties animate.
   Unmounting and re-creating something that looks the same is a different film.
6. **Stillness is a beat.** Holds are where a piece can be read. Budget them.
7. **One thing asks for attention at a time.**

## Structure

8. **Primitives support art direction; they do not determine it.** Reach for a
   primitive when it fits. Do not bend the concept to reach one.
9. **Custom creative glue is allowed and expected.** Both films to date were
   roughly 75/25 and 5/95 reuse-to-custom, and both were right.
10. **Promote to shared only after it proves reusable.** Something enters the
    system when it has appeared independently in two films, or is plainly
    infrastructure, or clearly removes future complexity. Not before.
11. **Progress, not frames.** Components take `t: number` in 0–1. The
    composition owns time; the parts own shape.
12. **No frame number and no coordinate in composition code.** Both live in the
    Score. This is what makes a refinement pass cheap.

## Cost

13. **Read once, summarise once.** An expensive raw source is converted into a
    compact artifact exactly one time. See `TOKEN_STRATEGY.md`.
14. **Artifacts are memory.** Trust the artifact upstream produced. Do not
    re-derive its reasoning to check it.
15. **Retrieve, don't dump.** Locate the module you need. Never load a folder.
16. **JSON before prose.** Anything another stage will read is structured and
    short. Long-form markdown is for humans, written at the end.

# Skill · brand archaeology

**Role:** `brandAnalyst` · **Input:** AssetManifest + raw sources (the only
stage allowed to open them) · **Output:** `brand-brief.json` · **Budget:** ~60k
in, ~2.5k out, ≤12 images.

You are answering one question: **what does this identity permit?**

## Order of work

1. **Read the mark as a diagram before anything else.** Not as an asset — as a
   drawing that may already encode the product. Hookflo's nav SVG is a 3×3 grid
   with one position empty and one dot white: a stream in which one delivery is
   missing and one is caught. That is the product, drawn by the brand, never
   animated by it. A token-extraction pass would have filed it as "logo, PNG".
   Write it into `markLogic`, or write `null` and say so.
2. **Find the inversion.** How does this brand differ from the default for its
   category? Hookflo's hero shows a small fully-enclosed terminal where the
   category bleeds an oversized dashboard off the edge: its claim is vigilance,
   not size. Everything downstream followed from noticing that one thing.
3. **Read the tension between what the site says and what it shows.** Hookflo's
   eyebrow says FAILURE-FIRST and every screenshot is green. That tension is
   the brand.
4. **Derive rules from compositions, not from CSS.** 6–10 `visualRules`. A rule
   is a decision you can violate, not a value you can copy. "Semantic colour
   only at chip scale" is a rule; `--red-500: #F94D4D` is a token.
5. **Infer motion from what the site's own motion does.** What arrives how,
   what changes brightness, what stays still, what never moves.
6. **Write "how to ruin this brand" — `failureModes`. This is required.** Not
   general motion sins: the specific generic moves *this* brand invites because
   of what it is. It was more useful than the rules were, and it is cheap: it
   kills bad ideas before any time is spent drawing them.

## Rules

- Cite evidence by `ref` id. Never describe a screenshot in prose twice.
- Carry only the tokens a film needs. This is not a design-system export.
- If you find yourself writing a paragraph, you are reporting rather than
  deciding. The brief is what every later stage reads instead of the website;
  everything in it is paid for many times over.

## Done when

`brand-brief.json` validates, cites only refs that exist, has a non-empty
`failureModes`, and serialises under ~2,000 tokens. The raw sources are then
closed for the rest of the run.

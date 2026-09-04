# runs/

One directory per pipeline run: `runs/<run-id>/metrics.json`, written by
`pipeline/run.ts` via `core/node/store.ts`.

Read a run with `node scripts/run-report.mjs [run-id]` (no id = most recent).

The numbers worth watching are not the totals:

- **RAW SOURCE REREADS** — must only ever list `extract` and `archaeology`.
  Anything later means a stage went back to the website instead of trusting the
  BrandBrief, and that is the single most expensive failure available.
- **CACHE HITS** — a second run that changes only the storyboard should show
  hits on `extract`, `archaeology` and `direction`. If it does not, the
  `cacheKey` for those stages is wrong.

Runs are disposable. Nothing downstream reads them.

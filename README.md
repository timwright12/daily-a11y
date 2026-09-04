# Daily Accessibility

A daily accessibility quiz app covering WCAG 2.2 success criteria. Each day
surfaces one success criterion with a plain-language explanation, who it
affects, a bad/good code example, manual testing steps, and a comprehension
check. Built with Astro, React (for interactive islands), and Tailwind CSS,
deployed to GitHub Pages.

Live at https://daily-a11y.com/.

## Development

```
npm install
npm run dev
```

Requires the Node version pinned in `.nvmrc`.

### Available scripts

- `npm run dev` — start the Astro dev server
- `npm run build` — build the static site to `dist/`
- `npm run preview` — serve the built `dist/` output locally
- `npm test` — run the Vitest suite once
- `npm run lint` — run ESLint (JS/JSX/Astro, including `jsx-a11y` rules)
- `npm run format` — format all files with Prettier
- `npm run format:check` — check formatting without writing changes

`npm test`, `npm run lint`, and `npm run format:check` mirror the checks run
in CI (`.github/workflows/pr-checks.yml`), which also runs `npm run build`.
A Husky pre-commit hook runs `lint-staged` (Prettier) on staged files.

`@axe-core/cli` is available as a dev dependency for manual accessibility
audits (e.g. `npx axe <url>` against a running `dev`/`preview` server) but
isn't wired into any npm script or CI job.

## How the app works

- **Today** (`/`) shows the criterion selected for the current day.
- **Random** (`/random/`) shows a randomly selected criterion.
- **Browse** (`/browse/`) lists and filters every criterion in the dataset.

All three pages render the same `CriterionApp` React island in a different
`mode`, fed by the full criteria list loaded server-side via
`src/lib/criteria.ts`.

Which criterion is "today's" is deterministic, not random: `src/rotation.js`
picks an index from the day count since the epoch (day rollover happens at
05:00 UTC, i.e. midnight US Eastern), so the same criterion shows for
everyone on a given day and the choice is reproducible without persisting
state server-side. `GET /today.json` exposes that same day's payload as
JSON (see `src/pages/today.json.ts`).

Progress (streaks, which criteria have been seen, and today's
answer/correctness) is stored in the browser's `localStorage` —
see `src/gamification/streak.js` and `src/gamification/coverage.js` — so
progress is per-device and nothing is sent to a server. `src/gamification/shareCard.js`
builds the share text used when a user shares their result.

## Adding or editing criteria content

Criteria live in `src/content/criteria/*.json`, one file per success
criterion (currently 86 files). `src/content.config.ts` registers this
directory as an Astro content collection validated against
`src/content/criterionSchema.js`, so an invalid file fails the build.
Before writing or editing `explanation`, `whoItAffects`, or `howToTest`,
read the content style convention documented at the top of
`src/content/criterionSchema.js` — it covers target reading level and a
rendering constraint on paragraph breaks.

Each criterion file must include:

- `id`, `name`, `level` (`A`/`AA`/`AAA`), `principle` (one of Perceivable,
  Operable, Understandable, Robust)
- `explanation`, `whoItAffects`, `howToTest` — prose fields (see the style
  convention above)
- `codeExample` — a `{ lang, bad, good }` snippet pair rendered side by side
- `check` — a comprehension-check question with `choices` and a correct
  `answer` index
- `references` and `relatedCriteria` — optional arrays (default to `[]`)

`src/content/loadCriteria.js` provides the same schema validation plus a
check that every `relatedCriteria` id points at a criterion that actually
exists (`assertRelatedCriteriaExist`), used both by `src/lib/criteria.ts`
after loading the collection and by its own test suite.

## Project structure

```
src/
  components/     Astro components (BaseHead, Masthead) and React islands
                   (CriterionApp, BrowseList, CodeSpread, ComprehensionCheck,
                   Hero, RerollLink, ShareBar)
  content/        Criteria JSON files, schema, and loader
  content.config.ts  Astro content collection registration for criteria/
  gamification/   Streak, coverage, and share-text logic (localStorage-backed)
  lib/            Criteria access, filtering, and "today" payload helpers
  pages/          Astro routes: index (today), random, browse, today.json
  rotation.js     Deterministic day-based rotation/index logic
  styles/         Global styles, print styles, Prism syntax-highlight overrides
tests/            Vitest specs, mirroring the src/ layout above
```

## Deployment

Pushes to `main` build and deploy automatically to GitHub Pages via
`.github/workflows/deploy.yml`, which also rebuilds on a daily cron
(05:10 UTC, shortly after the day rollover) so the "today" content and
`/today.json` don't go stale between pushes.

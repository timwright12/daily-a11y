# Daily Accessibility

A daily accessibility quiz app covering WCAG 2.2 success criteria.

## Development

```
npm install
npm run dev
```

`npm test`, `npm run lint`, and `npm run format:check` mirror the checks run in CI (`.github/workflows/pr-checks.yml`).

## Adding or editing criteria content

Criteria live in `src/content/criteria/*.json`, one file per success criterion, validated against `src/content/criterionSchema.js`. Before writing or editing `explanation`, `whoItAffects`, or `howToTest`, read the content style convention documented at the top of `src/content/criterionSchema.js` — it covers target reading level and a rendering constraint on paragraph breaks.

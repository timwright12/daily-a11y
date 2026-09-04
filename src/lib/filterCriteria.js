// src/lib/filterCriteria.js
export function filterCriteria(criteria, filters, coverage) {
  const { query, level, principle, seenState } = filters;

  return criteria.filter((criterion) => {
    if (query) {
      const needle = query.toLowerCase();
      const haystack = `${criterion.id} ${criterion.name}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    if (level && criterion.level !== level) return false;
    if (principle && criterion.principle !== principle) return false;

    if (seenState === "seen" && !coverage.includes(criterion.id)) return false;
    if (seenState === "unseen" && coverage.includes(criterion.id)) return false;

    return true;
  });
}

export function markSeen(coverage, criterionId) {
  if (coverage.includes(criterionId)) return coverage;
  return [...coverage, criterionId];
}

export function coverageSummary(coverage, totalAvailable) {
  return { seen: coverage.length, total: totalAvailable };
}

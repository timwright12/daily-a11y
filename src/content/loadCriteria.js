import { criterionSchema } from "./criterionSchema.js";

export function loadCriteria(rawEntries) {
  if (rawEntries.length === 0) {
    throw new Error("loadCriteria: no criteria provided");
  }

  const criteria = rawEntries.map((entry) => {
    const result = criterionSchema.safeParse(entry);
    if (!result.success) {
      const idHint = entry && entry.id ? entry.id : JSON.stringify(entry);
      throw new Error(
        `loadCriteria: invalid entry "${idHint}": ${result.error.message}`,
      );
    }
    return result.data;
  });

  assertRelatedCriteriaExist(criteria);

  return criteria;
}

// A typo'd relatedCriteria id would otherwise silently produce a dead link,
// since it passes schema validation (it just has to look like an SC number)
// without needing to match a real criterion.
export function assertRelatedCriteriaExist(criteria) {
  const knownIds = new Set(criteria.map((criterion) => criterion.id));
  for (const criterion of criteria) {
    for (const relatedId of criterion.relatedCriteria) {
      if (!knownIds.has(relatedId)) {
        throw new Error(
          `assertRelatedCriteriaExist: "${criterion.id}" has relatedCriteria entry "${relatedId}" which does not match any loaded criterion`,
        );
      }
    }
  }
}

export function sortCriteria(criteria) {
  return [...criteria].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
}

import { criterionSchema } from "./schema.js";

export function loadCriteria(rawEntries) {
  if (rawEntries.length === 0) {
    throw new Error("loadCriteria: no criteria provided");
  }

  return rawEntries.map((entry) => {
    const result = criterionSchema.safeParse(entry);
    if (!result.success) {
      const idHint = entry && entry.id ? entry.id : JSON.stringify(entry);
      throw new Error(
        `loadCriteria: invalid entry "${idHint}": ${result.error.message}`,
      );
    }
    return result.data;
  });
}

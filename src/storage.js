import { z } from "zod";

const STORAGE_KEY = "daily-a11y-state";

// Single source of truth for persisted state shape. A field must be added
// here before writeState() persists it — otherwise a readState() call on
// an older schema silently strips it (Zod's default behavior for unknown
// object keys) on the next round-trip.
const stateSchema = z.object({
  streak: z.object({
    count: z.number().int().min(0),
    lastAnsweredDay: z.number().int().nullable(),
  }),
  coverage: z.array(z.string()),
  lastAnswer: z
    .object({
      day: z.number().int(),
      criterionId: z.string(),
      choice: z.number().int().min(0),
      correct: z.boolean(),
    })
    .nullable()
    .default(null),
});

function defaultState() {
  return {
    streak: { count: 0, lastAnsweredDay: null },
    coverage: [],
    lastAnswer: null,
  };
}

export function readState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return defaultState();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return defaultState();
  }

  const result = stateSchema.safeParse(parsed);
  return result.success ? result.data : defaultState();
}

export function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

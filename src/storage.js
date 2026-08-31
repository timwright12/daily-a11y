import { z } from "zod";

const STORAGE_KEY = "daily-a11y-state";

const stateSchema = z.object({
  streak: z.object({
    count: z.number().int().min(0),
    lastAnsweredDay: z.number().int().nullable(),
  }),
  coverage: z.array(z.string()),
});

function defaultState() {
  return { streak: { count: 0, lastAnsweredDay: null }, coverage: [] };
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

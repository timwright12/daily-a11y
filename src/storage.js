const STORAGE_KEY = 'daily-a11y-state';

function defaultState() {
  return { streak: { count: 0, lastAnsweredDay: null }, coverage: [] };
}

export function readState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return defaultState();
  try {
    return JSON.parse(raw);
  } catch {
    return defaultState();
  }
}

export function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

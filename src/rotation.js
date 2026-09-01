const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

// The day rolls over at 05:00 UTC (midnight US Eastern Standard Time), so
// content resets overnight for US-based visitors instead of mid-afternoon.
const ROLLOVER_OFFSET_HOURS = 5;

export function daysSinceEpoch(date) {
  const shifted = new Date(
    date.getTime() - ROLLOVER_OFFSET_HOURS * MS_PER_HOUR,
  );
  const utcMidnight = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );
  return Math.floor(utcMidnight / MS_PER_DAY);
}

export function getTodayIndex(date, availableCount) {
  return (
    ((daysSinceEpoch(date) % availableCount) + availableCount) % availableCount
  );
}

export function puzzleDayNumber(date, launchDate) {
  return daysSinceEpoch(date) - daysSinceEpoch(launchDate) + 1;
}

export function randomIndex(availableCount, randomFn = Math.random) {
  return Math.floor(randomFn() * availableCount);
}

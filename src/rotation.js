const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysSinceEpoch(date) {
  const utcMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return Math.floor(utcMidnight / MS_PER_DAY);
}

export function getTodayIndex(date, availableCount) {
  return daysSinceEpoch(date) % availableCount;
}

export function puzzleDayNumber(date, launchDate) {
  return daysSinceEpoch(date) - daysSinceEpoch(launchDate) + 1;
}

export function randomIndex(availableCount, randomFn = Math.random) {
  return Math.floor(randomFn() * availableCount);
}

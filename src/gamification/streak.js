export function recordAnswer(streakState, today) {
  const { count, lastAnsweredDay } = streakState;

  if (lastAnsweredDay === today) {
    return { count, lastAnsweredDay };
  }

  if (lastAnsweredDay === today - 1) {
    return { count: count + 1, lastAnsweredDay: today };
  }

  return { count: 1, lastAnsweredDay: today };
}

// A stored streak only advances (or resets to 1) when an answer is actually
// recorded, so a streak from days ago would otherwise keep displaying as
// live indefinitely on a device that's gone unopened since. This derives the
// streak as of `today` without requiring a new answer: still-answerable
// (answered today or yesterday) leaves it untouched, anything older breaks
// it to 0.
export function currentStreak(streakState, today) {
  const { lastAnsweredDay } = streakState;

  if (lastAnsweredDay === null) return streakState;
  if (lastAnsweredDay === today) return streakState;
  if (lastAnsweredDay === today - 1) return streakState;

  return { count: 0, lastAnsweredDay };
}

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

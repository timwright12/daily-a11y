// src/lib/today.js
import { daysSinceEpoch, getTodayIndex } from "../rotation.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function buildTodayPayload(criteria, date, siteUrl) {
  const criterion = criteria[getTodayIndex(date, criteria.length)];
  const isoDate = new Date(daysSinceEpoch(date) * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);

  return {
    date: isoDate,
    id: criterion.id,
    name: criterion.name,
    level: criterion.level,
    principle: criterion.principle,
    explanation: criterion.explanation,
    url: siteUrl,
  };
}

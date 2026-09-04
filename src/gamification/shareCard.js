// Matches astro.config.mjs's site + base — a plain .js module has no access
// to Astro.site at runtime, so the site root is duplicated here rather than
// imported.
export const SITE_URL = "https://daily-a11y.com/";

export function buildShareText(criterion, dayNumber, checkResult) {
  const dayWord = dayNumber === 1 ? "day" : "days";
  const header = `${dayNumber} ${dayWord} in a row! Just got my daily dose of accessibility, learning about ${criterion.id} ${criterion.name}. `;

  if (checkResult === true) {
    return `${header}\nNailed it! ${SITE_URL}`;
  }
  if (checkResult === false) {
    return `${header}\nI missed it this time — back tomorrow! ${SITE_URL}`;
  }
  return `${header}${SITE_URL}`;
}

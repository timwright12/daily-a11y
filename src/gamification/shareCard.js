export function buildShareText(criterion, dayNumber, checkResult) {
  const header = `daily-a11y — Day ${dayNumber}: ${criterion.id} ${criterion.name}`;

  if (checkResult === true) {
    return `${header}\nI got it right! 🎯`;
  }
  if (checkResult === false) {
    return `${header}\nI missed it this time — back tomorrow!`;
  }
  return header;
}

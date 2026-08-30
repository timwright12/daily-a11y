export function buildShareText(criterion, dayNumber, checkResult) {
  const header = `Daily Accessibility — Day ${dayNumber}: ${criterion.id} ${criterion.name}`;

  if (checkResult === true) {
    return `${header}\nI got it right! 🎯`;
  }
  if (checkResult === false) {
    return `${header}\nI missed it this time — back tomorrow!`;
  }
  return header;
}

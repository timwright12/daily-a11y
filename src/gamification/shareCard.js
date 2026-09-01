export function buildShareText(criterion, dayNumber, checkResult) {
  const header = `${dayNumber} days in a row! Just got my daily dose of accessibility, learning about ${criterion.id} ${criterion.name}`;

  if (checkResult === true) {
    return `${header}\nNailed it!`;
  }
  if (checkResult === false) {
    return `${header}\nI missed it this time — back tomorrow!`;
  }
  return header;
}

export function buildShareText(criterion, dayNumber, checkResult) {
  const dayWord = dayNumber === 1 ? "day" : "days";
  const header = `${dayNumber} ${dayWord} in a row! Just got my daily dose of accessibility, learning about ${criterion.id} ${criterion.name}. `;

  if (checkResult === true) {
    return `${header}\nNailed it!`;
  }
  if (checkResult === false) {
    return `${header}\nI missed it this time — back tomorrow!`;
  }
  return header;
}

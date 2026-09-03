import { describe, it, expect } from "vitest";
import { buildShareText } from "../../src/gamification/shareCard.js";

describe("buildShareText", () => {
  const criterion = { id: "1.4.3", name: "Contrast (Minimum)" };

  it("includes criterion id, name, and day number with no check result", () => {
    const text = buildShareText(criterion, 42, null);
    expect(text).toContain("42 days in a row");
    expect(text).toContain("1.4.3");
    expect(text).toContain("Contrast (Minimum)");
    expect(text).not.toMatch(/correct|incorrect/i);
  });

  it("uses singular 'day' when the streak is exactly 1", () => {
    const text = buildShareText(criterion, 1, null);
    expect(text).toContain("1 day in a row");
    expect(text).not.toContain("1 days in a row");
  });

  it("includes a correct-answer note when checkResult is true", () => {
    const text = buildShareText(criterion, 42, true);
    expect(text).toMatch(/nailed it|correct/i);
  });

  it("includes an incorrect-answer note when checkResult is false", () => {
    const text = buildShareText(criterion, 42, false);
    expect(text).toMatch(/missed it|incorrect/i);
  });
});

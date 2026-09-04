import { describe, it, expect } from "vitest";
import { buildTodayPayload } from "../src/lib/today.js";
import { getTodayIndex, daysSinceEpoch } from "../src/rotation.js";

function criterion(overrides = {}) {
  return {
    id: "1.4.3",
    name: "Contrast (Minimum)",
    level: "AA",
    principle: "Perceivable",
    explanation: "Text must have enough contrast against its background.",
    whoItAffects: "Users with low vision.",
    codeExample: { lang: "css", bad: "", good: "" },
    howToTest: "Use a contrast checker.",
    check: {
      question: "What ratio is required?",
      choices: ["3:1", "4.5:1"],
      answer: 1,
    },
    references: [],
    relatedCriteria: [],
    ...overrides,
  };
}

describe("buildTodayPayload", () => {
  it("selects the same criterion getTodayIndex would pick for the given date", () => {
    const criteria = [
      criterion({ id: "1.1.1", name: "Non-text Content" }),
      criterion({ id: "1.4.3", name: "Contrast (Minimum)" }),
      criterion({ id: "2.4.9", name: "Link Purpose (Link Only)" }),
    ];
    const date = new Date("2026-09-03T12:00:00Z");
    const expectedIndex = getTodayIndex(date, criteria.length);

    const payload = buildTodayPayload(
      criteria,
      date,
      "https://daily-a11y.com/",
    );

    expect(payload.id).toBe(criteria[expectedIndex].id);
    expect(payload.name).toBe(criteria[expectedIndex].name);
  });

  it("includes the plain-language fields but omits the quiz question/answer", () => {
    const criteria = [criterion()];
    const date = new Date("2026-09-03T12:00:00Z");

    const payload = buildTodayPayload(
      criteria,
      date,
      "https://daily-a11y.com/",
    );

    expect(payload).toEqual({
      date: "2026-09-03",
      id: "1.4.3",
      name: "Contrast (Minimum)",
      level: "AA",
      principle: "Perceivable",
      explanation: "Text must have enough contrast against its background.",
      url: "https://daily-a11y.com/",
    });
    expect(payload.check).toBeUndefined();
  });

  it("formats date as the UTC-5 rollover calendar date, not raw UTC", () => {
    const criteria = [criterion()];
    // 04:59 UTC is still the previous US-Eastern day per the 05:00 rollover
    const date = new Date("2026-09-03T04:59:00Z");

    const payload = buildTodayPayload(
      criteria,
      date,
      "https://daily-a11y.com/",
    );

    expect(payload.date).toBe("2026-09-02");
  });

  it("agrees with daysSinceEpoch on which calendar day a date belongs to", () => {
    const criteria = [criterion()];
    const date = new Date("2026-09-03T12:00:00Z");
    const dayNumber = daysSinceEpoch(date);
    // Sanity-check the fixture: reconstructing the date from dayNumber should
    // round-trip to the same date string the payload reports.
    const expectedDate = new Date(dayNumber * 86400000);

    const payload = buildTodayPayload(
      criteria,
      date,
      "https://daily-a11y.com/",
    );

    expect(payload.date).toBe(expectedDate.toISOString().slice(0, 10));
  });
});

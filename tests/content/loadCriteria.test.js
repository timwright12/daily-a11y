import { describe, it, expect } from "vitest";
import { loadCriteria, sortCriteria } from "../../src/content/loadCriteria.js";

function validCriterion(overrides = {}) {
  return {
    id: "1.4.3",
    name: "Contrast (Minimum)",
    level: "AA",
    principle: "Perceivable",
    explanation: "Text must have enough contrast against its background.",
    whoItAffects: "Users with low vision or color vision deficiencies.",
    codeExample: {
      lang: "css",
      bad: "color: #999 on #fff;",
      good: "color: #595959 on #fff;",
    },
    howToTest: "Use a contrast checker on text/background color pairs.",
    check: {
      question: "What ratio is required for normal text?",
      choices: ["3:1", "4.5:1", "7:1"],
      answer: 1,
    },
    references: [],
    ...overrides,
  };
}

describe("loadCriteria", () => {
  it("returns validated criteria for all-valid input", () => {
    const result = loadCriteria([
      validCriterion(),
      validCriterion({ id: "1.1.1", name: "Non-text Content" }),
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1.4.3");
    expect(result[1].id).toBe("1.1.1");
  });

  it("throws a descriptive error identifying the invalid entry", () => {
    const bad = validCriterion({ id: "garbage" });
    expect(() => loadCriteria([validCriterion(), bad])).toThrow(/garbage/);
  });

  it("throws when given an empty array", () => {
    expect(() => loadCriteria([])).toThrow(/no criteria/i);
  });
});

describe("sortCriteria", () => {
  it("sorts criteria by id using numeric comparison", () => {
    const unsorted = [
      { id: "1.10.1", name: "Ten" },
      { id: "1.2.1", name: "Two" },
      { id: "1.1.1", name: "One" },
    ];
    const sorted = sortCriteria(unsorted);
    expect(sorted.map((c) => c.id)).toEqual(["1.1.1", "1.2.1", "1.10.1"]);
  });

  it("does not mutate the input array", () => {
    const unsorted = [{ id: "1.2.1" }, { id: "1.1.1" }];
    const original = [...unsorted];
    sortCriteria(unsorted);
    expect(unsorted).toEqual(original);
  });
});

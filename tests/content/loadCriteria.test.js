import { describe, it, expect } from "vitest";
import {
  loadCriteria,
  sortCriteria,
  assertRelatedCriteriaExist,
} from "../../src/content/loadCriteria.js";

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
    relatedCriteria: [],
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

  it("accepts relatedCriteria ids that reference other loaded criteria", () => {
    const result = loadCriteria([
      validCriterion({ relatedCriteria: ["1.1.1"] }),
      validCriterion({ id: "1.1.1", name: "Non-text Content" }),
    ]);
    expect(result[0].relatedCriteria).toEqual(["1.1.1"]);
  });

  it("throws a descriptive error when relatedCriteria references a nonexistent criterion", () => {
    const bad = validCriterion({ relatedCriteria: ["9.9.9"] });
    expect(() => loadCriteria([bad])).toThrow(/9\.9\.9/);
  });
});

describe("assertRelatedCriteriaExist", () => {
  it("does not throw when every relatedCriteria id is present in the set", () => {
    const criteria = [
      validCriterion({ relatedCriteria: ["1.1.1"] }),
      validCriterion({ id: "1.1.1", name: "Non-text Content" }),
    ];
    expect(() => assertRelatedCriteriaExist(criteria)).not.toThrow();
  });

  it("throws a descriptive error when a relatedCriteria id has no matching criterion", () => {
    const criteria = [validCriterion({ relatedCriteria: ["9.9.9"] })];
    expect(() => assertRelatedCriteriaExist(criteria)).toThrow(/9\.9\.9/);
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

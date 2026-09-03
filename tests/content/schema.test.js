import { describe, it, expect } from "vitest";
import { criterionSchema } from "../../src/content/criterionSchema.js";

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

describe("criterionSchema", () => {
  it("accepts a fully valid criterion", () => {
    expect(() => criterionSchema.parse(validCriterion())).not.toThrow();
  });

  it("defaults references to an empty array when omitted", () => {
    const input = validCriterion();
    delete input.references;
    const parsed = criterionSchema.parse(input);
    expect(parsed.references).toEqual([]);
  });

  it("rejects an id that does not match the SC number pattern", () => {
    expect(() =>
      criterionSchema.parse(validCriterion({ id: "not-an-id" })),
    ).toThrow();
  });

  it("rejects a level outside A/AA/AAA", () => {
    expect(() =>
      criterionSchema.parse(validCriterion({ level: "B" })),
    ).toThrow();
  });

  it("rejects a principle outside the four WCAG principles", () => {
    expect(() =>
      criterionSchema.parse(validCriterion({ principle: "Nonsense" })),
    ).toThrow();
  });

  it("rejects fewer than 2 answer choices", () => {
    expect(() =>
      criterionSchema.parse(
        validCriterion({
          check: { question: "Q?", choices: ["only one"], answer: 0 },
        }),
      ),
    ).toThrow();
  });

  it("rejects an answer index out of range for the given choices", () => {
    expect(() =>
      criterionSchema.parse(
        validCriterion({
          check: { question: "Q?", choices: ["a", "b"], answer: 5 },
        }),
      ),
    ).toThrow();
  });

  it("rejects a missing required field (explanation)", () => {
    const input = validCriterion();
    delete input.explanation;
    expect(() => criterionSchema.parse(input)).toThrow();
  });

  it("defaults relatedCriteria to an empty array when omitted", () => {
    const input = validCriterion();
    delete input.relatedCriteria;
    const parsed = criterionSchema.parse(input);
    expect(parsed.relatedCriteria).toEqual([]);
  });

  it("accepts relatedCriteria ids that match the SC number pattern", () => {
    const parsed = criterionSchema.parse(
      validCriterion({ relatedCriteria: ["1.4.6", "2.4.7"] }),
    );
    expect(parsed.relatedCriteria).toEqual(["1.4.6", "2.4.7"]);
  });

  it("rejects a relatedCriteria entry that does not match the SC number pattern", () => {
    expect(() =>
      criterionSchema.parse(validCriterion({ relatedCriteria: ["not-an-id"] })),
    ).toThrow();
  });
});

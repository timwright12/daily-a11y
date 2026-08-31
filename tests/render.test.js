import { describe, it, expect, beforeEach } from "vitest";
import { renderCriterionContent } from "../src/render.js";

const sampleCriterion = {
  id: "1.1.1",
  name: "Non-text Content",
  level: "A",
  principle: "Perceivable",
  explanation: "Explanation text.",
  whoItAffects: "Who it affects text.",
  codeExample: { lang: "html", bad: "<img>", good: '<img alt="">' },
  howToTest: "How to test text.",
  check: {
    question: "Sample question?",
    choices: ["Choice A", "Choice B"],
    answer: 1,
  },
  references: [],
};

describe("renderCriterionContent (jsdom smoke test)", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("renders the criterion id into the container", () => {
    renderCriterionContent(container, sampleCriterion);
    expect(container.querySelector("#criterion-id").textContent).toBe("1.1.1");
  });
});

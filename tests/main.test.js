import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderCriterionContent, wireCheckFeedback } from "../src/render.js";

// This test exercises the same integration pattern main.js uses: render,
// wire feedback with an onAnswered callback, and confirm the callback fires
// with the correct boolean without main.js needing its own correctness check.
describe("main.js check-answer integration (via wireCheckFeedback)", () => {
  let container;
  const criterion = {
    id: "1.1.1",
    name: "Non-text Content",
    level: "A",
    principle: "Perceivable",
    explanation: "x",
    whoItAffects: "x",
    codeExample: { lang: "html", bad: "<img>", good: '<img alt="">' },
    howToTest: "x",
    check: { question: "Q?", choices: ["A", "B"], answer: 1 },
    references: [],
  };

  beforeEach(() => {
    container = document.createElement("div");
    renderCriterionContent(container, criterion);
  });

  it("invokes onAnswered with true and lets the caller drive gamification without re-deriving correctness", () => {
    const recordAnswerSpy = vi.fn();
    wireCheckFeedback(container, criterion, {
      onAnswered: (isCorrect) => {
        if (isCorrect) recordAnswerSpy();
      },
    });

    const radios = container.querySelectorAll('input[type="radio"]');
    radios[1].checked = true;
    container
      .querySelector("#check-form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(recordAnswerSpy).toHaveBeenCalledOnce();
    expect(container.querySelector("#check-result").textContent).toBe(
      "Correct!",
    );
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import {
  renderCriterionContent,
  wireCheckFeedback,
  renderAnsweredState,
  renderMasthead,
} from "../src/render.js";

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
    choices: ["Choice A", "Choice B", "Choice C"],
    answer: 1,
  },
  references: [],
};

describe("renderCriterionContent", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("renders the criterion id, name, level, and principle", () => {
    renderCriterionContent(container, sampleCriterion);
    expect(container.querySelector("#criterion-id").textContent).toBe("1.1.1");
    expect(container.querySelector("#criterion-name").textContent).toBe(
      "Non-text Content",
    );
    expect(container.querySelector("#level-badge").textContent).toBe("Level A");
    expect(container.querySelector("#principle-badge").textContent).toBe(
      "Perceivable",
    );
  });

  it("renders explanation, who-it-affects, and how-to-test text", () => {
    renderCriterionContent(container, sampleCriterion);
    expect(container.querySelector("#explanation").textContent).toBe(
      "Explanation text.",
    );
    expect(container.querySelector("#who-it-affects").textContent).toBe(
      "Who it affects text.",
    );
    expect(container.querySelector("#how-to-test").textContent).toBe(
      "How to test text.",
    );
  });

  it("renders bad and good code examples with language class for Prism", () => {
    renderCriterionContent(container, sampleCriterion);
    const codeBad = container.querySelector("#code-bad");
    const codeGood = container.querySelector("#code-good");
    expect(codeBad.textContent).toBe("<img>");
    expect(codeGood.textContent).toBe('<img alt="">');
    expect(codeBad.className).toContain("language-html");
    expect(codeGood.className).toContain("language-html");
  });

  it("renders one labelled radio input per check choice", () => {
    renderCriterionContent(container, sampleCriterion);
    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios).toHaveLength(3);
    radios.forEach((radio, index) => {
      const label = container.querySelector(`label[for="${radio.id}"]`);
      expect(label.textContent).toBe(sampleCriterion.check.choices[index]);
    });
    expect(container.querySelector("#check-question").textContent).toBe(
      "Sample question?",
    );
  });

  it("does not show the already-answered message by default", () => {
    renderCriterionContent(container, sampleCriterion);
    expect(container.querySelector("#check-already-answered").hidden).toBe(
      true,
    );
  });

  it("replaces prior content when called again with a different criterion", () => {
    renderCriterionContent(container, sampleCriterion);
    const otherCriterion = {
      ...sampleCriterion,
      id: "1.4.3",
      name: "Contrast",
    };
    renderCriterionContent(container, otherCriterion);
    expect(container.querySelector("#criterion-id").textContent).toBe("1.4.3");
    expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(3);
  });
});

describe("wireCheckFeedback", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    renderCriterionContent(container, sampleCriterion);
  });

  function selectChoice(container, index) {
    const radio = container.querySelectorAll('input[type="radio"]')[index];
    radio.checked = true;
    return radio;
  }

  function submitForm(container) {
    const form = container.querySelector("#check-form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  }

  it("shows 'Correct!' when the selected choice matches the answer index", () => {
    wireCheckFeedback(container, sampleCriterion);
    selectChoice(container, sampleCriterion.check.answer);
    submitForm(container);
    expect(container.querySelector("#check-result").textContent).toBe(
      "Correct!",
    );
  });

  it("shows the review message when the selected choice does not match", () => {
    wireCheckFeedback(container, sampleCriterion);
    selectChoice(container, 0);
    submitForm(container);
    expect(container.querySelector("#check-result").textContent).toBe(
      "Not quite — review the explanation above.",
    );
  });

  it("does nothing when no choice is selected", () => {
    wireCheckFeedback(container, sampleCriterion);
    submitForm(container);
    expect(container.querySelector("#check-result").textContent).toBe("");
  });

  it("calls the optional onAnswered callback with the correctness result", () => {
    const onAnswered = [];
    wireCheckFeedback(container, sampleCriterion, {
      onAnswered: (isCorrect) => onAnswered.push(isCorrect),
    });
    selectChoice(container, sampleCriterion.check.answer);
    submitForm(container);
    expect(onAnswered).toEqual([true]);
  });

  it("calls onAnswered with the selected choice index as the second argument", () => {
    const calls = [];
    wireCheckFeedback(container, sampleCriterion, {
      onAnswered: (isCorrect, choice) => calls.push([isCorrect, choice]),
    });
    selectChoice(container, 2);
    submitForm(container);
    expect(calls).toEqual([[false, 2]]);
  });

  it("does not call onAnswered when no choice is selected", () => {
    const onAnswered = [];
    wireCheckFeedback(container, sampleCriterion, {
      onAnswered: (isCorrect) => onAnswered.push(isCorrect),
    });
    submitForm(container);
    expect(onAnswered).toEqual([]);
  });
});

describe("renderAnsweredState", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    renderCriterionContent(container, sampleCriterion);
  });

  it("shows a message above the form indicating today's check was already answered", () => {
    renderAnsweredState(container, sampleCriterion, {
      choice: 1,
      correct: true,
    });
    expect(container.querySelector("#check-already-answered")).not.toBeNull();
    expect(
      container.querySelector("#check-already-answered").textContent,
    ).toMatch(/already answered/i);
  });

  it("pre-checks the radio matching the persisted choice", () => {
    renderAnsweredState(container, sampleCriterion, {
      choice: 2,
      correct: false,
    });
    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios[2].checked).toBe(true);
    expect(radios[0].checked).toBe(false);
    expect(radios[1].checked).toBe(false);
  });

  it("disables all radio inputs and the submit button", () => {
    renderAnsweredState(container, sampleCriterion, {
      choice: 0,
      correct: false,
    });
    const radios = container.querySelectorAll('input[type="radio"]');
    radios.forEach((radio) => expect(radio.disabled).toBe(true));
    expect(container.querySelector('button[type="submit"]').disabled).toBe(
      true,
    );
  });

  it("shows the correct/incorrect result text matching the persisted outcome", () => {
    renderAnsweredState(container, sampleCriterion, {
      choice: 1,
      correct: true,
    });
    expect(container.querySelector("#check-result").textContent).toBe(
      "Correct!",
    );
  });

  it("shows the review message when the persisted outcome was incorrect", () => {
    renderAnsweredState(container, sampleCriterion, {
      choice: 0,
      correct: false,
    });
    expect(container.querySelector("#check-result").textContent).toBe(
      "Not quite — review the explanation above.",
    );
  });
});

describe("renderMasthead", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("renders the masthead mark and a gamification-status placeholder when no label is given", () => {
    renderMasthead(container);
    expect(container.querySelector(".masthead-mark").textContent).toBe(
      "Daily Accessibility",
    );
    expect(container.querySelector("#gamification-status")).not.toBeNull();
    expect(container.querySelector(".admin-label")).toBeNull();
  });

  it("renders a static admin-label span when a label string is given", () => {
    renderMasthead(container, "Browse criteria");
    expect(container.querySelector(".admin-label").textContent).toBe(
      "Browse criteria",
    );
    expect(container.querySelector("#gamification-status")).toBeNull();
  });
});

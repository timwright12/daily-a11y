import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderCriterionContent, wireCheckFeedback } from "../src/render.js";

function makeMemoryLocalStorage() {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

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

// main.js runs its setup at module load time (reads #app from the DOM,
// reads/writes localStorage), so each test sets up a fresh #app element and
// dynamically imports the module fresh via vi.resetModules() to re-run its
// top-level bootstrap — same pattern as tests/admin.test.js.
describe("main.js bootstrap (real module)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.stubGlobal("localStorage", makeMemoryLocalStorage());
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("renders today's criterion and an initial gamification status line", async () => {
    vi.resetModules();
    await import("../src/main.js");

    expect(document.querySelector("#criterion-id").textContent).not.toBe("");
    expect(document.querySelector("#gamification-status").textContent).toMatch(
      /^Streak: 0 days — 1 of \d+ criteria seen$/,
    );
  });

  it("persists coverage for today's criterion to localStorage on load", async () => {
    vi.resetModules();
    await import("../src/main.js");

    const stored = JSON.parse(localStorage.getItem("daily-a11y-state"));
    const shownId = document.querySelector("#criterion-id").textContent;
    expect(stored.coverage).toContain(shownId);
  });

  it("records a streak and updates the status line when a correct answer is submitted", async () => {
    vi.resetModules();
    await import("../src/main.js");

    // recordAnswer (and the status re-render) fires on any submitted
    // choice, correct or not — main.js's onAnswered runs unconditionally.
    // So submitting choice 0 exercises the wiring without needing to know
    // today's actual correct answer.
    const radios = document.querySelectorAll('input[type="radio"]');
    radios[0].checked = true;
    document
      .getElementById("check-form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(document.querySelector("#gamification-status").textContent).toMatch(
      /^Streak: 1 day —/,
    );

    const stored = JSON.parse(localStorage.getItem("daily-a11y-state"));
    expect(stored.streak.count).toBe(1);
  });

  it("copies today's result to the clipboard when the share button is clicked", async () => {
    vi.resetModules();
    await import("../src/main.js");

    document.getElementById("share-button").click();
    await Promise.resolve();

    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
    expect(document.querySelector("#share-status").textContent).toBe(
      "Copied to clipboard!",
    );
  });

  it("persists the selected choice and criterion id as lastAnswer on submit", async () => {
    vi.resetModules();
    await import("../src/main.js");

    const todayId = document.querySelector("#criterion-id").textContent;
    const radios = document.querySelectorAll('input[type="radio"]');
    radios[0].checked = true;
    document
      .getElementById("check-form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    const stored = JSON.parse(localStorage.getItem("daily-a11y-state"));
    expect(stored.lastAnswer).toMatchObject({
      criterionId: todayId,
      choice: 0,
    });
    expect(typeof stored.lastAnswer.day).toBe("number");
    expect(typeof stored.lastAnswer.correct).toBe("boolean");
  });

  it("restores the already-answered state on reload for today's criterion", async () => {
    // First load: submit an answer, which persists lastAnswer with the
    // real today-day-number and today's actual criterion id.
    vi.resetModules();
    await import("../src/main.js");
    const radios = document.querySelectorAll('input[type="radio"]');
    radios[0].checked = true;
    document
      .getElementById("check-form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    // Simulate a page reload with the same localStorage state.
    document.body.innerHTML = '<div id="app"></div>';
    vi.resetModules();
    await import("../src/main.js");

    expect(document.querySelector("#check-already-answered").hidden).toBe(
      false,
    );
    const reloadedRadios = document.querySelectorAll('input[type="radio"]');
    expect(reloadedRadios[0].checked).toBe(true);
    reloadedRadios.forEach((radio) => expect(radio.disabled).toBe(true));
  });
});

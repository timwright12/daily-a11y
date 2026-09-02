import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import CriterionApp from "../../src/components/CriterionApp.jsx";

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

const criteria = [
  {
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
  },
];

// Roots created by serverRenderThenHydrate(), unmounted and detached after
// each test so a hydrated tree from one test can't leak into the next
// test's DOM queries (e.g. a duplicate "Non-text Content" heading).
let hydratedRoots = [];

afterEach(async () => {
  for (const { root, container } of hydratedRoots) {
    await act(async () => root.unmount());
    container.remove();
  }
  hydratedRoots = [];
});

// Astro prerenders client:load islands on the server (no localStorage there),
// then hydrates the same markup in the browser. If a component reads
// browser-only or nondeterministic state (localStorage, Math.random())
// synchronously during its first render instead of in a useEffect, the
// client's first render disagrees with the server-rendered HTML it's
// hydrating onto — a real hydration mismatch (React error #418), not just a
// static-render check. This replicates that exact two-phase render — with
// localStorage genuinely absent for the server phase, as it is in real
// Astro SSR — so the mismatch (if any) actually reproduces.
async function serverRenderThenHydrate(element) {
  const clientLocalStorage = globalThis.localStorage;
  // storage.js branches on `typeof localStorage === "undefined"`; a stubbed
  // globalThis.localStorage makes that check pass even after `delete`, so
  // fully unstub it for the server-render phase.
  vi.unstubAllGlobals();

  const html = renderToString(element);

  vi.stubGlobal("localStorage", clientLocalStorage);
  vi.stubGlobal("navigator", {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  const recoverableErrors = [];
  let root;
  await act(async () => {
    root = hydrateRoot(container, element, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    });
  });

  hydratedRoots.push({ root, container });
  return { container, recoverableErrors };
}

describe("CriterionApp today mode", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", makeMemoryLocalStorage());
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders today's criterion and an initial gamification status line", () => {
    render(<CriterionApp mode="today" criteria={criteria} />);
    expect(
      screen.getByRole("heading", { name: "Non-text Content" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^Streak: 0 days — 1 of 1 criteria seen$/),
    ).toBeInTheDocument();
  });

  it("renders the criterion's explanation, who-it-affects, and how-to-test text", () => {
    render(<CriterionApp mode="today" criteria={criteria} />);
    expect(
      screen.getByText(criteria[0].explanation, {
        selector: "#explanation-heading + p",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(criteria[0].whoItAffects, {
        selector: "#who-heading + p",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(criteria[0].howToTest, {
        selector: "#test-heading + p",
      }),
    ).toBeInTheDocument();
  });

  it("persists coverage for today's criterion to localStorage on mount", () => {
    render(<CriterionApp mode="today" criteria={criteria} />);
    const stored = JSON.parse(localStorage.getItem("daily-a11y-state"));
    expect(stored.coverage).toContain("1.1.1");
  });

  it("records a streak and updates the status line when an answer is submitted", () => {
    render(<CriterionApp mode="today" criteria={criteria} />);
    fireEvent.click(screen.getByLabelText("A"));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    expect(screen.getByText(/^Streak: 1 day —/)).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem("daily-a11y-state"));
    expect(stored.streak.count).toBe(1);
  });

  it("persists the selected choice and criterion id as lastAnswer on submit", () => {
    render(<CriterionApp mode="today" criteria={criteria} />);
    fireEvent.click(screen.getByLabelText("A"));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const stored = JSON.parse(localStorage.getItem("daily-a11y-state"));
    expect(stored.lastAnswer).toMatchObject({
      criterionId: "1.1.1",
      choice: 0,
    });
    expect(typeof stored.lastAnswer.day).toBe("number");
    expect(typeof stored.lastAnswer.correct).toBe("boolean");
  });

  it("restores already-answered state on remount for today's criterion", () => {
    const { unmount } = render(
      <CriterionApp mode="today" criteria={criteria} />,
    );
    fireEvent.click(screen.getByLabelText("A"));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    unmount();

    render(<CriterionApp mode="today" criteria={criteria} />);
    expect(
      screen.getByText(/already answered today's knowledge check/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("A")).toBeChecked();
  });

  it("copies today's result to the clipboard when the share button is clicked", async () => {
    render(<CriterionApp mode="today" criteria={criteria} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Copy today's result" }),
    );
    await Promise.resolve();

    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
    expect(await screen.findByText("Copied to clipboard!")).toBeInTheDocument();
  });

  it("hydrates cleanly against server-rendered markup when localStorage already holds an answered state", async () => {
    // Seed localStorage as if a previous visit already answered today's
    // criterion — this is exactly the state a real reload would have, and is
    // what the server (which has no localStorage) cannot know about.
    localStorage.setItem(
      "daily-a11y-state",
      JSON.stringify({
        streak: { count: 1, lastAnsweredDay: 0 },
        coverage: ["1.1.1"],
        lastAnswer: {
          day: Math.floor(Date.now() / 86400000),
          criterionId: "1.1.1",
          choice: 1,
          correct: true,
        },
      }),
    );

    const element = <CriterionApp mode="today" criteria={criteria} />;
    const { container, recoverableErrors } =
      await serverRenderThenHydrate(element);

    expect(recoverableErrors).toEqual([]);
    expect(container.textContent).toMatch(/already answered/i);
  });
});

describe("CriterionApp random mode", () => {
  it("renders a criterion and a reroll link, with no gamification status", () => {
    render(<CriterionApp mode="random" criteria={criteria} />);
    expect(
      screen.getByRole("heading", { name: "Non-text Content" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Show me another" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Streak:/)).not.toBeInTheDocument();
  });

  it("hydrates cleanly even when the server and client would otherwise roll different random picks", async () => {
    // A single-criterion fixture can't expose a random-index mismatch —
    // Math.floor(Math.random() * 1) is always 0. Two criteria plus a
    // Math.random mock that returns a different value per call forces the
    // server render and the client's first render to want different
    // criteria, which is exactly the scenario that must not reach the DOM
    // as a hydration mismatch.
    const twoCriteria = [
      criteria[0],
      { ...criteria[0], id: "1.1.2", name: "Second Criterion" },
    ];
    const randomValues = [0.1, 0.9];
    let call = 0;
    vi.spyOn(Math, "random").mockImplementation(
      () => randomValues[call++ % randomValues.length],
    );

    const element = <CriterionApp mode="random" criteria={twoCriteria} />;
    const { recoverableErrors } = await serverRenderThenHydrate(element);

    Math.random.mockRestore();
    expect(recoverableErrors).toEqual([]);
  });
});

describe("CriterionApp browse mode", () => {
  it("shows the placeholder until a criterion is selected", () => {
    render(<CriterionApp mode="browse" criteria={criteria} />);
    expect(
      screen.getByText("Select a criterion from the list to preview it."),
    ).toBeInTheDocument();
  });

  it("renders the selected criterion and marks it active in the list on click", () => {
    render(<CriterionApp mode="browse" criteria={criteria} />);
    fireEvent.click(screen.getByRole("button", { name: /1\.1\.1/ }));

    expect(
      screen.getByRole("heading", { name: "Non-text Content" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1\.1\.1/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});

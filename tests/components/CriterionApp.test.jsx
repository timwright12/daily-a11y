import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

// tests/components/BrowseList.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BrowseList from "../../src/components/BrowseList.jsx";

const criteria = [
  {
    id: "1.1.1",
    name: "Non-text Content",
    level: "A",
    principle: "Perceivable",
  },
  {
    id: "1.2.1",
    name: "Audio-only and Video-only",
    level: "A",
    principle: "Perceivable",
  },
];

const noopFilters = {
  query: "",
  level: "",
  principle: "",
  seenState: "",
};

function noopHandlers() {
  return {
    onQueryChange: vi.fn(),
    onLevelChange: vi.fn(),
    onPrincipleChange: vi.fn(),
    onSeenStateChange: vi.fn(),
  };
}

describe("BrowseList", () => {
  it("renders a list item with id and name for each criterion", () => {
    render(
      <BrowseList
        criteria={criteria}
        activeCriterionId={null}
        filters={noopFilters}
        {...noopHandlers()}
      />,
    );
    expect(screen.getByText("1.1.1")).toBeInTheDocument();
    expect(screen.getByText("Non-text Content")).toBeInTheDocument();
    expect(screen.getByText("1.2.1")).toBeInTheDocument();
  });

  it("renders each criterion as a link to its hash fragment", () => {
    render(
      <BrowseList
        criteria={criteria}
        activeCriterionId={null}
        filters={noopFilters}
        {...noopHandlers()}
      />,
    );
    expect(screen.getByRole("link", { name: /1\.1\.1/ })).toHaveAttribute(
      "href",
      "#1.1.1",
    );
    expect(screen.getByRole("link", { name: /1\.2\.1/ })).toHaveAttribute(
      "href",
      "#1.2.1",
    );
  });

  it("marks the active criterion's link with aria-current and is-active", () => {
    render(
      <BrowseList
        criteria={criteria}
        activeCriterionId="1.1.1"
        filters={noopFilters}
        {...noopHandlers()}
      />,
    );
    const activeLink = screen.getByRole("link", { name: /1\.1\.1/ });
    const inactiveLink = screen.getByRole("link", { name: /1\.2\.1/ });
    expect(activeLink).toHaveAttribute("aria-current", "true");
    expect(activeLink.className).toContain("is-active");
    expect(inactiveLink).not.toHaveAttribute("aria-current");
    expect(inactiveLink.className).not.toContain("is-active");
  });

  it("renders a labeled search field for filtering by text", () => {
    render(
      <BrowseList
        criteria={criteria}
        activeCriterionId={null}
        filters={noopFilters}
        {...noopHandlers()}
      />,
    );
    expect(
      screen.getByRole("searchbox", { name: /search criteria/i }),
    ).toBeInTheDocument();
  });

  it("calls onQueryChange when the user types in the search field", () => {
    const handlers = noopHandlers();
    render(
      <BrowseList
        criteria={criteria}
        activeCriterionId={null}
        filters={noopFilters}
        {...handlers}
      />,
    );
    fireEvent.change(
      screen.getByRole("searchbox", { name: /search criteria/i }),
      { target: { value: "contrast" } },
    );
    expect(handlers.onQueryChange).toHaveBeenCalledWith("contrast");
  });

  it("renders labeled selects for level, principle, and seen state", () => {
    render(
      <BrowseList
        criteria={criteria}
        activeCriterionId={null}
        filters={noopFilters}
        {...noopHandlers()}
      />,
    );
    expect(
      screen.getByRole("combobox", { name: /level/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /principle/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /seen/i })).toBeInTheDocument();
  });

  it("calls onLevelChange when the level select changes", () => {
    const handlers = noopHandlers();
    render(
      <BrowseList
        criteria={criteria}
        activeCriterionId={null}
        filters={noopFilters}
        {...handlers}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: /level/i }), {
      target: { value: "AA" },
    });
    expect(handlers.onLevelChange).toHaveBeenCalledWith("AA");
  });

  it("shows a no-results message when criteria is empty", () => {
    render(
      <BrowseList
        criteria={[]}
        activeCriterionId={null}
        filters={{ ...noopFilters, query: "zzz" }}
        {...noopHandlers()}
      />,
    );
    expect(screen.getByText(/no criteria match/i)).toBeInTheDocument();
  });
});

// tests/components/BrowseList.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BrowseList from "../../src/components/BrowseList.jsx";

const criteria = [
  { id: "1.1.1", name: "Non-text Content" },
  { id: "1.2.1", name: "Audio-only and Video-only" },
];

describe("BrowseList", () => {
  it("renders a list item with id and name for each criterion", () => {
    render(
      <BrowseList
        criteria={criteria}
        activeCriterionId={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("1.1.1")).toBeInTheDocument();
    expect(screen.getByText("Non-text Content")).toBeInTheDocument();
    expect(screen.getByText("1.2.1")).toBeInTheDocument();
  });

  it("calls onSelect with the clicked criterion", () => {
    const onSelect = vi.fn();
    render(
      <BrowseList
        criteria={criteria}
        activeCriterionId={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /1\.2\.1/ }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(criteria[1]);
  });

  it("marks the active criterion's button with aria-current and is-active", () => {
    render(
      <BrowseList
        criteria={criteria}
        activeCriterionId="1.1.1"
        onSelect={vi.fn()}
      />,
    );
    const activeButton = screen.getByRole("button", { name: /1\.1\.1/ });
    const inactiveButton = screen.getByRole("button", { name: /1\.2\.1/ });
    expect(activeButton).toHaveAttribute("aria-current", "true");
    expect(activeButton.className).toContain("is-active");
    expect(inactiveButton).not.toHaveAttribute("aria-current");
    expect(inactiveButton.className).not.toContain("is-active");
  });
});

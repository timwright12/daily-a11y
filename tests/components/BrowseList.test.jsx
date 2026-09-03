// tests/components/BrowseList.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BrowseList from "../../src/components/BrowseList.jsx";

const criteria = [
  { id: "1.1.1", name: "Non-text Content" },
  { id: "1.2.1", name: "Audio-only and Video-only" },
];

describe("BrowseList", () => {
  it("renders a list item with id and name for each criterion", () => {
    render(<BrowseList criteria={criteria} activeCriterionId={null} />);
    expect(screen.getByText("1.1.1")).toBeInTheDocument();
    expect(screen.getByText("Non-text Content")).toBeInTheDocument();
    expect(screen.getByText("1.2.1")).toBeInTheDocument();
  });

  it("renders each criterion as a link to its hash fragment", () => {
    render(<BrowseList criteria={criteria} activeCriterionId={null} />);
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
    render(<BrowseList criteria={criteria} activeCriterionId="1.1.1" />);
    const activeLink = screen.getByRole("link", { name: /1\.1\.1/ });
    const inactiveLink = screen.getByRole("link", { name: /1\.2\.1/ });
    expect(activeLink).toHaveAttribute("aria-current", "true");
    expect(activeLink.className).toContain("is-active");
    expect(inactiveLink).not.toHaveAttribute("aria-current");
    expect(inactiveLink.className).not.toContain("is-active");
  });
});

// tests/components/Hero.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "../../src/components/Hero.jsx";

const criterion = {
  id: "1.1.1",
  name: "Non-text Content",
  level: "A",
  principle: "Perceivable",
};

describe("Hero", () => {
  it("renders the criterion id, name, level, and principle", () => {
    render(<Hero criterion={criterion} />);
    expect(screen.getByText("1.1.1")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Non-text Content" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Level A")).toBeInTheDocument();
    expect(screen.getByText("Perceivable")).toBeInTheDocument();
  });
});

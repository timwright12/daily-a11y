// tests/components/CodeSpread.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CodeSpread from "../../src/components/CodeSpread.jsx";

const codeExample = {
  lang: "html",
  bad: "<img>",
  good: '<img alt="">',
};

describe("CodeSpread", () => {
  it("renders both the bad and good code examples", () => {
    const { container } = render(<CodeSpread codeExample={codeExample} />);
    expect(screen.getByText("Bad")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();

    // Prism highlighting wraps the code text in nested <span class="token ...">
    // elements, so the plain-text strings are split across multiple text
    // nodes. getByText only matches a node's direct text-node children, so
    // we assert against .textContent (which recurses through descendants)
    // instead — matching the precedent in the old tests/render.test.js.
    const [badCode, goodCode] = container.querySelectorAll("code");
    expect(badCode.textContent).toBe("<img>");
    expect(goodCode.textContent).toBe('<img alt="">');
  });
});

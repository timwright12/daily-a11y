import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ComprehensionCheck from "../../src/components/ComprehensionCheck.jsx";

const criterion = {
  id: "1.1.1",
  check: {
    question: "Sample question?",
    choices: ["Choice A", "Choice B", "Choice C"],
    answer: 1,
  },
};

describe("ComprehensionCheck", () => {
  it("renders the question and all choices as radio inputs", () => {
    render(<ComprehensionCheck criterion={criterion} />);
    expect(screen.getByText("Sample question?")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByLabelText("Choice A")).toBeInTheDocument();
    expect(screen.getByLabelText("Choice B")).toBeInTheDocument();
    expect(screen.getByLabelText("Choice C")).toBeInTheDocument();
  });

  it("shows 'Correct!' when the selected choice matches the answer index", () => {
    render(<ComprehensionCheck criterion={criterion} />);
    fireEvent.click(screen.getByLabelText("Choice B"));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(screen.getByRole("status")).toHaveTextContent("Correct!");
  });

  it("offers links to a random criterion and the full list when correct", () => {
    render(<ComprehensionCheck criterion={criterion} />);
    fireEvent.click(screen.getByLabelText("Choice B"));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    const randomLink = screen.getByRole("link", {
      name: /test yourself with a random criterion/i,
    });
    const browseLink = screen.getByRole("link", {
      name: /browse the full list/i,
    });
    expect(randomLink).toHaveAttribute("href", "/random/");
    expect(browseLink).toHaveAttribute("href", "/browse/");
  });

  it("shows the review message when the selected choice does not match", () => {
    render(<ComprehensionCheck criterion={criterion} />);
    fireEvent.click(screen.getByLabelText("Choice A"));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Not quite — review the explanation above.",
    );
  });

  it("does not offer the random/browse links when the answer is incorrect", () => {
    render(<ComprehensionCheck criterion={criterion} />);
    fireEvent.click(screen.getByLabelText("Choice A"));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does nothing when submitted with no choice selected", () => {
    render(<ComprehensionCheck criterion={criterion} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("calls onAnswered with correctness and choice index on submit", () => {
    const onAnswered = vi.fn();
    render(
      <ComprehensionCheck criterion={criterion} onAnswered={onAnswered} />,
    );
    fireEvent.click(screen.getByLabelText("Choice C"));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(onAnswered).toHaveBeenCalledExactlyOnceWith(false, 2);
  });

  it("does not call onAnswered when no choice is selected", () => {
    const onAnswered = vi.fn();
    render(
      <ComprehensionCheck criterion={criterion} onAnswered={onAnswered} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(onAnswered).not.toHaveBeenCalled();
  });
});

describe("ComprehensionCheck with initialAnswer", () => {
  it("shows the already-answered banner and pre-selects the persisted choice", () => {
    render(
      <ComprehensionCheck
        criterion={criterion}
        initialAnswer={{ choice: 2, correct: false }}
      />,
    );
    expect(
      screen.getByText(/already answered today's knowledge check/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Choice C")).toBeChecked();
    expect(screen.getByLabelText("Choice A")).not.toBeChecked();
  });

  it("shows the persisted result text and links", () => {
    render(
      <ComprehensionCheck
        criterion={criterion}
        initialAnswer={{ choice: 1, correct: true }}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Correct!");
    expect(
      screen.getByRole("link", {
        name: /test yourself with a random criterion/i,
      }),
    ).toBeInTheDocument();
  });

  it("leaves radios and submit enabled so the user can re-answer", () => {
    render(
      <ComprehensionCheck
        criterion={criterion}
        initialAnswer={{ choice: 0, correct: false }}
      />,
    );
    screen
      .getAllByRole("radio")
      .forEach((radio) => expect(radio).toBeEnabled());
    expect(screen.getByRole("button", { name: "Submit answer" })).toBeEnabled();
  });
});

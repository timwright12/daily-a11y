// tests/components/ShareBar.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ShareBar from "../../src/components/ShareBar.jsx";

describe("ShareBar", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("copies the given share text to the clipboard when clicked", async () => {
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Copy today's result" }),
    );
    await Promise.resolve();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "Day 5! Learned about 1.1.1",
    );
    expect(await screen.findByText("Copied to clipboard!")).toBeInTheDocument();
  });

  it("falls back to showing the share text directly if clipboard write fails", async () => {
    navigator.clipboard.writeText = vi
      .fn()
      .mockRejectedValue(new Error("nope"));
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Copy today's result" }),
    );

    expect(
      await screen.findByText("Day 5! Learned about 1.1.1"),
    ).toBeInTheDocument();
  });
});

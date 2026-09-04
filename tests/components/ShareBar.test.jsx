// tests/components/ShareBar.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ShareBar from "../../src/components/ShareBar.jsx";

describe("ShareBar", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    vi.stubGlobal("open", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a collapsed 'Share my progress' trigger", () => {
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    const trigger = screen.getByRole("button", { name: "Share my progress" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("expands the share menu when the trigger is clicked", () => {
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    const trigger = screen.getByRole("button", { name: "Share my progress" });

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: /share on x/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /share on linkedin/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /copy today's result/i }),
    ).toBeInTheDocument();
  });

  it("collapses the menu when the trigger is clicked again", () => {
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    const trigger = screen.getByRole("button", { name: "Share my progress" });

    fireEvent.click(trigger);
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("collapses the menu and returns focus to the trigger on Escape", () => {
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    const trigger = screen.getByRole("button", { name: "Share my progress" });

    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("button", { name: /share on x/i }), {
      key: "Escape",
    });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("opens a Twitter/X share intent in a new tab when the X button is clicked", () => {
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    fireEvent.click(screen.getByRole("button", { name: "Share my progress" }));
    fireEvent.click(screen.getByRole("button", { name: /share on x/i }));

    expect(window.open).toHaveBeenCalledWith(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent("Day 5! Learned about 1.1.1")}`,
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("copies text and opens LinkedIn's share URL when the LinkedIn button is clicked", async () => {
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    fireEvent.click(screen.getByRole("button", { name: "Share my progress" }));
    fireEvent.click(screen.getByRole("button", { name: /share on linkedin/i }));
    await Promise.resolve();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "Day 5! Learned about 1.1.1",
    );
    expect(
      await screen.findByText(/text copied.*paste it into your linkedin post/i),
    ).toBeInTheDocument();
    expect(window.open).toHaveBeenCalledWith(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fdaily-a11y.com%2F",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("copies the given share text to the clipboard when the copy button is clicked", async () => {
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    fireEvent.click(screen.getByRole("button", { name: "Share my progress" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Share my progress" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Copy today's result" }),
    );

    expect(
      await screen.findByText("Day 5! Learned about 1.1.1"),
    ).toBeInTheDocument();
  });

  it("clears the status text when the menu is collapsed by clicking the trigger", async () => {
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    const trigger = screen.getByRole("button", { name: "Share my progress" });

    fireEvent.click(trigger);
    fireEvent.click(
      screen.getByRole("button", { name: "Copy today's result" }),
    );
    await screen.findByText("Copied to clipboard!");

    fireEvent.click(trigger);

    expect(screen.queryByText("Copied to clipboard!")).not.toBeInTheDocument();
  });

  it("clears the status text when the menu is collapsed via Escape", async () => {
    render(<ShareBar shareText="Day 5! Learned about 1.1.1" />);
    const trigger = screen.getByRole("button", { name: "Share my progress" });

    fireEvent.click(trigger);
    fireEvent.click(
      screen.getByRole("button", { name: "Copy today's result" }),
    );
    await screen.findByText("Copied to clipboard!");

    fireEvent.keyDown(screen.getByRole("button", { name: /share on x/i }), {
      key: "Escape",
    });

    expect(screen.queryByText("Copied to clipboard!")).not.toBeInTheDocument();
  });
});

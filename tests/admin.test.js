import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// admin.js runs its setup at module load time (reads #app from the DOM),
// so each test sets up a fresh #app element and dynamically imports the
// module fresh via vi.resetModules() to re-run its top-level bootstrap.
describe("admin.js active nav item", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("sets aria-current=true on the clicked item and removes it from others", async () => {
    vi.resetModules();
    await import("../src/admin.js");

    const buttons = document.querySelectorAll(".admin-list-item");
    expect(buttons.length).toBeGreaterThan(1);

    buttons[0].click();
    expect(buttons[0].getAttribute("aria-current")).toBe("true");
    expect(buttons[1].getAttribute("aria-current")).toBeNull();

    buttons[1].click();
    expect(buttons[0].getAttribute("aria-current")).toBeNull();
    expect(buttons[1].getAttribute("aria-current")).toBe("true");
  });
});

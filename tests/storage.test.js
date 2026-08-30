import { describe, it, expect, beforeEach, vi } from "vitest";
import { readState, writeState } from "../src/storage.js";

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

describe("storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", makeMemoryLocalStorage());
  });

  it("returns default empty state when nothing is stored", () => {
    expect(readState()).toEqual({
      streak: { count: 0, lastAnsweredDay: null },
      coverage: [],
    });
  });

  it("returns default empty state when stored value is malformed JSON", () => {
    localStorage.setItem("daily-a11y-state", "{not valid json");
    expect(readState()).toEqual({
      streak: { count: 0, lastAnsweredDay: null },
      coverage: [],
    });
  });

  it("round-trips a written state through readState", () => {
    const state = {
      streak: { count: 3, lastAnsweredDay: 20666 },
      coverage: ["1.4.3", "1.1.1"],
    };
    writeState(state);
    expect(readState()).toEqual(state);
  });
});

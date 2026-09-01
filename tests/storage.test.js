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
      lastAnswer: null,
    });
  });

  it("returns default empty state when stored value is malformed JSON", () => {
    localStorage.setItem("daily-a11y-state", "{not valid json");
    expect(readState()).toEqual({
      streak: { count: 0, lastAnsweredDay: null },
      coverage: [],
      lastAnswer: null,
    });
  });

  it("round-trips a written state through readState", () => {
    const state = {
      streak: { count: 3, lastAnsweredDay: 20666 },
      coverage: ["1.4.3", "1.1.1"],
      lastAnswer: {
        day: 20666,
        criterionId: "1.4.3",
        choice: 1,
        correct: true,
      },
    };
    writeState(state);
    expect(readState()).toEqual(state);
  });

  it("round-trips a written state with lastAnswer set to null", () => {
    const state = {
      streak: { count: 0, lastAnsweredDay: null },
      coverage: [],
      lastAnswer: null,
    };
    writeState(state);
    expect(readState()).toEqual(state);
  });
});

describe("readState with invalid stored data", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", makeMemoryLocalStorage());
  });

  it("falls back to default state when stored JSON has the wrong shape", () => {
    localStorage.setItem(
      "daily-a11y-state",
      JSON.stringify({ streak: "not-an-object" }),
    );
    const state = readState();
    expect(state).toEqual({
      streak: { count: 0, lastAnsweredDay: null },
      coverage: [],
      lastAnswer: null,
    });
  });

  it("falls back to default state when coverage is not an array", () => {
    localStorage.setItem(
      "daily-a11y-state",
      JSON.stringify({
        streak: { count: 1, lastAnsweredDay: 5 },
        coverage: "nope",
      }),
    );
    const state = readState();
    expect(state).toEqual({
      streak: { count: 0, lastAnsweredDay: null },
      coverage: [],
      lastAnswer: null,
    });
  });

  it("falls back to default state when lastAnswer has the wrong shape", () => {
    localStorage.setItem(
      "daily-a11y-state",
      JSON.stringify({
        streak: { count: 1, lastAnsweredDay: 5 },
        coverage: [],
        lastAnswer: { day: "not-a-number" },
      }),
    );
    const state = readState();
    expect(state).toEqual({
      streak: { count: 0, lastAnsweredDay: null },
      coverage: [],
      lastAnswer: null,
    });
  });

  it("still returns valid stored state unchanged", () => {
    const valid = {
      streak: { count: 3, lastAnsweredDay: 10 },
      coverage: ["1.1.1"],
      lastAnswer: { day: 10, criterionId: "1.1.1", choice: 0, correct: false },
    };
    localStorage.setItem("daily-a11y-state", JSON.stringify(valid));
    expect(readState()).toEqual(valid);
  });

  it("treats missing lastAnswer as null (forward compatibility with pre-existing stored state)", () => {
    localStorage.setItem(
      "daily-a11y-state",
      JSON.stringify({
        streak: { count: 3, lastAnsweredDay: 10 },
        coverage: ["1.1.1"],
      }),
    );
    const state = readState();
    expect(state).toEqual({
      streak: { count: 3, lastAnsweredDay: 10 },
      coverage: ["1.1.1"],
      lastAnswer: null,
    });
  });

  it("drops fields not in stateSchema instead of failing (forward compatibility)", () => {
    localStorage.setItem(
      "daily-a11y-state",
      JSON.stringify({
        streak: { count: 3, lastAnsweredDay: 10 },
        coverage: ["1.1.1"],
        futureField: "written by a newer version of the app",
      }),
    );
    const state = readState();
    expect(state).toEqual({
      streak: { count: 3, lastAnsweredDay: 10 },
      coverage: ["1.1.1"],
      lastAnswer: null,
    });
    expect(state).not.toHaveProperty("futureField");
  });
});

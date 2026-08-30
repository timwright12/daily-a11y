import { describe, it, expect } from "vitest";
import { daysSinceEpoch, getTodayIndex } from "../src/rotation.js";

describe("daysSinceEpoch", () => {
  it("returns 0 for the Unix epoch", () => {
    expect(daysSinceEpoch(new Date("1970-01-01T00:00:00Z"))).toBe(0);
  });

  it("returns 1 for one UTC day after the epoch", () => {
    expect(daysSinceEpoch(new Date("1970-01-02T00:00:00Z"))).toBe(1);
  });

  it("ignores time-of-day, using UTC calendar date only", () => {
    expect(daysSinceEpoch(new Date("1970-01-02T23:59:59Z"))).toBe(1);
  });

  it("computes a known later date correctly", () => {
    // 2026-08-29 is 20694 days after 1970-01-01 (UTC)
    expect(daysSinceEpoch(new Date("2026-08-29T12:00:00Z"))).toBe(20694);
  });
});

describe("getTodayIndex", () => {
  it("wraps around using modulo of the available count", () => {
    const date = new Date("1970-01-01T00:00:00Z"); // daysSinceEpoch = 0
    expect(getTodayIndex(date, 5)).toBe(0);
  });

  it("returns a different index the next day", () => {
    const date = new Date("1970-01-02T00:00:00Z"); // daysSinceEpoch = 1
    expect(getTodayIndex(date, 5)).toBe(1);
  });

  it("wraps back to 0 after a full cycle", () => {
    const date = new Date("1970-01-06T00:00:00Z"); // daysSinceEpoch = 5
    expect(getTodayIndex(date, 5)).toBe(0);
  });

  it("every criterion in a fixed-size set appears exactly once before any repeat (non-repeat property)", () => {
    const availableCount = 29;
    const seen = new Map();
    for (let day = 0; day < availableCount; day++) {
      const date = new Date(Date.UTC(1970, 0, 1 + day));
      const index = getTodayIndex(date, availableCount);
      expect(seen.has(index)).toBe(false);
      seen.set(index, day);
    }
    expect(seen.size).toBe(availableCount);

    // day `availableCount` must repeat the same index as day 0
    const wrapDate = new Date(Date.UTC(1970, 0, 1 + availableCount));
    expect(getTodayIndex(wrapDate, availableCount)).toBe(
      getTodayIndex(new Date(Date.UTC(1970, 0, 1)), availableCount),
    );
  });
});

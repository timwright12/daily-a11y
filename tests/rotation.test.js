import { describe, it, expect } from "vitest";
import {
  daysSinceEpoch,
  getTodayIndex,
  puzzleDayNumber,
  randomIndex,
} from "../src/rotation.js";

describe("daysSinceEpoch", () => {
  it("returns 0 at the UTC-5 rollover on the epoch's calendar date", () => {
    expect(daysSinceEpoch(new Date("1970-01-01T05:00:00Z"))).toBe(0);
  });

  it("returns -1 for the Unix epoch instant itself (still the prior UTC-5 day)", () => {
    expect(daysSinceEpoch(new Date("1970-01-01T00:00:00Z"))).toBe(-1);
  });

  it("returns 1 for one UTC-5 day after the epoch", () => {
    expect(daysSinceEpoch(new Date("1970-01-02T05:00:00Z"))).toBe(1);
  });

  it("ignores time-of-day, using UTC-5 calendar date only", () => {
    expect(daysSinceEpoch(new Date("1970-01-03T04:59:59Z"))).toBe(1);
  });

  it("computes a known later date correctly", () => {
    // 2026-08-29 05:00 UTC (2026-08-29 00:00 UTC-5) is 20694 days after 1970-01-01 (UTC-5)
    expect(daysSinceEpoch(new Date("2026-08-29T12:00:00Z"))).toBe(20694);
  });

  it("rolls over at 05:00 UTC (midnight US Eastern Standard Time), not at UTC midnight", () => {
    // Just before the UTC-5 rollover: still the previous day
    expect(daysSinceEpoch(new Date("1970-01-02T04:59:59Z"))).toBe(0);
    // At the UTC-5 rollover: the next day begins
    expect(daysSinceEpoch(new Date("1970-01-02T05:00:00Z"))).toBe(1);
  });
});

describe("getTodayIndex", () => {
  it("wraps around using modulo of the available count", () => {
    const date = new Date("1970-01-01T05:00:00Z"); // daysSinceEpoch = 0
    expect(getTodayIndex(date, 5)).toBe(0);
  });

  it("returns a different index the next day", () => {
    const date = new Date("1970-01-02T05:00:00Z"); // daysSinceEpoch = 1
    expect(getTodayIndex(date, 5)).toBe(1);
  });

  it("wraps back to 0 after a full cycle", () => {
    const date = new Date("1970-01-06T05:00:00Z"); // daysSinceEpoch = 5
    expect(getTodayIndex(date, 5)).toBe(0);
  });

  it("never returns a negative index for dates before the epoch's UTC-5 rollover", () => {
    const date = new Date("1970-01-01T00:00:00Z"); // daysSinceEpoch = -1
    expect(getTodayIndex(date, 5)).toBe(4);
  });

  it("every criterion in a fixed-size set appears exactly once before any repeat (non-repeat property)", () => {
    const availableCount = 29;
    const seen = new Map();
    for (let day = 0; day < availableCount; day++) {
      const date = new Date(
        Date.UTC(1970, 0, 1, 5) + day * 24 * 60 * 60 * 1000,
      );
      const index = getTodayIndex(date, availableCount);
      expect(seen.has(index)).toBe(false);
      seen.set(index, day);
    }
    expect(seen.size).toBe(availableCount);

    // day `availableCount` must repeat the same index as day 0
    const wrapDate = new Date(
      Date.UTC(1970, 0, 1, 5) + availableCount * 24 * 60 * 60 * 1000,
    );
    expect(getTodayIndex(wrapDate, availableCount)).toBe(
      getTodayIndex(new Date(Date.UTC(1970, 0, 1, 5)), availableCount),
    );
  });
});

describe("puzzleDayNumber", () => {
  const launchDate = new Date("2026-08-30T05:00:00Z");

  it("returns 1 on the launch date itself", () => {
    expect(puzzleDayNumber(launchDate, launchDate)).toBe(1);
  });

  it("returns 2 the day after launch", () => {
    expect(puzzleDayNumber(new Date("2026-08-31T05:00:00Z"), launchDate)).toBe(
      2,
    );
  });

  it("ignores time-of-day, using UTC-5 calendar date only", () => {
    expect(puzzleDayNumber(new Date("2026-08-31T04:59:59Z"), launchDate)).toBe(
      1,
    );
  });

  it("computes a known later date correctly", () => {
    expect(puzzleDayNumber(new Date("2026-09-29T05:00:00Z"), launchDate)).toBe(
      31,
    );
  });
});

describe("randomIndex", () => {
  it("returns 0 when the random source returns 0", () => {
    expect(randomIndex(29, () => 0)).toBe(0);
  });

  it("returns the last index when the random source returns just under 1", () => {
    expect(randomIndex(29, () => 0.9999999)).toBe(28);
  });

  it("returns the middle index for a mid-range random value", () => {
    expect(randomIndex(29, () => 0.5)).toBe(14);
  });

  it("never returns an index outside the available range across many draws", () => {
    for (let i = 0; i < 1000; i++) {
      const index = randomIndex(29, Math.random);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(29);
      expect(Number.isInteger(index)).toBe(true);
    }
  });
});

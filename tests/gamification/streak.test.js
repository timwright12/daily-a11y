import { describe, it, expect } from "vitest";
import { recordAnswer, currentStreak } from "../../src/gamification/streak.js";

describe("recordAnswer", () => {
  it("starts a new streak of 1 on the first-ever answer", () => {
    const result = recordAnswer({ count: 0, lastAnsweredDay: null }, 100);
    expect(result).toEqual({ count: 1, lastAnsweredDay: 100 });
  });

  it("increments the streak when answered on the consecutive day", () => {
    const result = recordAnswer({ count: 3, lastAnsweredDay: 100 }, 101);
    expect(result).toEqual({ count: 4, lastAnsweredDay: 101 });
  });

  it("resets the streak to 1 when a day was skipped", () => {
    const result = recordAnswer({ count: 5, lastAnsweredDay: 100 }, 103);
    expect(result).toEqual({ count: 1, lastAnsweredDay: 103 });
  });

  it("does not double-count answering again on the same day", () => {
    const result = recordAnswer({ count: 4, lastAnsweredDay: 101 }, 101);
    expect(result).toEqual({ count: 4, lastAnsweredDay: 101 });
  });

  it("resets to 1 if answered on an earlier day than lastAnsweredDay (clock anomaly)", () => {
    const result = recordAnswer({ count: 4, lastAnsweredDay: 101 }, 99);
    expect(result).toEqual({ count: 1, lastAnsweredDay: 99 });
  });
});

describe("currentStreak", () => {
  it("returns a never-started streak unchanged", () => {
    const result = currentStreak({ count: 0, lastAnsweredDay: null }, 100);
    expect(result).toEqual({ count: 0, lastAnsweredDay: null });
  });

  it("leaves the streak unchanged when already answered today", () => {
    const result = currentStreak({ count: 4, lastAnsweredDay: 101 }, 101);
    expect(result).toEqual({ count: 4, lastAnsweredDay: 101 });
  });

  it("leaves the streak unchanged when today is still open to answer (answered yesterday)", () => {
    const result = currentStreak({ count: 4, lastAnsweredDay: 100 }, 101);
    expect(result).toEqual({ count: 4, lastAnsweredDay: 100 });
  });

  it("breaks the streak to 0 when a day was missed", () => {
    const result = currentStreak({ count: 5, lastAnsweredDay: 100 }, 103);
    expect(result).toEqual({ count: 0, lastAnsweredDay: 100 });
  });

  it("breaks the streak to 0 exactly two days after the last answer", () => {
    const result = currentStreak({ count: 5, lastAnsweredDay: 100 }, 102);
    expect(result).toEqual({ count: 0, lastAnsweredDay: 100 });
  });
});

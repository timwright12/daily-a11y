// tests/lib/filterCriteria.test.js
import { describe, it, expect } from "vitest";
import { filterCriteria } from "../../src/lib/filterCriteria.js";

function criterion(overrides = {}) {
  return {
    id: "1.1.1",
    name: "Non-text Content",
    level: "A",
    principle: "Perceivable",
    ...overrides,
  };
}

describe("filterCriteria", () => {
  const criteria = [
    criterion({
      id: "1.1.1",
      name: "Non-text Content",
      level: "A",
      principle: "Perceivable",
    }),
    criterion({
      id: "1.4.3",
      name: "Contrast (Minimum)",
      level: "AA",
      principle: "Perceivable",
    }),
    criterion({
      id: "2.4.9",
      name: "Link Purpose (Link Only)",
      level: "AAA",
      principle: "Operable",
    }),
    criterion({
      id: "4.1.2",
      name: "Name, Role, Value",
      level: "A",
      principle: "Robust",
    }),
  ];

  it("returns all criteria when no filters are set", () => {
    const result = filterCriteria(criteria, {}, []);
    expect(result).toEqual(criteria);
  });

  it("matches query text against criterion id", () => {
    const result = filterCriteria(criteria, { query: "1.4.3" }, []);
    expect(result.map((c) => c.id)).toEqual(["1.4.3"]);
  });

  it("matches query text against criterion name, case-insensitively", () => {
    const result = filterCriteria(criteria, { query: "contrast" }, []);
    expect(result.map((c) => c.id)).toEqual(["1.4.3"]);
  });

  it("filters by level", () => {
    const result = filterCriteria(criteria, { level: "A" }, []);
    expect(result.map((c) => c.id)).toEqual(["1.1.1", "4.1.2"]);
  });

  it("filters by principle", () => {
    const result = filterCriteria(criteria, { principle: "Operable" }, []);
    expect(result.map((c) => c.id)).toEqual(["2.4.9"]);
  });

  it("filters to only seen criteria when seenState is 'seen'", () => {
    const coverage = ["1.1.1", "2.4.9"];
    const result = filterCriteria(criteria, { seenState: "seen" }, coverage);
    expect(result.map((c) => c.id)).toEqual(["1.1.1", "2.4.9"]);
  });

  it("filters to only unseen criteria when seenState is 'unseen'", () => {
    const coverage = ["1.1.1", "2.4.9"];
    const result = filterCriteria(criteria, { seenState: "unseen" }, coverage);
    expect(result.map((c) => c.id)).toEqual(["1.4.3", "4.1.2"]);
  });

  it("combines multiple filters with AND semantics", () => {
    const coverage = ["1.1.1", "4.1.2"];
    const result = filterCriteria(
      criteria,
      { level: "A", seenState: "seen" },
      coverage,
    );
    expect(result.map((c) => c.id)).toEqual(["1.1.1", "4.1.2"]);
  });

  it("returns an empty array when no criteria match", () => {
    const result = filterCriteria(criteria, { query: "nonexistent" }, []);
    expect(result).toEqual([]);
  });
});

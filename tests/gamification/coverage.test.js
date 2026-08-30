import { describe, it, expect } from 'vitest';
import { markSeen, coverageSummary } from '../../src/gamification/coverage.js';

describe('markSeen', () => {
  it('adds a new criterion id to an empty coverage list', () => {
    expect(markSeen([], '1.4.3')).toEqual(['1.4.3']);
  });

  it('adds a new criterion id to an existing list', () => {
    expect(markSeen(['1.1.1'], '1.4.3')).toEqual(['1.1.1', '1.4.3']);
  });

  it('does not duplicate an already-seen criterion id', () => {
    expect(markSeen(['1.1.1', '1.4.3'], '1.4.3')).toEqual(['1.1.1', '1.4.3']);
  });
});

describe('coverageSummary', () => {
  it('reports seen count against total available', () => {
    expect(coverageSummary(['1.1.1', '1.4.3'], 29)).toEqual({ seen: 2, total: 29 });
  });

  it('reports zero seen for empty coverage', () => {
    expect(coverageSummary([], 29)).toEqual({ seen: 0, total: 29 });
  });
});

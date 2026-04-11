import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetBurstIdCounter,
  createBurstBuilderState,
  addCharToBursts,
  removeLastCharFromBursts,
  getAllBursts,
  getTotalCharCount,
  buildBurstsFromEvents,
} from './burstDetector';

beforeEach(() => {
  resetBurstIdCounter();
});

// ─── createBurstBuilderState ────────────────────────────────────────────────

describe('createBurstBuilderState', () => {
  it('returns empty bursts and null currentBurst', () => {
    const state = createBurstBuilderState();
    expect(state.bursts).toEqual([]);
    expect(state.currentBurst).toBeNull();
  });
});

// ─── addCharToBursts — basic burst creation ──────────────────────────────────

describe('addCharToBursts', () => {
  it('creates the first burst when state is empty', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 150, 0.8, 0.1, 0);
    expect(state.currentBurst).not.toBeNull();
    expect(state.currentBurst!.chars).toEqual(['a']);
    expect(state.bursts).toHaveLength(0);
  });

  it('appends chars with consistent IKI into the same burst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 110, 0.7, 0.1, 0);
    addCharToBursts(state, 'c', 105, 0.9, 0.1, 0);
    expect(state.currentBurst!.chars).toEqual(['a', 'b', 'c']);
    expect(state.bursts).toHaveLength(0);
  });

  it('starts a new burst when IKI exceeds pause threshold (800 ms)', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 900, 0.5, 0.5, 0); // IKI > 800 → new burst
    expect(state.bursts).toHaveLength(1);
    expect(state.currentBurst!.chars).toEqual(['b']);
  });

  it('starts a new burst when pause > 0', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 100, 0.5, 0.5, 1000); // explicit pause
    expect(state.bursts).toHaveLength(1);
    expect(state.currentBurst!.chars).toEqual(['b']);
  });

  it('stores the pause as pauseBefore on the new burst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 100, 0.5, 0.5, 1200);
    expect(state.currentBurst!.pauseBefore).toBe(1200);
  });

  it('sets pauseBefore to 0 when no pause', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    expect(state.currentBurst!.pauseBefore).toBe(0);
  });

  // Speed-change split requires burst length >= 3 (MIN_BURST_SIZE_FOR_SPLIT)
  it('splits burst on significant speed increase (>2×) once burst has ≥3 chars', () => {
    const state = createBurstBuilderState();
    // Establish a burst with avg IKI ~100 ms
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'c', 100, 0.8, 0.1, 0);
    // Now add a char that's >2× the avg IKI (300 ms is 3× of 100)
    addCharToBursts(state, 'd', 300, 0.3, 0.4, 0);
    expect(state.bursts).toHaveLength(1);
    expect(state.currentBurst!.chars).toEqual(['d']);
  });

  it('splits burst on significant speed decrease (<0.5×) once burst has ≥3 chars', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 200, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 200, 0.8, 0.1, 0);
    addCharToBursts(state, 'c', 200, 0.8, 0.1, 0);
    // 40 ms < 0.5 × 200 ms
    addCharToBursts(state, 'd', 40, 0.9, 0.05, 0);
    expect(state.bursts).toHaveLength(1);
    expect(state.currentBurst!.chars).toEqual(['d']);
  });

  it('does not split before burst has ≥3 chars even with a large IKI change', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 100, 0.8, 0.1, 0);
    // Only 2 chars so far — speed change should not split
    addCharToBursts(state, 'c', 300, 0.3, 0.4, 0);
    expect(state.bursts).toHaveLength(0);
    expect(state.currentBurst!.chars).toHaveLength(3);
  });

  it('updates running average of confidence and hesitation within a burst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 1.0, 0.0, 0); // confidence=1.0
    addCharToBursts(state, 'b', 100, 0.0, 1.0, 0); // confidence=0.0
    // After 2 chars the running average should be 0.5
    expect(state.currentBurst!.confidence).toBeCloseTo(0.5);
    expect(state.currentBurst!.hesitation).toBeCloseTo(0.5);
  });

  it('assigns unique ids to consecutive bursts', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 900, 0.5, 0.5, 0);
    const id1 = state.bursts[0].id;
    const id2 = state.currentBurst!.id;
    expect(id1).not.toBe(id2);
  });
});

// ─── removeLastCharFromBursts ────────────────────────────────────────────────

describe('removeLastCharFromBursts', () => {
  it('returns false when state is empty', () => {
    const state = createBurstBuilderState();
    expect(removeLastCharFromBursts(state)).toBe(false);
  });

  it('removes the last character from currentBurst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 100, 0.8, 0.1, 0);
    removeLastCharFromBursts(state);
    expect(state.currentBurst!.chars).toEqual(['a']);
  });

  it('returns true when a character was removed', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    expect(removeLastCharFromBursts(state)).toBe(true);
  });

  it('sets currentBurst to null when the only burst becomes empty', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    removeLastCharFromBursts(state);
    expect(state.currentBurst).toBeNull();
  });

  it('restores the previous burst when currentBurst becomes empty and a completed burst exists', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 900, 0.5, 0.5, 0); // creates second burst
    removeLastCharFromBursts(state); // removes 'b', restores first burst
    expect(state.currentBurst!.chars).toEqual(['a']);
    expect(state.bursts).toHaveLength(0);
  });

  it('can backspace across multiple bursts', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 900, 0.5, 0.5, 0);
    addCharToBursts(state, 'c', 100, 0.8, 0.1, 0);
    removeLastCharFromBursts(state); // removes 'c'
    removeLastCharFromBursts(state); // removes 'b' (was only char in second burst)
    expect(state.currentBurst!.chars).toEqual(['a']);
    expect(state.bursts).toHaveLength(0);
  });
});

// ─── getAllBursts ────────────────────────────────────────────────────────────

describe('getAllBursts', () => {
  it('returns empty array when state is empty', () => {
    const state = createBurstBuilderState();
    expect(getAllBursts(state)).toEqual([]);
  });

  it('returns only the currentBurst when no bursts are completed', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    const all = getAllBursts(state);
    expect(all).toHaveLength(1);
    expect(all[0].chars).toEqual(['a']);
  });

  it('includes completed bursts and the current burst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 900, 0.5, 0.5, 0);
    const all = getAllBursts(state);
    expect(all).toHaveLength(2);
  });

  it('does not include an empty currentBurst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    removeLastCharFromBursts(state); // leaves empty currentBurst = null
    expect(getAllBursts(state)).toEqual([]);
  });
});

// ─── getTotalCharCount ────────────────────────────────────────────────────────

describe('getTotalCharCount', () => {
  it('returns 0 for empty state', () => {
    const state = createBurstBuilderState();
    expect(getTotalCharCount(state)).toBe(0);
  });

  it('counts characters in the current burst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 100, 0.8, 0.1, 0);
    expect(getTotalCharCount(state)).toBe(2);
  });

  it('counts characters across completed and current bursts', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 100, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 900, 0.5, 0.5, 0); // new burst
    addCharToBursts(state, 'c', 100, 0.8, 0.1, 0);
    expect(getTotalCharCount(state)).toBe(3);
  });
});

// ─── buildBurstsFromEvents ───────────────────────────────────────────────────

describe('buildBurstsFromEvents', () => {
  it('returns empty array for empty event list', () => {
    expect(buildBurstsFromEvents([])).toEqual([]);
  });

  it('builds bursts from insert events', () => {
    const events = [
      { type: 'insert' as const, char: 'h', iki: 100, confidence: 0.8, hesitation: 0.1, pause: 0 },
      { type: 'insert' as const, char: 'i', iki: 110, confidence: 0.8, hesitation: 0.1, pause: 0 },
    ];
    const bursts = buildBurstsFromEvents(events);
    expect(bursts).toHaveLength(1);
    expect(bursts[0].chars).toEqual(['h', 'i']);
  });

  it('applies delete events by removing the last character', () => {
    const events = [
      { type: 'insert' as const, char: 'a', iki: 100, confidence: 0.8, hesitation: 0.1, pause: 0 },
      { type: 'insert' as const, char: 'b', iki: 100, confidence: 0.8, hesitation: 0.1, pause: 0 },
      { type: 'delete' as const, iki: 80, confidence: 0.7, hesitation: 0.2, pause: 0 },
    ];
    const bursts = buildBurstsFromEvents(events);
    expect(bursts).toHaveLength(1);
    expect(bursts[0].chars).toEqual(['a']);
  });

  it('handles delete events with no prior inserts gracefully', () => {
    const events = [
      { type: 'delete' as const, iki: 80, confidence: 0.7, hesitation: 0.2, pause: 0 },
    ];
    expect(() => buildBurstsFromEvents(events)).not.toThrow();
    expect(buildBurstsFromEvents(events)).toEqual([]);
  });

  it('creates multiple bursts when pauses are present in the event stream', () => {
    const events = [
      { type: 'insert' as const, char: 'a', iki: 100, confidence: 0.8, hesitation: 0.1, pause: 0 },
      { type: 'insert' as const, char: 'b', iki: 1000, confidence: 0.5, hesitation: 0.5, pause: 0 },
    ];
    const bursts = buildBurstsFromEvents(events);
    expect(bursts).toHaveLength(2);
  });

  it('skips insert events without a char value', () => {
    const events = [
      { type: 'insert' as const, char: undefined, iki: 100, confidence: 0.8, hesitation: 0.1, pause: 0 },
    ];
    expect(buildBurstsFromEvents(events)).toEqual([]);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import {
  addCharToBursts,
  buildBurstsFromEvents,
  createBurstBuilderState,
  getAllBursts,
  getTotalCharCount,
  removeLastCharFromBursts,
  resetBurstIdCounter,
  type BurstBuilderState,
} from '../burstDetector';

beforeEach(() => {
  resetBurstIdCounter();
});

// ─── createBurstBuilderState ─────────────────────────────────────────────────

describe('createBurstBuilderState', () => {
  it('returns empty bursts and null currentBurst', () => {
    const state = createBurstBuilderState();
    expect(state.bursts).toEqual([]);
    expect(state.currentBurst).toBeNull();
  });
});

// ─── addCharToBursts ─────────────────────────────────────────────────────────

describe('addCharToBursts', () => {
  it('creates the first burst when state is empty', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    expect(state.currentBurst).not.toBeNull();
    expect(state.currentBurst!.chars).toEqual(['a']);
    expect(state.bursts).toHaveLength(0);
  });

  it('appends subsequent fast characters to the same burst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'h', 120, 0.7, 0.1, 0);
    addCharToBursts(state, 'e', 130, 0.7, 0.1, 0);
    addCharToBursts(state, 'l', 125, 0.7, 0.1, 0);
    addCharToBursts(state, 'l', 120, 0.7, 0.1, 0);
    addCharToBursts(state, 'o', 118, 0.7, 0.1, 0);

    expect(state.currentBurst!.chars).toEqual(['h', 'e', 'l', 'l', 'o']);
    expect(state.bursts).toHaveLength(0);
  });

  it('starts a new burst after a pause (pause > 0)', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 120, 0.8, 0.1, 0);
    // Pause triggers new burst
    addCharToBursts(state, 'c', 120, 0.8, 0.1, 1200);

    expect(state.bursts).toHaveLength(1);
    expect(state.bursts[0].chars).toEqual(['a', 'b']);
    expect(state.currentBurst!.chars).toEqual(['c']);
  });

  it('starts a new burst when IKI exceeds PAUSE_THRESHOLD_MS (800ms)', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 900, 0.8, 0.1, 0); // IKI > 800

    expect(state.bursts).toHaveLength(1);
    expect(state.currentBurst!.chars).toEqual(['b']);
  });

  it('splits burst on significant speed change after MIN_BURST_SIZE_FOR_SPLIT chars', () => {
    const state = createBurstBuilderState();
    // Build a burst of 3+ chars at ~120ms IKI
    addCharToBursts(state, 'a', 120, 0.7, 0.1, 0);
    addCharToBursts(state, 'b', 120, 0.7, 0.1, 0);
    addCharToBursts(state, 'c', 120, 0.7, 0.1, 0);
    // Suddenly type at >2× the average (120 * 2 = 240ms) → split
    addCharToBursts(state, 'd', 300, 0.3, 0.5, 0);

    expect(state.bursts).toHaveLength(1);
    expect(state.bursts[0].chars).toEqual(['a', 'b', 'c']);
    expect(state.currentBurst!.chars).toEqual(['d']);
  });

  it('does NOT split on speed change with fewer than MIN_BURST_SIZE_FOR_SPLIT chars', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.7, 0.1, 0);
    addCharToBursts(state, 'b', 120, 0.7, 0.1, 0);
    // Only 2 chars so far; speed change should NOT split
    addCharToBursts(state, 'c', 600, 0.3, 0.5, 0);

    expect(state.bursts).toHaveLength(0);
    expect(state.currentBurst!.chars).toEqual(['a', 'b', 'c']);
  });

  it('updates running average confidence and hesitation on each char', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 1.0, 0.0, 0);
    addCharToBursts(state, 'b', 120, 0.0, 1.0, 0);

    const burst = state.currentBurst!;
    // After 2 chars: avg confidence = (1.0 * 1/2) + (0.0 * 1/2) = 0.5
    expect(burst.confidence).toBeCloseTo(0.5, 5);
    expect(burst.hesitation).toBeCloseTo(0.5, 5);
  });

  it('sets pauseBefore on new burst started by pause', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 120, 0.8, 0.1, 1500);

    expect(state.currentBurst!.pauseBefore).toBe(1500);
  });

  it('sets pauseBefore using IKI when IKI > PAUSE_THRESHOLD and pause is 0', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 900, 0.8, 0.1, 0); // IKI > 800 triggers pause

    expect(state.currentBurst!.pauseBefore).toBe(900);
  });

  it('returns the mutated state for convenience chaining', () => {
    const state = createBurstBuilderState();
    const returned = addCharToBursts(state, 'x', 100, 0.5, 0.2, 0);
    expect(returned).toBe(state);
  });
});

// ─── removeLastCharFromBursts ─────────────────────────────────────────────────

describe('removeLastCharFromBursts', () => {
  it('removes the last character from currentBurst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 120, 0.8, 0.1, 0);

    const removed = removeLastCharFromBursts(state);

    expect(removed).toBe(true);
    expect(state.currentBurst!.chars).toEqual(['a']);
  });

  it('returns false when state is completely empty', () => {
    const state = createBurstBuilderState();
    expect(removeLastCharFromBursts(state)).toBe(false);
  });

  it('pops the previous burst as currentBurst when currentBurst empties', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 120, 0.8, 0.1, 1200); // new burst
    // Now bursts = [a], currentBurst = [b]
    removeLastCharFromBursts(state);
    // currentBurst was [b], now emptied → pop previous burst 'a'
    expect(state.bursts).toHaveLength(0);
    expect(state.currentBurst!.chars).toEqual(['a']);
  });

  it('recursively removes from restored burst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 120, 0.8, 0.1, 1200); // new burst; bursts=[a]
    // Remove b → pops [a] as current, then removes a too
    removeLastCharFromBursts(state);
    removeLastCharFromBursts(state);

    expect(state.currentBurst).toBeNull();
    expect(state.bursts).toHaveLength(0);
  });
});

// ─── getAllBursts ─────────────────────────────────────────────────────────────

describe('getAllBursts', () => {
  it('returns empty array when state is empty', () => {
    const state = createBurstBuilderState();
    expect(getAllBursts(state)).toEqual([]);
  });

  it('includes the in-progress currentBurst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);

    const all = getAllBursts(state);
    expect(all).toHaveLength(1);
    expect(all[0].chars).toEqual(['a']);
  });

  it('includes completed bursts and current burst in order', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 120, 0.8, 0.1, 1200); // second burst

    const all = getAllBursts(state);
    expect(all).toHaveLength(2);
    expect(all[0].chars).toEqual(['a']);
    expect(all[1].chars).toEqual(['b']);
  });

  it('does not mutate internal state', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);

    const all1 = getAllBursts(state);
    const all2 = getAllBursts(state);
    expect(all1).not.toBe(all2); // new array each time
    expect(all1).toEqual(all2);
  });
});

// ─── getTotalCharCount ────────────────────────────────────────────────────────

describe('getTotalCharCount', () => {
  it('returns 0 for empty state', () => {
    expect(getTotalCharCount(createBurstBuilderState())).toBe(0);
  });

  it('counts chars across completed bursts and currentBurst', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'c', 120, 0.8, 0.1, 1200); // new burst

    expect(getTotalCharCount(state)).toBe(3);
  });

  it('decrements after backspace', () => {
    const state = createBurstBuilderState();
    addCharToBursts(state, 'a', 120, 0.8, 0.1, 0);
    addCharToBursts(state, 'b', 120, 0.8, 0.1, 0);
    removeLastCharFromBursts(state);

    expect(getTotalCharCount(state)).toBe(1);
  });
});

// ─── buildBurstsFromEvents ────────────────────────────────────────────────────

describe('buildBurstsFromEvents', () => {
  it('returns empty array for empty events', () => {
    expect(buildBurstsFromEvents([])).toEqual([]);
  });

  it('builds bursts from insert events', () => {
    const events = [
      { type: 'insert' as const, char: 'h', iki: 120, confidence: 0.8, hesitation: 0.1, pause: 0 },
      { type: 'insert' as const, char: 'i', iki: 115, confidence: 0.8, hesitation: 0.1, pause: 0 },
    ];
    const bursts = buildBurstsFromEvents(events);
    const text = bursts.flatMap((b) => b.chars).join('');
    expect(text).toBe('hi');
  });

  it('applies delete events correctly', () => {
    const events = [
      { type: 'insert' as const, char: 'a', iki: 120, confidence: 0.8, hesitation: 0.1, pause: 0 },
      { type: 'insert' as const, char: 'b', iki: 120, confidence: 0.8, hesitation: 0.1, pause: 0 },
      { type: 'delete' as const, char: undefined, iki: 200, confidence: 0.5, hesitation: 0.2, pause: 0 },
      { type: 'insert' as const, char: 'c', iki: 120, confidence: 0.8, hesitation: 0.1, pause: 0 },
    ];
    const bursts = buildBurstsFromEvents(events);
    const text = bursts.flatMap((b) => b.chars).join('');
    expect(text).toBe('ac');
  });

  it('ignores insert events without a char value', () => {
    const events = [
      { type: 'insert' as const, char: undefined, iki: 120, confidence: 0.8, hesitation: 0.1, pause: 0 },
    ];
    expect(buildBurstsFromEvents(events)).toEqual([]);
  });

  it('handles all-delete events gracefully', () => {
    const events = [
      { type: 'delete' as const, char: undefined, iki: 200, confidence: 0.5, hesitation: 0.2, pause: 0 },
      { type: 'delete' as const, char: undefined, iki: 200, confidence: 0.5, hesitation: 0.2, pause: 0 },
    ];
    expect(buildBurstsFromEvents(events)).toEqual([]);
  });

  it('creates separate bursts for paused sequences', () => {
    const events = [
      { type: 'insert' as const, char: 'a', iki: 120, confidence: 0.8, hesitation: 0.1, pause: 0 },
      { type: 'insert' as const, char: 'b', iki: 120, confidence: 0.8, hesitation: 0.1, pause: 1000 },
    ];
    const bursts = buildBurstsFromEvents(events);
    expect(bursts).toHaveLength(2);
    expect(bursts[0].chars).toEqual(['a']);
    expect(bursts[1].chars).toEqual(['b']);
  });
});

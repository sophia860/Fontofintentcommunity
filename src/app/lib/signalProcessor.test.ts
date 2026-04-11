import { describe, it, expect } from 'vitest';
import { createSignalState, processKeystroke } from './signalProcessor';

// ─── createSignalState ───────────────────────────────────────────────────────

describe('createSignalState', () => {
  it('returns sensible defaults', () => {
    const state = createSignalState();
    expect(state.lastKeyTime).toBe(0);
    expect(state.burstVelocity).toBe(0);
    expect(state.recentIKIs).toEqual([]);
    expect(state.avgIKI).toBe(150);
    expect(state.baselineReady).toBe(false);
    expect(state.recentDeleteCount).toBe(0);
    expect(state.recentInsertCount).toBe(0);
  });
});

// ─── processKeystroke — IKI calculation ─────────────────────────────────────

describe('processKeystroke — iki', () => {
  it('returns default iki of 150 on the very first keystroke (lastKeyTime=0)', () => {
    const state = createSignalState();
    const result = processKeystroke(state, 1000, false);
    expect(result.iki).toBe(150);
  });

  it('returns actual elapsed time for subsequent keystrokes', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    const result = processKeystroke(state, 1200, false);
    expect(result.iki).toBe(200);
  });

  it('updates lastKeyTime after each call', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    expect(state.lastKeyTime).toBe(1000);
    processKeystroke(state, 1300, false);
    expect(state.lastKeyTime).toBe(1300);
  });
});

// ─── processKeystroke — pause detection ─────────────────────────────────────

describe('processKeystroke — pause', () => {
  it('returns pause=0 for normal typing IKI (<800 ms)', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    const result = processKeystroke(state, 1200, false);
    expect(result.pause).toBe(0);
  });

  it('returns non-zero pause for IKI > 800 ms', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    const result = processKeystroke(state, 2000, false);
    expect(result.pause).toBeGreaterThan(0);
    expect(result.pause).toBe(1000);
  });
});

// ─── processKeystroke — baseline and confidence ─────────────────────────────

describe('processKeystroke — confidence', () => {
  /**
   * Helper: prime the baseline by sending 6+ non-pause keystrokes
   * all with the same IKI, making avgIKI ≈ that IKI.
   */
  function primeBaseline(state: ReturnType<typeof createSignalState>, iki: number) {
    let t = 0;
    for (let i = 0; i < 8; i++) {
      t += iki;
      processKeystroke(state, t, false);
    }
    return t;
  }

  it('returns confidence=0.5 when typing at exactly the average IKI (ratio=1)', () => {
    const state = createSignalState();
    const t = primeBaseline(state, 100);
    // Next keystroke at the exact average IKI
    const result = processKeystroke(state, t + 100, false);
    expect(result.confidence).toBeCloseTo(0.5, 1);
  });

  it('returns confidence close to 1 when typing faster than 0.6× the average', () => {
    const state = createSignalState();
    const t = primeBaseline(state, 200);
    // IKI = 60 ms → ratio = 60/200 = 0.3 which is < FAST_RATIO (0.6)
    const result = processKeystroke(state, t + 60, false);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('returns low confidence when typing significantly slower than the average', () => {
    const state = createSignalState();
    const t = primeBaseline(state, 100);
    // IKI = 400 ms → well above SLOW_RATIO (1.6×) even after EMA self-update.
    // EMA update: newAvg ≈ 0.3*400 + 0.7*~104 ≈ 192.8; ratio ≈ 400/192.8 ≈ 2.07 > 1.6
    const result = processKeystroke(state, t + 400, false);
    expect(result.confidence).toBeLessThan(0.15);
  });

  it('confidence is clamped between 0 and 1', () => {
    const state = createSignalState();
    const t = primeBaseline(state, 100);
    const result = processKeystroke(state, t + 500, false);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('does not use baseline before 6 IKIs are collected (baselineReady=false)', () => {
    const state = createSignalState();
    // Only 3 inserts — baseline not ready
    processKeystroke(state, 100, false);
    processKeystroke(state, 200, false);
    const result = processKeystroke(state, 300, false);
    expect(state.baselineReady).toBe(false);
    // ratio = 1 → speedConfidence = 0.5 (default)
    expect(result.confidence).toBeCloseTo(0.5, 1);
  });
});

// ─── processKeystroke — hesitation ───────────────────────────────────────────

describe('processKeystroke — hesitation', () => {
  it('returns hesitation=0 for fast, consistent typing', () => {
    const state = createSignalState();
    // Many keystrokes with low, consistent IKI
    let t = 0;
    for (let i = 0; i < 10; i++) {
      t += 80;
      processKeystroke(state, t, false);
    }
    const result = processKeystroke(state, t + 80, false);
    expect(result.hesitation).toBeCloseTo(0, 1);
  });

  it('returns hesitation > 0 after a long pause (>2000 ms)', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    const result = processKeystroke(state, 4000, false);
    expect(result.hesitation).toBeGreaterThan(0);
  });

  it('hesitation is clamped between 0 and 1', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    const result = processKeystroke(state, 10000, false);
    expect(result.hesitation).toBeGreaterThanOrEqual(0);
    expect(result.hesitation).toBeLessThanOrEqual(1);
  });
});

// ─── processKeystroke — correction tracking ──────────────────────────────────

describe('processKeystroke — correction (delete) tracking', () => {
  it('increments recentDeleteCount on delete', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, true);
    expect(state.recentDeleteCount).toBe(1);
  });

  it('increments recentInsertCount on insert', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    expect(state.recentInsertCount).toBe(1);
  });

  it('decays counts when total exceeds 20', () => {
    const state = createSignalState();
    let t = 0;
    for (let i = 0; i < 21; i++) {
      t += 100;
      processKeystroke(state, t, i % 2 === 0); // alternate deletes and inserts
    }
    // After decay both counts should be below their pre-decay values
    expect(state.recentDeleteCount + state.recentInsertCount).toBeLessThanOrEqual(20);
  });

  it('applying a high delete ratio reduces confidence', () => {
    const state = createSignalState();
    let t = 0;
    // Prime baseline
    for (let i = 0; i < 8; i++) {
      t += 100;
      processKeystroke(state, t, false);
    }
    // Now do many deletes
    for (let i = 0; i < 10; i++) {
      t += 100;
      processKeystroke(state, t, true);
    }
    // One final insert at average IKI — correctionPenalty should reduce confidence
    const result = processKeystroke(state, t + 100, false);
    expect(result.confidence).toBeLessThan(0.5);
  });
});

// ─── processKeystroke — burst velocity ───────────────────────────────────────

describe('processKeystroke — burstVelocity', () => {
  it('initialises burstVelocity on the first keystroke', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    expect(state.burstVelocity).toBeGreaterThan(0);
  });

  it('returns burst velocity in the result', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    const result = processKeystroke(state, 1100, false);
    expect(result.burst).toBeGreaterThan(0);
  });

  it('burstVelocity increases when typing faster', () => {
    const state = createSignalState();
    let t = 0;
    // slow typing first
    for (let i = 0; i < 5; i++) { t += 500; processKeystroke(state, t, false); }
    const slowVelocity = state.burstVelocity;
    // now fast typing
    for (let i = 0; i < 5; i++) { t += 50; processKeystroke(state, t, false); }
    expect(state.burstVelocity).toBeGreaterThan(slowVelocity);
  });
});

// ─── processKeystroke — rolling IKI window ───────────────────────────────────

describe('processKeystroke — recentIKIs rolling window', () => {
  it('does not add IKI to window when IKI ≤ 30 ms (too fast, likely noise)', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false); // first call: iki=150 (default), added to window
    const lengthBefore = state.recentIKIs.length;
    processKeystroke(state, 1010, false); // IKI = 10 ≤ 30 — must NOT be added
    expect(state.recentIKIs).toHaveLength(lengthBefore); // no new entry
    expect(state.recentIKIs).not.toContain(10);
  });

  it('does not add IKI to window when IKI ≥ 800 ms (a pause)', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false); // first call: iki=150 (default), added to window
    const lengthBefore = state.recentIKIs.length;
    processKeystroke(state, 2000, false); // IKI = 1000 ≥ 800 — must NOT be added
    expect(state.recentIKIs).toHaveLength(lengthBefore); // no new entry
    expect(state.recentIKIs).not.toContain(1000);
  });

  it('adds IKI to window for normal typing speed', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false); // first call: iki=150 (default), added to window
    const lengthBefore = state.recentIKIs.length;
    processKeystroke(state, 1100, false); // IKI = 100 — must be added
    expect(state.recentIKIs).toHaveLength(lengthBefore + 1);
    expect(state.recentIKIs).toContain(100);
  });

  it('caps the rolling window at 20 entries', () => {
    const state = createSignalState();
    let t = 0;
    for (let i = 0; i < 25; i++) {
      t += 100;
      processKeystroke(state, t, false);
    }
    expect(state.recentIKIs.length).toBeLessThanOrEqual(20);
  });
});

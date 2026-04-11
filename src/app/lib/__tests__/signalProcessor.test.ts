import { describe, it, expect } from 'vitest';
import { createSignalState, processKeystroke } from '../signalProcessor';

// ─── createSignalState ────────────────────────────────────────────────────────

describe('createSignalState', () => {
  it('returns sensible defaults', () => {
    const state = createSignalState();
    expect(state.lastKeyTime).toBe(0);
    expect(state.burstVelocity).toBe(0);
    expect(state.recentIKIs).toEqual([]);
    expect(state.recentDeleteCount).toBe(0);
    expect(state.recentInsertCount).toBe(0);
    expect(state.avgIKI).toBe(150);
    expect(state.baselineReady).toBe(false);
  });
});

// ─── processKeystroke — IKI computation ──────────────────────────────────────

describe('processKeystroke — IKI', () => {
  it('returns 150 as default IKI for the very first keystroke', () => {
    const state = createSignalState();
    const result = processKeystroke(state, 1000, false);
    expect(result.iki).toBe(150);
  });

  it('computes IKI as difference between consecutive timestamps', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    const result = processKeystroke(state, 1120, false);
    expect(result.iki).toBe(120);
  });

  it('updates lastKeyTime after each call', () => {
    const state = createSignalState();
    processKeystroke(state, 500, false);
    expect(state.lastKeyTime).toBe(500);
    processKeystroke(state, 700, false);
    expect(state.lastKeyTime).toBe(700);
  });
});

// ─── processKeystroke — pause detection ──────────────────────────────────────

describe('processKeystroke — pause detection', () => {
  it('sets pause to 0 when IKI is below the threshold (800ms)', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    const result = processKeystroke(state, 1500, false); // IKI = 500
    expect(result.pause).toBe(0);
  });

  it('sets pause to IKI when IKI exceeds 800ms', () => {
    const state = createSignalState();
    processKeystroke(state, 1000, false);
    const result = processKeystroke(state, 2000, false); // IKI = 1000
    expect(result.pause).toBe(1000);
  });

  it('sets pause equal to IKI exactly at boundary (801ms)', () => {
    const state = createSignalState();
    processKeystroke(state, 1, false); // sets lastKeyTime=1
    const result = processKeystroke(state, 802, false); // IKI = 801 > 800
    expect(result.pause).toBe(801);
  });
});

// ─── processKeystroke — baseline readiness ───────────────────────────────────

describe('processKeystroke — baseline', () => {
  it('marks baselineReady after 6 non-pause keystrokes', () => {
    const state = createSignalState();
    let t = 0;
    for (let i = 0; i < 6; i++) {
      t += 120;
      processKeystroke(state, t, false);
    }
    expect(state.baselineReady).toBe(true);
  });

  it('does not mark baselineReady with only 5 keystrokes', () => {
    const state = createSignalState();
    let t = 0;
    for (let i = 0; i < 5; i++) {
      t += 120;
      processKeystroke(state, t, false);
    }
    expect(state.baselineReady).toBe(false);
  });

  it('excludes very short IKIs (<=30ms) from the baseline window', () => {
    const state = createSignalState();
    // Simulate 10 very fast keystrokes (10ms each) — should NOT count
    let t = 0;
    for (let i = 0; i < 10; i++) {
      t += 10;
      processKeystroke(state, t, false);
    }
    expect(state.baselineReady).toBe(false);
  });

  it('excludes pause-length IKIs (>=800ms) from the rolling IKI window', () => {
    const state = createSignalState();
    // First keystroke at t=1 so lastKeyTime becomes 1 (not 0)
    processKeystroke(state, 1, false);  // IKI=150 (default), added to window
    const countAfterFirst = state.recentIKIs.length;
    processKeystroke(state, 1001, false); // IKI=1000ms (pause) — must be excluded
    // The pause keystroke must not have added to the window
    expect(state.recentIKIs.length).toBe(countAfterFirst);
  });
});

// ─── processKeystroke — confidence ───────────────────────────────────────────

describe('processKeystroke — confidence', () => {
  it('returns confidence in [0, 1]', () => {
    const state = createSignalState();
    let t = 0;
    for (let i = 0; i < 20; i++) {
      t += 120;
      const result = processKeystroke(state, t, i % 3 === 0);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('produces higher confidence for faster-than-average typing after baseline', () => {
    // Build baseline at ~200ms IKI
    const state = createSignalState();
    let t = 0;
    for (let i = 0; i < 8; i++) {
      t += 200;
      processKeystroke(state, t, false);
    }
    // Type at 80ms (much faster than 200ms average → high confidence)
    const fast = processKeystroke(state, t + 80, false);

    // Reset and type slower
    const state2 = createSignalState();
    let t2 = 0;
    for (let i = 0; i < 8; i++) {
      t2 += 200;
      processKeystroke(state2, t2, false);
    }
    // Type at 400ms (much slower → lower confidence)
    const slow = processKeystroke(state2, t2 + 400, false);

    expect(fast.confidence).toBeGreaterThan(slow.confidence);
  });

  it('penalises confidence when correction (delete) rate is high', () => {
    const state = createSignalState();
    let t = 0;
    // Establish baseline
    for (let i = 0; i < 8; i++) {
      t += 150;
      processKeystroke(state, t, false);
    }
    const baseConfidence = processKeystroke(state, (t += 150), false).confidence;

    // Now simulate lots of deletes
    const state2 = createSignalState();
    t = 0;
    for (let i = 0; i < 8; i++) {
      t += 150;
      processKeystroke(state2, t, false);
    }
    // Many corrections
    for (let i = 0; i < 8; i++) {
      t += 150;
      processKeystroke(state2, t, true);
    }
    const correctedConfidence = processKeystroke(state2, (t += 150), false).confidence;
    expect(correctedConfidence).toBeLessThan(baseConfidence);
  });
});

// ─── processKeystroke — hesitation ───────────────────────────────────────────

describe('processKeystroke — hesitation', () => {
  it('returns hesitation in [0, 1]', () => {
    const state = createSignalState();
    let t = 0;
    for (let i = 0; i < 20; i++) {
      t += 300;
      const result = processKeystroke(state, t, false);
      expect(result.hesitation).toBeGreaterThanOrEqual(0);
      expect(result.hesitation).toBeLessThanOrEqual(1);
    }
  });

  it('increases hesitation on a long pause (>2000ms)', () => {
    const state = createSignalState();
    processKeystroke(state, 1, false);                    // seed lastKeyTime=1
    const shortPause = processKeystroke(state, 901, false).hesitation;  // IKI=900 (short pause)

    const state2 = createSignalState();
    processKeystroke(state2, 1, false);                   // seed lastKeyTime=1
    const longPause = processKeystroke(state2, 2501, false).hesitation; // IKI=2500 (long pause)

    expect(longPause).toBeGreaterThan(shortPause);
  });
});

// ─── processKeystroke — rolling window cap ────────────────────────────────────

describe('processKeystroke — rolling IKI window', () => {
  it('caps recentIKIs at 20 entries', () => {
    const state = createSignalState();
    let t = 0;
    for (let i = 0; i < 30; i++) {
      t += 120;
      processKeystroke(state, t, false);
    }
    expect(state.recentIKIs.length).toBeLessThanOrEqual(20);
  });
});

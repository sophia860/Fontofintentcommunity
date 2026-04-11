import { describe, it, expect } from 'vitest';
import { getBurstStyle, getGhostStyle } from './fontMapper';

// ─── getBurstStyle — weight axis ────────────────────────────────────────────

describe('getBurstStyle — weight (fontVariationSettings)', () => {
  it('maps confidence=0 to wght 200', () => {
    const style = getBurstStyle(0, 0, 0);
    expect(style.fontVariationSettings).toBe("'wght' 200");
  });

  it('maps confidence=1 to wght 800', () => {
    const style = getBurstStyle(1, 0, 0);
    expect(style.fontVariationSettings).toBe("'wght' 800");
  });

  it('maps confidence=0.5 to wght 500', () => {
    const style = getBurstStyle(0.5, 0, 0);
    expect(style.fontVariationSettings).toBe("'wght' 500");
  });
});

// ─── getBurstStyle — color axis (light mode) ────────────────────────────────

describe('getBurstStyle — color (light mode)', () => {
  it('at confidence=0 produces the warm-gray end of the spectrum', () => {
    const { color } = getBurstStyle(0, 0, 0) as { color: string };
    // Expected: rgb(0x8a, 0x85, 0x80) → rgb(138, 133, 128)
    expect(color).toBe('rgb(138, 133, 128)');
  });

  it('at confidence=1 produces near-black', () => {
    const { color } = getBurstStyle(1, 0, 0) as { color: string };
    // Expected: rgb(0x1a, 0x1a, 0x1a) → rgb(26, 26, 26)
    expect(color).toBe('rgb(26, 26, 26)');
  });
});

// ─── getBurstStyle — color axis (dark mode) ─────────────────────────────────

describe('getBurstStyle — color (dark mode)', () => {
  it('at confidence=0 produces the dark muted tone', () => {
    const { color } = getBurstStyle(0, 0, 0, true) as { color: string };
    // Expected: rgb(0x5a, 0x50, 0x48) → rgb(90, 80, 72)
    expect(color).toBe('rgb(90, 80, 72)');
  });

  it('at confidence=1 produces warm off-white', () => {
    const { color } = getBurstStyle(1, 0, 0, true) as { color: string };
    // Expected: rgb(0xf0, 0xe8, 0xde) → rgb(240, 232, 222)
    expect(color).toBe('rgb(240, 232, 222)');
  });
});

// ─── getBurstStyle — opacity axis ───────────────────────────────────────────

describe('getBurstStyle — opacity', () => {
  it('light mode opacity at confidence=0 is 0.7', () => {
    const { opacity } = getBurstStyle(0, 0, 0) as { opacity: number };
    expect(opacity).toBeCloseTo(0.7, 5);
  });

  it('light mode opacity at confidence=1 is 1.0', () => {
    const { opacity } = getBurstStyle(1, 0, 0) as { opacity: number };
    expect(opacity).toBeCloseTo(1.0, 5);
  });

  it('dark mode opacity at confidence=0 is 0.65', () => {
    const { opacity } = getBurstStyle(0, 0, 0, true) as { opacity: number };
    expect(opacity).toBeCloseTo(0.65, 5);
  });

  it('dark mode opacity at confidence=1 is 1.0', () => {
    const { opacity } = getBurstStyle(1, 0, 0, true) as { opacity: number };
    expect(opacity).toBeCloseTo(1.0, 5);
  });
});

// ─── getBurstStyle — spacing axis ───────────────────────────────────────────

describe('getBurstStyle — marginLeft (pause spacing)', () => {
  it('no marginLeft when pauseBefore is 0', () => {
    const style = getBurstStyle(0.5, 0.1, 0);
    expect(style.marginLeft).toBeUndefined();
  });

  it('adds marginLeft when pauseBefore is 800 ms (minimum gap threshold)', () => {
    const style = getBurstStyle(0.5, 0.1, 800);
    // gap = Math.min(16, 4 + (800-800)/150) = 4 → '4.0px'
    expect(style.marginLeft).toBe('4.0px');
  });

  it('caps marginLeft at 16 px for very long pauses', () => {
    const style = getBurstStyle(0.5, 0.1, 5000);
    expect(style.marginLeft).toBe('16.0px');
  });

  it('does not add marginLeft for pauses that produce a gap ≤ 0', () => {
    // gap = 4 + (pauseBefore - 800)/150; for pauseBefore slightly > 0 this would be
    // negative before the threshold kicks in. The code only runs when pauseBefore > 0.
    // But the internal gap formula: 4 + (p-800)/150 must be > 0 → p > 200 ms offset
    // Actually for pauseBefore between 1 and 800 the IKI branch handles it.
    // Here we use pauseBefore=1 (non-zero but very small) to exercise the branch.
    const style = getBurstStyle(0.5, 0.1, 1);
    // gap = Math.min(16, 4 + (1-800)/150) ≈ 4 - 5.33 = negative → marginLeft not set
    expect(style.marginLeft).toBeUndefined();
  });
});

// ─── getBurstStyle — general structure ──────────────────────────────────────

describe('getBurstStyle — style object shape', () => {
  it('always includes fontFamily and transition', () => {
    const style = getBurstStyle(0.5, 0.1, 0);
    expect(style.fontFamily).toContain('Inter');
    expect(style.transition).toBeTruthy();
  });

  it('always sets display to "inline"', () => {
    const style = getBurstStyle(0.5, 0.1, 0);
    expect(style.display).toBe('inline');
  });
});

// ─── getGhostStyle ───────────────────────────────────────────────────────────

describe('getGhostStyle', () => {
  it('returns an object with line-through text decoration', () => {
    const style = getGhostStyle();
    expect(style.textDecoration).toBe('line-through');
  });

  it('has very low opacity (≤ 0.2)', () => {
    const style = getGhostStyle();
    expect(style.opacity as number).toBeLessThanOrEqual(0.2);
  });

  it('sets display to "inline"', () => {
    const style = getGhostStyle();
    expect(style.display).toBe('inline');
  });

  it('includes fontFamily', () => {
    const style = getGhostStyle();
    expect(style.fontFamily).toContain('Inter');
  });
});

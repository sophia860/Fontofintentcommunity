import { describe, it, expect } from 'vitest';
import { getBurstStyle, getGhostStyle } from '../fontMapper';

// ─── getBurstStyle ────────────────────────────────────────────────────────────

describe('getBurstStyle — font weight', () => {
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

  it('rounds weight to nearest integer', () => {
    // confidence 0.333… → wght = round(200 + 0.333 * 600) = round(400) = 400
    const style = getBurstStyle(1 / 3, 0, 0);
    const match = style.fontVariationSettings?.match(/'wght' (\d+)/);
    expect(match).not.toBeNull();
    const wght = parseInt(match![1], 10);
    expect(Number.isInteger(wght)).toBe(true);
  });
});

describe('getBurstStyle — light mode color', () => {
  it('near-black color for high confidence in light mode', () => {
    const style = getBurstStyle(1, 0, 0, false);
    expect(style.color).toBe('rgb(26, 26, 26)');
  });

  it('warm gray color for zero confidence in light mode', () => {
    const style = getBurstStyle(0, 0, 0, false);
    expect(style.color).toBe('rgb(138, 133, 128)');
  });
});

describe('getBurstStyle — dark mode color', () => {
  it('warm off-white color for high confidence in dark mode', () => {
    const style = getBurstStyle(1, 0, 0, true);
    expect(style.color).toBe('rgb(240, 232, 222)');
  });

  it('muted warm gray for zero confidence in dark mode', () => {
    const style = getBurstStyle(0, 0, 0, true);
    expect(style.color).toBe('rgb(90, 80, 72)');
  });
});

describe('getBurstStyle — opacity', () => {
  it('opacity is higher for high confidence in light mode', () => {
    const low = getBurstStyle(0, 0, 0, false);
    const high = getBurstStyle(1, 0, 0, false);
    expect(high.opacity as number).toBeGreaterThan(low.opacity as number);
  });

  it('opacity is within [0.65, 1] in dark mode', () => {
    for (const c of [0, 0.25, 0.5, 0.75, 1]) {
      const style = getBurstStyle(c, 0, 0, true);
      expect(style.opacity as number).toBeGreaterThanOrEqual(0.65);
      expect(style.opacity as number).toBeLessThanOrEqual(1);
    }
  });

  it('opacity is within [0.7, 1] in light mode', () => {
    for (const c of [0, 0.25, 0.5, 0.75, 1]) {
      const style = getBurstStyle(c, 0, 0, false);
      expect(style.opacity as number).toBeGreaterThanOrEqual(0.7);
      expect(style.opacity as number).toBeLessThanOrEqual(1);
    }
  });
});

describe('getBurstStyle — marginLeft / spacing', () => {
  it('does not add marginLeft when pauseBefore is 0', () => {
    const style = getBurstStyle(0.5, 0.1, 0);
    expect(style.marginLeft).toBeUndefined();
  });

  it('adds marginLeft when pauseBefore results in a positive gap', () => {
    // pause > 800ms guarantees gap > 0
    const style = getBurstStyle(0.5, 0.1, 2000);
    expect(style.marginLeft).toBeDefined();
    const px = parseFloat(style.marginLeft as string);
    expect(px).toBeGreaterThan(0);
  });

  it('caps marginLeft at 16px', () => {
    // Very large pause
    const style = getBurstStyle(0.5, 0.1, 999999);
    const px = parseFloat(style.marginLeft as string);
    expect(px).toBeLessThanOrEqual(16);
  });

  it('defaults to light mode (darkMode=false) when not specified', () => {
    const defaultStyle = getBurstStyle(0.5, 0.1, 0);
    const lightStyle = getBurstStyle(0.5, 0.1, 0, false);
    expect(defaultStyle.color).toBe(lightStyle.color);
  });
});

describe('getBurstStyle — structural properties', () => {
  it('always sets fontFamily to Inter', () => {
    const style = getBurstStyle(0.5, 0.1, 0);
    expect(style.fontFamily).toBe("'Inter', sans-serif");
  });

  it('sets display to inline', () => {
    const style = getBurstStyle(0.5, 0.1, 0);
    expect(style.display).toBe('inline');
  });

  it('includes opacity transition', () => {
    const style = getBurstStyle(0.5, 0.1, 0);
    expect(style.transition).toBe('opacity 0.3s ease');
  });
});

// ─── getGhostStyle ────────────────────────────────────────────────────────────

describe('getGhostStyle', () => {
  it('returns a consistent ghost style object', () => {
    const style = getGhostStyle();
    expect(style.fontFamily).toBe("'Inter', sans-serif");
    expect(style.fontVariationSettings).toBe("'wght' 350");
    expect(style.color).toBe('#8A7E72');
    expect(style.opacity).toBe(0.15);
    expect(style.display).toBe('inline');
    expect(style.textDecoration).toBe('line-through');
  });

  it('returns the same values on repeated calls (pure function)', () => {
    expect(getGhostStyle()).toEqual(getGhostStyle());
  });
});

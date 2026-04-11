/**
 * Maps burst-level behavioral signals to visual styles.
 *
 * Three axes of expression:
 * 1. Weight: confidence → wght 200 (hesitant) to 800 (confident)
 * 2. Opacity/Color: hesitant → warm gray, confident → full intensity
 * 3. Spacing: pauses between bursts create visible horizontal gaps
 *
 * Font chaos (fourth axis):
 * - Uppercase-heavy bursts → ACRealAdult (printed caps feel)
 * - ~20% of remaining bursts → BiroScriptPlus (biro scrawl)
 * - Everything else → ACFrenchToast (flowing lowercase handwriting)
 * Plus random subtle size shifts and slight baseline wobble.
 *
 * Supports both light mode (writing surface, preview) and dark mode (replay).
 */
import type { CSSProperties } from 'react';

/**
 * Deterministic hash of a string — used so font/size choices are stable
 * across re-renders but vary per burst content.
 */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Pick a font family for a burst based on its character content.
 * Returns the full CSS font-family value.
 */
function pickFontFamily(chars: string[]): string {
  if (!chars || chars.length === 0) return "'ACFrenchToast', cursive";

  const text = chars.join('');
  const letters = text.match(/[a-zA-Z]/g) ?? [];
  const uppers = text.match(/[A-Z]/g) ?? [];

  // Uppercase-heavy → ACRealAdult
  if (letters.length > 0 && uppers.length / letters.length > 0.55) {
    return "'ACRealAdult', cursive";
  }

  // ~20% chance → BiroScriptPlus (deterministic via hash so stable on re-render)
  const h = hashString(text);
  if (h % 5 === 0) {
    return "'BiroScriptPlus', cursive";
  }

  return "'ACFrenchToast', cursive";
}

/**
 * Compute inline style for a burst span.
 *
 * @param confidence  0–1 confidence score
 * @param hesitation  0–1 hesitation score
 * @param pauseBefore milliseconds of pause before this burst
 * @param darkMode    if true, renders warm light text on dark background
 * @param chars       burst characters — used to select font chaotically
 */
export function getBurstStyle(
  confidence: number,
  hesitation: number,
  pauseBefore: number,
  darkMode = false,
  chars: string[] = []
): CSSProperties {
  // --- Axis 1: Weight ---
  const wght = Math.round(200 + confidence * 600);

  // --- Axis 2: Color/Opacity ---
  let color: string;
  let opacity: number;

  if (darkMode) {
    // Dark mode: warm muted (#5A5048) to warm off-white (#F0E8DE)
    const r = Math.round(0x5a + confidence * (0xf0 - 0x5a));
    const g = Math.round(0x50 + confidence * (0xe8 - 0x50));
    const b = Math.round(0x48 + confidence * (0xde - 0x48));
    color = `rgb(${r}, ${g}, ${b})`;
    opacity = 0.65 + 0.35 * Math.pow(confidence, 0.5);
  } else {
    // Light mode: warm gray (#8A8580) to near-black (#1A1A1A)
    const r = Math.round(0x1a + (1 - confidence) * (0x8a - 0x1a));
    const g = Math.round(0x1a + (1 - confidence) * (0x85 - 0x1a));
    const b = Math.round(0x1a + (1 - confidence) * (0x80 - 0x1a));
    color = `rgb(${r}, ${g}, ${b})`;
    opacity = 0.7 + 0.3 * Math.pow(confidence, 0.5);
  }

  // --- Axis 3: Spacing ---
  let marginLeft: string | undefined;
  if (pauseBefore > 0) {
    const gap = Math.min(16, 4 + (pauseBefore - 800) / 150);
    if (gap > 0) {
      marginLeft = `${Math.max(0, gap).toFixed(1)}px`;
    }
  }

  // --- Axis 4: Chaotic font + subtle size / baseline wobble ---
  const fontFamily = pickFontFamily(chars);
  const text = chars.join('');
  const h = hashString(text || String(pauseBefore));
  // 37 steps gives a 0.82–1.19em range (±~18% size variation across bursts)
  const SIZE_VARIATION_STEPS = 37;
  const sizeScale = 0.82 + (h % SIZE_VARIATION_STEPS) / 100;
  // 7 steps gives a −3 to +3 px baseline wobble
  const WOBBLE_STEPS = 7;
  const verticalShift = ((h % WOBBLE_STEPS) - 3);

  const style: CSSProperties = {
    fontFamily,
    fontVariationSettings: `'wght' ${wght}`,
    color,
    opacity,
    display: 'inline',
    transition: 'opacity 0.3s ease',
    marginLeft,
    fontSize: `${sizeScale}em`,
    verticalAlign: `${verticalShift}px`,
  };

  return style;
}

/**
 * Ghost style for replay: strikethrough + faded before removal.
 */
export function getGhostStyle(): CSSProperties {
  return {
    fontFamily: "'ACFrenchToast', cursive",
    color: '#8A7E72',
    opacity: 0.15,
    display: 'inline',
    textDecoration: 'line-through',
    textDecorationColor: 'rgba(138, 126, 114, 0.4)',
    transition: 'opacity 300ms ease-out',
  };
}
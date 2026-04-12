/**
 * Maps burst-level behavioral signals to visual styles.
 *
 * Three axes of expression:
 * 1. Weight: confidence → wght 200 (hesitant) to 800 (confident/bold)
 * 2. Opacity/Color: hesitant → warm gray, confident → full intensity
 * 3. Spacing: pauses between bursts create visible horizontal gaps
 *
 * Writing studio text uses DM Sans so that the rhythm-driven weight
 * variation (thin → bold) reads cleanly on screen.
 *
 * Supports both light mode (writing surface, preview) and dark mode (replay).
 */
import type { CSSProperties } from 'react';

/** Font used for burst text in the writing studio. */
const WRITING_FONT = "'Fira Code', monospace";

/**
 * Full chaos font pool — replaced with TaktukBrush as the single handwritten font.
 * Order matters: hash % length maps into this array.
 */
export const CHAOS_FONTS = [
  "'TaktukBrush', cursive",
];

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
 * Pick a font for a heading / UI element using a stable seed string.
 * Pass a unique per-element seed (e.g. component name + element description)
 * so each heading gets a different font but doesn't change on re-render.
 */
export function pickHeadingFont(seed: string): string {
  return CHAOS_FONTS[hashString(seed) % CHAOS_FONTS.length];
}

/**
 * Compute inline style for a burst span.
 *
 * @param confidence  0–1 confidence score
 * @param hesitation  0–1 hesitation score
 * @param pauseBefore milliseconds of pause before this burst
 * @param darkMode    if true, renders warm light text on dark background
 * @param chars       burst characters (unused, kept for API compatibility)
 */
export function getBurstStyle(
  confidence: number,
  hesitation: number,
  pauseBefore: number,
  darkMode = false,
  chars: string[] = []
): CSSProperties {
  void chars; // reserved for future use

  // --- Axis 1: Weight (DM Sans variable font: 100–900) ---
  // Slow/hesitant → 300 (light), fast/confident → 700 (bold)
  const wght = Math.round(300 + confidence * 400);

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

  const style: CSSProperties = {
    fontFamily: WRITING_FONT,
    fontVariationSettings: `'wght' ${wght}`,
    color,
    opacity,
    display: 'inline',
    transition: 'opacity 0.3s ease',
    marginLeft,
  };

  return style;
}

/**
 * Ghost style for replay: strikethrough + faded before removal.
 */
export function getGhostStyle(): CSSProperties {
  return {
    fontFamily: "'TaktukBrush', cursive",
    color: '#8A7E72',
    opacity: 0.15,
    display: 'inline',
    textDecoration: 'line-through',
    textDecorationColor: 'rgba(138, 126, 114, 0.4)',
    transition: 'opacity 300ms ease-out',
  };
}
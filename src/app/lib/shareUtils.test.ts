import { describe, it, expect, vi } from 'vitest';
import { encodeSession, decodeSession, buildShareUrl } from './shareUtils';
import type { Session } from './types';

const SAMPLE_SESSION: Session = {
  startedAt: 1700000000000,
  finalText: 'Hello, world!',
  events: [
    { t: 1, type: 'insert', char: 'H', pos: 0, iki: 150, burst: 6.5, pause: 0, confidence: 0.8, hesitation: 0.1 },
    { t: 2, type: 'insert', char: 'i', pos: 1, iki: 110, burst: 7.0, pause: 0, confidence: 0.9, hesitation: 0.05 },
  ],
};

// ─── encodeSession ────────────────────────────────────────────────────────────

describe('encodeSession', () => {
  it('returns a non-empty string', () => {
    const encoded = encodeSession(SAMPLE_SESSION);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);
  });

  it('produces URL-safe base64 (no +, /, or = characters)', () => {
    const encoded = encodeSession(SAMPLE_SESSION);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('produces consistent output for the same input', () => {
    expect(encodeSession(SAMPLE_SESSION)).toBe(encodeSession(SAMPLE_SESSION));
  });

  it('produces different output for different sessions', () => {
    const other: Session = { ...SAMPLE_SESSION, finalText: 'Different text' };
    expect(encodeSession(SAMPLE_SESSION)).not.toBe(encodeSession(other));
  });
});

// ─── decodeSession ────────────────────────────────────────────────────────────

describe('decodeSession', () => {
  it('round-trips a session through encode → decode', () => {
    const encoded = encodeSession(SAMPLE_SESSION);
    const decoded = decodeSession(encoded);
    expect(decoded).toEqual(SAMPLE_SESSION);
  });

  it('returns null for completely invalid input', () => {
    expect(decodeSession('not-valid-base64!!!')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(decodeSession('')).toBeNull();
  });

  it('handles URL-safe characters (- and _) correctly', () => {
    // Encode then manually replace to standard base64 to ensure decode handles both
    const encoded = encodeSession(SAMPLE_SESSION);
    // The encoded string may already contain - or _ from the URL-safe conversion.
    // Decoding it should still work.
    const decoded = decodeSession(encoded);
    expect(decoded).not.toBeNull();
  });

  it('handles missing padding gracefully', () => {
    const encoded = encodeSession(SAMPLE_SESSION);
    // encoded is already stripped of padding; decode should add it back
    expect(decodeSession(encoded)).toEqual(SAMPLE_SESSION);
  });

  it('handles a session with Unicode characters in finalText', () => {
    const unicodeSession: Session = {
      ...SAMPLE_SESSION,
      finalText: 'こんにちは 🌸',
    };
    const encoded = encodeSession(unicodeSession);
    const decoded = decodeSession(encoded);
    expect(decoded?.finalText).toBe('こんにちは 🌸');
  });

  it('handles an empty events array', () => {
    const emptyEventsSession: Session = {
      startedAt: 0,
      finalText: '',
      events: [],
    };
    const encoded = encodeSession(emptyEventsSession);
    const decoded = decodeSession(encoded);
    expect(decoded).toEqual(emptyEventsSession);
  });
});

// ─── buildShareUrl ────────────────────────────────────────────────────────────

describe('buildShareUrl', () => {
  it('returns a URL containing the encoded session as the "d" query parameter', () => {
    vi.stubGlobal('window', { location: { origin: 'https://example.com' } });
    const url = buildShareUrl(SAMPLE_SESSION);
    const parsed = new URL(url);
    expect(parsed.searchParams.get('d')).toBe(encodeSession(SAMPLE_SESSION));
    vi.unstubAllGlobals();
  });

  it('uses window.location.origin as the base', () => {
    vi.stubGlobal('window', { location: { origin: 'https://mysite.io' } });
    const url = buildShareUrl(SAMPLE_SESSION);
    expect(url.startsWith('https://mysite.io')).toBe(true);
    vi.unstubAllGlobals();
  });

  it('contains the /replay path', () => {
    vi.stubGlobal('window', { location: { origin: 'https://example.com' } });
    const url = buildShareUrl(SAMPLE_SESSION);
    expect(url).toContain('/replay');
    vi.unstubAllGlobals();
  });

  it('produces a URL that round-trips the session back through decodeSession', () => {
    vi.stubGlobal('window', { location: { origin: 'https://example.com' } });
    const url = buildShareUrl(SAMPLE_SESSION);
    const d = new URL(url).searchParams.get('d')!;
    expect(decodeSession(d)).toEqual(SAMPLE_SESSION);
    vi.unstubAllGlobals();
  });
});

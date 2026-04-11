import { describe, it, expect, vi, beforeAll } from 'vitest';
import { encodeSession, decodeSession, buildShareUrl } from '../shareUtils';
import type { Session } from '../types';

const sampleSession: Session = {
  startedAt: 1700000000000,
  finalText: 'Hello, world!',
  events: [
    { t: 100, type: 'insert', char: 'H', pos: 0, iki: 150, burst: 5, pause: 0, confidence: 0.8, hesitation: 0.1 },
    { t: 220, type: 'insert', char: 'i', pos: 1, iki: 120, burst: 5, pause: 0, confidence: 0.9, hesitation: 0.05 },
  ],
};

// ─── encodeSession ────────────────────────────────────────────────────────────

describe('encodeSession', () => {
  it('returns a non-empty string', () => {
    expect(encodeSession(sampleSession)).toBeTruthy();
  });

  it('produces URL-safe output (no +, /, or = characters)', () => {
    const encoded = encodeSession(sampleSession);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('produces consistent output for the same input', () => {
    expect(encodeSession(sampleSession)).toBe(encodeSession(sampleSession));
  });

  it('produces different output for different sessions', () => {
    const other: Session = { ...sampleSession, finalText: 'different text' };
    expect(encodeSession(sampleSession)).not.toBe(encodeSession(other));
  });

  it('handles a session with no events', () => {
    const empty: Session = { startedAt: 0, finalText: '', events: [] };
    expect(() => encodeSession(empty)).not.toThrow();
  });

  it('handles Unicode characters correctly', () => {
    const unicode: Session = { startedAt: 0, finalText: '日本語テスト', events: [] };
    expect(() => encodeSession(unicode)).not.toThrow();
    const encoded = encodeSession(unicode);
    expect(encoded.length).toBeGreaterThan(0);
  });
});

// ─── decodeSession ────────────────────────────────────────────────────────────

describe('decodeSession', () => {
  it('round-trips a session through encode → decode', () => {
    const encoded = encodeSession(sampleSession);
    const decoded = decodeSession(encoded);
    expect(decoded).toEqual(sampleSession);
  });

  it('returns null for an empty string', () => {
    expect(decodeSession('')).toBeNull();
  });

  it('returns null for invalid base64 garbage', () => {
    expect(decodeSession('!!!not-valid-base64!!!')).toBeNull();
  });

  it('returns null for valid base64 that is not a valid session JSON', () => {
    // base64 of "this is not json"
    const notJson = btoa('this is not json').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeSession(notJson)).toBeNull();
  });

  it('handles URL-safe encoding variants (- instead of +, _ instead of /)', () => {
    const encoded = encodeSession(sampleSession);
    // Already URL-safe from encodeSession, but decode should still work
    expect(decodeSession(encoded)).toEqual(sampleSession);
  });

  it('round-trips a session with Unicode text', () => {
    const unicode: Session = {
      startedAt: 1700000000000,
      finalText: '日本語テスト 🌸',
      events: [],
    };
    const decoded = decodeSession(encodeSession(unicode));
    expect(decoded?.finalText).toBe('日本語テスト 🌸');
  });
});

// ─── buildShareUrl ────────────────────────────────────────────────────────────

describe('buildShareUrl', () => {
  beforeAll(() => {
    // jsdom sets window.location.origin to 'http://localhost'
  });

  it('returns a string starting with origin and /replay?d=', () => {
    const url = buildShareUrl(sampleSession);
    // jsdom may include a port (e.g. :3000) in the origin
    expect(url).toMatch(/^http:\/\/localhost(:\d+)?\/replay\?d=.+/);
  });

  it('embeds an encoded session that can be decoded back', () => {
    const url = buildShareUrl(sampleSession);
    const encoded = url.split('?d=')[1];
    expect(decodeSession(encoded)).toEqual(sampleSession);
  });

  it('produces different URLs for different sessions', () => {
    const other: Session = { ...sampleSession, finalText: 'other text' };
    expect(buildShareUrl(sampleSession)).not.toBe(buildShareUrl(other));
  });
});

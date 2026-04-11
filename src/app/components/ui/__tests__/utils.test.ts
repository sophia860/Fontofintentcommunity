import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn', () => {
  it('merges a single class string', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('handles undefined and null values without error', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('handles boolean false without adding a class', () => {
    expect(cn('foo', false && 'hidden', 'bar')).toBe('foo bar');
  });

  it('handles boolean true with a class', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('resolves Tailwind conflicts — later class wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('resolves Tailwind conflicts across multiple groups', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles conditional object syntax from clsx', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles array inputs via clsx', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('deduplicates conflicting Tailwind utilities rather than concatenating', () => {
    const result = cn('m-2 p-2', 'm-4');
    expect(result).toContain('m-4');
    expect(result).not.toContain('m-2');
    expect(result).toContain('p-2');
  });
});

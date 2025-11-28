import { removeUndefined } from '../objectUtils';

describe('removeUndefined', () => {
  it('removes undefined values from objects', () => {
    const input = { a: 1, b: undefined, c: 'value' };
    const result = removeUndefined(input);

    expect(result).toEqual({ a: 1, c: 'value' });
    expect('b' in result).toBe(false);
  });

  it('preserves null values', () => {
    const input = { a: null, b: undefined };
    const result = removeUndefined(input);

    expect(result).toEqual({ a: null });
  });

  it('preserves other falsy values', () => {
    const input = { a: 0, b: false, c: '', d: NaN, e: undefined };
    const result = removeUndefined(input);

    expect(result).toEqual({ a: 0, b: false, c: '', d: NaN });
  });

  it('keeps nested objects intact while removing top-level undefined', () => {
    const input = { nested: { inner: undefined, value: 2 }, removed: undefined };
    const result = removeUndefined(input);

    expect(result).toEqual({ nested: { inner: undefined, value: 2 } });
  });

  it('returns an empty object for empty input', () => {
    expect(removeUndefined({})).toEqual({});
  });

  it('maintains type safety for returned objects', () => {
    const user = { name: 'Alice', age: undefined } as { name?: string; age?: number };
    const result = removeUndefined(user);

    expect(result.name).toBe('Alice');
    expect('age' in result).toBe(false);
  });
});

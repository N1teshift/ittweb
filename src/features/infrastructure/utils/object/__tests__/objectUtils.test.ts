import { removeUndefined } from '../objectUtils';

describe('removeUndefined', () => {
  describe('basic functionality', () => {
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

    it('preserves multiple null values', () => {
      const input = { a: null, b: null, c: undefined };
      const result = removeUndefined(input);

      expect(result).toEqual({ a: null, b: null });
    });

    it('preserves null in arrays', () => {
      const input = { arr: [null, null, 1], removed: undefined };
      const result = removeUndefined(input);

      expect(result).toEqual({ arr: [null, null, 1] });
    });

    it('preserves null in nested objects', () => {
      const input = { nested: { inner: null, value: 2 }, removed: undefined };
      const result = removeUndefined(input);

      expect(result).toEqual({ nested: { inner: null, value: 2 } });
    });

    it('preserves other falsy values', () => {
      const input = { a: 0, b: false, c: '', d: NaN, e: undefined };
      const result = removeUndefined(input);

      expect(result).toEqual({ a: 0, b: false, c: '', d: NaN });
    });

    it('preserves empty arrays', () => {
      const input = { arr: [], removed: undefined };
      const result = removeUndefined(input);

      expect(result).toEqual({ arr: [] });
    });

    it('preserves empty objects', () => {
      const input = { obj: {}, removed: undefined };
      const result = removeUndefined(input);

      expect(result).toEqual({ obj: {} });
    });

    it('preserves arrays with undefined elements', () => {
      const input = { arr: [1, undefined, 3], removed: undefined };
      const result = removeUndefined(input);

      expect(result).toEqual({ arr: [1, undefined, 3] });
    });
  });

  describe('nested objects', () => {
    it('keeps nested objects intact while removing top-level undefined', () => {
      const input = { nested: { inner: undefined, value: 2 }, removed: undefined };
      const result = removeUndefined(input);

      expect(result).toEqual({ nested: { inner: undefined, value: 2 } });
    });

    it('handles deeply nested objects', () => {
      const input = {
        level1: {
          level2: {
            level3: { value: 'deep' },
            undefinedValue: undefined,
          },
        },
        removed: undefined,
      };
      const result = removeUndefined(input);

      expect(result).toEqual({
        level1: {
          level2: {
            level3: { value: 'deep' },
            undefinedValue: undefined,
          },
        },
      });
    });

    it('handles mixed nested structures', () => {
      const input = {
        obj: { a: 1 },
        arr: [1, 2, 3],
        nested: { inner: { value: 'test' } },
        removed: undefined,
      };
      const result = removeUndefined(input);

      expect(result).toEqual({
        obj: { a: 1 },
        arr: [1, 2, 3],
        nested: { inner: { value: 'test' } },
      });
    });
  });

  describe('edge cases', () => {
    it('returns an empty object for empty input', () => {
      expect(removeUndefined({})).toEqual({});
    });

    it('handles object with only undefined values', () => {
      const input = { a: undefined, b: undefined, c: undefined };
      const result = removeUndefined(input);

      expect(result).toEqual({});
    });

    it('handles null prototype objects', () => {
      const input = Object.create(null);
      input.a = 1;
      input.b = undefined;
      const result = removeUndefined(input);

      expect(result).toEqual({ a: 1 });
    });
  });

  describe('type safety', () => {
    it('maintains type safety for returned objects', () => {
      const user = { name: 'Alice', age: undefined } as { name?: string; age?: number };
      const result = removeUndefined(user);

      expect(result.name).toBe('Alice');
      expect('age' in result).toBe(false);
    });

    it('handles generic types', () => {
      interface TestType<T> {
        value: T;
        optional?: T;
      }
      const input: TestType<string> = { value: 'test', optional: undefined };
      const result = removeUndefined(input as unknown as Record<string, unknown>);

      expect(result.value).toBe('test');
      expect('optional' in result).toBe(false);
    });

    it('handles union types', () => {
      const input: { value: string | number | undefined } = { value: undefined };
      const result = removeUndefined(input);

      expect(result).toEqual({});
    });

    it('handles optional properties', () => {
      interface User {
        name: string;
        email?: string;
      }
      const input: User = { name: 'Alice', email: undefined };
      const result = removeUndefined(input as unknown as Record<string, unknown>);

      expect(result.name).toBe('Alice');
      expect('email' in result).toBe(false);
    });
  });
});


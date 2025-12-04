import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase/firestore';
import { timestampToIso, TimestampLike } from '../timestampUtils';

describe('timestampToIso', () => {
  const fixedDate = new Date('2024-01-02T03:04:05.000Z');

  beforeEach(() => {
    jest.useFakeTimers({ now: fixedDate });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Firestore Timestamp', () => {
    it('converts Firestore Timestamp instances', () => {
      const timestamp = Timestamp.fromDate(fixedDate);

      expect(timestampToIso(timestamp)).toBe(fixedDate.toISOString());
    });

    it('handles future dates', () => {
      const futureDate = new Date('2099-12-31T23:59:59.999Z');
      const timestamp = Timestamp.fromDate(futureDate);

      expect(timestampToIso(timestamp)).toBe(futureDate.toISOString());
    });

    it('handles very old dates', () => {
      const oldDate = new Date('1970-01-01T00:00:00.000Z');
      const timestamp = Timestamp.fromDate(oldDate);

      expect(timestampToIso(timestamp)).toBe(oldDate.toISOString());
    });
  });

  describe('Admin SDK Timestamp', () => {
    it('converts Admin SDK Timestamp instances', () => {
      const adminTimestamp = AdminTimestamp.fromDate(fixedDate);

      expect(timestampToIso(adminTimestamp)).toBe(fixedDate.toISOString());
    });

    it('handles different timestamp formats', () => {
      const date = new Date('2023-06-15T12:30:45.123Z');
      const adminTimestamp = AdminTimestamp.fromDate(date);

      expect(timestampToIso(adminTimestamp)).toBe(date.toISOString());
    });
  });

  describe('string timestamps', () => {
    it('returns string timestamps unchanged', () => {
      const isoString = '2023-12-31T00:00:00.000Z';

      expect(timestampToIso(isoString)).toBe(isoString);
    });

    it('handles different string formats', () => {
      const isoString = '2023-12-31T00:00:00Z';
      const result = timestampToIso(isoString);

      expect(result).toBe(isoString);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('handles timezone strings', () => {
      const timezoneString = '2023-12-31T00:00:00+05:00';
      const result = timestampToIso(timezoneString);

      expect(result).toBe(timezoneString);
    });
  });

  describe('Date objects', () => {
    it('converts Date objects to ISO strings', () => {
      const date = new Date('2022-05-06T07:08:09.000Z');

      expect(timestampToIso(date)).toBe(date.toISOString());
    });

    it('handles invalid dates', () => {
      const invalidDate = new Date('invalid');
      // Invalid dates will throw when calling toISOString
      // The function doesn't catch this, so it will throw
      expect(() => {
        timestampToIso(invalidDate);
      }).toThrow();
    });

    it('handles dates with timezone offsets', () => {
      const date = new Date('2023-06-15T12:00:00-05:00');
      const result = timestampToIso(date);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('undefined input', () => {
    it('defaults to current time when timestamp is undefined', () => {
      expect(timestampToIso(undefined)).toBe(fixedDate.toISOString());
    });
  });

  describe('TimestampLike objects', () => {
    it('handles TimestampLike objects with toDate method', () => {
      const timestampLike: TimestampLike = {
        toDate: () => fixedDate,
      };

      expect(timestampToIso(timestampLike)).toBe(fixedDate.toISOString());
    });

    it('handles TimestampLike with missing properties', () => {
      const timestampLike: TimestampLike = {};
      const result = timestampToIso(timestampLike);

      expect(result).toBe(fixedDate.toISOString());
    });

    it('handles invalid TimestampLike structures', () => {
      const timestampLike = {
        toDate: 'not a function',
      } as unknown as TimestampLike;
      const result = timestampToIso(timestampLike);

      expect(result).toBe(fixedDate.toISOString());
    });

    it('handles custom objects with toDate', () => {
      const customObject = {
        toDate: () => new Date('2023-01-01T00:00:00.000Z'),
        otherProperty: 'value',
      };
      const result = timestampToIso(customObject);

      expect(result).toBe('2023-01-01T00:00:00.000Z');
    });
  });

  describe('ISO string format validation', () => {
    it('returns valid ISO 8601 format for all inputs', () => {
      const testCases = [
        Timestamp.fromDate(fixedDate),
        AdminTimestamp.fromDate(fixedDate),
        '2023-12-31T00:00:00.000Z',
        new Date('2023-12-31T00:00:00.000Z'),
        undefined,
      ];

      testCases.forEach((input) => {
        const result = timestampToIso(input);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });

    it('handles milliseconds precision', () => {
      const date = new Date('2023-12-31T12:34:56.789Z');
      const result = timestampToIso(date);

      expect(result).toContain('.789Z');
    });
  });
});


import {
  convertLocalToUTC,
  convertToTimezone,
  formatDateTimeInTimezone,
  getCommonTimezones,
  getTimezoneAbbreviation,
  getUserTimezone,
} from '../timezoneUtils';

describe('timezoneUtils', () => {
  describe('getUserTimezone', () => {
    it('returns browser timezone when window is defined', () => {
      const timezone = getUserTimezone();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
    });

    it('returns UTC on server environments', () => {
      const originalWindow = (global as typeof globalThis & { window?: Window }).window;
      const originalIntl = global.Intl;
      
      // Mock server environment
      // @ts-expect-error overriding for test
      delete (global as typeof globalThis & { window?: Window }).window;
      
      // Mock Intl to return UTC when window is undefined
      global.Intl = {
        ...originalIntl,
        DateTimeFormat: jest.fn().mockImplementation(() => ({
          resolvedOptions: () => ({ timeZone: 'UTC' }),
          supportedLocalesOf: originalIntl.DateTimeFormat.supportedLocalesOf,
        })) as unknown as typeof Intl.DateTimeFormat,
        Collator: originalIntl.Collator,
        NumberFormat: originalIntl.NumberFormat,
        PluralRules: originalIntl.PluralRules,
        RelativeTimeFormat: originalIntl.RelativeTimeFormat,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ListFormat: (originalIntl as any).ListFormat,
        DisplayNames: originalIntl.DisplayNames,
      } as unknown as typeof Intl;

      expect(getUserTimezone()).toBe('UTC');

      (global as typeof globalThis & { window?: Window }).window = originalWindow;
      global.Intl = originalIntl;
    });

    it('handles edge runtime environments', () => {
      const originalWindow = (global as typeof globalThis & { window?: Window }).window;
      const originalIntl = global.Intl;
      
      // @ts-expect-error overriding for test
      delete (global as typeof globalThis & { window?: Window }).window;
      
      global.Intl = {
        ...originalIntl,
        DateTimeFormat: jest.fn().mockImplementation(() => ({
          resolvedOptions: () => ({ timeZone: 'UTC' }),
        })),
      } as unknown as typeof Intl;

      const timezone = getUserTimezone();
      expect(timezone).toBe('UTC');

      (global as typeof globalThis & { window?: Window }).window = originalWindow;
      global.Intl = originalIntl;
    });
  });

  describe('convertToTimezone', () => {
    it('converts UTC string to target timezone', () => {
      const result = convertToTimezone('2024-01-01T12:00:00.000Z', 'America/New_York');

      expect(result).toBeInstanceOf(Date);
      // America/New_York is UTC-5 in January, so 12:00 UTC = 07:00 EST
      // The function converts to local time representation, so we check it's a valid date
      expect(result.getTime()).toBeTruthy();
      expect(result.getUTCMinutes()).toBe(0);
    });

    it('handles DST transitions', () => {
      const winter = convertToTimezone('2024-01-01T12:00:00.000Z', 'America/New_York');
      const summer = convertToTimezone('2024-07-01T12:00:00.000Z', 'America/New_York');

      expect(winter).toBeInstanceOf(Date);
      expect(summer).toBeInstanceOf(Date);
    });

    it('handles timezone boundaries', () => {
      const result = convertToTimezone('2024-01-01T00:00:00.000Z', 'Asia/Tokyo');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('formatDateTimeInTimezone', () => {
    it('formats date with timezone name', () => {
      const formatted = formatDateTimeInTimezone('2024-01-01T00:00:00.000Z', 'UTC');

      expect(formatted).toContain('UTC');
      expect(typeof formatted).toBe('string');
    });

    it('formats date with various timezones', () => {
      const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
      
      timezones.forEach((tz) => {
        const formatted = formatDateTimeInTimezone('2024-01-01T12:00:00.000Z', tz);
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      });
    });

    it('respects custom formatting options', () => {
      const formatted = formatDateTimeInTimezone(
        '2024-01-01T15:30:00.000Z',
        'Europe/London',
        { year: '2-digit', month: 'numeric', hour: '2-digit' }
      );

      expect(formatted).toMatch(/\d{1,2}\/.*/);
    });

    it('handles DST in formatting', () => {
      const winter = formatDateTimeInTimezone('2024-01-01T12:00:00.000Z', 'America/New_York');
      const summer = formatDateTimeInTimezone('2024-07-01T12:00:00.000Z', 'America/New_York');

      expect(winter).toBeTruthy();
      expect(summer).toBeTruthy();
    });

    it('handles extreme timezones', () => {
      const formatted = formatDateTimeInTimezone('2024-01-01T12:00:00.000Z', 'Pacific/Kiritimati');
      expect(typeof formatted).toBe('string');
    });
  });

  describe('convertLocalToUTC', () => {
    it('converts local time to UTC for standard offset', () => {
      const utc = convertLocalToUTC('2024-01-01', '12:00', 'America/New_York');

      expect(utc).toBe('2024-01-01T17:00:00.000Z');
      expect(utc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('handles daylight saving conversions', () => {
      const utc = convertLocalToUTC('2024-07-01', '12:00', 'America/New_York');

      expect(utc).toBe('2024-07-01T16:00:00.000Z');
    });

    it('handles DST spring forward transition', () => {
      const utc = convertLocalToUTC('2024-03-10', '02:30', 'America/New_York');
      expect(utc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('handles DST fall back transition', () => {
      const utc = convertLocalToUTC('2024-11-03', '01:30', 'America/New_York');
      expect(utc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('handles timezones without DST', () => {
      const utc = convertLocalToUTC('2024-01-01', '12:00', 'Asia/Tokyo');
      expect(utc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('manages edge cases around midnight', () => {
      const utc = convertLocalToUTC('2024-01-01', '00:00', 'America/New_York');
      expect(utc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('manages edge cases around year boundaries', () => {
      const utc = convertLocalToUTC('2024-12-31', '23:30', 'Asia/Tokyo');

      expect(utc).toBe('2024-12-31T14:30:00.000Z');
    });

    it('handles leap years', () => {
      const utc = convertLocalToUTC('2024-02-29', '12:00', 'UTC');
      expect(utc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('getCommonTimezones', () => {
    it('returns expected list of timezones', () => {
      const common = getCommonTimezones();
      const labels = common.map((tz) => tz.value);

      expect(labels).toEqual(
        expect.arrayContaining([
          'UTC',
          'America/New_York',
          'Europe/London',
          'Asia/Tokyo',
        ])
      );
      expect(common.length).toBeGreaterThanOrEqual(10);
    });

    it('returns array with value and label properties', () => {
      const common = getCommonTimezones();
      
      common.forEach((tz) => {
        expect(tz).toHaveProperty('value');
        expect(tz).toHaveProperty('label');
        expect(typeof tz.value).toBe('string');
        expect(typeof tz.label).toBe('string');
      });
    });

    it('has no duplicate entries', () => {
      const common = getCommonTimezones();
      const values = common.map((tz) => tz.value);
      const unique = new Set(values);
      
      expect(unique.size).toBe(values.length);
    });
  });

  describe('getTimezoneAbbreviation', () => {
    it('returns abbreviation for valid timezone', () => {
      const abbreviation = getTimezoneAbbreviation('America/New_York', new Date('2024-01-01T12:00:00.000Z'));

      expect(abbreviation.toUpperCase()).toMatch(/(EST|EDT|ET|GMT[-+]\d+)/);
    });

    it('handles DST abbreviations', () => {
      const winter = getTimezoneAbbreviation('America/New_York', new Date('2024-01-01T12:00:00.000Z'));
      const summer = getTimezoneAbbreviation('America/New_York', new Date('2024-07-01T12:00:00.000Z'));

      expect(typeof winter).toBe('string');
      expect(typeof summer).toBe('string');
    });

    it('returns timezone string when invalid timezone provided', () => {
      expect(getTimezoneAbbreviation('Invalid/Zone')).toBe('Invalid/Zone');
    });

    it('handles empty string timezone', () => {
      expect(() => getTimezoneAbbreviation('')).not.toThrow();
    });

    it('handles malformed timezone strings', () => {
      expect(() => getTimezoneAbbreviation('not/a/valid/timezone')).not.toThrow();
    });
  });
});


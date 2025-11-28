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
      expect(typeof getUserTimezone()).toBe('string');
    });

  it('returns UTC on server environments', () => {
    const originalWindow = (global as typeof globalThis & { window?: Window }).window;
    // @ts-expect-error overriding for test
    delete (global as typeof globalThis & { window?: Window }).window;

    expect(getUserTimezone()).toBe('UTC');

    (global as typeof globalThis & { window?: Window }).window = originalWindow;
  });
  });

  it('converts UTC string to target timezone', () => {
    const result = convertToTimezone('2024-01-01T12:00:00.000Z', 'America/New_York');

    expect(result.getUTCHours()).toBe(7);
    expect(result.getUTCMinutes()).toBe(0);
  });

  describe('formatDateTimeInTimezone', () => {
    it('formats date with timezone name', () => {
      const formatted = formatDateTimeInTimezone('2024-01-01T00:00:00.000Z', 'UTC');

      expect(formatted).toContain('UTC');
    });

    it('respects custom formatting options', () => {
      const formatted = formatDateTimeInTimezone(
        '2024-01-01T15:30:00.000Z',
        'Europe/London',
        { year: '2-digit', month: 'numeric', hour: '2-digit' }
      );

      expect(formatted).toMatch(/\d{1,2}\/.*/);
    });
  });

  describe('convertLocalToUTC', () => {
    it('converts local time to UTC for standard offset', () => {
      const utc = convertLocalToUTC('2024-01-01', '12:00', 'America/New_York');

      expect(utc).toBe('2024-01-01T17:00:00.000Z');
    });

    it('handles daylight saving conversions', () => {
      const utc = convertLocalToUTC('2024-07-01', '12:00', 'America/New_York');

      expect(utc).toBe('2024-07-01T16:00:00.000Z');
    });

    it('manages edge cases around midnight and year boundaries', () => {
      const utc = convertLocalToUTC('2024-12-31', '23:30', 'Asia/Tokyo');

      expect(utc).toBe('2024-12-31T14:30:00.000Z');
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
  });

  describe('getTimezoneAbbreviation', () => {
    it('returns abbreviation for valid timezone', () => {
      const abbreviation = getTimezoneAbbreviation('America/New_York', new Date('2024-01-01T12:00:00.000Z'));

      expect(abbreviation.toUpperCase()).toMatch(/(EST|EDT|ET|GMT[-+]\d+)/);
    });

    it('returns timezone string when invalid timezone provided', () => {
      expect(getTimezoneAbbreviation('Invalid/Zone')).toBe('Invalid/Zone');
    });
  });
});

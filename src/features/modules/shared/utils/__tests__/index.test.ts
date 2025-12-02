import { formatDuration, formatEloChange } from '../index';

describe('formatDuration', () => {
  describe('basic functionality', () => {
    it('formats seconds only', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(60)).toBe('1m 0s');
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(125)).toBe('2m 5s');
      expect(formatDuration(3599)).toBe('59m 59s');
    });

    it('formats hours, minutes, and seconds', () => {
      expect(formatDuration(3600)).toBe('1h 0m 0s');
      expect(formatDuration(3661)).toBe('1h 1m 1s');
      expect(formatDuration(7325)).toBe('2h 2m 5s');
      expect(formatDuration(36661)).toBe('10h 11m 1s');
    });
  });

  describe('edge cases', () => {
    it('handles zero duration', () => {
      expect(formatDuration(0)).toBe('0s');
    });

    it('handles large durations', () => {
      expect(formatDuration(86400)).toBe('24h 0m 0s');
      expect(formatDuration(90000)).toBe('25h 0m 0s');
    });

    it('handles fractional seconds', () => {
      // Note: Only hours and minutes are floored, seconds preserve decimals
      expect(formatDuration(30.9)).toBe('30.9s');
      expect(formatDuration(90.5)).toBe('1m 30.5s');
    });
  });
});

describe('formatEloChange', () => {
  describe('basic functionality', () => {
    it('formats positive ELO changes with plus sign', () => {
      expect(formatEloChange(0)).toBe('+0.00');
      expect(formatEloChange(10)).toBe('+10.00');
      expect(formatEloChange(25.5)).toBe('+25.50');
      expect(formatEloChange(100)).toBe('+100.00');
    });

    it('formats negative ELO changes without plus sign', () => {
      expect(formatEloChange(-10)).toBe('-10.00');
      expect(formatEloChange(-25.5)).toBe('-25.50');
      expect(formatEloChange(-100)).toBe('-100.00');
    });

    it('formats to 2 decimal places', () => {
      expect(formatEloChange(10.1)).toBe('+10.10');
      expect(formatEloChange(10.12)).toBe('+10.12');
      expect(formatEloChange(10.123)).toBe('+10.12');
      expect(formatEloChange(10.999)).toBe('+11.00');
    });
  });

  describe('edge cases', () => {
    it('handles zero change', () => {
      expect(formatEloChange(0)).toBe('+0.00');
    });

    it('handles very small changes', () => {
      expect(formatEloChange(0.01)).toBe('+0.01');
      expect(formatEloChange(-0.01)).toBe('-0.01');
      expect(formatEloChange(0.001)).toBe('+0.00');
      expect(formatEloChange(-0.001)).toBe('-0.00');
    });

    it('handles very large changes', () => {
      expect(formatEloChange(1000)).toBe('+1000.00');
      expect(formatEloChange(-1000)).toBe('-1000.00');
    });
  });
});



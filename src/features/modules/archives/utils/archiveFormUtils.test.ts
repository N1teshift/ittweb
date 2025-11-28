import { buildDateInfo, computeEffectiveSectionOrder, extractFilenameFromUrl, normalizeSectionOrder } from './archiveFormUtils';

describe('archiveFormUtils', () => {
  describe('buildDateInfo', () => {
    it('creates a single-date structure when all fields are provided', () => {
      const dateInfo = buildDateInfo({
        dateType: 'single',
        singleDate: ' 2024-05-01 ',
        approximateText: 'ignored'
      });

      expect(dateInfo).toEqual({
        type: 'single',
        singleDate: '2024-05-01'
      });
    });

    it('creates an undated structure when minimal information is provided', () => {
      const dateInfo = buildDateInfo({
        dateType: 'undated',
        singleDate: '',
        approximateText: ''
      });

      expect(dateInfo).toEqual({ type: 'undated' });
    });
  });

  describe('normalizeSectionOrder', () => {
    it('deduplicates and fills missing sections according to canonical order', () => {
      const normalized = normalizeSectionOrder(['video', 'images', 'video', 'text', 'unknown' as any]);

      expect(normalized).toEqual(['video', 'images', 'text', 'twitch', 'replay', 'game']);
    });
  });

  describe('computeEffectiveSectionOrder', () => {
    it('respects available media flags and maintains relative order', () => {
      const order = computeEffectiveSectionOrder(
        ['video', 'images', 'video', 'text'],
        { hasImages: true, hasVideo: true, hasTwitch: false, hasReplay: false, hasGame: false, hasText: true }
      );

      expect(order).toEqual(['video', 'images', 'text']);
    });

    it('returns an empty array when no sections are available', () => {
      const order = computeEffectiveSectionOrder([], {
        hasImages: false,
        hasVideo: false,
        hasTwitch: false,
        hasReplay: false,
        hasGame: false,
        hasText: false
      });

      expect(order).toEqual([]);
    });
  });

  describe('extractFilenameFromUrl', () => {
    it('extracts and decodes the filename from a URL', () => {
      expect(extractFilenameFromUrl('https://example.com/uploads/My%20Replay.w3g')).toBe('My Replay.w3g');
    });

    it('returns fallback value when URL is empty', () => {
      expect(extractFilenameFromUrl('')).toBe('File');
    });
  });
});

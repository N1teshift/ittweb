import {
  buildDateInfo,
  computeEffectiveSectionOrder,
  extractFilenameFromUrl,
  normalizeSectionOrder,
  type SectionKey,
} from './archiveFormUtils';

describe('archiveFormUtils', () => {
  describe('buildDateInfo', () => {
    it('builds single date info', () => {
      expect(
        buildDateInfo({ dateType: 'single', singleDate: '2024-01-01', approximateText: '' })
      ).toEqual({ type: 'single', singleDate: '2024-01-01' });
    });

    it('builds undated info with approximate text', () => {
      expect(
        buildDateInfo({ dateType: 'undated', singleDate: '', approximateText: 'circa 2020' })
      ).toEqual({ type: 'undated', approximateText: 'circa 2020' });
    });
  });

  describe('computeEffectiveSectionOrder', () => {
    const order: SectionKey[] = ['images', 'replay', 'game', 'text'];

    it('filters sections based on flags while preserving order', () => {
      const effective = computeEffectiveSectionOrder(order, {
        hasImages: true,
        hasVideo: false,
        hasTwitch: false,
        hasReplay: true,
        hasGame: true,
        hasText: true,
      });

      expect(effective).toEqual(['images', 'replay', 'game', 'text']);
    });
  });

  describe('normalizeSectionOrder', () => {
    it('removes duplicates and fills missing sections', () => {
      const normalized = normalizeSectionOrder(['text', 'images', 'text', 'video']);

      expect(normalized).toEqual(['text', 'images', 'video', 'twitch', 'replay', 'game']);
    });

    it('returns canonical order for empty input', () => {
      expect(normalizeSectionOrder()).toEqual(['images', 'video', 'twitch', 'replay', 'game', 'text']);
    });

    it('ignores invalid sections', () => {
      // @ts-expect-error intentional invalid section for test
      const normalized = normalizeSectionOrder(['images', 'invalid', 'video']);

      expect(normalized).toEqual(['images', 'video', 'twitch', 'replay', 'game', 'text']);
    });
  });

  describe('extractFilenameFromUrl', () => {
    it('extracts filename from valid URL', () => {
      expect(extractFilenameFromUrl('https://example.com/path/to/file.png')).toBe('file.png');
    });

    it('handles URL encoded filenames', () => {
      expect(extractFilenameFromUrl('https://example.com/files/hello%20world.txt')).toBe('hello world.txt');
    });

    it('handles invalid URLs gracefully', () => {
      expect(extractFilenameFromUrl('not a url')).toBe('not a url');
    });

    it('returns fallback for empty path', () => {
      expect(extractFilenameFromUrl('')).toBe('File');
    });
  });
});

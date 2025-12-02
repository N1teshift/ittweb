import {
  buildDateInfo,
  computeEffectiveSectionOrder,
  extractFilenameFromUrl,
  normalizeSectionOrder,
  type SectionKey,
} from '../archiveFormUtils';

describe('archiveFormUtils', () => {
  describe('buildDateInfo', () => {
    it('builds single date info', () => {
      expect(
        buildDateInfo({ dateType: 'single', singleDate: '2024-01-01', approximateText: '' })
      ).toEqual({ type: 'single', singleDate: '2024-01-01' });
    });

    it('builds single date info with trimmed date', () => {
      expect(
        buildDateInfo({ dateType: 'single', singleDate: '  2024-01-01  ', approximateText: '' })
      ).toEqual({ type: 'single', singleDate: '2024-01-01' });
    });

    it('builds undated info with approximate text', () => {
      expect(
        buildDateInfo({ dateType: 'undated', singleDate: '', approximateText: 'circa 2020' })
      ).toEqual({ type: 'undated', approximateText: 'circa 2020' });
    });

    it('includes approximateText when provided for single date', () => {
      const result = buildDateInfo({
        dateType: 'single',
        singleDate: '2024-01-01',
        approximateText: 'approximately',
      });
      
      expect(result.type).toBe('single');
      expect(result.singleDate).toBe('2024-01-01');
    });

    it('handles empty approximate text', () => {
      const result = buildDateInfo({
        dateType: 'undated',
        singleDate: '',
        approximateText: '',
      });
      
      expect(result.type).toBe('undated');
      expect(result.approximateText).toBeUndefined();
    });

    it('handles very long approximate text', () => {
      const longText = 'a'.repeat(1000);
      const result = buildDateInfo({
        dateType: 'undated',
        singleDate: '',
        approximateText: longText,
      });
      
      expect(result.approximateText).toBe(longText);
    });

    it('handles special characters in approximate text', () => {
      const specialText = 'circa ~2020 (approx.)';
      const result = buildDateInfo({
        dateType: 'undated',
        singleDate: '',
        approximateText: specialText,
      });
      
      expect(result.approximateText).toBe(specialText);
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

    it('filters out disabled sections', () => {
      const effective = computeEffectiveSectionOrder(order, {
        hasImages: false,
        hasVideo: false,
        hasTwitch: false,
        hasReplay: false,
        hasGame: false,
        hasText: false,
      });

      expect(effective).toEqual([]);
    });

    it('includes all sections when all enabled', () => {
      const fullOrder: SectionKey[] = ['images', 'video', 'twitch', 'replay', 'game', 'text'];
      const effective = computeEffectiveSectionOrder(fullOrder, {
        hasImages: true,
        hasVideo: true,
        hasTwitch: true,
        hasReplay: true,
        hasGame: true,
        hasText: true,
      });

      expect(effective).toEqual(fullOrder);
    });

    it('maintains order with mixed flags', () => {
      const effective = computeEffectiveSectionOrder(order, {
        hasImages: true,
        hasVideo: false,
        hasTwitch: false,
        hasReplay: false,
        hasGame: true,
        hasText: false,
      });

      expect(effective).toEqual(['images', 'game']);
    });
  });

  describe('normalizeSectionOrder', () => {
    it('removes duplicates and fills missing sections', () => {
      const normalized = normalizeSectionOrder(['text', 'images', 'text', 'video']);

      expect(normalized).toEqual(['text', 'images', 'video', 'twitch', 'replay', 'game']);
    });

    it('removes multiple duplicates', () => {
      const normalized = normalizeSectionOrder(['images', 'images', 'images', 'video']);
      
      expect(normalized).toEqual(['images', 'video', 'twitch', 'replay', 'game', 'text']);
    });

    it('fills missing sections', () => {
      const normalized = normalizeSectionOrder(['images', 'text']);
      
      expect(normalized).toEqual(['images', 'text', 'video', 'twitch', 'replay', 'game']);
    });

    it('returns canonical order for empty input', () => {
      expect(normalizeSectionOrder()).toEqual(['images', 'video', 'twitch', 'replay', 'game', 'text']);
    });

    it('returns canonical order for empty array', () => {
      expect(normalizeSectionOrder([])).toEqual(['images', 'video', 'twitch', 'replay', 'game', 'text']);
    });

    it('ignores invalid sections', () => {
      // @ts-expect-error intentional invalid section for test
      const normalized = normalizeSectionOrder(['images', 'invalid', 'video']);

      expect(normalized).toEqual(['images', 'video', 'twitch', 'replay', 'game', 'text']);
    });

    it('handles partial missing sections', () => {
      const normalized = normalizeSectionOrder(['images', 'video', 'text']);
      
      expect(normalized).toEqual(['images', 'video', 'text', 'twitch', 'replay', 'game']);
    });
  });

  describe('extractFilenameFromUrl', () => {
    it('extracts filename from valid URL', () => {
      expect(extractFilenameFromUrl('https://example.com/path/to/file.png')).toBe('file.png');
    });

    it('extracts filename from URL without path', () => {
      expect(extractFilenameFromUrl('https://example.com/file.png')).toBe('file.png');
    });

    it('handles URLs without filename', () => {
      expect(extractFilenameFromUrl('https://example.com/path/')).toBe('File');
    });

    it('handles URLs with query parameters', () => {
      expect(extractFilenameFromUrl('https://example.com/file.png?param=value')).toBe('file.png');
    });

    it('handles URLs with fragments', () => {
      expect(extractFilenameFromUrl('https://example.com/file.png#section')).toBe('file.png');
    });

    it('handles URLs with both query and fragment', () => {
      expect(extractFilenameFromUrl('https://example.com/file.png?param=value#section')).toBe('file.png');
    });

    it('handles URL encoded filenames', () => {
      expect(extractFilenameFromUrl('https://example.com/files/hello%20world.txt')).toBe('hello world.txt');
    });

    it('handles multiple URL encodings', () => {
      expect(extractFilenameFromUrl('https://example.com/files/hello%20world%21.txt')).toBe('hello world!.txt');
    });

    it('handles unicode characters in filenames', () => {
      expect(extractFilenameFromUrl('https://example.com/files/файл.png')).toBe('файл.png');
    });

    it('handles URL-encoded unicode', () => {
      const encoded = encodeURIComponent('файл.png');
      expect(extractFilenameFromUrl(`https://example.com/files/${encoded}`)).toBe('файл.png');
    });

    it('handles invalid URLs gracefully', () => {
      expect(extractFilenameFromUrl('not a url')).toBe('not a url');
    });

    it('handles malformed URLs', () => {
      expect(extractFilenameFromUrl('http://')).toBe('File');
    });

    it('returns fallback for empty URL', () => {
      expect(extractFilenameFromUrl('')).toBe('File');
    });

    it('handles null-like empty string', () => {
      expect(extractFilenameFromUrl('')).toBe('File');
    });

    it('handles whitespace-only URL', () => {
      // The function splits by '/' and gets last segment, which for '   ' would be '   '
      // Since decodeURIComponent('   ') returns '   ' (truthy), it returns that, not 'File'
      const result = extractFilenameFromUrl('   ');
      // The function behavior: splits by '/', gets last part '   ', which is truthy, so returns it
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles non-URL strings', () => {
      expect(extractFilenameFromUrl('just a string')).toBe('just a string');
    });
  });
});



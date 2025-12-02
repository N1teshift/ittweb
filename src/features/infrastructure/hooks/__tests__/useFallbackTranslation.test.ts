import { renderHook } from '@testing-library/react';
import { useFallbackTranslation } from '../useFallbackTranslation';

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

// Mock TranslationNamespaceContext
jest.mock('../../lib/TranslationNamespaceContext', () => ({
  useTranslationNamespace: jest.fn(),
}));

// Mock logger
jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

const { useTranslation } = jest.requireMock('next-i18next');
const { useTranslationNamespace } = jest.requireMock(
  '../../lib/TranslationNamespaceContext'
);

describe('useFallbackTranslation', () => {
  const mockI18n = {
    t: jest.fn(),
    exists: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslationNamespace as jest.Mock).mockReturnValue({
      translationNs: ['common'],
    });
    (useTranslation as jest.Mock).mockReturnValue({
      t: jest.fn((key: string) => key),
      i18n: mockI18n,
      ready: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('uses provided namespaces', () => {
    it('should use provided namespace when given', () => {
      // Arrange
      const providedNamespaces = ['blog', 'common'];

      // Act
      const { result } = renderHook(() =>
        useFallbackTranslation(providedNamespaces)
      );

      // Assert
      expect(result.current.ready).toBe(true);
      expect(useTranslation).toHaveBeenCalledWith('blog');
    });

    it('should use single namespace string', () => {
      // Arrange
      const providedNamespace = 'blog';

      // Act
      const { result } = renderHook(() =>
        useFallbackTranslation(providedNamespace)
      );

      // Assert
      expect(result.current.ready).toBe(true);
      expect(useTranslation).toHaveBeenCalledWith('blog');
    });
  });

  describe('uses context namespaces', () => {
    it('should fall back to context namespaces when not provided', () => {
      // Arrange
      (useTranslationNamespace as jest.Mock).mockReturnValue({
        translationNs: ['common', 'shared'],
      });

      // Act
      const { result } = renderHook(() => useFallbackTranslation());

      // Assert
      expect(result.current.ready).toBe(true);
      expect(useTranslation).toHaveBeenCalledWith('common');
    });
  });

  describe('translation fallback logic', () => {
    it('should return primary translation when found', () => {
      // Arrange
      const mockT = jest.fn((key: string) => {
        if (key === 'test.key') return 'Translated Text';
        return key;
      });
      (useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: mockI18n,
        ready: true,
      });

      // Act
      const { result } = renderHook(() =>
        useFallbackTranslation(['common', 'fallback'])
      );

      // Assert
      const translation = result.current.t('test.key');
      expect(translation).toBe('Translated Text');
    });

    it('should fall back to secondary namespace when primary fails', () => {
      // Arrange
      const mockT = jest.fn((key: string) => key); // Primary returns key (not found)
      mockI18n.t = jest.fn((key: string, options?: { ns?: string }) => {
        if (options?.ns === 'fallback' && key === 'test.key') {
          return 'Fallback Translation';
        }
        return key;
      });
      (useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: mockI18n,
        ready: true,
      });

      // Act
      const { result } = renderHook(() =>
        useFallbackTranslation(['common', 'fallback'])
      );

      // Assert
      const translation = result.current.t('test.key');
      expect(translation).toBe('Fallback Translation');
      expect(mockI18n.t).toHaveBeenCalledWith('test.key', { ns: 'fallback' });
    });

    it('should try multiple fallback namespaces', () => {
      // Arrange
      const mockT = jest.fn((key: string) => key); // Primary returns key (not found)
      mockI18n.t = jest.fn((key: string, options?: { ns?: string }) => {
        if (options?.ns === 'fallback2' && key === 'test.key') {
          return 'Fallback2 Translation';
        }
        return key;
      });
      (useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: mockI18n,
        ready: true,
      });

      // Act
      const { result } = renderHook(() =>
        useFallbackTranslation(['common', 'fallback1', 'fallback2'])
      );

      // Assert
      const translation = result.current.t('test.key');
      expect(translation).toBe('Fallback2 Translation');
      expect(mockI18n.t).toHaveBeenCalledWith('test.key', { ns: 'fallback1' });
      expect(mockI18n.t).toHaveBeenCalledWith('test.key', { ns: 'fallback2' });
    });

    it('should return key if no translation found in any namespace', () => {
      // Arrange
      const mockT = jest.fn((key: string) => key);
      mockI18n.t = jest.fn((key: string) => key);
      (useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: mockI18n,
        ready: true,
      });

      // Act
      const { result } = renderHook(() =>
        useFallbackTranslation(['common', 'fallback'])
      );

      // Assert
      const translation = result.current.t('nonexistent.key');
      expect(translation).toBe('nonexistent.key');
    });
  });

  describe('handles array keys', () => {
    it('should handle array keys without fallback', () => {
      // Arrange
      const mockT = jest.fn((key: string | string[]) => {
        if (Array.isArray(key)) return 'Array Translation';
        return key;
      });
      (useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: mockI18n,
        ready: true,
      });

      // Act
      const { result } = renderHook(() =>
        useFallbackTranslation(['common', 'fallback'])
      );

      // Assert
      const translation = result.current.t(['key1', 'key2']);
      expect(translation).toBe('Array Translation');
      expect(mockT).toHaveBeenCalledWith(['key1', 'key2'], undefined);
    });
  });

  describe('passes translation options', () => {
    it('should pass options to primary translation', () => {
      // Arrange
      const mockT = jest.fn((key: string, options?: Record<string, unknown>) => {
        if (key === 'test.key' && (options as { count?: number })?.count === 5) {
          return '5 items';
        }
        return key;
      });
      (useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: mockI18n,
        ready: true,
      });

      // Act
      const { result } = renderHook(() =>
        useFallbackTranslation(['common'])
      );

      // Assert
      const translation = result.current.t('test.key', { count: 5 });
      expect(translation).toBe('5 items');
      expect(mockT).toHaveBeenCalledWith('test.key', { count: 5 });
    });

    it('should pass options to fallback translations', () => {
      // Arrange
      const mockT = jest.fn((key: string) => key);
      mockI18n.t = jest.fn((key: string, options?: Record<string, unknown>) => {
        const opts = options as { ns?: string; count?: number } | undefined;
        if (opts?.ns === 'fallback' && opts?.count === 3) {
          return '3 items';
        }
        return key;
      });
      (useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: mockI18n,
        ready: true,
      });

      // Act
      const { result } = renderHook(() =>
        useFallbackTranslation(['common', 'fallback'])
      );

      // Assert
      const translation = result.current.t('test.key', { count: 3 });
      expect(translation).toBe('3 items');
      expect(mockI18n.t).toHaveBeenCalledWith('test.key', {
        ns: 'fallback',
        count: 3,
      });
    });
  });
});



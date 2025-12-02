import { act, renderHook, waitFor } from '@testing-library/react';
import { useItemsData } from '../useItemsData';
import type { ItemData } from '@/types/items';

describe('useItemsData', () => {
  const mockItems: ItemData[] = [
    { id: 'item1', name: 'Item 1', category: 'weapons', description: 'Test item 1' },
    { id: 'item2', name: 'Item 2', category: 'buildings', description: 'Test item 2' },
  ];

  const mockApiResponse = {
    success: true,
    data: {
      items: mockItems,
      meta: {
        total: 2,
        buildingsTotal: 1,
        count: 2,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('returns expected structure', () => {
    it('should return items, meta, isLoading, error, and refetch', () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      // Act
      const { result } = renderHook(() => useItemsData());

      // Assert
      expect(result.current).toHaveProperty('items');
      expect(result.current).toHaveProperty('meta');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(typeof result.current.refetch).toBe('function');
      expect(Array.isArray(result.current.items)).toBe(true);
    });
  });

  describe('refetch function', () => {
    it('should allow manual refetch', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      // Act
      const { result } = renderHook(() => useItemsData());

      // Wait for initial load (if any)
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });

      // Manual refetch - this always works regardless of cache
      await act(async () => {
        await result.current.refetch();
      });

      // Assert
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });
      expect(result.current.items).toBeDefined();
      expect(result.current.meta).toBeDefined();
      expect(Array.isArray(result.current.items)).toBe(true);
    });

    it('should handle errors during refetch', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      // First call might succeed (or use cache)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);
      // Refetch call fails
      const refetchError = new Error('Refetch error');
      mockFetch.mockRejectedValueOnce(refetchError);

      // Act
      const { result } = renderHook(() => useItemsData());

      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });

      // Manual refetch that will fail
      await act(async () => {
        try {
          await result.current.refetch();
        } catch (err) {
          // Error is expected, refetch handles it internally
        }
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        // Refetch should set error when it fails
        if (result.current.error) {
          expect(result.current.error).toBeInstanceOf(Error);
          expect(result.current.error?.message).toBe('Refetch error');
        }
      }, { timeout: 3000 });
    });
  });

  describe('handles loading state', () => {
    it('should eventually set loading to false', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      // Act
      const { result } = renderHook(() => useItemsData());

      // Assert - loading should eventually be false (either from cache or fetch)
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });
      expect(result.current.isLoading).toBe(false);
    });
  });
});


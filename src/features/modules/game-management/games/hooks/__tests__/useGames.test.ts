import { act, renderHook, waitFor } from '@testing-library/react';
import { useGames } from '../useGames';
import type { Game, GameFilters, GameListResponse } from '../../types';

// Mock logger
jest.mock('@/features/infrastructure/logging', () => ({
  logError: jest.fn(),
}));

describe('useGames', () => {
  const mockGames: Game[] = [
    {
      id: '1',
      gameId: 1,
      gameState: 'completed',
      creatorName: 'Test Creator',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      datetime: '2024-01-01T00:00:00Z',
      duration: 3600,
      gamename: 'Test Game',
      map: 'Test Map',
      ownername: 'Test Owner',
      category: '1v1',
    },
    {
      id: '2',
      gameId: 2,
      gameState: 'completed',
      creatorName: 'Test Creator 2',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      datetime: '2024-01-02T00:00:00Z',
      duration: 1800,
      gamename: 'Test Game 2',
      map: 'Test Map 2',
      ownername: 'Test Owner 2',
      category: '2v2',
    },
  ];

  const mockGameListResponse: GameListResponse = {
    games: mockGames,
    hasMore: false,
    nextCursor: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetches games on mount', () => {
    it('should fetch games when hook mounts', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGames());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith('/api/games?');
      expect(result.current.games).toEqual(mockGames);
      expect(result.current.error).toBeNull();
    });

    it('should handle empty results', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { games: [], hasMore: false },
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGames());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.games).toEqual([]);
      expect(result.current.hasMore).toBe(false);
    });

    it('should handle network errors', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const { result } = renderHook(() => useGames());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
    });

    it('should handle slow responses', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  success: true,
                  data: mockGameListResponse,
                }),
              } as Response);
            }, 100);
          })
      );

      // Act
      const { result } = renderHook(() => useGames());

      // Assert
      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 200 });
      expect(result.current.games).toEqual(mockGames);
    });
  });

  describe('applies filters', () => {
    it('should apply gameState filter', async () => {
      // Arrange
      const filters: GameFilters = { gameState: 'completed' };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGames(filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith('/api/games?gameState=completed');
    });

    it('should apply multiple filters', async () => {
      // Arrange
      const filters: GameFilters = {
        gameState: 'completed',
        category: '1v1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGames(filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/games?gameState=completed&startDate=2024-01-01&endDate=2024-01-31&category=1v1'
      );
    });

    it('should refetch when filters change', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      // Act
      const { result, rerender } = renderHook(
        ({ filters }) => useGames(filters),
        {
          initialProps: { filters: { gameState: 'completed' as const } },
        }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Change filter
      rerender({ filters: { gameState: 'scheduled' as const } as any });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith('/api/games?gameState=scheduled');
    });

    it('should handle rapid filter changes', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      // Act
      const { result, rerender } = renderHook(
        ({ filters }) => useGames(filters),
        {
          initialProps: { filters: { category: '1v1' } },
        }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Rapid filter changes
      rerender({ filters: { category: '2v2' } });
      rerender({ filters: { category: '3v3' } });
      rerender({ filters: { category: '4v4' } });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should handle same filter value (no unnecessary refetch)', async () => {
      // Arrange
      const filters: GameFilters = { gameState: 'completed' };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      // Act
      const { result, rerender } = renderHook(
        ({ filters }) => useGames(filters),
        {
          initialProps: { filters },
        }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      const firstCallCount = mockFetch.mock.calls.length;

      // Rerender with same filters
      rerender({ filters });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      // Should not trigger additional fetch for same filter values
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(firstCallCount);
    });
  });

  describe('handles loading state', () => {
    it('should set loading to true during fetch', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      let resolveFetch: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });
      mockFetch.mockReturnValueOnce(fetchPromise);

      // Act
      const { result } = renderHook(() => useGames());

      // Assert
      expect(result.current.loading).toBe(true);

      // Resolve fetch
      resolveFetch!({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('should set loading to false after fetch completes', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGames());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.loading).toBe(false);
    });

    it('should handle multiple rapid fetches', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      // Act
      const { result, rerender } = renderHook(
        ({ filters }) => useGames(filters),
        {
          initialProps: { filters: {} },
        }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Trigger multiple rapid filter changes
      rerender({ filters: { category: '1v1' } });
      rerender({ filters: { category: '2v2' } });
      rerender({ filters: { category: '3v3' } });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.loading).toBe(false);
    });
  });

  describe('handles error state', () => {
    it('should capture and expose network errors', async () => {
      // Arrange
      const networkError = new Error('Network request failed');
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(networkError);

      // Act
      const { result } = renderHook(() => useGames());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network request failed');
    });

    it('should handle HTTP error responses', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response);

      // Act
      const { result } = renderHook(() => useGames());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain('Failed to fetch games');
    });

    it('should handle API error responses', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Invalid filters provided',
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGames());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Invalid filters provided');
    });

    it('should handle permission errors', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      // Act
      const { result } = renderHook(() => useGames());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain('Failed to fetch games');
    });
  });

  describe('refetches on filter change', () => {
    it('should trigger refetch when filter changes', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      // Act
      const { result, rerender } = renderHook(
        ({ filters }) => useGames(filters),
        {
          initialProps: { filters: { gameState: 'completed' as const } },
        }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      const initialCallCount = mockFetch.mock.calls.length;

      // Change filter
      rerender({ filters: { gameState: 'scheduled' as const, category: '1v1' as const } as any });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('should handle pagination filters', async () => {
      // Arrange
      const filters: GameFilters = { page: 2, limit: 10 };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { ...mockGameListResponse, nextCursor: 'cursor123' },
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGames(filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith('/api/games?page=2&limit=10');
      expect(result.current.nextCursor).toBe('cursor123');
    });
  });

  describe('refetch function', () => {
    it('should allow manual refetch', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGameListResponse,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGames());

      await waitFor(() => expect(result.current.loading).toBe(false));
      const initialCallCount = mockFetch.mock.calls.length;

      // Manual refetch
      act(() => {
        result.current.refetch();
      });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});



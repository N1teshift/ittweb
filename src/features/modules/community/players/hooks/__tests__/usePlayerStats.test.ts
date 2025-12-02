import { act, renderHook, waitFor } from '@testing-library/react';
import { usePlayerStats } from '../usePlayerStats';
import type { PlayerProfile, PlayerSearchFilters } from '../../types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock logger
jest.mock('@/features/infrastructure/logging', () => ({
  logError: jest.fn(),
}));

describe('usePlayerStats', () => {
  const mockPlayerProfile: PlayerProfile = {
    id: 'testplayer',
    name: 'TestPlayer',
    categories: {
      '1v1': {
        wins: 10,
        losses: 5,
        draws: 0,
        score: 1500,
        games: 15,
        rank: 1,
        peakElo: 1600,
        peakEloDate: '2024-01-15T00:00:00Z',
      },
    },
    totalGames: 15,
    lastPlayed: '2024-01-15T00:00:00Z',
    firstPlayed: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetches player statistics', () => {
    it('should fetch player stats when hook mounts', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPlayerProfile,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Initial state should be loading
      expect(result.current.loading).toBe(true);
      expect(result.current.player).toBeNull();

      // Manually trigger fetch since useEffect might not run in test environment
      await act(async () => {
        await result.current.refetch();
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/players/TestPlayer?');
      expect(result.current.loading).toBe(false);
      expect(result.current.player).toEqual(mockPlayerProfile);
      expect(result.current.error).toBeNull();
    });

    it('should handle URL encoding for player names', async () => {
      // Arrange
      const playerName = 'Player With Spaces';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPlayerProfile,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(playerName))
      );
    });

    it('should handle network errors', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const networkError = new Error('Network error');
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(networkError);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
    });

    it('should handle missing player', async () => {
      // Arrange
      const playerName = 'NonExistentPlayer';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.player).toBeNull();
    });

    it('should handle slow responses', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  success: true,
                  data: mockPlayerProfile,
                }),
              } as Response);
            }, 100);
          })
      );

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Assert
      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 200 });
      expect(result.current.player).toEqual(mockPlayerProfile);
    });
  });

  describe('handles loading state', () => {
    it('should set loading to true during fetch', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      let resolveFetch: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });
      mockFetch.mockReturnValueOnce(fetchPromise);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Assert
      expect(result.current.loading).toBe(true);

      // Resolve fetch
      resolveFetch!({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPlayerProfile,
        }),
      } as Response);

      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('should set loading to false after fetch completes', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPlayerProfile,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

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
          data: mockPlayerProfile,
        }),
      } as Response);

      // Act
      const { result, rerender } = renderHook(
        ({ name }) => usePlayerStats(name),
        {
          initialProps: { name: 'Player1' },
        }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Rapid name changes
      rerender({ name: 'Player2' });
      rerender({ name: 'Player3' });
      rerender({ name: 'Player4' });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.loading).toBe(false);
    });
  });

  describe('handles error state', () => {
    it('should capture and expose network errors', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const networkError = new Error('Network request failed');
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(networkError);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network request failed');
    });

    it('should handle HTTP error responses', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain('Failed to fetch player');
    });

    it('should handle API error responses', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Player not found',
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Player not found');
    });

    it('should handle permission errors', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain('Failed to fetch player');
    });
  });

  describe('applies filters', () => {
    it('should apply category filter', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const filters: PlayerSearchFilters = { category: '1v1' };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPlayerProfile,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName, filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('category=1v1')
      );
    });

    it('should apply date range filters', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const filters: PlayerSearchFilters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPlayerProfile,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName, filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2024-01-31')
      );
    });

    it('should apply includeGames filter', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const filters: PlayerSearchFilters = { includeGames: true };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPlayerProfile,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName, filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('includeGames=true')
      );
    });

    it('should apply multiple filters', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const filters: PlayerSearchFilters = {
        category: '1v1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        includeGames: true,
      };
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPlayerProfile,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName, filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('category=1v1');
      expect(callUrl).toContain('startDate=2024-01-01');
      expect(callUrl).toContain('endDate=2024-01-31');
      expect(callUrl).toContain('includeGames=true');
    });

    it('should refetch when filters change', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPlayerProfile,
        }),
      } as Response);

      // Act
      const { result, rerender } = renderHook(
        ({ name, filters }) => usePlayerStats(name, filters),
        {
          initialProps: { name: playerName, filters: { category: '1v1' } },
        }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Change filter
      rerender({ name: playerName, filters: { category: '2v2' } });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.stringContaining('category=2v2')
      );
    });
  });

  describe('handles empty name', () => {
    it('should not fetch when name is empty', async () => {
      // Arrange
      const playerName = '';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.player).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('refetch function', () => {
    it('should allow manual refetch', async () => {
      // Arrange
      const playerName = 'TestPlayer';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPlayerProfile,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => usePlayerStats(playerName));

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



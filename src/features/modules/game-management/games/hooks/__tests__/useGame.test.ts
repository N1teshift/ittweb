import { act, renderHook, waitFor } from '@testing-library/react';
import { useGame } from '../useGame';
import type { GameWithPlayers } from '../../types';

// Mock logger
jest.mock('@/features/infrastructure/logging', () => ({
  logError: jest.fn(),
}));

describe('useGame', () => {
  const mockGame: GameWithPlayers = {
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
    players: [
      {
        id: 'player1',
        gameId: '1',
        name: 'Player 1',
        pid: 0,
        flag: 'winner',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetches game by ID', () => {
    it('should fetch game by ID', async () => {
      // Arrange
      const gameId = '1';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGame,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/^\/api\/games\/1\?t=\d+$/), expect.any(Object));
      expect(result.current.game).toEqual(mockGame);
      expect(result.current.error).toBeNull();
    });

    it('should handle invalid ID', async () => {
      // Arrange
      const gameId = 'invalid-id';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.game).toBeNull();
    });

    it('should handle missing game', async () => {
      // Arrange
      const gameId = '999';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.game).toBeNull();
    });

    it('should handle network errors', async () => {
      // Arrange
      const gameId = '1';
      const networkError = new Error('Network error');
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(networkError);

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
    });
  });

  describe('handles loading state', () => {
    it('should set loading to true during fetch', async () => {
      // Arrange
      const gameId = '1';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      let resolveFetch: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });
      mockFetch.mockReturnValueOnce(fetchPromise);

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      expect(result.current.loading).toBe(true);

      // Resolve fetch
      resolveFetch!({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGame,
        }),
      } as Response);

      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('should set loading to false after fetch completes', async () => {
      // Arrange
      const gameId = '1';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGame,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.loading).toBe(false);
    });

    it('should handle ID changes', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGame,
        }),
      } as Response);

      // Act
      const { result, rerender } = renderHook(
        ({ id }) => useGame(id),
        {
          initialProps: { id: '1' },
        }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/^\/api\/games\/1\?t=\d+$/), expect.any(Object));

      // Change ID
      rerender({ id: '2' });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/^\/api\/games\/2\?t=\d+$/), expect.any(Object));
    });

    it('should handle rapid ID switches', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGame,
        }),
      } as Response);

      // Act
      const { result, rerender } = renderHook(
        ({ id }) => useGame(id),
        {
          initialProps: { id: '1' },
        }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Rapid ID changes
      rerender({ id: '2' });
      rerender({ id: '3' });
      rerender({ id: '4' });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('handles error state', () => {
    it('should handle 404 errors', async () => {
      // Arrange
      const gameId = '999';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain('Failed to fetch game');
    });

    it('should handle network errors', async () => {
      // Arrange
      const gameId = '1';
      const networkError = new Error('Network request failed');
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(networkError);

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network request failed');
    });

    it('should handle malformed data', async () => {
      // Arrange
      const gameId = '1';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Invalid game data',
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Invalid game data');
    });
  });

  describe('handles non-existent game', () => {
    it('should handle deleted game', async () => {
      // Arrange
      const gameId = 'deleted-game';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.game).toBeNull();
    });

    it('should handle invalid ID format', async () => {
      // Arrange
      const gameId = '';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

      // Act
      const { result } = renderHook(() => useGame(gameId));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.game).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('refetch function', () => {
    it('should allow manual refetch', async () => {
      // Arrange
      const gameId = '1';
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockGame,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useGame(gameId));

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



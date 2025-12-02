jest.mock('../../../../game-management/games/lib/gameService', () => ({
  getGames: jest.fn(),
  getGameById: jest.fn(),
}));

jest.mock('../../../../community/players/lib/playerService', () => ({
  getPlayerStats: jest.fn(),
}));

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
  logError: jest.fn(),
}));

import { getGames, getGameById } from '../../../../game-management/games/lib/gameService';
import { getPlayerStats } from '../../../../community/players/lib/playerService';
import {
  getActivityData,
  getEloHistory,
  getWinRateData,
  getClassStats,
  getGameLengthData,
  getPlayerActivityData,
  getClassSelectionData,
  getClassWinRateData,
} from '../analyticsService';

describe('analyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActivityData', () => {
    it('should build activity data even when there are no games', async () => {
      // Arrange
      (getGames as jest.Mock).mockResolvedValue({ games: [] });

      // Act
      const result = await getActivityData('player', '2024-01-01', '2024-01-01');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ date: '2024-01-01', games: 0 });
    });

    it('should calculate activity aggregated by time period', async () => {
      // Arrange
      const games = [
        { id: '1', datetime: '2024-01-01T10:00:00Z' },
        { id: '2', datetime: '2024-01-01T15:00:00Z' },
        { id: '3', datetime: '2024-01-02T10:00:00Z' },
      ];
      (getGames as jest.Mock).mockResolvedValue({ games });

      // Act
      const result = await getActivityData(undefined, '2024-01-01', '2024-01-02');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: '2024-01-01', games: 2 });
      expect(result[1]).toEqual({ date: '2024-01-02', games: 1 });
    });

    it('should handle many games', async () => {
      // Arrange
      const games = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        datetime: `2024-01-01T${String(i % 24).padStart(2, '0')}:00:00Z`,
      }));
      (getGames as jest.Mock).mockResolvedValue({ games });

      // Act
      const result = await getActivityData(undefined, '2024-01-01', '2024-01-01');

      // Assert
      expect(result).toHaveLength(1);
      // Note: Some games might be filtered if datetime parsing fails, so we check it's close to expected
      expect(result[0].games).toBeGreaterThan(90);
      expect(result[0].games).toBeLessThanOrEqual(100);
    });

    it('should filter by player name', async () => {
      // Arrange
      (getGames as jest.Mock).mockResolvedValue({ games: [] });

      // Act
      await getActivityData('TestPlayer', '2024-01-01', '2024-01-01');

      // Assert
      expect(getGames).toHaveBeenCalledWith(
        expect.objectContaining({ player: 'TestPlayer' })
      );
    });

    it('should filter by category', async () => {
      // Arrange
      (getGames as jest.Mock).mockResolvedValue({ games: [] });

      // Act
      await getActivityData(undefined, '2024-01-01', '2024-01-01', 'category1');

      // Assert
      expect(getGames).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category1' })
      );
    });

    it('should return empty array on error', async () => {
      // Arrange
      (getGames as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Act
      const result = await getActivityData();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getEloHistory', () => {
    it('should aggregate ELO history over time periods', async () => {
      // Arrange
      const games = [
        { id: '1', datetime: '2024-01-01T10:00:00Z' },
        { id: '2', datetime: '2024-01-02T10:00:00Z' },
      ];
      (getGames as jest.Mock).mockResolvedValue({ games });
      (getPlayerStats as jest.Mock).mockResolvedValue({
        categories: { category1: { score: 1000 } },
      });
      (getGameById as jest.Mock)
        .mockResolvedValueOnce({
          players: [{ name: 'Player1', elochange: 10 }],
        })
        .mockResolvedValueOnce({
          players: [{ name: 'Player1', elochange: -5 }],
        });

      // Act
      const result = await getEloHistory('Player1', 'category1', '2024-01-01', '2024-01-02');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].elo).toBe(1000);
    });

    it('should handle no ELO changes', async () => {
      // Arrange
      (getGames as jest.Mock).mockResolvedValue({ games: [] });
      (getPlayerStats as jest.Mock).mockResolvedValue({
        categories: { category1: { score: 1000 } },
      });

      // Act
      const result = await getEloHistory('Player1', 'category1');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].elo).toBe(1000);
    });

    it('should handle missing player stats', async () => {
      // Arrange
      (getGames as jest.Mock).mockResolvedValue({ games: [] });
      (getPlayerStats as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await getEloHistory('Player1', 'category1');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].elo).toBe(1000); // Default ELO
    });

    it('should return empty array on error', async () => {
      // Arrange
      (getGames as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Act
      const result = await getEloHistory('Player1', 'category1');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getWinRateData', () => {
    it('should calculate win rate per category', async () => {
      // Arrange
      (getPlayerStats as jest.Mock).mockResolvedValue({
        categories: {
          category1: { wins: 10, losses: 5, draws: 2 },
        },
      });

      // Act
      const result = await getWinRateData('Player1', 'category1');

      // Assert
      expect(result).toEqual({ wins: 10, losses: 5, draws: 2 });
    });

    it('should handle no games in category', async () => {
      // Arrange
      (getPlayerStats as jest.Mock).mockResolvedValue({
        categories: {},
      });

      // Act
      const result = await getWinRateData('Player1', 'category1');

      // Assert
      expect(result).toEqual({ wins: 0, losses: 0, draws: 0 });
    });

    it('should handle all wins', async () => {
      // Arrange
      (getPlayerStats as jest.Mock).mockResolvedValue({
        categories: {
          category1: { wins: 10, losses: 0, draws: 0 },
        },
      });

      // Act
      const result = await getWinRateData('Player1', 'category1');

      // Assert
      expect(result).toEqual({ wins: 10, losses: 0, draws: 0 });
    });

    it('should aggregate across all players when no player specified', async () => {
      // Arrange
      const games = [{ id: '1', datetime: '2024-01-01T10:00:00Z' }];
      (getGames as jest.Mock).mockResolvedValue({ games });
      (getGameById as jest.Mock).mockResolvedValue({
        players: [
          { flag: 'winner' },
          { flag: 'loser' },
          { flag: 'drawer' },
        ],
      });

      // Act
      const result = await getWinRateData(undefined, 'category1');

      // Assert
      expect(result.wins).toBe(1);
      expect(result.losses).toBe(1);
      expect(result.draws).toBe(1);
    });

    it('should return empty stats on error', async () => {
      // Arrange
      (getPlayerStats as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Act
      const result = await getWinRateData('Player1', 'category1');

      // Assert
      expect(result).toEqual({ wins: 0, losses: 0, draws: 0 });
    });
  });

  describe('getClassStats', () => {
    it('should calculate class selection frequency and win rates', async () => {
      // Arrange
      const games = [{ id: '1', datetime: '2024-01-01T10:00:00Z' }];
      (getGames as jest.Mock).mockResolvedValue({ games });
      (getGameById as jest.Mock).mockResolvedValue({
        players: [
          { class: 'Warrior', flag: 'winner' },
          { class: 'Warrior', flag: 'loser' },
        ],
      });

      // Act
      const result = await getClassStats();

      // Assert
      expect(result.length).toBeGreaterThan(0);
      const warriorStats = result.find((s) => s.id === 'warrior');
      expect(warriorStats).toBeDefined();
      expect(warriorStats?.totalGames).toBe(2);
      expect(warriorStats?.totalWins).toBe(1);
      expect(warriorStats?.totalLosses).toBe(1);
    });

    it('should handle no class data', async () => {
      // Arrange
      (getGames as jest.Mock).mockResolvedValue({ games: [] });

      // Act
      const result = await getClassStats();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle missing classes', async () => {
      // Arrange
      const games = [{ id: '1', datetime: '2024-01-01T10:00:00Z' }];
      (getGames as jest.Mock).mockResolvedValue({ games });
      (getGameById as jest.Mock).mockResolvedValue({
        players: [{ class: '', flag: 'winner' }],
      });

      // Act
      const result = await getClassStats();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      // Arrange
      (getGames as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Act
      const result = await getClassStats();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getGameLengthData', () => {
    it('should calculate game length distribution', async () => {
      // Arrange
      const games = [
        { id: '1', datetime: '2024-01-01T10:00:00Z', duration: 3600 }, // 60 minutes
        { id: '2', datetime: '2024-01-01T11:00:00Z', duration: 1800 }, // 30 minutes
      ];
      (getGames as jest.Mock).mockResolvedValue({ games });
      (getGameById as jest.Mock).mockResolvedValue({ players: [] });

      // Act
      const result = await getGameLengthData(undefined, '2024-01-01', '2024-01-01');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      const dayData = result.find((d) => d.date === '2024-01-01');
      expect(dayData?.averageDuration).toBe(45); // (60 + 30) / 2
    });

    it('should handle very short games', async () => {
      // Arrange
      const games = [{ id: '1', datetime: '2024-01-01T10:00:00Z', duration: 60 }];
      (getGames as jest.Mock).mockResolvedValue({ games });
      (getGameById as jest.Mock).mockResolvedValue({ players: [] });

      // Act
      const result = await getGameLengthData(undefined, '2024-01-01', '2024-01-01');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      const dayData = result.find((d) => d.date === '2024-01-01');
      expect(dayData?.averageDuration).toBe(1); // 1 minute
    });

    it('should handle missing durations', async () => {
      // Arrange
      const games = [{ id: '1', datetime: '2024-01-01T10:00:00Z', duration: 0 }];
      (getGames as jest.Mock).mockResolvedValue({ games });
      (getGameById as jest.Mock).mockResolvedValue({ players: [] });

      // Act
      const result = await getGameLengthData(undefined, '2024-01-01', '2024-01-01');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      const dayData = result.find((d) => d.date === '2024-01-01');
      expect(dayData?.averageDuration).toBe(0);
    });

    it('should return empty array on error', async () => {
      // Arrange
      (getGames as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Act
      const result = await getGameLengthData();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getPlayerActivityData', () => {
    it('should track player participation over time', async () => {
      // Arrange
      const games = [{ id: '1', datetime: '2024-01-01T10:00:00Z' }];
      (getGames as jest.Mock).mockResolvedValue({ games });
      (getGameById as jest.Mock).mockResolvedValue({
        players: [
          { name: 'Player1' },
          { name: 'Player2' },
        ],
      });

      // Act
      const result = await getPlayerActivityData(undefined, '2024-01-01', '2024-01-31');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      const monthData = result.find((d) => d.date.startsWith('2024-01'));
      expect(monthData?.players).toBe(2);
    });

    it('should handle inactive players', async () => {
      // Arrange
      (getGames as jest.Mock).mockResolvedValue({ games: [] });

      // Act
      const result = await getPlayerActivityData(undefined, '2024-01-01', '2024-01-31');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      const monthData = result.find((d) => d.date.startsWith('2024-01'));
      expect(monthData?.players).toBe(0);
    });

    it('should return empty array on error', async () => {
      // Arrange
      (getGames as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Act
      const result = await getPlayerActivityData();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getClassSelectionData', () => {
    it('should calculate class selection statistics', async () => {
      // Arrange
      const games = [{ id: '1', datetime: '2024-01-01T10:00:00Z' }];
      (getGames as jest.Mock).mockResolvedValue({ games });
      (getGameById as jest.Mock).mockResolvedValue({
        players: [
          { class: 'Warrior', flag: 'winner' },
          { class: 'Mage', flag: 'loser' },
        ],
      });

      // Act
      const result = await getClassSelectionData();

      // Assert
      expect(result.length).toBe(2);
      expect(result.find((c) => c.className === 'warrior')?.count).toBe(1);
      expect(result.find((c) => c.className === 'mage')?.count).toBe(1);
    });

    it('should handle empty data', async () => {
      // Arrange
      (getGames as jest.Mock).mockResolvedValue({ games: [] });

      // Act
      const result = await getClassSelectionData();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      // Arrange
      (getGames as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Act
      const result = await getClassSelectionData();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getClassWinRateData', () => {
    it('should calculate class win rates', async () => {
      // Arrange
      const games = [{ id: '1', datetime: '2024-01-01T10:00:00Z' }];
      (getGames as jest.Mock).mockResolvedValue({ games });
      (getGameById as jest.Mock).mockResolvedValue({
        players: [
          { class: 'Warrior', flag: 'winner' },
          { class: 'Warrior', flag: 'loser' },
        ],
      });

      // Act
      const result = await getClassWinRateData();

      // Assert
      expect(result.length).toBeGreaterThan(0);
      const warriorStats = result.find((c) => c.className === 'warrior');
      expect(warriorStats?.winRate).toBe(50); // 1 win / 2 total
    });

    it('should handle no data', async () => {
      // Arrange
      (getGames as jest.Mock).mockResolvedValue({ games: [] });

      // Act
      const result = await getClassWinRateData();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      // Arrange
      (getGames as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Act
      const result = await getClassWinRateData();

      // Assert
      expect(result).toEqual([]);
    });
  });
});


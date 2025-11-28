import { Timestamp } from 'firebase/firestore';
import {
  normalizePlayerName,
  updatePlayerStats,
} from './playerService';

jest.mock('@/features/infrastructure/api/firebase', () => ({
  getFirestoreInstance: jest.fn(),
}));

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(),
  isServerSide: jest.fn(),
  getAdminTimestamp: jest.fn(),
}));

jest.mock('@/features/modules/games/lib/gameService', () => ({
  getGameById: jest.fn(),
  getGames: jest.fn(),
}));

const mockGetFirestoreAdmin = jest.requireMock('@/features/infrastructure/api/firebase/admin')
  .getFirestoreAdmin as jest.Mock;
const mockIsServerSide = jest.requireMock('@/features/infrastructure/api/firebase/admin')
  .isServerSide as jest.Mock;
const mockGetAdminTimestamp = jest.requireMock('@/features/infrastructure/api/firebase/admin')
  .getAdminTimestamp as jest.Mock;
const mockGetGameById = jest.requireMock('@/features/modules/games/lib/gameService')
  .getGameById as jest.Mock;

type PlayerDoc = Record<string, unknown>;

describe('Player System Tests', () => {
  const playerStore = new Map<string, PlayerDoc>();

  beforeEach(() => {
    jest.clearAllMocks();
    playerStore.clear();

    const adminTimestamp = {
      fromDate: (date: Date) => Timestamp.fromDate(date),
      now: () => Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
    };

    mockIsServerSide.mockReturnValue(true);
    mockGetAdminTimestamp.mockReturnValue(adminTimestamp);

    mockGetFirestoreAdmin.mockReturnValue({
      collection: () => ({
        doc: (id: string) => ({
          get: async () => {
            const data = playerStore.get(id);
            return {
              exists: Boolean(data),
              data: () => data,
            };
          },
          set: async (value: PlayerDoc) => {
            playerStore.set(id, value);
          },
          update: async (value: PlayerDoc) => {
            const current = playerStore.get(id) || {};
            playerStore.set(id, { ...current, ...value });
          },
        }),
      }),
    });
  });

  describe('Player Name Normalization', () => {
    it('normalizes case-insensitively', () => {
      expect(normalizePlayerName('PlayerOne')).toBe('playerone');
      expect(normalizePlayerName('PLAYERONE')).toBe('playerone');
    });

    it('trims surrounding whitespace', () => {
      expect(normalizePlayerName('  spaced  ')).toBe('spaced');
    });

    it('preserves special characters while lowercasing', () => {
      expect(normalizePlayerName('Player_Name-123')).toBe('player_name-123');
    });

    it('handles unicode characters', () => {
      expect(normalizePlayerName('Ægir')).toBe('ægir');
    });
  });

  describe('Player Statistics', () => {
    it('tracks wins, losses, draws, and total games per category', async () => {
      mockGetGameById.mockResolvedValue({
        id: 'game-1',
        datetime: '2024-02-01T00:00:00Z',
        category: 'heroic',
        players: [
          { name: 'Winner', flag: 'winner', category: 'heroic', eloAfter: 1020 },
          { name: 'Loser', flag: 'loser', category: 'heroic', eloAfter: 980 },
          { name: 'Drawer', flag: 'drawer', category: 'heroic', eloAfter: 1000 },
        ],
      });

      await updatePlayerStats('game-1');

      const winnerStats = playerStore.get('winner');
      const loserStats = playerStore.get('loser');
      const drawerStats = playerStore.get('drawer');

      expect(winnerStats?.totalGames).toBe(1);
      expect((winnerStats?.categories as any).heroic).toMatchObject({
        wins: 1,
        losses: 0,
        draws: 0,
        games: 1,
        score: 1020,
      });

      expect(loserStats?.totalGames).toBe(1);
      expect((loserStats?.categories as any).heroic.losses).toBe(1);

      expect(drawerStats?.totalGames).toBe(1);
      expect((drawerStats?.categories as any).heroic.draws).toBe(1);
    });

    it('aggregates statistics across multiple games and updates peak ELO', async () => {
      const games = new Map([
        ['game-1', {
          id: 'game-1',
          datetime: '2024-02-01T00:00:00Z',
          category: 'heroic',
          players: [
            { name: 'Champion', flag: 'winner', category: 'heroic', eloAfter: 1050 },
          ],
        }],
        ['game-2', {
          id: 'game-2',
          datetime: '2024-02-02T00:00:00Z',
          category: 'heroic',
          players: [
            { name: 'Champion', flag: 'loser', category: 'heroic', eloAfter: 1010 },
          ],
        }],
        ['game-3', {
          id: 'game-3',
          datetime: '2024-02-03T00:00:00Z',
          category: 'heroic',
          players: [
            { name: 'Champion', flag: 'winner', category: 'heroic', eloAfter: 1100 },
          ],
        }],
      ]);

      mockGetGameById.mockImplementation(async (id: string) => games.get(id));

      await updatePlayerStats('game-1');
      await updatePlayerStats('game-2');
      await updatePlayerStats('game-3');

      const championStats = playerStore.get('champion');
      const categoryStats = (championStats?.categories as any).heroic;

      expect(championStats?.totalGames).toBe(3);
      expect(categoryStats.games).toBe(3);
      expect(categoryStats.wins).toBe(2);
      expect(categoryStats.losses).toBe(1);

      const winRate = categoryStats.wins / categoryStats.games;
      const lossRate = categoryStats.losses / categoryStats.games;

      expect(winRate).toBeCloseTo(2 / 3);
      expect(lossRate).toBeCloseTo(1 / 3);
      expect(categoryStats.score).toBe(1100);
      expect(categoryStats.peakElo).toBe(1100);
      expect(categoryStats.peakEloDate).toBeInstanceOf(Timestamp);
    });
  });
});


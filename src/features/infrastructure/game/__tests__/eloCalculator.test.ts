import {
  calculateEloChange,
  calculateTeamElo,
  updateEloScores,
  recalculateFromGame,
  STARTING_ELO,
} from '../elo';

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

const mockGetGameById = jest.fn();
jest.mock('../gameService', () => ({
  getGameById: (...args: unknown[]) => mockGetGameById(...args),
}));

const mockGetPlayerStats = jest.fn();
const mockUpdatePlayerStats = jest.fn();
jest.mock('../../../players/lib/playerService', () => ({
  getPlayerStats: (...args: unknown[]) => mockGetPlayerStats(...args),
  updatePlayerStats: (...args: unknown[]) => mockUpdatePlayerStats(...args),
}));

const mockIsServerSide = jest.fn(() => false);
jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(),
  isServerSide: mockIsServerSide,
}));

const mockDoc = jest.fn((...args: unknown[]) => ({ path: args.join('/') }));
const mockUpdateDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockCollection = jest.fn();
jest.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
}));

jest.mock('@/features/infrastructure/api/firebase', () => ({
  getFirestoreInstance: jest.fn(() => ({ instance: 'client' })),
}));

describe('calculateEloChange', () => {
  it('handles win, loss, and draw outcomes with default K-factor', () => {
    expect(calculateEloChange(1000, 1000, 'win')).toBeCloseTo(16);
    expect(calculateEloChange(1000, 1000, 'loss')).toBeCloseTo(-16);
    expect(calculateEloChange(1000, 1000, 'draw')).toBeCloseTo(0);
  });

  it('respects custom K-factor and rounds to two decimals', () => {
    const change = calculateEloChange(1200, 1400, 'win', 10);
    expect(change).toBeCloseTo(7.6, 2);
    expect(change.toString()).toMatch(/\d+\.\d{1,2}/);
  });
});

describe('calculateTeamElo', () => {
  it('returns starting ELO for empty teams', () => {
    expect(calculateTeamElo([])).toBe(STARTING_ELO);
  });

  it('averages and rounds team values', () => {
    expect(calculateTeamElo([1000, 1200, 1100])).toBe(1100);
    expect(calculateTeamElo([999.4, 1000.4])).toBe(999.9);
  });
});

describe('updateEloScores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates winners and losers with calculated changes', async () => {
    mockGetGameById.mockResolvedValue({
      category: '1v1',
      players: [
        { name: 'Alice', flag: 'winner' },
        { name: 'Bob', flag: 'loser' },
      ],
    });

    mockGetPlayerStats.mockImplementation((name: string) => ({
      categories: {
        '1v1': { score: name === 'alice' ? 1000 : 980 },
      },
    }));

    mockGetDocs.mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ name: 'Alice' }) },
        { id: '2', data: () => ({ name: 'Bob' }) },
      ],
    });

    await updateEloScores('game-123');

    const payloads = mockUpdateDoc.mock.calls.map(([, payload]) => payload);
    expect(payloads).toContainEqual({ elochange: expect.closeTo(15.08, 2), eloBefore: 1000, eloAfter: expect.closeTo(1015.08, 2) });
    expect(payloads).toContainEqual({ elochange: expect.closeTo(-15.08, 2), eloBefore: 980, eloAfter: expect.closeTo(964.92, 2) });
    expect(mockUpdatePlayerStats).toHaveBeenCalledWith('game-123');
  });

  it('returns early when game or players are missing', async () => {
    mockGetGameById.mockResolvedValue({ players: [{ name: 'Solo', flag: 'winner' }] });

    await updateEloScores('missing-game');

    expect(mockUpdateDoc).not.toHaveBeenCalled();
    expect(mockUpdatePlayerStats).not.toHaveBeenCalled();
  });
});

describe('recalculateFromGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws error when game not found', async () => {
    mockGetGameById.mockResolvedValue(null);
    await expect(recalculateFromGame('game-1')).rejects.toThrow('Game not found or invalid: game-1');
  });

  it('throws error when game is invalid (insufficient players)', async () => {
    mockGetGameById.mockResolvedValue({
      id: 'game-1',
      players: [{ name: 'Solo', flag: 'winner' }], // Only 1 player
    });
    await expect(recalculateFromGame('game-1')).rejects.toThrow('Game not found or invalid: game-1');
  });

  it('throws error when game is not completed', async () => {
    mockGetGameById.mockResolvedValue({
      id: 'game-1',
      gameState: 'scheduled',
      players: [
        { name: 'Alice', flag: 'winner' },
        { name: 'Bob', flag: 'loser' },
      ],
    });
    await expect(recalculateFromGame('game-1')).rejects.toThrow('Can only recalculate ELO for completed games');
  });
});


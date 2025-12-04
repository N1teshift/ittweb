import { parseReplayFile } from '../replay';
import type { W3MMDAction } from 'w3gjs/dist/types/parsers/ActionParser';

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

const mockParse = jest.fn();
let mockW3mmdEntries: W3MMDAction[] = [];

jest.mock('w3gjs', () => {
  return jest.fn().mockImplementation(() => ({
    parse: (...args: unknown[]) => mockParse(...args),
    get w3mmd() {
      return mockW3mmdEntries;
    },
  }));
});

describe('parseReplayFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockW3mmdEntries = [];
  });

  it('parses replay data and derives game information', async () => {
    mockW3mmdEntries = [
      {
        cache: { missionKey: 'player1', key: 'kills', filename: 'game.w3g' },
        value: 10,
      },
    ] as W3MMDAction[];

    mockParse.mockResolvedValue({
      randomseed: 42,
      duration: 60000,
      gamename: 'Test Replay',
      map: { path: 'Maps/Forest' },
      creator: 'Host',
      players: [
        { id: 1, name: 'Player1', teamid: 0, result: 'win' },
        { id: 2, name: 'Player2', teamid: 1, result: 'loss' },
      ],
    });

    const result = await parseReplayFile(Buffer.from('test'), {
      fallbackDatetime: '2024-01-01T00:00:00.000Z',
    });

    expect(result.gameData).toMatchObject({
      gameId: 42,
      duration: 60,
      gamename: 'Test Replay',
      map: 'Maps/Forest',
      creatorName: 'Host',
      category: '1v1',
    });

    const [winner, loser] = result.gameData.players;
    expect(winner.flag).toBe('winner');
    expect(loser.flag).toBe('loser');
    expect(winner.kills).toBe(10);
  });

  it('throws when replay has fewer than two players', async () => {
    mockParse.mockResolvedValue({ players: [{ id: 1, name: 'Solo', teamid: 0 }] });

    await expect(parseReplayFile(Buffer.from('invalid'))).rejects.toThrow(
      'Replay does not contain at least two players.',
    );
  });
});


import { buildW3MMDLookup, mapMissionStatsToPlayers } from '../w3mmd';
import type { W3MMDAction } from 'w3gjs/dist/types/parsers/ActionParser';
import type Player from 'w3gjs/dist/types/Player';

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('buildW3MMDLookup', () => {
  it('normalizes mission keys and collects raw entries', () => {
    const actions: W3MMDAction[] = [
      {
        cache: { missionKey: ' Player1 ', key: 'Kills', filename: 'test.w3g' },
        value: 5,
      },
      {
        cache: { missionKey: 'player1', key: 'Assists', filename: 'test.w3g' },
        value: 3,
      },
      {
        cache: { missionKey: '', key: 'ignored', filename: 'test.w3g' },
        value: 1,
      },
    ] as W3MMDAction[];

    const result = buildW3MMDLookup(actions);

    expect(result.rawEntries).toHaveLength(2);
    expect(result.lookup.player1).toEqual({ kills: 5, assists: 3 });
  });
});

describe('mapMissionStatsToPlayers', () => {
  const player: Player = { id: 1, name: 'Player1', teamid: 0 } as Player;
  const otherPlayer: Player = { id: 2, name: 'Player2', teamid: 1 } as Player;

  it('maps mission statistics to players using multiple candidate keys', () => {
    const encodedClass = Buffer.from('Mage').readUInt32BE(0);
    const lookup = {
      player1: {
        kills: 8,
        deaths: 2,
        assists: 4,
        gold: 1234,
        damagetaken: 200,
        damage: 500,
        randomclass: 1,
        class: encodedClass,
      },
    };

    const stats = mapMissionStatsToPlayers([player, otherPlayer], lookup);
    const playerStats = stats.get(1);

    expect(playerStats).toMatchObject({
      kills: 8,
      deaths: 2,
      assists: 4,
      gold: 1234,
      damageTaken: 200,
      damageDealt: 500,
      randomClass: true,
      class: 'Mage',
    });
    expect(stats.get(2)).toBeUndefined();
  });

  it('returns empty stats map when lookup is empty', () => {
    const stats = mapMissionStatsToPlayers([player], {});
    expect(stats.size).toBe(0);
  });
});


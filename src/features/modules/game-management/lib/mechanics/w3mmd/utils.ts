import type Player from 'w3gjs/dist/types/Player';
import type { W3MMDAction } from 'w3gjs/dist/types/parsers/ActionParser';
import type { CreateGame } from '@/features/modules/game-management/games/types';

export interface ParsedW3MMDEntry {
  missionKey: string;
  key: string;
  value: number;
  filename: string;
}

export type PlayerStatPatch = Partial<CreateGame['players'][number]>;

export function buildW3MMDLookup(actions: W3MMDAction[]) {
  const rawEntries: ParsedW3MMDEntry[] = [];
  const lookup: Record<string, Record<string, number>> = {};

  actions.forEach((action) => {
    if (!action.cache?.missionKey || !action.cache?.key) {
      return;
    }

    rawEntries.push({
      missionKey: action.cache.missionKey,
      key: action.cache.key,
      value: action.value,
      filename: action.cache.filename,
    });

    const missionKey = normalize(action.cache.missionKey);
    if (!missionKey) {
      return;
    }

    const variableKey = normalize(action.cache.key) || action.cache.key.toLowerCase();
    lookup[missionKey] = lookup[missionKey] || {};
    lookup[missionKey][variableKey] = action.value;
  });

  return { rawEntries, lookup };
}

export function mapMissionStatsToPlayers(
  players: Player[],
  w3mmdLookup: Record<string, Record<string, number>>,
): Map<number, PlayerStatPatch> {
  const stats = new Map<number, PlayerStatPatch>();
  if (!Object.keys(w3mmdLookup).length) {
    return stats;
  }

  players.forEach((player) => {
    const candidateKeys = buildMissionCandidates(player);
    const mission = candidateKeys
      .map((candidate) => w3mmdLookup[candidate])
      .find((entry) => Boolean(entry));

    if (!mission) {
      return;
    }

    const derived = deriveStatsFromMission(mission);
    if (Object.keys(derived).length > 0) {
      stats.set(player.id, derived);
    }
  });

  return stats;
}

function buildMissionCandidates(player: Player): string[] {
  const base = normalize(player.name || '');
  const pid = String(player.id);
  const candidates = [
    base,
    `player${pid}`,
    `player${Number(pid) + 1}`,
    `p${pid}`,
    `slot${pid}`,
    normalize(`${player.teamid}-${pid}`),
  ];
  return Array.from(new Set(candidates.filter(Boolean)));
}

function deriveStatsFromMission(entry: Record<string, number>): PlayerStatPatch {
  const stats: PlayerStatPatch = {};

  Object.entries(entry).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase();

    // Generic kills (not animal-specific)
    if (normalizedKey === 'kills' || normalizedKey === 'kill') {
      stats.kills = value;
      return;
    }
    if (normalizedKey.includes('death')) {
      stats.deaths = value;
      return;
    }
    if (normalizedKey.includes('assist')) {
      stats.assists = value;
      return;
    }
    // Gold - handle both 'gold' and 'goldacquired'
    if (normalizedKey === 'gold' || normalizedKey === 'goldacquired') {
      stats.gold = value;
      stats.goldAcquired = value;
      return;
    }
    if (normalizedKey.includes('damage') && normalizedKey.includes('taken')) {
      stats.damageTaken = value;
      return;
    }
    if (normalizedKey.includes('damage')) {
      stats.damageDealt = value;
      return;
    }
    if (normalizedKey.includes('random')) {
      stats.randomClass = value > 0;
      return;
    }
    if (normalizedKey.includes('class')) {
      stats.class = decodeMaybeString(value);
      return;
    }

    // ITT-specific stats
    if (normalizedKey === 'selfhealing' || normalizedKey === 'selfheal') {
      stats.selfHealing = value;
      return;
    }
    if (normalizedKey === 'allyhealing' || normalizedKey === 'allyheal') {
      stats.allyHealing = value;
      return;
    }
    if (normalizedKey === 'meateaten' || normalizedKey === 'meat') {
      stats.meatEaten = value;
      return;
    }

    // Animal kill counts
    if (normalizedKey === 'killselk' || normalizedKey === 'elk') {
      stats.killsElk = value;
      return;
    }
    if (normalizedKey === 'killshawk' || normalizedKey === 'hawk') {
      stats.killsHawk = value;
      return;
    }
    if (normalizedKey === 'killssnake' || normalizedKey === 'snake') {
      stats.killsSnake = value;
      return;
    }
    if (normalizedKey === 'killswolf' || normalizedKey === 'wolf') {
      stats.killsWolf = value;
      return;
    }
    if (normalizedKey === 'killsbear' || normalizedKey === 'bear') {
      stats.killsBear = value;
      return;
    }
    if (normalizedKey === 'killspanther' || normalizedKey === 'panther') {
      stats.killsPanther = value;
      return;
    }
  });

  return stats;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function decodeMaybeString(value: number): string {
  const safeValue = Number.isFinite(value) ? value >>> 0 : 0;
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeUInt32BE(safeValue);
  const ascii = buffer.toString('utf8').replace(/\u0000/g, '').trim();
  if (ascii && /^[\x20-\x7E]+$/.test(ascii)) {
    return ascii;
  }
  return value.toString();
}


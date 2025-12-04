import type Player from 'w3gjs/dist/types/Player';
import type { GameCategory } from '@/features/modules/game-management/games/types';

export function getDurationSeconds(durationMs?: number): number {
  if (!durationMs || Number.isNaN(durationMs)) {
    return 1;
  }
  return Math.max(1, Math.round(durationMs / 1000));
}

export function deriveCategory(players: Player[]): GameCategory | undefined {
  const teamCounts = players.reduce<Record<number, number>>((acc, player) => {
    acc[player.teamid] = (acc[player.teamid] || 0) + 1;
    return acc;
  }, {});

  const counts = Object.values(teamCounts).sort((a, b) => b - a);
  if (counts.length === 2 && counts[0] === counts[1]) {
    return `${counts[0]}v${counts[1]}` as GameCategory;
  }
  if (counts.length === 1) {
    return counts[0] === 1 ? '1v1' : `${counts[0]}p` as GameCategory;
  }
  return 'ffa';
}


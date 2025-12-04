import { Timestamp } from 'firebase/firestore';
import { ScheduledGame } from '@/types/scheduledGame';
import type { ParticipantResult, TeamSize, GameType } from '@/features/modules/game-management/games/types';
import { timestampToIso, type TimestampLike } from '@/features/infrastructure/utils';
import { deriveGameStatus } from './scheduledGameService.utils';

/**
 * Convert Firestore game document data to ScheduledGame format
 */
export function convertGameDataToScheduledGame(
  docId: string,
  data: Record<string, unknown>
): ScheduledGame {
  const scheduledDateTime = (data.scheduledDateTimeString as string) || timestampToIso(data.scheduledDateTime as Timestamp | TimestampLike | Date | undefined);
  
  const derivedStatus = deriveGameStatus({
    status: data.status as string | undefined,
    scheduledDateTime: scheduledDateTime,
    gameLength: data.gameLength as number | undefined,
  });

  // Validate and convert teamSize
  const validTeamSizes: TeamSize[] = ['1v1', '2v2', '3v3', '4v4', '5v5', '6v6', 'custom'];
  const rawTeamSize = data.teamSize;
  let teamSize: TeamSize = '1v1'; // default
  if (typeof rawTeamSize === 'string' && validTeamSizes.includes(rawTeamSize as TeamSize)) {
    teamSize = rawTeamSize as TeamSize;
  } else if (typeof rawTeamSize === 'number') {
    // Convert number to TeamSize format (e.g., 2 -> '2v2')
    const sizeStr = `${rawTeamSize}v${rawTeamSize}` as TeamSize;
    if (validTeamSizes.includes(sizeStr)) {
      teamSize = sizeStr;
    }
  }

  // Validate and convert gameType
  const validGameTypes: GameType[] = ['elo', 'normal'];
  const rawGameType = data.gameType;
  let gameType: GameType = 'elo'; // default
  if (typeof rawGameType === 'string' && validGameTypes.includes(rawGameType as GameType)) {
    gameType = rawGameType as GameType;
  }

  // Convert customTeamSize to string if needed
  const customTeamSize = data.customTeamSize 
    ? String(data.customTeamSize) 
    : undefined;

  return {
    id: docId,
    scheduledGameId: typeof data.gameId === 'number' ? data.gameId : Number(data.gameId) || 0,
    creatorName: (data.creatorName as string) || 'Unknown',
    createdByDiscordId: (data.createdByDiscordId as string) || '',
    scheduledDateTime: scheduledDateTime,
    scheduledDateTimeString: scheduledDateTime,
    timezone: (data.timezone as string) || 'UTC',
    teamSize,
    customTeamSize,
    gameType,
    gameVersion: data.gameVersion as string | undefined,
    gameLength: data.gameLength as number | undefined,
    modes: Array.isArray(data.modes) ? data.modes : [],
    participants: (Array.isArray(data.participants) ? data.participants : []).map((p: Record<string, unknown>) => ({
      discordId: typeof p.discordId === 'string' ? p.discordId : String(p.discordId || ''),
      name: typeof p.name === 'string' ? p.name : String(p.name || ''),
      joinedAt: typeof p.joinedAt === 'string' ? p.joinedAt : timestampToIso(p.joinedAt as Timestamp | TimestampLike | Date | undefined),
      result: (p.result === 'winner' || p.result === 'loser' || p.result === 'draw') ? p.result as ParticipantResult : undefined,
    })),
    createdAt: timestampToIso(data.createdAt as Timestamp | TimestampLike | Date | string | undefined),
    updatedAt: timestampToIso(data.updatedAt as Timestamp | TimestampLike | Date | string | undefined),
    submittedAt: data.submittedAt ? timestampToIso(data.submittedAt) : undefined,
    status: derivedStatus,
    linkedGameDocumentId: data.linkedGameDocumentId as string | undefined,
    linkedArchiveDocumentId: data.linkedArchiveDocumentId as string | undefined,
    isDeleted: (data.isDeleted as boolean) ?? false,
    deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
  };
}

/**
 * Filter game data based on includePast and includeArchived flags
 */
export function shouldIncludeGame(
  data: Record<string, unknown>,
  scheduledDateTime: string,
  includePast: boolean,
  includeArchived: boolean
): boolean {
  // Filter out cancelled games
  if (data.status === 'cancelled') {
    return false;
  }
  
  // Filter by status (exclude archived unless requested)
  if (!includeArchived && data.status === 'archived') {
    return false;
  }
  
  // Filter past games if includePast is false
  if (!includePast) {
    const gameDate = new Date(scheduledDateTime);
    if (gameDate < new Date()) {
      return false;
    }
  }
  
  return true;
}



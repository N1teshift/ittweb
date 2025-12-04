/**
 * Game Service Utilities (Client-Safe)
 * 
 * Pure utility functions that are safe to use in both client and server code.
 * Server-only utilities are in gameService.utils.server.ts
 */

import { Timestamp } from 'firebase/firestore';
import { timestampToIso } from '@/features/infrastructure/utils';
import type { 
  Game, 
  GamePlayer, 
  GamePlayerFlag, 
  GameState,
  GameArchiveContent,
  TeamSize,
  GameType,
} from '../types';

/**
 * Convert game document from Firestore to Game type
 * Handles both scheduled and completed games
 */
export function convertGameDoc(docData: Record<string, unknown>, id: string): Game {
  const gameState = (docData.gameState as GameState) || 'completed'; // Default to completed for backward compatibility
  
  const baseGame: Game = {
    id,
    gameId: typeof docData.gameId === 'number' ? docData.gameId : Number(docData.gameId) || 0,
    gameState,
    creatorName: typeof docData.creatorName === 'string' ? docData.creatorName : String(docData.creatorName || ''),
    createdByDiscordId: typeof docData.createdByDiscordId === 'string' ? docData.createdByDiscordId : undefined,
    createdAt: (docData.createdAt as Timestamp | string) || Timestamp.now(),
    updatedAt: (docData.updatedAt as Timestamp | string) || Timestamp.now(),
    submittedAt: docData.submittedAt ? (docData.submittedAt as Timestamp | string) : undefined,
    isDeleted: typeof docData.isDeleted === 'boolean' ? docData.isDeleted : false,
    deletedAt: docData.deletedAt ? (docData.deletedAt as Timestamp | string | null) : null,
  };

  // Add scheduled game fields if gameState is 'scheduled'
  if (gameState === 'scheduled') {
    return {
      ...baseGame,
      scheduledDateTime: docData.scheduledDateTime ? (docData.scheduledDateTime as Timestamp | string) : undefined,
      scheduledDateTimeString: typeof docData.scheduledDateTimeString === 'string' ? docData.scheduledDateTimeString : undefined,
      timezone: typeof docData.timezone === 'string' ? docData.timezone : undefined,
      teamSize: (docData.teamSize as TeamSize | undefined),
      customTeamSize: typeof docData.customTeamSize === 'string' ? docData.customTeamSize : undefined,
      gameType: (docData.gameType as GameType | undefined),
      gameVersion: typeof docData.gameVersion === 'string' ? docData.gameVersion : undefined,
      gameLength: typeof docData.gameLength === 'number' ? docData.gameLength : undefined,
      modes: Array.isArray(docData.modes) ? docData.modes : [],
      participants: Array.isArray(docData.participants) ? docData.participants : [],
    };
  }

  // Add completed game fields if gameState is 'completed'
  const playerNames = Array.isArray(docData.playerNames) 
    ? docData.playerNames.map(n => String(n))
    : undefined;
  const playerCount = typeof docData.playerCount === 'number' 
    ? docData.playerCount 
    : (playerNames ? playerNames.length : undefined);

  const completedGame: Game = {
    ...baseGame,
    datetime: docData.datetime ? (docData.datetime as Timestamp | string) : undefined,
    duration: typeof docData.duration === 'number' ? docData.duration : Number(docData.duration) || 0,
    gamename: typeof docData.gamename === 'string' ? docData.gamename : String(docData.gamename || ''),
    map: typeof docData.map === 'string' ? docData.map : String(docData.map || ''),
    ownername: typeof docData.ownername === 'string' ? docData.ownername : String(docData.ownername || ''),
    category: typeof docData.category === 'string' ? docData.category : undefined,
    replayUrl: typeof docData.replayUrl === 'string' ? docData.replayUrl : undefined,
    replayFileName: typeof docData.replayFileName === 'string' ? docData.replayFileName : undefined,
    playerNames,
    playerCount,
    verified: typeof docData.verified === 'boolean' ? docData.verified : false,
  };

  // Add archive content if present
  if (docData.archiveContent) {
    completedGame.archiveContent = docData.archiveContent as GameArchiveContent;
  }

  return completedGame;
}

/**
 * Convert game player document from Firestore to GamePlayer type
 */
export function convertGamePlayerDoc(docData: Record<string, unknown>, id: string): GamePlayer {
  return {
    id,
    gameId: typeof docData.gameId === 'string' ? docData.gameId : String(docData.gameId || ''),
    name: typeof docData.name === 'string' ? docData.name : String(docData.name || ''),
    pid: typeof docData.pid === 'number' ? docData.pid : Number(docData.pid) || 0,
    flag: (typeof docData.flag === 'string' && (docData.flag === 'winner' || docData.flag === 'loser' || docData.flag === 'drawer')) 
      ? docData.flag as GamePlayerFlag 
      : 'drawer',
    category: typeof docData.category === 'string' ? docData.category : undefined,
    elochange: typeof docData.elochange === 'number' ? docData.elochange : undefined,
    eloBefore: typeof docData.eloBefore === 'number' ? docData.eloBefore : undefined,
    eloAfter: typeof docData.eloAfter === 'number' ? docData.eloAfter : undefined,
    class: typeof docData.class === 'string' ? docData.class : undefined,
    randomClass: typeof docData.randomClass === 'boolean' ? docData.randomClass : undefined,
    kills: typeof docData.kills === 'number' ? docData.kills : undefined,
    deaths: typeof docData.deaths === 'number' ? docData.deaths : undefined,
    assists: typeof docData.assists === 'number' ? docData.assists : undefined,
    gold: typeof docData.gold === 'number' ? docData.gold : undefined,
    damageDealt: typeof docData.damageDealt === 'number' ? docData.damageDealt : undefined,
    damageTaken: typeof docData.damageTaken === 'number' ? docData.damageTaken : undefined,
    // ITT-specific stats (schema v2+)
    selfHealing: typeof docData.selfHealing === 'number' ? docData.selfHealing : undefined,
    allyHealing: typeof docData.allyHealing === 'number' ? docData.allyHealing : undefined,
    meatEaten: typeof docData.meatEaten === 'number' ? docData.meatEaten : undefined,
    goldAcquired: typeof docData.goldAcquired === 'number' ? docData.goldAcquired : undefined,
    // Animal kill counts
    killsElk: typeof docData.killsElk === 'number' ? docData.killsElk : undefined,
    killsHawk: typeof docData.killsHawk === 'number' ? docData.killsHawk : undefined,
    killsSnake: typeof docData.killsSnake === 'number' ? docData.killsSnake : undefined,
    killsWolf: typeof docData.killsWolf === 'number' ? docData.killsWolf : undefined,
    killsBear: typeof docData.killsBear === 'number' ? docData.killsBear : undefined,
    killsPanther: typeof docData.killsPanther === 'number' ? docData.killsPanther : undefined,
    createdAt: timestampToIso(docData.createdAt as Timestamp | { toDate?: () => Date } | string | Date | undefined),
  };
}



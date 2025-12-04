import React from 'react';
import Link from 'next/link';
import { Card } from '@/features/infrastructure/components';
import { Tooltip } from '@/features/infrastructure/components';
import { formatDuration, formatEloChange } from '../../../shared/utils';
import { timestampToIso } from '@/features/infrastructure/utils';
import { formatDateTimeInTimezone } from '@/features/modules/game-management/scheduled-games/utils/timezoneUtils';
import { PlayerStatsTable } from './PlayerStatsTable';
import type { GameWithPlayers } from '../types';

interface GameDetailProps {
  game: GameWithPlayers;
  onEdit?: (game: GameWithPlayers) => void;
  onDelete?: (game: GameWithPlayers) => void;
  onJoin?: (gameId: string) => Promise<void>;
  onLeave?: (gameId: string) => Promise<void>;
  onUploadReplay?: (game: GameWithPlayers) => void;
  isJoining?: boolean;
  isLeaving?: boolean;
  userIsCreator?: boolean;
  userIsParticipant?: boolean;
  userIsAdmin?: boolean;
}

/**
 * Parse a date value that could be a Timestamp, ISO string, or other format
 */
function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  
  const date = new Date(value);
  // Check if the date is valid
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
}

/**
 * Compute if a scheduled game is awaiting replay upload
 * A game is awaiting replay if: scheduledDateTime + gameLength < now
 */
function isAwaitingReplay(game: GameWithPlayers): boolean {
  if (game.gameState !== 'scheduled') return false;
  if (!game.scheduledDateTime) return false;
  
  // Prefer scheduledDateTimeString, fallback to converting scheduledDateTime
  const scheduledDateTimeIso = game.scheduledDateTimeString || timestampToIso(game.scheduledDateTime);
  const scheduledDate = parseDate(scheduledDateTimeIso);
  if (!scheduledDate) return false;
  
  // Default game length to 1 hour (3600 seconds) if not specified
  const gameLengthSeconds = game.gameLength || 3600;
  const gameEndTime = new Date(scheduledDate.getTime() + gameLengthSeconds * 1000);
  const now = new Date();
  
  return gameEndTime < now;
}

export function GameDetail({ 
  game, 
  onEdit, 
  onDelete, 
  onJoin,
  onLeave,
  onUploadReplay,
  isJoining = false,
  isLeaving = false,
  userIsCreator = false,
  userIsParticipant = false,
  userIsAdmin = false,
}: GameDetailProps) {
  const isScheduled = game.gameState === 'scheduled';
  const canEdit = isScheduled && (userIsCreator || userIsAdmin);
  const canDelete = isScheduled && (userIsCreator || userIsAdmin);
  const canJoin = isScheduled && !userIsParticipant && onJoin;
  const canLeave = isScheduled && userIsParticipant && onLeave;
  const awaitingReplay = isAwaitingReplay(game);
  const canUploadReplay = isScheduled && awaitingReplay && onUploadReplay;
  
  // Format scheduled date with timezone awareness
  const formattedScheduledDate = isScheduled && game.scheduledDateTime
    ? formatDateTimeInTimezone(
        game.scheduledDateTimeString || timestampToIso(game.scheduledDateTime),
        game.timezone || 'UTC',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        }
      )
    : null;
  
  // Parse completed game date (for fallback display)
  const completedDate = !isScheduled && game.datetime
    ? parseDate(timestampToIso(game.datetime))
    : null;
  
  const gameDate = completedDate; // Only used for completed games now
  
  const winners = game.players?.filter(p => p.flag === 'winner') || [];
  const losers = game.players?.filter(p => p.flag === 'loser') || [];
  const drawers = game.players?.filter(p => p.flag === 'drawer') || [];

  return (
    <div className="space-y-6">
      <Card variant="medieval" className="p-6">
        <h1 className="text-2xl font-bold text-amber-400 mb-4">
          {isScheduled ? 'Scheduled ' : ''}Game #{game.gameId}
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {isScheduled && formattedScheduledDate && (
            <div>
              <span className="text-gray-500">Scheduled:</span>
              <p className="text-amber-300">{formattedScheduledDate}</p>
            </div>
          )}
          {!isScheduled && gameDate && (
            <div>
              <span className="text-gray-500">Date:</span>
              <p className="text-amber-300">{gameDate.toLocaleString()}</p>
            </div>
          )}
          {!isScheduled && game.duration && (
            <div>
              <span className="text-gray-500">Duration:</span>
              <p className="text-amber-300">{formatDuration(game.duration)}</p>
            </div>
          )}
          {isScheduled && game.timezone && (
            <div>
              <span className="text-gray-500">Timezone:</span>
              <p className="text-amber-300">{game.timezone}</p>
            </div>
          )}
          {!isScheduled && game.map && (
            <div>
              <span className="text-gray-500">Map:</span>
              <p className="text-amber-300">{typeof game.map === 'string' ? (game.map.split('\\').pop() || game.map) : game.map}</p>
            </div>
          )}
          {!isScheduled && (
            <div>
              <span className="text-gray-500">Category:</span>
              <p className="text-amber-300">{game.category || 'N/A'}</p>
            </div>
          )}
          {isScheduled && game.teamSize && (
            <div>
              <span className="text-gray-500">Team Size:</span>
              <p className="text-amber-300">{game.customTeamSize || game.teamSize}</p>
            </div>
          )}
          {isScheduled && game.gameType && (
            <div>
              <span className="text-gray-500">Game Type:</span>
              <p className="text-amber-300">{game.gameType}</p>
            </div>
          )}
          {/* Status field removed - using gameState instead */}
          <div>
            <span className="text-gray-500">Creator:</span>
            <p className="text-amber-300">{game.creatorName}</p>
          </div>
          {!isScheduled && game.ownername && (
            <div>
              <span className="text-gray-500">Owner:</span>
              <p className="text-amber-300">{game.ownername}</p>
            </div>
          )}
        </div>
        
        {isScheduled && game.participants && game.participants.length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-500/20">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Participants ({game.participants.length})</h3>
            <div className="flex flex-wrap gap-2">
              {game.participants.map((participant, idx) => (
                <span key={idx} className="px-3 py-1 bg-amber-500/10 rounded text-amber-300">
                  {participant.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Status indicator for scheduled games */}
        {isScheduled && awaitingReplay && (
          <div className="mt-4 pt-4 border-t border-amber-500/20">
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg px-4 py-2">
              <p className="text-blue-300 font-medium">Waiting for Replay Upload</p>
              <p className="text-blue-400 text-sm mt-1">
                This game has ended. Please upload the replay file to complete the game record.
              </p>
            </div>
          </div>
        )}
        
        {/* Action buttons for scheduled games */}
        {isScheduled && (canEdit || canDelete || canJoin || canLeave || canUploadReplay) && (
          <div className="mt-4 pt-4 border-t border-amber-500/20 flex flex-wrap gap-3 justify-between items-center">
            <div className="flex flex-wrap gap-3">
            {canUploadReplay && (
              <Tooltip content="Upload the .w3g replay file from your Warcraft 3 game to automatically extract game data and complete the game record">
                <button
                  onClick={() => onUploadReplay(game)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                >
                  Upload Replay
                </button>
              </Tooltip>
            )}
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(game)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(game)}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
              >
                Delete
              </button>
            )}
            </div>
            <div className="flex gap-3">
              {canJoin && onJoin && (
                <button
                  onClick={() => onJoin(game.id)}
                  disabled={isJoining}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? 'Joining...' : 'Join'}
                </button>
              )}
            {canLeave && onLeave && (
              <button
                onClick={() => onLeave(game.id)}
                disabled={isLeaving}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLeaving ? 'Leaving...' : 'Leave'}
              </button>
            )}
            </div>
          </div>
        )}
        
        {!isScheduled && game.replayUrl && (
          <div className="mt-4 pt-4 border-t border-amber-500/20">
            <a
              href={game.replayUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={game.replayFileName || 'replay.w3g'}
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 underline transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download replay {game.replayFileName ? `(${game.replayFileName})` : '(.w3g)'}
            </a>
          </div>
        )}
      </Card>

      {!isScheduled && winners.length > 0 && (
        <Card variant="medieval" className="p-6">
          <h2 className="text-xl font-semibold text-green-400 mb-4">Winners</h2>
          <div className="space-y-2">
            {winners.map((player) => (
              <div key={player.id} className="flex justify-between items-center p-2 bg-green-500/10 rounded">
                <Link href={`/players/${encodeURIComponent(player.name)}`} className="text-amber-300 hover:text-amber-200">
                  {player.name}
                </Link>
                <div className="text-sm text-gray-400">
                  {player.elochange !== undefined && (
                    <span className="text-green-400">{formatEloChange(player.elochange)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!isScheduled && losers.length > 0 && (
        <Card variant="medieval" className="p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Losers</h2>
          <div className="space-y-2">
            {losers.map((player) => (
              <div key={player.id} className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                <Link href={`/players/${encodeURIComponent(player.name)}`} className="text-amber-300 hover:text-amber-200">
                  {player.name}
                </Link>
                <div className="text-sm text-gray-400">
                  {player.elochange !== undefined && (
                    <span className="text-red-400">{formatEloChange(player.elochange)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!isScheduled && drawers.length > 0 && (
        <Card variant="medieval" className="p-6">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Draw</h2>
          <div className="space-y-2">
            {drawers.map((player) => (
              <div key={player.id} className="flex justify-between items-center p-2 bg-yellow-500/10 rounded">
                <Link href={`/players/${encodeURIComponent(player.name)}`} className="text-amber-300 hover:text-amber-200">
                  {player.name}
                </Link>
                <div className="text-sm text-gray-400">
                  {player.elochange !== undefined && (
                    <span className="text-yellow-400">{formatEloChange(player.elochange)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Player Statistics Table - shows ITT-specific stats if available */}
      {!isScheduled && game.players && game.players.length > 0 && (
        <PlayerStatsTable players={game.players} />
      )}
    </div>
  );
}





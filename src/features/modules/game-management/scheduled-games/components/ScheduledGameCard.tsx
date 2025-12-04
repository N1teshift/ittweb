import React, { useMemo, useCallback } from 'react';
import type { Game } from '@/features/modules/game-management/games/types';
import { formatDateTimeInTimezone, getUserTimezone } from '../utils/timezoneUtils';
import { timestampToIso } from '@/features/infrastructure/utils';
import { useSession } from 'next-auth/react';

interface ScheduledGameCardProps {
  game: Game;
  onGameClick?: (game: Game) => void;
  onJoin?: (gameId: string) => Promise<void>;
  onLeave?: (gameId: string) => Promise<void>;
  onEdit?: (game: Game) => void;
  onRequestDelete?: (game: Game) => void;
  onUploadReplay?: (game: Game) => void;
  isJoining?: string | null;
  isLeaving?: string | null;
  isDeleting?: string | null;
  isUploadingReplay?: string | null;
  userIsAdmin?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-green-900/50 text-green-300',
  },
  ongoing: {
    label: 'On Going',
    className: 'bg-blue-900/50 text-blue-300',
  },
  awaiting_replay: {
    label: 'Waiting for Evidence',
    className: 'bg-yellow-900/50 text-yellow-300',
  },
  archived: {
    label: 'Archived',
    className: 'bg-gray-800/70 text-gray-300',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-900/50 text-red-300',
  },
};

function ScheduledGameCardComponent({
  game,
  onGameClick,
  onJoin,
  onLeave,
  onEdit,
  onRequestDelete,
  onUploadReplay,
  isJoining,
  isLeaving,
  isDeleting,
  isUploadingReplay,
  userIsAdmin = false,
}: ScheduledGameCardProps) {
  const { data: session } = useSession();
  const userTimezone = getUserTimezone();

  // Memoize formatted dates
  const scheduledDateTimeString = useMemo(
    () => (game.scheduledDateTime ? timestampToIso(game.scheduledDateTime) : new Date().toISOString()),
    [game.scheduledDateTime]
  );

  const gameDate = useMemo(
    () =>
      formatDateTimeInTimezone(scheduledDateTimeString, game.timezone || 'UTC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
    [scheduledDateTimeString, game.timezone]
  );

  const userLocalDate = useMemo(
    () =>
      formatDateTimeInTimezone(scheduledDateTimeString, userTimezone, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
    [scheduledDateTimeString, userTimezone]
  );

  // Memoize user participation status
  const userIsParticipant = useMemo(() => {
    if (!session?.discordId || !game.participants) return false;
    return game.participants.some((p) => p.discordId === session.discordId);
  }, [session?.discordId, game.participants]);

  const userIsCreator = useMemo(() => {
    if (!session?.discordId) return false;
    return game.createdByDiscordId === session.discordId;
  }, [session?.discordId, game.createdByDiscordId]);

  const canDelete = useMemo(() => {
    return userIsAdmin || userIsCreator;
  }, [userIsAdmin, userIsCreator]);

  const isProcessing = useMemo(
    () => isJoining === game.id || isLeaving === game.id || isDeleting === game.id || isUploadingReplay === game.id,
    [isJoining, isLeaving, isDeleting, isUploadingReplay, game.id]
  );

  const statusMeta = useMemo(
    () =>
      game.status
        ? STATUS_CONFIG[game.status] ?? { label: game.status, className: 'bg-gray-700 text-gray-200' }
        : { label: 'unknown', className: 'bg-gray-700 text-gray-200' },
    [game.status]
  );

  // Memoize callback functions
  const handleCardClick = useCallback(() => {
    onGameClick?.(game);
  }, [onGameClick, game]);

  const handleJoinClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onJoin) {
        await onJoin(game.id);
      }
    },
    [onJoin, game.id]
  );

  const handleLeaveClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onLeave) {
        await onLeave(game.id);
      }
    },
    [onLeave, game.id]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onEdit) {
        onEdit(game);
      }
    },
    [onEdit, game]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRequestDelete) {
        onRequestDelete(game);
      }
    },
    [onRequestDelete, game]
  );

  const handleUploadReplayClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onUploadReplay) {
        onUploadReplay(game);
      }
    },
    [onUploadReplay, game]
  );

  // Memoize formatted game length
  const formattedGameLength = useMemo(() => {
    if (!game.gameLength) return null;
    return game.gameLength >= 60
      ? `${Math.floor(game.gameLength / 60)} minute${Math.floor(game.gameLength / 60) !== 1 ? 's' : ''}`
      : `${game.gameLength} second${game.gameLength !== 1 ? 's' : ''}`;
  }, [game.gameLength]);

  const showUserLocalTime = userTimezone !== game.timezone;

  return (
    <div
      onClick={handleCardClick}
      className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 hover:border-amber-500/50 transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-medieval-brand text-amber-400">
              {game.teamSize === 'custom' ? game.customTeamSize : game.teamSize} -{' '}
              {game.gameType === 'elo' ? 'ELO' : 'Normal'}
            </h3>
            {game.scheduledGameId && <span className="text-sm text-gray-400">#{game.scheduledGameId}</span>}
          </div>
          <p className="text-gray-300">
            Scheduled by: <span className="text-amber-400">{game.creatorName}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded text-sm ${statusMeta.className}`}>{statusMeta.label}</span>
          {session && (
            <div className="flex gap-2">
              {game.status === 'awaiting_replay' && (
                <button
                  onClick={handleUploadReplayClick}
                  disabled={isProcessing}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload replay"
                >
                  {isProcessing ? 'Uploading...' : 'Upload Replay'}
                </button>
              )}
              {game.status === 'scheduled' && (
                <>
                  {userIsCreator && (
                    <button
                      onClick={handleEditClick}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm"
                      title="Edit game"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDeleteClick}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete game"
                    >
                      Delete
                    </button>
                  )}
                  {userIsParticipant ? (
                    <button
                      onClick={handleLeaveClick}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Leaving...' : 'Leave'}
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinClick}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Joining...' : 'Join'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-300 mb-4">
        <div>
          <span className="text-amber-500">Scheduled Time:</span> {gameDate}
        </div>
        {showUserLocalTime && (
          <div>
            <span className="text-amber-500">Your Local Time:</span> {userLocalDate}
          </div>
        )}
        {game.gameVersion && (
          <div>
            <span className="text-amber-500">Version:</span> {game.gameVersion}
          </div>
        )}
        {formattedGameLength && (
          <div>
            <span className="text-amber-500">Length:</span> {formattedGameLength}
          </div>
        )}
        {game.modes && game.modes.length > 0 && (
          <div>
            <span className="text-amber-500">Modes:</span> {game.modes.join(', ')}
          </div>
        )}
      </div>

      {/* Participants Section */}
      {game.participants && game.participants.length > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-500/20">
          <div className="text-amber-500 text-sm mb-2">Participants ({game.participants.length}):</div>
          <div className="flex flex-wrap gap-2">
            {game.participants.map((participant) => (
              <span
                key={participant.discordId}
                className={`px-2 py-1 rounded text-xs ${
                  participant.discordId === session?.discordId
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                    : 'bg-gray-700/50 text-gray-300'
                }`}
              >
                {participant.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders when props haven't changed
export const ScheduledGameCard = React.memo(ScheduledGameCardComponent);



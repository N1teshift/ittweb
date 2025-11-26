import React from 'react';
import { ScheduledGame } from '@/types/scheduledGame';
import { formatDateTimeInTimezone, getUserTimezone } from '../utils/timezoneUtils';
import { useSession } from 'next-auth/react';

interface ScheduledGamesListProps {
  games: ScheduledGame[];
  onGameClick?: (game: ScheduledGame) => void;
  onJoin?: (gameId: string) => Promise<void>;
  onLeave?: (gameId: string) => Promise<void>;
  onEdit?: (game: ScheduledGame) => void;
  onRequestDelete?: (game: ScheduledGame) => void;
  onUploadReplay?: (game: ScheduledGame) => void;
  isJoining?: string | null;
  isLeaving?: string | null;
  isDeleting?: string | null;
  isUploadingReplay?: string | null;
  userIsAdmin?: boolean;
}

export default function ScheduledGamesList({ 
  games, 
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
}: ScheduledGamesListProps) {
  const { data: session } = useSession();
  const userTimezone = getUserTimezone();
  
  const handleJoinClick = async (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    if (onJoin) {
      await onJoin(gameId);
    }
  };
  
  const handleLeaveClick = async (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    if (onLeave) {
      await onLeave(gameId);
    }
  };
  
  const isUserParticipant = (game: ScheduledGame): boolean => {
    if (!session?.discordId) return false;
    return game.participants.some(p => p.discordId === session.discordId);
  };

  const isUserCreator = (game: ScheduledGame): boolean => {
    if (!session?.discordId) return false;
    return game.scheduledByDiscordId === session.discordId;
  };

  const handleEditClick = (e: React.MouseEvent, game: ScheduledGame) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(game);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, game: ScheduledGame) => {
    e.stopPropagation();
    if (onRequestDelete) {
      onRequestDelete(game);
    }
  };

  const handleUploadReplayClick = (e: React.MouseEvent, game: ScheduledGame) => {
    e.stopPropagation();
    if (onUploadReplay) {
      onUploadReplay(game);
    }
  };

  const canDeleteGame = (game: ScheduledGame): boolean => {
    return userIsAdmin || isUserCreator(game);
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No scheduled games yet.</p>
        <p className="text-gray-500 text-sm mt-2">Be the first to schedule a game!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {games.map(game => {
        const gameDate = formatDateTimeInTimezone(game.scheduledDateTime, game.timezone, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        });
        
        const userLocalDate = formatDateTimeInTimezone(game.scheduledDateTime, userTimezone, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        });

        const userIsParticipant = isUserParticipant(game);
        const userIsCreator = isUserCreator(game);
        const canDelete = canDeleteGame(game);
        const isProcessing = isJoining === game.id || isLeaving === game.id || isDeleting === game.id || isUploadingReplay === game.id;
        const canUploadReplay = game.status === 'awaiting_replay' || (game.status === 'scheduled' && new Date(game.scheduledDateTime) < new Date());
        
        return (
          <div
            key={game.id}
            onClick={() => onGameClick?.(game)}
            className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 hover:border-amber-500/50 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-medieval-brand text-amber-400">
                    {game.teamSize === 'custom' ? game.customTeamSize : game.teamSize} - {game.gameType === 'elo' ? 'ELO' : 'Normal'}
                  </h3>
                  <span className="text-sm text-gray-400">
                    #{game.scheduledGameId}
                  </span>
                </div>
                <p className="text-gray-300">
                  Scheduled by: <span className="text-amber-400">{game.scheduledByName}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded text-sm ${
                  game.status === 'scheduled' ? 'bg-green-900/50 text-green-300' :
                  game.status === 'awaiting_replay' ? 'bg-yellow-900/50 text-yellow-300' :
                  game.status === 'archived' ? 'bg-blue-900/50 text-blue-300' :
                  'bg-red-900/50 text-red-300'
                }`}>
                  {game.status === 'awaiting_replay' ? 'Awaiting Replay' : game.status}
                </span>
                {session && (game.status === 'scheduled' || game.status === 'awaiting_replay') && (
                  <div className="flex gap-2">
                    {canUploadReplay && (
                      <button
                        onClick={(e) => handleUploadReplayClick(e, game)}
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
                            onClick={(e) => handleEditClick(e, game)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm"
                            title="Edit game"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={(e) => handleDeleteClick(e, game)}
                            disabled={isProcessing}
                            className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete game"
                          >
                            Delete
                          </button>
                        )}
                        {userIsParticipant ? (
                          <button
                            onClick={(e) => handleLeaveClick(e, game.id)}
                            disabled={isProcessing}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? 'Leaving...' : 'Leave'}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleJoinClick(e, game.id)}
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
              {userTimezone !== game.timezone && (
                <div>
                  <span className="text-amber-500">Your Local Time:</span> {userLocalDate}
                </div>
              )}
              {game.gameVersion && (
                <div>
                  <span className="text-amber-500">Version:</span> {game.gameVersion}
                </div>
              )}
              {game.gameLength && (
                <div>
                  <span className="text-amber-500">Length:</span> {
                    game.gameLength >= 60 
                      ? `${Math.floor(game.gameLength / 60)} minute${Math.floor(game.gameLength / 60) !== 1 ? 's' : ''}`
                      : `${game.gameLength} second${game.gameLength !== 1 ? 's' : ''}`
                  }
                </div>
              )}
              {game.modes.length > 0 && (
                <div>
                  <span className="text-amber-500">Modes:</span> {game.modes.join(', ')}
                </div>
              )}
            </div>
            
            {/* Participants Section */}
            {game.participants.length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-500/20">
                <div className="text-amber-500 text-sm mb-2">
                  Participants ({game.participants.length}):
                </div>
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
      })}
    </div>
  );
}


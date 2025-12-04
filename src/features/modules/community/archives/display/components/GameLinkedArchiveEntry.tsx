import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Card } from '@/features/infrastructure/components';
import { formatDuration } from '@/features/modules/shared/utils';
import { timestampToIso } from '@/features/infrastructure/utils';
import { formatDateTimeInTimezone } from '@/features/modules/game-management/scheduled-games/utils/timezoneUtils';
import type { ArchiveEntry } from '@/types/archive';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';
import { GamePlayersSection } from './GamePlayersSection';
import YouTubeEmbed from '../../media/components/YouTubeEmbed';
import TwitchClipEmbed from '../../media/components/TwitchClipEmbed';
import { createComponentLogger } from '@/features/infrastructure/logging';

/**
 * Extract version from map path
 * Example: "Maps/Download/Island.Troll.Tribes.v3.25.8.w3x" -> "v3.25.8"
 */
function extractVersionFromMap(map: string): string | null {
  if (!map) return null;
  
  // Match version pattern like v3.25.8, v3.28, etc.
  // Pattern: v followed by digits and dots
  const versionMatch = map.match(/v\d+(\.\d+)*/i);
  return versionMatch ? versionMatch[0] : null;
}

interface GameLinkedArchiveEntryProps {
  entry: ArchiveEntry;
  game: GameWithPlayers | null;
  gameLoading: boolean;
  gameError: string | null;
  gameNumber: string | null;
  gameType: string | null;
  onEdit?: (entry: ArchiveEntry) => void;
  onDelete?: (entry: ArchiveEntry) => void;
  canDelete?: boolean;
  onImageClick?: (url: string, title: string) => void;
  displayText: string;
  shouldTruncate: boolean;
  isExpanded: boolean;
  onTextExpand: () => void;
  onGameEdit?: (game: GameWithPlayers) => void;
  onGameDelete?: (game: GameWithPlayers) => void;
  onGameJoin?: (gameId: string) => Promise<void>;
  onGameLeave?: (gameId: string) => Promise<void>;
  isJoining?: string | boolean;
  isLeaving?: string | boolean;
  userIsAdmin?: boolean;
}

export function GameLinkedArchiveEntry({
  entry,
  game,
  gameLoading,
  gameError,
  gameNumber,
  gameType: _gameType,
  onEdit: _onEdit,
  onDelete: _onDelete,
  canDelete: _canDelete,
  onImageClick,
  displayText,
  shouldTruncate,
  isExpanded,
  onTextExpand,
  onGameEdit,
  onGameDelete,
  onGameJoin,
  onGameLeave,
  isJoining = false,
  isLeaving = false,
  userIsAdmin = false,
}: GameLinkedArchiveEntryProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const logger = createComponentLogger('GameLinkedArchiveEntry');

  // Check if user is participant or creator
  const userIsParticipant = React.useMemo(() => {
    if (!session?.discordId || !game?.participants) return false;
    return game.participants.some((p) => p.discordId === session.discordId);
  }, [session?.discordId, game?.participants]);

  const userIsCreator = React.useMemo(() => {
    if (!session?.discordId) return false;
    return game?.createdByDiscordId === session.discordId;
  }, [session?.discordId, game?.createdByDiscordId]);

  const canEditGame = React.useMemo(() => {
    return game?.gameState === 'scheduled' && (userIsAdmin || userIsCreator);
  }, [game?.gameState, userIsAdmin, userIsCreator]);

  const canDeleteGame = React.useMemo(() => {
    return game?.gameState === 'scheduled' && (userIsAdmin || userIsCreator);
  }, [game?.gameState, userIsAdmin, userIsCreator]);

  if (gameLoading && entry.linkedGameDocumentId) {
    return (
      <Card variant="medieval" className="p-4 mb-4 animate-pulse">
        <div className="h-6 bg-amber-500/20 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
      </Card>
    );
  }



  const handleTextExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTextExpand();
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (game?.id) {
      router.push(`/games/${game.id}`);
    }
  };

  const imageUrls: string[] = entry.images && entry.images.length > 0 ? entry.images : [];
  const video: string | undefined = entry.videoUrl;
  const replay: string | undefined = entry.replayUrl;
  const hasMedia = imageUrls.length > 0 || video || entry.twitchClipUrl || replay;

  return (
    <div 
      className="bg-gradient-to-br from-black/40 via-amber-950/20 to-black/40 backdrop-blur-sm border-2 border-amber-500/40 rounded-lg p-6 mb-6 hover:border-amber-400/70 hover:shadow-lg hover:shadow-amber-500/20 transition-all relative group"
    >
      {/* Main clickable content area */}
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-amber-300">
                {game ? `Game #${game.gameId}` : (gameNumber ? `Game #${gameNumber}` : entry.title)}
              </h3>
            </div>
          </div>
          {game && (
            <span className="px-3 py-1 text-xs bg-amber-500/30 border border-amber-400/50 rounded text-amber-300 font-medium">
              {game.gameState === 'completed' ? 'Completed game' : game.gameState === 'scheduled' ? 'Scheduled game' : 'Game'}
            </span>
          )}
        </div>

        {game && (
          <>
            {/* Game Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mt-4 p-3 bg-black/30 rounded border border-amber-500/20">
              {game.gameState === 'completed' ? (
                <>
                  {/* 1. Creator */}
                  {game.creatorName && (
                    <div>
                      <span className="text-gray-400">Creator:</span>{' '}
                      <span className="text-amber-300 font-medium">{game.creatorName}</span>
                    </div>
                  )}
                  {/* 2. Version */}
                  {game.map && (() => {
                    const version = extractVersionFromMap(typeof game.map === 'string' ? game.map : String(game.map));
                    return version ? (
                      <div>
                        <span className="text-gray-400">Version:</span>{' '}
                        <span className="text-amber-300 font-medium">{version}</span>
                      </div>
                    ) : null;
                  })()}
                  {/* 3. Team Size */}
                  {game.category && (
                    <div>
                      <span className="text-gray-400">Team Size:</span>{' '}
                      <span className="text-amber-300 font-medium">{game.category}</span>
                    </div>
                  )}
                  {/* 4. Duration */}
                  {game.duration && (
                    <div>
                      <span className="text-gray-400">Duration:</span>{' '}
                      <span className="text-amber-300 font-medium">{formatDuration(game.duration)}</span>
                    </div>
                  )}
                  {/* 5. Owner */}
                  {game.ownername && (
                    <div>
                      <span className="text-gray-400">Owner:</span>{' '}
                      <span className="text-amber-300 font-medium">{game.ownername}</span>
                    </div>
                  )}
                </>
              ) : game.gameState === 'scheduled' ? (
                <>
                  {/* 1. Creator */}
                  {game.creatorName && (
                    <div>
                      <span className="text-gray-400">Creator:</span>{' '}
                      <span className="text-amber-300 font-medium">{game.creatorName}</span>
                    </div>
                  )}
                  {/* 2. Version */}
                  {game.gameVersion && (
                    <div>
                      <span className="text-gray-400">Version:</span>{' '}
                      <span className="text-amber-300 font-medium">{game.gameVersion}</span>
                    </div>
                  )}
                  {/* 3. Team Size */}
                  {game.teamSize && (
                    <div>
                      <span className="text-gray-400">Team Size:</span>{' '}
                      <span className="text-amber-300 font-medium">
                        {game.teamSize === 'custom' ? game.customTeamSize : game.teamSize}
                      </span>
                    </div>
                  )}
                  {/* 4. Duration */}
                  {game.gameLength && (
                    <div>
                      <span className="text-gray-400">Duration:</span>{' '}
                      <span className="text-amber-300 font-medium">{formatDuration(game.gameLength)}</span>
                    </div>
                  )}
                  {/* 5. Scheduled */}
                  {(game.scheduledDateTimeString || game.scheduledDateTime) && (
                    <div>
                      <span className="text-gray-400">Scheduled:</span>{' '}
                      <span className="text-amber-300 font-medium">
                        {(() => {
                          try {
                            // Prefer scheduledDateTimeString if available, otherwise convert scheduledDateTime
                            const scheduledDateIso = game.scheduledDateTimeString || timestampToIso(game.scheduledDateTime);
                            return formatDateTimeInTimezone(
                              scheduledDateIso,
                              game.timezone || 'UTC',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short',
                              }
                            );
                          } catch {
                            // Fallback to simple date formatting if timezone formatting fails
                            const scheduledDateIso = game.scheduledDateTimeString || timestampToIso(game.scheduledDateTime);
                            return new Date(scheduledDateIso).toLocaleString();
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Participants Section for Scheduled Games */}
            {game?.gameState === 'scheduled' && game.participants && game.participants.length > 0 && (
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

            {/* Players Section */}
            <GamePlayersSection game={game} />

            {game.verified && (
              <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 border border-green-500/30 rounded text-green-400">
                <span>✓</span> Verified
              </div>
            )}
          </>
        )}

        {/* Media sections */}
        {hasMedia && (
          <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-3" onClick={(e) => e.stopPropagation()}>
            {replay && (
              <div>
                <a
                  href={replay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 underline text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download replay (.w3g)
                </a>
              </div>
            )}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {imageUrls.slice(0, 2).map((url: string, i: number) => (
                  <div
                    key={url + i}
                    className="relative w-full rounded-lg border border-amber-500/30 overflow-hidden cursor-pointer hover:border-amber-500/50 transition-colors"
                    onClick={() => onImageClick ? onImageClick(url, entry.title) : undefined}
                  >
                    <Image
                      src={url}
                      alt={entry.title}
                      width={400}
                      height={300}
                      className="w-full h-auto max-h-32 object-cover"
                      sizes="(max-width: 768px) 50vw, 200px"
                      unoptimized={url.includes('firebasestorage.googleapis.com')}
                    />
                  </div>
                ))}
              </div>
            )}
            {video && (
              <div>
                <YouTubeEmbed url={video} title={entry.title} />
              </div>
            )}
            {entry.twitchClipUrl && (
              <div>
                <TwitchClipEmbed url={entry.twitchClipUrl} title={entry.title} />
              </div>
            )}
          </div>
        )}

        {/* Text content */}
        {entry.content && entry.content.trim() && (
          <div className="mt-4 pt-4 border-t border-amber-500/20" onClick={(e) => e.stopPropagation()}>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                {displayText}
                {shouldTruncate && (
                  <button
                    onClick={handleTextExpandClick}
                    className="ml-2 text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Archive metadata */}
        <div className="mt-4 pt-4 border-t-2 border-amber-500/30">
          <div className="flex items-center justify-between text-xs"> 
            <span className="text-gray-400">
              Added by <span className="text-amber-400/80">{entry.creatorName}</span> on {new Date(timestampToIso(entry.createdAt)).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-3">
              {/* Scheduled game actions */}
              {game?.gameState === 'scheduled' && game.id && (
                <>
                  {onGameJoin && !userIsParticipant && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onGameJoin(game.id);
                      }}
                      disabled={isJoining === game.id || isJoining === true}
                      className="text-amber-400 hover:text-amber-300 underline font-medium transition-colors disabled:opacity-50"
                    >
                      {(isJoining === game.id || isJoining === true) ? 'Joining...' : 'Join'}
                    </button>
                  )}
                  {onGameLeave && userIsParticipant && (
                    <button
                      onClick={(e) => {
                        logger.debug('Leave button clicked', { gameId: game.id });
                        e.preventDefault();
                        e.stopPropagation();
                        onGameLeave(game.id);
                      }}
                      disabled={isLeaving === game.id || isLeaving === true}
                      className="text-amber-400 hover:text-amber-300 underline font-medium transition-colors disabled:opacity-50"
                    >
                      {(isLeaving === game.id || isLeaving === true) ? 'Leaving...' : 'Leave'}
                    </button>
                  )}
                  {canEditGame && onGameEdit && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onGameEdit(game);
                      }}
                      className="text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {canDeleteGame && onGameDelete && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onGameDelete(game);
                      }}
                      className="text-red-400 hover:text-red-300 underline font-medium transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
              {game?.id ? (
                <button
                  onClick={handleViewDetailsClick}
                  className="text-amber-300 font-medium hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  View full game details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : entry.linkedGameDocumentId && gameLoading ? (
                <span className="text-amber-400/60 text-xs animate-pulse">
                  Loading game data...
                </span>
              ) : entry.linkedGameDocumentId && gameError ? (
                <span className="text-red-400/60 text-xs">
                  Game not found (ID: {entry.linkedGameDocumentId})
                </span>
              ) : entry.linkedGameDocumentId ? (
                <span className="text-amber-400/60 text-xs">
                  Game data unavailable
                </span>
              ) : entry.replayUrl ? (
                <span className="text-amber-400/60 text-xs">
                  Replay uploaded - game link missing (may need manual linking)
                </span>
              ) : (
                <span className="text-amber-400/60 text-xs">
                  Waiting for replay upload
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}




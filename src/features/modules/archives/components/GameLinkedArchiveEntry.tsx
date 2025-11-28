import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/features/infrastructure/components/ui/Card';
import { formatDuration } from '@/features/modules/shared/utils';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import type { ArchiveEntry } from '@/types/archive';
import type { GameWithPlayers } from '@/features/modules/games/types';
import { GameDetailsSection } from './GameDetailsSection';
import { GamePlayersSection } from './GamePlayersSection';
import { ArchiveMediaSections } from './ArchiveMediaSections';
import YouTubeEmbed from './YouTubeEmbed';
import TwitchClipEmbed from './TwitchClipEmbed';

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
}

export function GameLinkedArchiveEntry({
  entry,
  game,
  gameLoading,
  gameError,
  gameNumber,
  gameType,
  onEdit,
  onDelete,
  canDelete,
  onImageClick,
  displayText,
  shouldTruncate,
  isExpanded,
  onTextExpand,
}: GameLinkedArchiveEntryProps) {
  const router = useRouter();

  if (gameLoading && entry.linkedGameDocumentId) {
    return (
      <Card variant="medieval" className="p-4 mb-4 animate-pulse">
        <div className="h-6 bg-amber-500/20 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
      </Card>
    );
  }

  const gameDate = game 
    ? new Date(game.datetime as string) 
    : (entry.dateInfo.singleDate 
        ? new Date(entry.dateInfo.singleDate) 
        : new Date(timestampToIso(entry.createdAt)));
  const formattedDate = gameDate.toLocaleDateString();
  const formattedTime = gameDate.toLocaleTimeString();

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(entry);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(entry);
  };

  const handleTextExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTextExpand();
  };

  const handleCardClick = () => {
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
      className={`bg-gradient-to-br from-black/40 via-amber-950/20 to-black/40 backdrop-blur-sm border-2 border-amber-500/40 rounded-lg p-6 mb-6 hover:border-amber-400/70 hover:shadow-lg hover:shadow-amber-500/20 transition-all relative group ${game?.id ? 'cursor-pointer' : ''}`}
      onClick={game?.id ? handleCardClick : undefined}
    >
      {/* Visual indicator badge */}
      <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500/30 border border-amber-400/50 rounded text-xs font-semibold text-amber-300 z-10">
        🎮 Game Archive
      </div>

      {/* Main clickable content area */}
      <div className="pt-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-amber-300">
                {game ? `Game #${game.gameId}` : (gameNumber ? `Game #${gameNumber}` : entry.title)}
              </h3>
            </div>
            <p className="text-sm text-gray-300">
              {formattedDate} {formattedTime}
            </p>
          </div>
          {(game?.category || gameType) && (
            <span className="px-3 py-1 text-xs bg-amber-500/30 border border-amber-400/50 rounded text-amber-300 font-medium">
              {game?.category || gameType}
            </span>
          )}
        </div>

        {game && (
          <>
            {/* Game Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mt-4 p-3 bg-black/30 rounded border border-amber-500/20">
              {game.duration && (
                <div>
                  <span className="text-gray-400">Duration:</span>{' '}
                  <span className="text-amber-300 font-medium">{formatDuration(game.duration)}</span>
                </div>
              )}
              {game.map && (
                <div>
                  <span className="text-gray-400">Map:</span>{' '}
                  <span className="text-amber-300 font-medium">{typeof game.map === 'string' ? (game.map.split('\\').pop() || game.map) : game.map}</span>
                </div>
              )}
              {game.creatorName && (
                <div>
                  <span className="text-gray-400">Creator:</span>{' '}
                  <span className="text-amber-300 font-medium">{game.creatorName}</span>
                </div>
              )}
              {game.ownername && (
                <div>
                  <span className="text-gray-400">Owner:</span>{' '}
                  <span className="text-amber-300 font-medium">{game.ownername}</span>
                </div>
              )}
            </div>

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
            {game?.id ? (
              <span className="text-amber-300 font-medium group-hover:text-amber-200 transition-colors flex items-center gap-1">
                View full game details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
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

      {/* Edit/Delete buttons */}
      {(onEdit || (canDelete && onDelete)) && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="px-3 py-1.5 text-xs font-medium bg-black/70 hover:bg-black/90 border border-amber-500/40 hover:border-amber-500/60 text-amber-300 hover:text-amber-200 rounded transition-all shadow-lg"
              title="Edit archive entry"
            >
              Edit
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={handleDeleteClick}
              className="px-3 py-1.5 text-xs font-medium bg-black/70 hover:bg-black/90 border border-red-500/40 hover:border-red-500/60 text-red-300 hover:text-red-200 rounded transition-all shadow-lg"
              title="Delete archive entry"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}


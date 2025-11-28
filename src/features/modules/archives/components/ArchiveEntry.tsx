import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { ArchiveEntry } from '@/types/archive';
import { normalizeSectionOrder } from '@/features/modules/archives/utils/archiveFormUtils';
import YouTubeEmbed from './YouTubeEmbed';
import TwitchClipEmbed from './TwitchClipEmbed';
import Image from 'next/image';
import { GameDetailsSection } from './GameDetailsSection';
import { useGame } from '@/features/modules/games/hooks/useGame';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import { formatDuration, formatEloChange } from '@/features/modules/shared/utils';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import Link from 'next/link';

type EntrySection = 'images' | 'video' | 'twitch' | 'replay' | 'game' | 'text';

interface ArchiveEntryProps {
  entry: ArchiveEntry;
  onEdit?: (entry: ArchiveEntry) => void;
  onDelete?: (entry: ArchiveEntry) => void;
  canDelete?: boolean;
  onImageClick?: (url: string, title: string) => void;
}

export default function ArchiveEntry({ entry, onEdit, onDelete, canDelete, onImageClick }: ArchiveEntryProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [foundGameId, setFoundGameId] = useState<string | null>(null);
  const maxLength = 300; // Characters to show before truncating
  const shouldTruncate = entry.content.length > maxLength;
  const displayText = isExpanded ? entry.content : entry.content.slice(0, maxLength) + '...';
  
  // Extract scheduled game ID from title for fallback lookup
  const titleMatch = entry.title.match(/^Game #(\d+)/);
  const scheduledGameId = titleMatch ? titleMatch[1] : null;
  
  // Fetch game data if linkedGameDocumentId is present
  const { game, loading: gameLoading, error: gameError } = useGame(entry.linkedGameDocumentId || foundGameId || '');
  
  // If no linkedGameDocumentId in entry but we have a scheduled game ID, try to find the game by numeric gameId
  useEffect(() => {
    if (!entry.linkedGameDocumentId && scheduledGameId && !game && !gameLoading && !foundGameId) {
      // Try to find game by matching the numeric gameId field (which matches scheduledGameId)
      fetch(`/api/games?gameId=${scheduledGameId}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.games?.length > 0) {
            // Found a game - the game object should have an 'id' field (document ID)
            const foundGame = data.data.games[0];
            // Games returned from the API should include the document ID
            // Check if it's in the response or we need to get it differently
            if (foundGame.id) {
              setFoundGameId(foundGame.id);
            } else {
              // If the API doesn't return id, we might need to query differently
              // For now, log this case
              console.warn('Game found but no document ID in response', foundGame);
            }
          }
        })
        .catch(() => {
          // Silently fail - game might not exist yet
        });
    }
  }, [entry.linkedGameDocumentId, scheduledGameId, game, gameLoading, foundGameId]);

  const formatDate = (dateInfo: ArchiveEntry['dateInfo']) => {
    switch (dateInfo.type) {
      case 'single':
        if (!dateInfo.singleDate) return 'Unknown';
        // Handle partial dates: YYYY, YYYY-MM, or YYYY-MM-DD
        const dateStr = dateInfo.singleDate.trim();
        if (/^\d{4}$/.test(dateStr)) {
          // Year only
          return dateStr;
        } else if (/^\d{4}-\d{2}$/.test(dateStr)) {
          // Year-Month: format as "March 2025"
          const [year, month] = dateStr.split('-');
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          const monthName = monthNames[parseInt(month) - 1] || month;
          return `${monthName} ${year}`;
        } else {
          // Full date: YYYY-MM-DD
          try {
            return new Date(dateStr).toLocaleDateString();
          } catch {
            return dateStr;
          }
        }
      case 'interval':
        // Backward compatibility: handle existing interval dates
        const start = dateInfo.startDate ? new Date(dateInfo.startDate).toLocaleDateString() : 'Unknown';
        const end = dateInfo.endDate ? new Date(dateInfo.endDate).toLocaleDateString() : 'Unknown';
        return `${start} - ${end}`;
      case 'undated':
        return dateInfo.approximateText || 'Undated';
      default:
        return 'Unknown';
    }
  };

  const renderSectionedMediaAndText = () => {
    const imageUrls: string[] =
      entry.images && entry.images.length > 0
        ? entry.images
        : [];

    const video: string | undefined = entry.videoUrl;
    const replay: string | undefined = entry.replayUrl;

    const order: EntrySection[] = normalizeSectionOrder(entry.sectionOrder as EntrySection[] | undefined);

    return (
      <div className="space-y-4">
        {order.map((section: EntrySection, idx: number) => {
          if (section === 'images' && imageUrls.length > 0) {
            return (
              <div key={`section-images-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {imageUrls.map((url: string, i: number) => (
                  <div
                    key={url + i}
                    className="relative w-full rounded-lg border border-amber-500/30 overflow-hidden cursor-pointer hover:border-amber-500/50 transition-colors"
                    onClick={() => onImageClick ? onImageClick(url, entry.title) : undefined}
                  >
                    <Image
                      src={url}
                      alt={entry.title}
                      width={800}
                      height={600}
                      className="w-full h-auto max-h-96 object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized={url.includes('firebasestorage.googleapis.com')}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 hover:opacity-100 transition-opacity">
                        Click to enlarge
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          if (section === 'video' && video) {
            return (
              <div key={`section-video-${idx}`}>
                <YouTubeEmbed url={video} title={entry.title} />
              </div>
            );
          }

          if (section === 'twitch' && entry.twitchClipUrl) {
            return (
              <div key={`section-twitch-${idx}`}>
                <TwitchClipEmbed url={entry.twitchClipUrl} title={entry.title} />
              </div>
            );
          }

          if (section === 'replay' && replay) {
            return (
              <div key={`section-replay-${idx}`}>
                <a
                  href={replay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 underline"
                >
                  Download replay (.w3g)
                </a>
              </div>
            );
          }

          if (section === 'game' && entry.linkedGameDocumentId) {
            if (gameLoading) {
              return (
                <div key={`section-game-${idx}`} className="p-4 bg-black/20 rounded-lg">
                  <div className="animate-pulse text-gray-400">Loading game details...</div>
                </div>
              );
            }
            if (game) {
              return (
                <div key={`section-game-${idx}`}>
                  <GameDetailsSection game={game} />
                </div>
              );
            }
            return null;
          }

          if (section === 'text') {
            return (
              <div key={`section-text-${idx}`} className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {displayText}
                  {shouldTruncate && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="ml-2 text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </p>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const getDateBadgeColor = () => {
    switch (entry.dateInfo.type) {
      case 'undated':
        return 'bg-gray-600 text-gray-300';
      case 'interval':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-amber-600 text-white';
    }
  };

  // Check if this is an auto-created archive entry from a scheduled game
  // Identified by: title pattern "Game #X - ..." AND having replayUrl
  const titleMatchesPattern = /^Game #\d+/.test(entry.title);
  const hasReplay = !!entry.replayUrl;
  const isScheduledGameArchive = titleMatchesPattern && hasReplay;
  
  // If this archive entry has a gameId OR is a scheduled game archive, render it as a GameCard-style component
  if (entry.linkedGameDocumentId || isScheduledGameArchive) {
    // Extract game number from title if game data not available
    const titleMatch = entry.title.match(/^Game #(\d+) - (.+)$/);
    const gameNumber = titleMatch ? titleMatch[1] : null;
    const gameType = titleMatch ? titleMatch[2] : null;

    // For scheduled game archives, show the new design even if game data isn't loaded yet
    // Only show loading skeleton if we have a gameId and are actively loading (not for scheduled archives without gameId)
    if (gameLoading && entry.linkedGameDocumentId && !isScheduledGameArchive) {
      return (
        <Card variant="medieval" className="p-4 mb-4 animate-pulse">
          <div className="h-6 bg-amber-500/20 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
        </Card>
      );
    }

    // Render as GameCard-style with archive features (hybrid design)
    // Use game data if available, otherwise use title/date info
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
      setIsExpanded(!isExpanded);
    };

    const handleCardClick = () => {
      if (game?.id) {
        router.push(`/games/${game.id}`);
      }
      // If no game data yet, clicking won't navigate (entry might still be processing)
    };

    // Check for media sections (replay, images, video, twitch)
    const imageUrls: string[] =
      entry.images && entry.images.length > 0
        ? entry.images
        : [];
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

              {/* Players - Winners, Losers, Drawers */}
              {game.players && game.players.length > 0 && (
                <div className="mt-4 space-y-2">
                  {(() => {
                    const winners = game.players.filter(p => p.flag === 'winner');
                    const losers = game.players.filter(p => p.flag === 'loser');
                    const drawers = game.players.filter(p => p.flag === 'drawer');
                    
                    return (
                      <>
                        {winners.length > 0 && (
                          <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                            <div className="text-xs font-semibold text-green-400 mb-1.5">Winners</div>
                            <div className="flex flex-wrap gap-2">
                              {winners.map((player) => (
                                <Link
                                  key={player.id}
                                  href={`/players/${encodeURIComponent(player.name)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-amber-300 hover:text-amber-200 underline"
                                >
                                  {player.name}
                                  {player.elochange !== undefined && (
                                    <span className="ml-1 text-green-400">{formatEloChange(player.elochange)}</span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {losers.length > 0 && (
                          <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                            <div className="text-xs font-semibold text-red-400 mb-1.5">Losers</div>
                            <div className="flex flex-wrap gap-2">
                              {losers.map((player) => (
                                <Link
                                  key={player.id}
                                  href={`/players/${encodeURIComponent(player.name)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-amber-300 hover:text-amber-200 underline"
                                >
                                  {player.name}
                                  {player.elochange !== undefined && (
                                    <span className="ml-1 text-red-400">{formatEloChange(player.elochange)}</span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {drawers.length > 0 && (
                          <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                            <div className="text-xs font-semibold text-yellow-400 mb-1.5">Draw</div>
                            <div className="flex flex-wrap gap-2">
                              {drawers.map((player) => (
                                <Link
                                  key={player.id}
                                  href={`/players/${encodeURIComponent(player.name)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-amber-300 hover:text-amber-200 underline"
                                >
                                  {player.name}
                                  {player.elochange !== undefined && (
                                    <span className="ml-1 text-yellow-400">{formatEloChange(player.elochange)}</span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {game.verified && (
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 border border-green-500/30 rounded text-green-400">
                  <span>✓</span> Verified
                </div>
              )}
            </>
          )}

          {/* Media sections - archive feature (replay, images, video, twitch) */}
          {hasMedia && (
            <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-3">
              {replay && (
                <div onClick={(e) => e.stopPropagation()}>
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
                <div onClick={(e) => e.stopPropagation()} className="grid grid-cols-2 gap-2">
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
                <div onClick={(e) => e.stopPropagation()}>
                  <YouTubeEmbed url={video} title={entry.title} />
                </div>
              )}
              {entry.twitchClipUrl && (
                <div onClick={(e) => e.stopPropagation()}>
                  <TwitchClipEmbed url={entry.twitchClipUrl} title={entry.title} />
                </div>
              )}
            </div>
          )}

          {/* Text content if available - archive feature */}
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

          {/* Archive metadata - hybrid feature */}
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

        {/* Edit/Delete buttons - positioned absolutely to not interfere with click */}
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

  // Normal archive entry (no gameId)
  return (
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 mb-6 hover:border-amber-500/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medieval-brand text-2xl text-amber-400">
          {entry.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDateBadgeColor()}`}>
            {formatDate(entry.dateInfo)}
          </span>
        </div>
      </div>

      {/* Media and Text in Saved Order */}
      {renderSectionedMediaAndText()}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-amber-500/20">
        <div className="flex items-center justify-between text-sm text-gray-400"> 
          <span>
            Added by {entry.creatorName} on {new Date(timestampToIso(entry.createdAt)).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(entry)}
                className="text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(entry)}
                className="text-red-400 hover:text-red-300 underline font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

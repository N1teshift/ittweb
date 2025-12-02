/**
 * Modules Index - Feature-specific modules for ITT Web
 *
 * This file provides unified exports for all feature modules,
 * allowing clean imports without remembering individual paths.
 */

// Core feature modules - named exports
export * as Analytics from './analytics';
export * as Archives from './archives';
export * as Blog from './blog';
export * as Classes from './classes';
export * as Entries from './entries';
export * as Games from './games';
export * as Guides from './guides';
export * as MapAnalyzer from './map-analyzer';
export * as Meta from './meta';
export * as Players from './players';
export * as ScheduledGames from './scheduled-games';
export * as Standings from './standings';
export * as Tools from './tools';
export * as Shared from './shared';

// Direct component exports for convenience
export { ActivityChart, EloChart, WinRateChart, ClassSelectionChart, ClassWinRateChart, GameLengthChart, PlayerActivityChart } from './analytics/components';
export { ArchivesContent, ArchiveForm, ArchiveEditForm, ArchiveEntry, ArchiveDeleteDialog, ArchivesToolbar } from './archives/components';
export { BlogPost, NewPostForm, EditPostForm, NewPostFormModal, PostDeleteDialog } from './blog/components';
export { ClassesPage, ClassDetailPage } from './classes/components';
export { EntryFormModal, EntryEditModal } from './entries/components';
export { GameList, GameCard, GameDetail } from './games/components';
export { ClassHeader, ClassIcon, ClassModel, ColoredText, GuideCard, GuideIcon, StatsCard } from './guides/components';
export { MapContainer, MapControls, MapFileUploader, MapInfoPanel, TerrainVisualizer, TerrainVisualizerContainer, TerrainLegendCard, TileInfoPanel, FlagVisualizer, FlagLegend, CliffLegend, ElevationLegend, WaterLegend, HeightDistributionChart } from './map-analyzer/components';
export { MetaPage } from './meta/components';
export { PlayersPage, PlayerCard, PlayersActionBar, ComparisonResults, PlayerProfile, PlayerComparison } from './players/components';
export { ScheduledGamesPage, ScheduledGameCard, ScheduledGameForm, ScheduledGameDetail, JoinGameButton, ScheduledGameFilters } from './scheduled-games/components';
export { Leaderboard, CategorySelector } from './standings/components';
export { IconMapper, StatsPanel } from './tools/components';
export { DateRangeFilter, PlayerFilter, TeamFormatFilter, GameFilters } from './shared/components';

// Hook exports
export { useGames, useGame, useGameFilters } from './games/hooks';
export { usePlayerStats, usePlayerComparison } from './players/hooks';
export { useStandings } from './standings/hooks';
export { useClassesData, useClassData } from './classes/hooks';
export { useArchivesPage, useArchiveHandlers, useArchiveBaseState, useArchiveMedia, useArchiveFormSubmit } from './archives/hooks';
export { useNewPostForm, useEditPostForm } from './blog/hooks';
export { useMetaData, useMetaFilters } from './meta/components';
export { useIconMapperData } from './tools/useIconMapperData';

// Service exports
export { gameService, createGame, getGames, getGameById, updateGame, deleteGame } from './games/lib';
export { playerService, getPlayerStats, searchPlayers, comparePlayers } from './players/lib';
export { standingsService, getStandings } from './standings/lib';
export { analyticsService, getActivityData, getEloHistory, getWinRateData } from './analytics/lib';
export { entryService, createEntry, getEntryById, updateEntry, deleteEntry } from './entries/lib';
export { postService, createPost, getPosts, getPostById, updatePost, deletePost } from './blog/lib';
export { scheduledGameService, getAllScheduledGames, createScheduledGame } from './scheduled-games/lib';

// Type exports
export type { Game, GamePlayer, CreateGame, UpdateGame, GameFilters as GameFiltersType } from './games/types';
export type { PlayerStats, PlayerProfile, PlayerComparison } from './players/types';
export type { StandingsEntry, StandingsResponse, StandingsFilters } from './standings/types';
export type { ActivityDataPoint, EloHistoryDataPoint, WinRateData, ClassStats } from './analytics/types';
export type { Post } from './blog/lib/posts';
export type { SimpleMapData, SimpleTile } from './map-analyzer/types';
export type { DateRange, DateRangePreset, FilterState } from './shared/types';

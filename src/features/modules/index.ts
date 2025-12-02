/**
 * Modules Index - Feature-specific modules for ITT Web
 *
 * This file provides unified exports for all feature modules,
 * allowing clean imports without remembering individual paths.
 */

// Feature groups - organized by domain
export * as GameManagement from './game-management';
export * as Content from './content';
export * as Community from './community';
export * as Analytics from './analytics-group';
export * as Tools from './tools-group';
export * as Shared from './shared';

// Direct component exports for convenience
export { ActivityChart, EloChart, WinRateChart, ClassSelectionChart, ClassWinRateChart, GameLengthChart, PlayerActivityChart } from './analytics-group/analytics/components';
export { ArchivesToolbar } from './community/archives/shared/components';
export { ArchiveEntry } from './community/archives/display/components';
export { ArchiveForm, ArchiveEditForm, ArchiveDeleteDialog } from './community/archives/forms/components';
export { ArchivesContent } from './community/archives/timeline/components';
export { BlogPost, NewPostForm, EditPostForm, NewPostFormModal, PostDeleteDialog } from './content/blog/components';
export { ClassesPage, ClassDetailPage } from './content/classes/components';
export { EntryFormModal, EntryEditModal } from './game-management/entries/components';
export { GameList, GameCard, GameDetail } from './game-management/games/components';
export { ClassHeader, ClassIcon, ClassModel, ColoredText, GuideCard, GuideIcon, StatsCard } from './content/guides/components';
export { MapContainer, MapControls, MapFileUploader, MapInfoPanel, TerrainVisualizer, TerrainVisualizerContainer, TerrainLegendCard, TileInfoPanel, FlagVisualizer, FlagLegend, CliffLegend, ElevationLegend, WaterLegend, HeightDistributionChart } from './tools-group/map-analyzer/components';
export { MetaPage } from './analytics-group/meta/components';
export { PlayersPage, PlayerCard, PlayersActionBar, ComparisonResults } from './community/players/components';
export { ScheduledGamesList as ScheduledGamesPage, ScheduledGameCard, ScheduleGameForm as ScheduledGameForm, ScheduledGameCard as ScheduledGameDetail, ScheduledGameCard as JoinGameButton, ScheduledGamesList as ScheduledGameFilters } from './game-management/scheduled-games/components';
export { Leaderboard, CategorySelector } from './community/standings/components';
export { IconMapperMappingsList as IconMapper, StatsPanel } from './tools-group/tools/components';
export { DateRangeFilter, PlayerFilter, TeamFormatFilter } from './shared/components';
export type { GameFilters } from './game-management/games/types';

// Hook exports
export { useGames, useGame, useGameFilters } from './game-management/games/hooks';
export { usePlayerStats, usePlayerComparison } from './community/players/hooks';
export { useStandings } from './community/standings/hooks';
export { useClassesData } from './content/classes/hooks';
export { useArchivesPage, useArchiveHandlers, useArchiveBaseState, useArchiveMedia, useArchiveFormSubmit } from './community/archives/shared/hooks';
export { useNewPostForm, useEditPostForm } from './content/blog/hooks';
export { useMetaData, useMetaFilters } from './analytics-group/meta/components';
export { useIconMapperData } from './tools-group/tools/hooks';

// Service exports
export { createGame, getGames, getGameById, updateGame, deleteGame, updateEloScores } from './game-management/games/lib';
export { getPlayerStats, searchPlayers, comparePlayers } from './community/players/lib';
export { getStandings } from './community/standings/lib';
export { getActivityData, getEloHistory, getWinRateData } from './analytics-group/analytics/lib';
export { createEntry, getEntryById, updateEntry, deleteEntry } from './game-management/entries/lib';
export { loadAllPosts, loadPostBySlug } from './content/blog/lib';

// Type exports
export type { Game, GamePlayer, CreateGame, UpdateGame, GameFilters as GameFiltersType } from './game-management/games/types';
export type { PlayerStats, PlayerProfile, PlayerComparison } from './community/players/types';
export type { StandingsEntry, StandingsResponse, StandingsFilters } from './community/standings/types';
export type { ActivityDataPoint, EloHistoryDataPoint, WinRateData, ClassStats } from './analytics-group/analytics/types';
export type { LoadedPost, SerializedPost } from './content/blog/lib/posts';
export type { SimpleMapData, SimpleTile } from './tools-group/map-analyzer/types';
export type { DateRange, DateRangePreset, FilterState } from './shared/types';


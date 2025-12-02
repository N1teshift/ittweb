/**
 * Features Index - Unified API for all ITT Web features
 *
 * This file provides clean imports for infrastructure and modules,
 * allowing developers to access features without remembering full paths.
 */

// Infrastructure exports - shared across all features
export * as infrastructure from './infrastructure';

// Module exports - feature-specific functionality
export * as modules from './modules';

// Direct module access for convenience (namespaced)
export { Archives, Analytics, Blog, Classes, Entries, Games, Guides, MapAnalyzer, Meta, Players, ScheduledGames, Standings, Tools, Shared } from './modules';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import type { GameFilters } from '../types';

const STORAGE_KEY = 'gameFilters';

interface UseGameFiltersResult {
  filters: GameFilters;
  setFilters: (filters: GameFilters) => void;
  updateFilter: <K extends keyof GameFilters>(key: K, value: GameFilters[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

/**
 * Hook to manage game filters with URL sync and localStorage persistence
 */
export function useGameFilters(initialFilters: GameFilters = {}): UseGameFiltersResult {
  const router = useRouter();
  const [filters, setFiltersState] = useState<GameFilters>(initialFilters);

  // Initialize from URL query params or localStorage
  useEffect(() => {
    if (!router.isReady) return;

    // First, try to read from URL query params
    const queryFilters: GameFilters = {};
    
    if (router.query.gameState) queryFilters.gameState = router.query.gameState as 'scheduled' | 'completed';
    if (router.query.startDate) queryFilters.startDate = router.query.startDate as string;
    if (router.query.endDate) queryFilters.endDate = router.query.endDate as string;
    if (router.query.category) queryFilters.category = router.query.category as string;
    if (router.query.player) queryFilters.player = router.query.player as string;
    if (router.query.ally) queryFilters.ally = router.query.ally as string;
    if (router.query.enemy) queryFilters.enemy = router.query.enemy as string;
    if (router.query.teamFormat) queryFilters.teamFormat = router.query.teamFormat as string;
    if (router.query.gameId) queryFilters.gameId = parseInt(router.query.gameId as string, 10);
    if (router.query.page) queryFilters.page = parseInt(router.query.page as string, 10);
    if (router.query.limit) queryFilters.limit = parseInt(router.query.limit as string, 10);
    if (router.query.cursor) queryFilters.cursor = router.query.cursor as string;

    // If URL has filters, use them; otherwise try localStorage
    if (Object.keys(queryFilters).length > 0) {
      setFiltersState(queryFilters);
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queryFilters));
      } catch {
        // Ignore localStorage errors
      }
    } else {
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as GameFilters;
          setFiltersState(parsed);
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [router.isReady, router.query]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: GameFilters) => {
    if (!router.isReady) return;

    const query = { ...router.query };
    
    // Remove all filter params first
    delete query.gameState;
    delete query.startDate;
    delete query.endDate;
    delete query.category;
    delete query.player;
    delete query.ally;
    delete query.enemy;
    delete query.teamFormat;
    delete query.gameId;
    delete query.page;
    delete query.limit;
    delete query.cursor;

    // Add active filter params
    if (newFilters.gameState) query.gameState = newFilters.gameState;
    if (newFilters.startDate) query.startDate = newFilters.startDate;
    if (newFilters.endDate) query.endDate = newFilters.endDate;
    if (newFilters.category) query.category = newFilters.category;
    if (newFilters.player) query.player = newFilters.player;
    if (newFilters.ally) query.ally = newFilters.ally;
    if (newFilters.enemy) query.enemy = newFilters.enemy;
    if (newFilters.teamFormat) query.teamFormat = newFilters.teamFormat;
    if (newFilters.gameId !== undefined) query.gameId = newFilters.gameId.toString();
    if (newFilters.page !== undefined) query.page = newFilters.page.toString();
    if (newFilters.limit !== undefined) query.limit = newFilters.limit.toString();
    if (newFilters.cursor) query.cursor = newFilters.cursor;

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  }, [router]);

  // Save to localStorage
  const saveToStorage = useCallback((newFilters: GameFilters) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFilters));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setFilters = useCallback((newFilters: GameFilters) => {
    setFiltersState(newFilters);
    updateURL(newFilters);
    saveToStorage(newFilters);
  }, [updateURL, saveToStorage]);

  const updateFilter = useCallback(<K extends keyof GameFilters>(
    key: K,
    value: GameFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  }, [filters, setFilters]);

  const resetFilters = useCallback(() => {
    const emptyFilters: GameFilters = {};
    setFilters(emptyFilters);
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, [setFilters]);

  // Calculate active filter count
  const activeFilterCount = [
    filters.gameState,
    filters.startDate,
    filters.endDate,
    filters.category,
    filters.player,
    filters.ally,
    filters.enemy,
    filters.teamFormat,
    filters.gameId,
  ].filter(value => value !== undefined && value !== null && value !== '').length;

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}



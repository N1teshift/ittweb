import { useState, useEffect, useMemo } from 'react';
import { ICON_MAP } from '@/features/ittweb/guides/utils/iconMap';
import { ITTIconCategory } from '@/features/ittweb/guides/utils/iconUtils';
import type { IconFile, IconMapping, EntityStat, IconMappingEntry, MarkedForDeletion } from './icon-mapper.types';
import { ABILITIES } from '@/features/ittweb/guides/data/abilities';
import { ITEMS_DATA } from '@/features/ittweb/guides/data/items';
import { BUILDINGS } from '@/features/ittweb/guides/data/buildings';
import { BASE_TROLL_CLASSES, DERIVED_CLASSES } from '@/features/ittweb/guides/data/units';

export function useIconMapperData() {
  const [mappings, setMappings] = useState<IconMapping>({
    abilities: {},
    items: {},
    buildings: {},
    trolls: {},
  });
  const [icons, setIcons] = useState<IconFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markedForDeletion, setMarkedForDeletion] = useState<MarkedForDeletion>(new Set());

  // Initialize with existing mappings
  useEffect(() => {
    setMappings(ICON_MAP);
  }, []);

  // Load icon files from API
  useEffect(() => {
    const loadIcons = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/icons/list?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`Loaded ${data.length} icons from API`);
          setIcons(data);
        } else {
          console.error('API response not OK:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to load icons:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadIcons();
  }, []);

  const updateMapping = (category: ITTIconCategory, filename: string, gameName: string) => {
    setMappings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [gameName]: filename,
      },
    }));
  };

  const removeMapping = (category: ITTIconCategory, gameName: string) => {
    setMappings(prev => {
      const newCategory = { ...prev[category] };
      delete newCategory[gameName];
      return {
        ...prev,
        [category]: newCategory,
      };
    });
  };

  const getExistingMapping = (category: ITTIconCategory, filename: string): string | undefined => {
    const categoryMappings = mappings[category] ?? {};
    return Object.keys(categoryMappings).find(key => categoryMappings[key] === filename);
  };

  const getAllMappingsForIcon = (filename: string): IconMappingEntry[] => {
    const allMappings: IconMappingEntry[] = [];
    const categories: ITTIconCategory[] = ['abilities', 'items', 'buildings', 'trolls'];
    
    for (const category of categories) {
      const categoryMappings = mappings[category] ?? {};
      for (const [gameName, mappedFilename] of Object.entries(categoryMappings)) {
        if (mappedFilename === filename) {
          allMappings.push({ category, gameName, filename });
        }
      }
    }
    
    return allMappings;
  };

  const toggleMarkForDeletion = (iconPath: string) => {
    setMarkedForDeletion(prev => {
      const newSet = new Set(prev);
      if (newSet.has(iconPath)) {
        newSet.delete(iconPath);
      } else {
        newSet.add(iconPath);
      }
      return newSet;
    });
  };

  const isMarkedForDeletion = (iconPath: string): boolean => {
    return markedForDeletion.has(iconPath);
  };

  // Calculate entity-based stats (abilities, units, items, buildings)
  const entityStats: EntityStat[] = useMemo(() => {
    const stats: EntityStat[] = [];

    try {
      // Abilities
      const abilitiesTotal = ABILITIES?.length || 0;
      const abilitiesMapped = Object.keys(mappings.abilities || {}).length;
      stats.push({
        category: 'abilities',
        total: abilitiesTotal,
        mapped: abilitiesMapped,
        unmapped: abilitiesTotal - abilitiesMapped,
        percentage: abilitiesTotal > 0 ? Math.round((abilitiesMapped / abilitiesTotal) * 100) : 0,
      });

      // Units (base classes + derived classes)
      const unitsTotal = (BASE_TROLL_CLASSES?.length || 0) + (DERIVED_CLASSES?.length || 0);
      const unitsMapped = Object.keys(mappings.trolls || {}).length;
      stats.push({
        category: 'units',
        total: unitsTotal,
        mapped: unitsMapped,
        unmapped: unitsTotal - unitsMapped,
        percentage: unitsTotal > 0 ? Math.round((unitsMapped / unitsTotal) * 100) : 0,
      });

      // Items
      const itemsTotal = ITEMS_DATA?.length || 0;
      const itemsMapped = Object.keys(mappings.items || {}).length;
      stats.push({
        category: 'items',
        total: itemsTotal,
        mapped: itemsMapped,
        unmapped: itemsTotal - itemsMapped,
        percentage: itemsTotal > 0 ? Math.round((itemsMapped / itemsTotal) * 100) : 0,
      });

      // Buildings
      const buildingsTotal = BUILDINGS?.length || 0;
      const buildingsMapped = Object.keys(mappings.buildings || {}).length;
      stats.push({
        category: 'buildings',
        total: buildingsTotal,
        mapped: buildingsMapped,
        unmapped: buildingsTotal - buildingsMapped,
        percentage: buildingsTotal > 0 ? Math.round((buildingsMapped / buildingsTotal) * 100) : 0,
      });
    } catch (error) {
      console.warn('Error calculating entity stats:', error);
    }

    return stats;
  }, [mappings]);

  return {
    mappings,
    icons,
    isLoading,
    entityStats,
    markedForDeletion,
    updateMapping,
    removeMapping,
    getExistingMapping,
    getAllMappingsForIcon,
    toggleMarkForDeletion,
    isMarkedForDeletion,
  };
}



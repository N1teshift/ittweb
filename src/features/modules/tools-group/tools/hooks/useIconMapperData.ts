import { useState, useEffect, useMemo } from 'react';
import { ICON_MAP } from '@/features/modules/content/guides/utils/iconMap';
import { ITTIconCategory } from '@/features/modules/content/guides/utils/iconUtils';
import type { IconFile, IconMapping, EntityStat, IconMappingEntry, MarkedForDeletion } from '@/features/modules/tools-group/tools/types/icon-mapper.types';
import { ABILITIES } from '@/features/modules/content/guides/data/abilities';
import { BASE_TROLL_CLASSES, DERIVED_CLASSES } from '@/features/modules/content/guides/data/units';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { useItemsDataSWR } from '@/features/modules/content/guides/hooks/useItemsDataSWR';

const logger = createComponentLogger('useIconMapperData');

export function useIconMapperData() {
  const [mappings, setMappings] = useState<IconMapping>({
    abilities: {},
    items: {},
    buildings: {},
    trolls: {},
    units: {},
  });
  const [icons, setIcons] = useState<IconFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markedForDeletion, setMarkedForDeletion] = useState<MarkedForDeletion>(new Set());
  const { items: itemDataset, isLoading: itemsLoading } = useItemsDataSWR();

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
          const result = await response.json();
          // API returns { success: true, data: [...] }, extract the data array
          const iconsArray = result?.data || result || [];
          logger.info(`Loaded ${iconsArray.length} icons from API`);
          setIcons(Array.isArray(iconsArray) ? iconsArray : []);
        } else {
          logger.error('API response not OK', undefined, { status: response.status, statusText: response.statusText });
          setIcons([]); // Set empty array on error
        }
      } catch (error) {
        logger.error('Failed to load icons', error instanceof Error ? error : new Error(String(error)), {
          operation: 'loadIcons',
        });
        setIcons([]); // Set empty array on error
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
      const itemsTotal = itemDataset?.length || 0;
      const itemsMapped = Object.keys(mappings.items || {}).length;
      stats.push({
        category: 'items',
        total: itemsTotal,
        mapped: itemsMapped,
        unmapped: itemsTotal - itemsMapped,
        percentage: itemsTotal > 0 ? Math.round((itemsMapped / itemsTotal) * 100) : 0,
      });

      // Buildings
      const buildingsTotal = itemDataset?.filter(item => item.category === 'buildings').length || 0;
      const buildingsMapped = Object.keys(mappings.buildings || {}).length;
      stats.push({
        category: 'buildings',
        total: buildingsTotal,
        mapped: buildingsMapped,
        unmapped: buildingsTotal - buildingsMapped,
        percentage: buildingsTotal > 0 ? Math.round((buildingsMapped / buildingsTotal) * 100) : 0,
      });
    } catch (error) {
      logger.warn('Error calculating entity stats', { error: error instanceof Error ? error.message : String(error) });
    }

    return stats;
  }, [mappings, itemDataset]);

  const gameNameOptions = useMemo(() => {
    const abilityNames = ABILITIES?.map((ability) => ability.name) || [];
    const trollNames = [
      ...(BASE_TROLL_CLASSES?.map((cls) => cls.name) || []),
      ...(DERIVED_CLASSES?.map((cls) => cls.name) || []),
    ];
    const itemNames = itemDataset?.map((item) => item.name) || [];
    const buildingNames = itemDataset
      ?.filter((item) => item.category === 'buildings')
      .map((item) => item.name) || [];

    return {
      abilities: abilityNames,
      trolls: trollNames,
      items: itemNames,
      buildings: buildingNames,
      units: trollNames,
    };
  }, [itemDataset]);

  return {
    mappings,
    icons,
    isLoading,
    itemsLoading,
    entityStats,
    markedForDeletion,
    gameNameOptions,
    updateMapping,
    removeMapping,
    getExistingMapping,
    getAllMappingsForIcon,
    toggleMarkForDeletion,
    isMarkedForDeletion,
  };
}



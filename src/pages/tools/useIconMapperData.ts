import { useState, useEffect, useMemo } from 'react';
import { ICON_MAP } from '@/features/ittweb/guides/utils/iconMap';
import { ITTIconCategory } from '@/features/ittweb/guides/utils/iconUtils';
import type { IconFile, IconMapping, CategoryStat } from './icon-mapper.types';
import { getTotalCountForCategory } from './icon-mapper.utils';

const allCategories = ['abilities', 'items', 'buildings', 'trolls', 'unclassified', 'base'] as const;

export function useIconMapperData() {
  const [mappings, setMappings] = useState<IconMapping>({
    abilities: {},
    items: {},
    buildings: {},
    trolls: {},
  });
  const [icons, setIcons] = useState<IconFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const categoryMappings = mappings[category];
    return Object.keys(categoryMappings).find(key => categoryMappings[key] === filename);
  };

  const stats: CategoryStat[] = useMemo(() => {
    return allCategories.map(category => {
      const total = getTotalCountForCategory(category, icons);
      const mapped = category in mappings ? Object.keys(mappings[category as ITTIconCategory]).length : 0;
      const unmapped = total - mapped;
      const percentage = total > 0 ? Math.round((mapped / total) * 100) : 0;

      return {
        category,
        total,
        mapped,
        unmapped,
        percentage,
      };
    });
  }, [mappings, icons]);

  return {
    mappings,
    icons,
    isLoading,
    stats,
    updateMapping,
    removeMapping,
    getExistingMapping,
  };
}


import { ITTIconCategory } from '@/features/modules/guides/utils/iconUtils';
import { ITEMS_DATA } from '@/features/modules/guides/data/items';
import { ABILITIES } from '@/features/modules/guides/data/abilities';
import { BASE_TROLL_CLASSES } from '@/features/modules/guides/data/units/classes';
import { DERIVED_CLASSES } from '@/features/modules/guides/data/units/derivedClasses';
import type { IconMapping } from './icon-mapper.types';
import { createComponentLogger } from '@/features/shared/utils/loggerUtils';

const logger = createComponentLogger('icon-mapper.utils');

/**
 * Get all game names for a given category
 */
export function getGameNamesForCategory(category: ITTIconCategory): string[] {
  try {
    if (category === 'items') {
      return ITEMS_DATA?.map(item => item.name) || [];
    } else if (category === 'abilities') {
      return ABILITIES?.map(ability => ability.name) || [];
    } else if (category === 'buildings') {
      // Get buildings from ITEMS_DATA
      return ITEMS_DATA?.filter(item => item.category === 'buildings').map(item => item.name) || [];
    } else if (category === 'trolls') {
      // Include both base classes and derived classes (subclasses/superclasses)
      const baseNames = BASE_TROLL_CLASSES?.map(cls => cls.name) || [];
      const derivedNames = DERIVED_CLASSES?.map(cls => cls.name) || [];
      return [...baseNames, ...derivedNames];
    }
  } catch (error) {
    logger.warn(`Error getting game names for category ${category}`, {
      error: error instanceof Error ? error.message : String(error),
      category,
    });
  }
  return [];
}

/**
 * Get total count of items for a category
 */
export function getTotalCountForCategory(category: string, icons: Array<{ category: string }>): number {
  try {
    if (category === 'items') {
      return ITEMS_DATA?.length || 0;
    } else if (category === 'abilities') {
      return ABILITIES?.length || 0;
    } else if (category === 'buildings') {
      // Count buildings from ITEMS_DATA
      return ITEMS_DATA?.filter(item => item.category === 'buildings').length || 0;
    } else if (category === 'trolls') {
      return (BASE_TROLL_CLASSES?.length || 0) + (DERIVED_CLASSES?.length || 0);
    }
  } catch (error) {
    logger.warn(`Error getting total count for category ${category}`, {
      error: error instanceof Error ? error.message : String(error),
      category,
    });
  }
  // For unclassified and base, count icons in those directories
  return icons?.filter(icon => icon.category === category).length || 0;
}

/**
 * Get suggestions based on category and input
 */
export function getSuggestions(category: ITTIconCategory, input: string, allMappings: IconMapping): string[] {
  if (!input || input.length < 1) return [];

  const inputLower = input.toLowerCase();
  const suggestions: string[] = [];

  // Get existing mapped names for this category
  const existingNames = Object.keys(allMappings[category]);

  // Get game data names based on category
  const gameNames = getGameNamesForCategory(category);

  // Combine and deduplicate
  const allNames = Array.from(new Set([...existingNames, ...gameNames]));

  // Find matches
  for (const name of allNames) {
    if (name.toLowerCase().startsWith(inputLower) && name.toLowerCase() !== inputLower) {
      suggestions.push(name);
      if (suggestions.length >= 5) break; // Limit to 5 suggestions
    }
  }

  return suggestions.sort();
}

/**
 * Format category mappings for export
 */
export function formatCategoryForExport(category: Record<string, string>): string {
  const entries = Object.entries(category)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `    '${key}': '${value}'`)
    .join(',\n');
  return entries ? `{\n${entries}\n  }` : '{}';
}

/**
 * Export mappings as code string
 */
export function exportMappingsAsCode(mappings: IconMapping): string {
  return `export const ICON_MAP: IconMap = {
  abilities: ${formatCategoryForExport(mappings.abilities)},
  items: ${formatCategoryForExport(mappings.items)},
  buildings: ${formatCategoryForExport(mappings.buildings)},
  trolls: ${formatCategoryForExport(mappings.trolls)},
};`;
}

/**
 * Export marked for deletion icons as JSON
 */
export function exportMarkedForDeletion(markedForDeletion: Set<string>): string {
  const paths = Array.from(markedForDeletion).sort();
  return JSON.stringify(paths, null, 2);
}

/**
 * Export both mappings and marked for deletion as a combined JSON
 */
export function exportMappingsAndDeletions(mappings: IconMapping, markedForDeletion: Set<string>): string {
  const paths = Array.from(markedForDeletion).sort();
  return JSON.stringify({
    mappings: {
      abilities: mappings.abilities,
      items: mappings.items,
      buildings: mappings.buildings,
      trolls: mappings.trolls,
    },
    markedForDeletion: paths,
  }, null, 2);
}

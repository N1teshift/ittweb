import type { IconMapping } from '@/features/modules/tools-group/tools/types/icon-mapper.types';

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


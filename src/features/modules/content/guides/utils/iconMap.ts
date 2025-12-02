import { ITTIconCategory } from './iconUtils';
import { ICON_MAP, type IconMap } from '../data/iconMap';

// Re-export the type and data for convenience
export type { IconMap };
export { ICON_MAP };

/**
 * Resolves an explicit icon path for a given category and key.
 * First checks the requested category, then searches all categories.
 */
export function resolveExplicitIcon(category: ITTIconCategory, key: string): string | undefined {
  // First, check the requested category
  const table = ICON_MAP[category];
  const filename = table?.[key];

  if (!filename) {
    // If not found in requested category, search all categories
    const allCategories: ITTIconCategory[] = ['abilities', 'items', 'buildings', 'trolls', 'units'];
    for (const cat of allCategories) {
      const catTable = ICON_MAP[cat];
      const foundFilename = catTable?.[key];
      if (foundFilename) {
        // Found the mapping, now determine which directory the file is in
        return findIconPath(foundFilename);
      }
    }
    return undefined;
  }

  // Found in requested category, determine which directory the file is actually in
  return findIconPath(filename);
}

/**
 * Finds the actual directory path for an icon filename.
 * All icons are stored in a single flat directory: /icons/itt/
 */
function findIconPath(filename: string): string {
  return `/icons/itt/${filename}`;
}


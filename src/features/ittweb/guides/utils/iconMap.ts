import { ITTIconCategory } from './iconUtils';

export type IconMap = {
  abilities: Record<string, string>;
  items: Record<string, string>;
  buildings: Record<string, string>;
  trolls: Record<string, string>;
};

// Central, explicit mapping (display name/id -> icon filename without path, with extension)
// Start empty; we will fill incrementally as you provide associations.
export const ICON_MAP: IconMap = {
  abilities: {},
  items: {},
  buildings: {},
  trolls: {},
};

export function resolveExplicitIcon(category: ITTIconCategory, key: string): string | undefined {
  // First, check the requested category
  const table = ICON_MAP[category];
  const filename = table[key];
  
  if (!filename) {
    // If not found in requested category, search all categories
    const allCategories: ITTIconCategory[] = ['abilities', 'items', 'buildings', 'trolls'];
    for (const cat of allCategories) {
      const catTable = ICON_MAP[cat];
      const foundFilename = catTable[key];
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
 * Since icons can be shared across categories, we check which category
 * has this filename mapped and prefer items directory for shared icons.
 */
function findIconPath(filename: string): string {
  const allCategories: ITTIconCategory[] = ['items', 'abilities', 'buildings', 'trolls'];
  
  // Check each category to see if this filename is mapped there
  // Priority: items first (most shared icons are there), then others
  for (const cat of allCategories) {
    const catTable = ICON_MAP[cat];
    if (Object.values(catTable).includes(filename)) {
      return `/icons/itt/${cat}/${filename}`;
    }
  }
  
  // Fallback: if somehow not found, try items directory (most common)
  return `/icons/itt/items/${filename}`;
}



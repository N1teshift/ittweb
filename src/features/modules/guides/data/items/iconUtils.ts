import { ItemData } from '@/types/items';
import { resolveExplicitIcon } from '@/features/modules/guides/utils/iconMap';
import { getDefaultIconPath, ITTIconCategory } from '@/features/modules/guides/utils/iconUtils';

/**
 * Base path for all ITT icons.
 * All icon files are stored in /public/icons/itt/ and accessed via /icons/itt/ in the app.
 */
const ICON_BASE_PATH = '/icons/itt/';

function toIconCategory(item: ItemData): ITTIconCategory {
  return item.category === 'buildings' ? 'buildings' : 'items';
}

/**
 * Resolves the full icon path for an item.
 * 
 * This function always returns an absolute path starting with `/icons/itt/`.
 * 
 * Priority order:
 * 1. If item has `iconPath` property, use it (prepending `/icons/itt/` if needed)
 * 2. If item name exists in ICON_MAP, use the mapped icon
 * 3. Fall back to default icon (`/icons/itt/btncancel.png`)
 * 
 * @param item - The item data object
 * @returns Full absolute path to the icon (e.g., `/icons/itt/BTNUltraPoisonSpear.png`)
 * 
 * @example
 * // Item with iconPath (just filename)
 * getItemIconPathFromRecord({ iconPath: 'BTNUltraPoisonSpear.png', ... })
 * // Returns: '/icons/itt/BTNUltraPoisonSpear.png'
 * 
 * @example
 * // Item without iconPath but with name in ICON_MAP
 * getItemIconPathFromRecord({ name: 'Battle Staff', ... })
 * // Returns: '/icons/itt/BTNBattleStaff.png'
 */
export function getItemIconPathFromRecord(item: ItemData): string {
  // Priority 1: Use item.iconPath if it exists
  if (item.iconPath) {
    // Ensure it's a full path - item.iconPath is typically just a filename
    // If it already starts with /icons/itt/, use it as-is (defensive check)
    if (item.iconPath.startsWith(ICON_BASE_PATH)) {
      return item.iconPath;
    }
    // Otherwise, prepend the base path
    // Note: item.iconPath in data files is stored as just the filename (e.g., 'BTNUltraPoisonSpear.png')
    // This function ensures it's always converted to a full path for use in Next.js Image components
    return `${ICON_BASE_PATH}${item.iconPath}`;
  }
  
  // Priority 2: Try to resolve from ICON_MAP by item name
  const category = toIconCategory(item);
  const explicit = resolveExplicitIcon(category, item.name);
  if (explicit) {
    return explicit; // resolveExplicitIcon already returns full path
  }
  
  // Priority 3: Fall back to default icon
  return getDefaultIconPath(); // Already returns full path
}

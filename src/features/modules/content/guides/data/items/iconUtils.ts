import { ItemData } from '@/types/items';
import { resolveExplicitIcon } from '../../utils/iconMap';
import { getDefaultIconPath, ITTIconCategory } from '../../utils/iconUtils';

function toIconCategory(item: ItemData): ITTIconCategory {
  return item.category === 'buildings' ? 'buildings' : 'items';
}

export function getItemIconPathFromRecord(item: ItemData): string {
  if (item.iconPath) {
    // If iconPath is already a full path (starts with /), return it as-is
    // Otherwise, it's just a filename and we need to construct the full path
    if (item.iconPath.startsWith('/')) {
      return item.iconPath;
    }
    return `/icons/itt/${item.iconPath}`;
  }
  const category = toIconCategory(item);
  const explicit = resolveExplicitIcon(category, item.name);
  if (explicit) return explicit;
  return getDefaultIconPath();
}


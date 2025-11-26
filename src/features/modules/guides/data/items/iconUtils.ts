import { ItemData } from '@/types/items';
import { resolveExplicitIcon } from '@/features/modules/guides/utils/iconMap';
import { getDefaultIconPath, ITTIconCategory } from '@/features/modules/guides/utils/iconUtils';

function toIconCategory(item: ItemData): ITTIconCategory {
  return item.category === 'buildings' ? 'buildings' : 'items';
}

export function getItemIconPathFromRecord(item: ItemData): string {
  if (item.iconPath) return `/icons/itt/${item.iconPath}`;
  const category = toIconCategory(item);
  const explicit = resolveExplicitIcon(category, item.name);
  if (explicit) return explicit;
  return getDefaultIconPath();
}

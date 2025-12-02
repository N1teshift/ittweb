export type ITTIconCategory = 'abilities' | 'items' | 'buildings' | 'trolls' | 'units';

export type ITTIconState = 'enabled' | 'disabled';

// Default fallback icon path - used when no explicit mapping exists
const DEFAULT_FALLBACK_ICON = '/icons/itt/btncancel.png';

/**
 * Returns the default fallback icon path.
 * This is used when an icon is not explicitly mapped in ICON_MAP.
 */
export function getDefaultIconPath(): string {
  return DEFAULT_FALLBACK_ICON;
}




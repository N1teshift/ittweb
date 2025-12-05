import { ItemData } from '@/types/items';
import { ITEMS_DATA } from './index';

/**
 * Raw item data mapping from tmp/work-data/raw/items.json
 * This maps 4-character Warcraft 3 rawcodes to item slugs
 * Generated from the game's object data
 */
const RAW_ITEM_CODE_TO_SLUG: Record<string, string> = {
    'IM2o': 'mana-crystal',
    'IM1y': 'flint',
    'IM4!': 'tinder',
    'IM1x': 'stick',
    'IM1z': 'clay-ball',
    'IM20': 'mushroom',
    'IM1{': 'elk-hide',
    'IM1|': 'wolf-hide',
    'IM1}': 'bear-hide',
    'IM1~': 'bone',
    'IM2p': 'magic',
    'IM2q': 'hawk-egg',
    'IM2r': 'scale',
    'IM2s': 'iron-ingot',
    'IM2t': 'steel-ingot',
    // Add more mappings as needed from tmp/work-data/raw/items.json
};

/**
 * Converts a 4-byte integer item ID from replay metadata to a 4-character Warcraft 3 rawcode
 * 
 * @param itemId - The integer item ID from replay metadata (e.g., 1229795951)
 * @returns The 4-character rawcode (e.g., "IM2o")
 * 
 * @example
 * ```ts
 * const code = itemIdToRawCode(1229795951);
 * console.log(code); // "IM2o"
 * ```
 */
export function itemIdToRawCode(itemId: number): string {
    // Convert integer to 4-character code (big-endian)
    return String.fromCharCode(
        (itemId >> 24) & 0xFF,
        (itemId >> 16) & 0xFF,
        (itemId >> 8) & 0xFF,
        itemId & 0xFF
    );
}

/**
 * Converts a 4-character Warcraft 3 rawcode to an item slug
 * 
 * @param rawCode - The 4-character rawcode (e.g., "IM2o")
 * @returns The item slug or undefined if not found
 * 
 * @example
 * ```ts
 * const slug = rawCodeToItemSlug("IM2o");
 * console.log(slug); // "mana-crystal"
 * ```
 */
export function rawCodeToItemSlug(rawCode: string): string | undefined {
    return RAW_ITEM_CODE_TO_SLUG[rawCode];
}

/**
 * Converts an integer item ID from replay metadata to an item slug
 * 
 * @param itemId - The integer item ID from replay metadata
 * @returns The item slug or undefined if not found
 * 
 * @example
 * ```ts
 * const slug = itemIdToSlug(1229795951);
 * console.log(slug); // "mana-crystal"
 * ```
 */
export function itemIdToSlug(itemId: number): string | undefined {
    const rawCode = itemIdToRawCode(itemId);
    return rawCodeToItemSlug(rawCode);
}

/**
 * Converts an integer item ID from replay metadata to full item data
 * 
 * @param itemId - The integer item ID from replay metadata
 * @returns The ItemData object or undefined if not found
 * 
 * @example
 * ```ts
 * const item = getItemByReplayId(1229795951);
 * console.log(item?.name); // "Mana Crystal"
 * ```
 */
export function getItemByReplayId(itemId: number): ItemData | undefined {
    const slug = itemIdToSlug(itemId);
    if (!slug) return undefined;

    return ITEMS_DATA.find(item => item.id === slug);
}

/**
 * Converts an array of integer item IDs from replay metadata to item data
 * Filters out items with ID 0 (empty slots) and unknown items
 * 
 * @param itemIds - Array of integer item IDs from replay metadata
 * @returns Array of ItemData objects
 * 
 * @example
 * ```ts
 * const items = getItemsByReplayIds([1229795951, 1229795705, 0]);
 * console.log(items.map(i => i.name)); // ["Mana Crystal", "Flint"]
 * ```
 */
export function getItemsByReplayIds(itemIds: number[]): ItemData[] {
    return itemIds
        .filter(id => id !== 0) // Filter out empty slots
        .map(id => getItemByReplayId(id))
        .filter((item): item is ItemData => item !== undefined);
}

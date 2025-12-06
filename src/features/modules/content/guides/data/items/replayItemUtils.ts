import { ItemData } from '@/types/items';
import { ITEMS_DATA } from './index';

/**
 * Raw item data mapping from tmp/work-data/raw/items.json
 * This maps 4-character Warcraft 3 rawcodes to item slugs
 * Generated from the game's object data
 */
const RAW_ITEM_CODE_TO_SLUG: Record<string, string> = {
    'I052': 'armor-salve',
    'I054': 'hypnosis-salve',
    'I055': 'poison-salve',
    'I056': 'speed-salve',
    'I057': 'alligator-gold',
    'I058': 'blink',
    'IM0{': 'panther-fang',
    'IM0~': 'blow-gun',
    'IM02': 'food-slot',
    'IM03': 'scavenged-mushroom',
    'IM04': 'happy-food-supplies',
    'IM05': 'materials-slot',
    'IM07': 'stashed-raw-meat',
    'IM08': 'eat-raw-meat',
    'IM09': 'robe-of-the-magi',
    'IM0a': 'venom-fang',
    'IM0b': 'troll-protector',
    'IM0e': 'acid-bomb',
    'IM0f': 'makruru-cuirass',
    'IM0g': 'makrura-carapace',
    'IM0h': 'makrura-claw',
    'IM0i': 'anabolic-boots',
    'IM0j': 'anabolic-potion',
    'IM0k': 'anti-magic-potion',
    'IM0l': 'armory-kit',
    'IM0m': 'athelas-seed',
    'IM0n': 'coconut',
    'IM0o': 'banana',
    'IM0p': 'battle-armor',
    'IM0q': 'battle-axe',
    'IM0r': 'battle-gloves',
    'IM0s': 'battle-shield',
    'IM0t': 'bear-skin-boots',
    'IM0v': 'bear-skin-coat',
    'IM0x': 'bear-skin-gloves',
    'IM0z': 'bee-hive',
    'IM1!': 'leaf-of-blue-herb',
    'IM1{': 'gem-of-knowledge',
    'IM1}': 'hatchery-kit',
    'IM1|': 'hydra-scale-coat',
    'IM1~': 'hawk-egg',
    'IM10': 'bone',
    'IM11': 'bone-boots',
    'IM12': 'bone-coat',
    'IM13': 'bone-gloves',
    'IM14': 'bone-shield',
    'IM15': 'clay-ball',
    'IM16': 'clay-explosion',
    'IM17': 'cloak-of-flames',
    'IM19': 'cloak-of-frost',
    'IM1a': 'cloak-of-healing',
    'IM1b': 'cloak-of-mana',
    'IM1c': 'cooked-meat',
    'IM1d': 'cure-potion',
    'IM1e': 'dark-spear',
    'IM1f': 'chameleon-hatchet',
    'IM1g': 'chameleon-hatchet',
    'IM1h': 'chameleon-hatchet',
    'IM1i': 'dark-thistles',
    'IM1y': 'flint',
    'IM1m': 'disease-potion',
    'IM1o': 'elk-hide',
    'IM1p': 'elk-skin-boots',
    'IM1q': 'elk-skin-coat',
    'IM1r': 'elk-skin-gloves',
    'IM1s': 'emp',
    'IM1t': 'ensnare-trap-kit',
    'IM1u': 'essence-of-bees',
    'IM1v': 'fervor-potion',
    'IM1w': 'fire-bomb',
    'IM1x': 'camp-fire-kit',
    'IM1z': 'forge-kit',
    'IM2!': 'healing-potion',
    'IM2{': 'poison',
    'IM2}': 'twin-island-potion',
    'IM2|': 'poison-spear',
    'IM2~': 'mixing-pot-kit',
    'IM20': 'horn-of-the-mammoth',
    'IM22': 'hunting-net',
    'IM23': 'hydra-claws',
    'IM24': 'magefist',
    'IM25': 'hydra-fins',
    'IM26': 'hydra-hint',
    'IM27': 'scale',
    'IM28': 'iron-axe',
    'IM29': 'iron-boots',
    'IM2a': 'iron-coat',
    'IM2b': 'iron-gloves',
    'IM2c': 'iron-ingot',
    'IM2d': 'iron-shield',
    'IM2e': 'iron-spear',
    'IM2f': 'bear-hide',
    'IM2g': 'wolf-hide',
    'IM2h': 'living-clay',
    'IM2i': 'mage-fire-kit',
    'IM2y': 'oracle-potion',
    'IM2j': 'mage-masher',
    'IM2k': 'magic',
    'IM2l': 'honeycomb',
    'IM2m': 'magic-seed',
    'IM2n': 'magic-palm-tree-seed',
    'IM2o': 'mana-crystal',
    'IM2p': 'mana-potion',
    'IM2q': 'medallion-of-courage',
    'IM2r': 'medallion-of-courage',
    'IM2s': 'mud-hut-kit',
    'IM2t': 'mushroom',
    'IM2u': 'nether-potion',
    'IM2v': 'net',
    'IM2w': 'omnicure-potion',
    'IM2x': 'omnitower-kit',
    'IM2z': 'leaf-of-orange-herb',
    'IM3{': 'teleport-beacon-kit',
    'IM3}': 'medalion-of-the-thief',
    'IM3|': 'tent-kit',
    'IM3~': 'thistles',
    'IM31': 'river-root',
    'IM32': 'river-stem',
    'IM33': 'healing-salve',
    'IM34': 'scroll-of-cyclone',
    'IM35': 'scroll-of-entangling-roots',
    'IM36': 'scroll-of-fire-ball',
    'IM37': 'scroll-of-living-dead',
    'IM38': 'scroll-of-stone-shield',
    'IM39': 'scroll-of-haste',
    'IM3a': 'scroll-of-tsunami',
    'IM3b': 'basic-shield',
    'IM3c': 'smoke-bomb',
    'IM3d': 'smoke-house-kit',
    'IM3e': 'stone-spear',
    'IM3f': 'spirit-of-darkness',
    'IM3g': 'spirit-ward-kit',
    'IM3h': 'leaf-of-native-herb',
    'IM3i': 'leaf-of-exotic-herb',
    'IM3y': 'storage-hut-kit',
    'IM3j': 'lesser-essence',
    'IM3k': 'greater-essence',
    'IM3l': 'spirit-of-water',
    'IM3m': 'spirit-of-wind',
    'IM3n': 'steel-axe',
    'IM3o': 'steel-boots',
    'IM3p': 'steel-coat',
    'IM3q': 'steel-gloves',
    'IM3r': 'steel-ingot',
    'IM3s': 'steel-shield',
    'IM3t': 'steel-spear',
    'IM3u': 'stick',
    'IM3w': 'stone',
    'IM3x': 'stone-axe',
    'IM3z': 'tannery-kit',
    'IM4!': 'tinder',
    'IM40': 'transport-ship-kit',
    'IM41': 'troll-hut-kit',
    'IM42': 'ultra-poison',
    'IM43': 'ultra-poison-spear',
    'IM44': 'witch-doctors-hut-kit',
    'IM45': 'wolf-skin-boots',
    'IM46': 'boots-of-wolfs-stamina',
    'IM47': 'wolf-skin-coat',
    'IM48': 'wolf-skin-gloves',
    'IM4b': 'workshop-kit',
    'IM4g': 'iron-staff',
    'IM4h': 'battle-staff',
    'IM4i': 'conducting-rod',
    'IM4j': 'staff-of-wisdom',
    'IM4k': 'staff-of-wisdom',
    'IM4l': 'poison-thistles',
    'IM4n': 'tidebringer',
    'IM4o': 'right-mammoth-horn',
    'IM4p': 'mammoth-boots',
    'IM4s': 'arms-slot',
    'IM4t': 'scroll-slot',
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

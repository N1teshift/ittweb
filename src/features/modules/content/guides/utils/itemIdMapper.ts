/**
 * Maps between game source ITEM_XXX constants and website kebab-case IDs
 */

/**
 * Convert ITEM_XXX constant to kebab-case ID
 */
export function itemConstantToId(constant: string): string {
  if (!constant.startsWith('ITEM_')) {
    return constant.toLowerCase().replace(/_/g, '-');
  }
  // Remove ITEM_ prefix and convert to kebab-case
  const withoutPrefix = constant.slice(5); // Remove "ITEM_"
  return withoutPrefix.toLowerCase().replace(/_/g, '-');
}

/**
 * Convert kebab-case ID to ITEM_XXX constant
 */
export function itemIdToConstant(id: string): string {
  const constant = id.toUpperCase().replace(/-/g, '_');
  return `ITEM_${constant}`;
}

/**
 * Map crafting station from game format to website format
 */
export function mapCraftingStation(station: string | null | undefined): string | undefined {
  if (!station) return undefined;
  
  const stationMap: Record<string, string> = {
    'armory': 'Armory',
    'forge': 'Forge',
    'workshop': 'Workshop',
    'tannery': 'Tannery',
    'witch_doctors_hut': "Witch Doctor's Hut",
    'mixing_pot': 'Mixing Pot',
  };
  
  return stationMap[station] || station.charAt(0).toUpperCase() + station.slice(1);
}

/**
 * Common ingredient name mappings
 * Some ingredients have simplified names in the website
 */
export const INGREDIENT_NAME_MAP: Record<string, string> = {
  'item-elk-hide': 'hide',
  'item-jungle-wolf-hide': 'wolf-hide',
  'item-jungle-bear-hide': 'bear-hide',
  'item-river-root': 'river-root',
  'item-river-stem': 'river-stem',
  'item-athelas-seed': 'athelas-seed',
  'item-native-herb': 'native-herb',
  'item-exotic-herb': 'exotic-herb',
  'item-mana-crystal': 'mana-crystal',
  'item-spirit-wind': 'spirit-wind',
  'item-spirit-water': 'spirit-water',
  'item-spirit-darkness': 'spirit-darkness',
  'item-lesser-essence': 'lesser-essence',
  'item-greater-essence': 'greater-essence',
  'item-iron-ingot': 'iron-ingot',
  'item-steel-ingot': 'steel-ingot',
  'item-clay-ball': 'clay-ball',
  'item-stick': 'stick',
  'item-stone': 'stone',
  'item-flint': 'flint',
  'item-bone': 'bone',
  'item-tinder': 'tinder',
  'item-mushroom': 'mushroom',
  'item-banana': 'banana',
  'item-thistles': 'thistles',
  'item-poison': 'poison',
  'item-magic': 'magic',
};

/**
 * Normalize ingredient name for website display
 */
export function normalizeIngredientName(ingredientConstant: string): string {
  const kebabId = itemConstantToId(ingredientConstant);
  return INGREDIENT_NAME_MAP[kebabId] || kebabId;
}





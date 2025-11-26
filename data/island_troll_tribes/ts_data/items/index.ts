import { ItemData, ItemsByCategory, ItemCategory, ItemSubcategory } from '@/types/items';
import { RAW_MATERIALS_ITEMS } from './raw-materials';
import { WEAPONS_ITEMS } from './weapons';
import { ARMOR_ITEMS } from './armor';
import { POTIONS_ITEMS } from './potions';
import { SCROLLS_ITEMS } from './scrolls';
import { BUILDINGS_ITEMS } from './buildings';
import { UNKNOWN_ITEMS } from './unknown';

export { getItemIconPathFromRecord } from './iconUtils';

export const ITEMS_DATA: ItemData[] = [
  ...(RAW_MATERIALS_ITEMS || []),
  ...(WEAPONS_ITEMS || []),
  ...(ARMOR_ITEMS || []),
  ...(POTIONS_ITEMS || []),
  ...(SCROLLS_ITEMS || []),
  ...(BUILDINGS_ITEMS || []),
  ...(UNKNOWN_ITEMS || []),
];

export const ITEMS_BY_CATEGORY: ItemsByCategory = ITEMS_DATA.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = [];
  }
  acc[item.category].push(item);
  return acc;
}, {} as ItemsByCategory);

export function getItemById(id: string): ItemData | undefined {
  return ITEMS_DATA.find(item => item.id === id);
}

export function getItemsByCategory(category: ItemCategory): ItemData[] {
  return ITEMS_BY_CATEGORY[category] || [];
}

export function getItemsBySubcategory(subcategory: ItemSubcategory): ItemData[] {
  return ITEMS_DATA.filter(item => item.subcategory === subcategory);
}

export function searchItems(query: string): ItemData[] {
  const lowercaseQuery = query.toLowerCase();
  return ITEMS_DATA.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery) ||
    item.recipe?.some(ingredient => ingredient.toLowerCase().includes(lowercaseQuery))
  );
}


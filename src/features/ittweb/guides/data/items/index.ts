import { ItemData, ItemsByCategory, ItemCategory, ItemSubcategory } from '@/types/items';
import { RAW_MATERIAL_ITEMS } from './raw-materials';
import { WEAPON_ITEMS } from './weapons';
import { ARMOR_ITEMS } from './armor';
import { TOOL_ITEMS } from './tools';
import { POTION_ITEMS } from './potions';
import { SCROLL_ITEMS } from './scrolls';

export { getItemIconPathFromRecord } from './iconUtils';

export const ITEMS_DATA: ItemData[] = [
  ...RAW_MATERIAL_ITEMS,
  ...WEAPON_ITEMS,
  ...ARMOR_ITEMS,
  ...TOOL_ITEMS,
  ...POTION_ITEMS,
  ...SCROLL_ITEMS,
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


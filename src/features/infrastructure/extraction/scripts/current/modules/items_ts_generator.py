"""Generate items.ts file that combines all base items and external items."""

from __future__ import annotations

from pathlib import Path

from common_paths import GUIDES_DATA_DIR

ITEMS_TS_CONTENT = """import { ItemData, ItemsByCategory, ItemCategory, ItemSubcategory } from '@/types/items';
import { EXTERNAL_ITEMS } from './items.external';
import { RAW_MATERIAL_ITEMS } from './items.raw-materials';
import { WEAPON_ITEMS } from './items.weapons';
import { ARMOR_ITEMS } from './items.armor';
import { TOOL_ITEMS } from './items.tools';
import { POTION_ITEMS } from './items.potions';
import { SCROLL_ITEMS } from './items.scrolls';
import { BUILDING_ITEMS } from './items.buildings';

const BASE_ITEMS: ItemData[] = [
  ...RAW_MATERIAL_ITEMS,
  ...WEAPON_ITEMS,
  ...ARMOR_ITEMS,
  ...TOOL_ITEMS,
  ...POTION_ITEMS,
  ...SCROLL_ITEMS,
  ...BUILDING_ITEMS,
];

// Filter out duplicates from EXTERNAL_ITEMS that already exist in BASE_ITEMS
const baseItemIds = new Set(BASE_ITEMS.map(item => item.id));
const uniqueExternalItems = EXTERNAL_ITEMS.filter(item => !baseItemIds.has(item.id));

export const ITEMS_DATA: ItemData[] = [...BASE_ITEMS, ...uniqueExternalItems];

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
"""


def write_items_ts(content: str, items_ts: Path) -> None:
    """Write items.ts file."""
    items_ts.parent.mkdir(parents=True, exist_ok=True)
    with open(items_ts, "w", encoding="utf-8") as f:
        f.write(content)


def generate_items_ts(items_ts: Path | None = None, content: str | None = None) -> None:
    """Generate items.ts file."""
    if items_ts is None:
        items_ts = GUIDES_DATA_DIR / "items.ts"
    if content is None:
        content = ITEMS_TS_CONTENT

    write_items_ts(content, items_ts)


def generate_and_write(items_ts: Path | None = None) -> None:
    """Generate items.ts file."""
    print("=" * 60)
    print("Generate items.ts")
    print("=" * 60)

    generate_items_ts(items_ts)
    print(f"\nCreated {items_ts or GUIDES_DATA_DIR / 'items.ts'}")
    print("=" * 60)
    print("Complete!")
    print("=" * 60)


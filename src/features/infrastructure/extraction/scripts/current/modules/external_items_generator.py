"""Generate items.external.ts from recipes.json."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple

from common_paths import DATA_DIR, GUIDES_DATA_DIR

# Base item files to check
BASE_ITEM_FILES = [
    GUIDES_DATA_DIR / "items.raw-materials.ts",
    GUIDES_DATA_DIR / "items.weapons.ts",
    GUIDES_DATA_DIR / "items.armor.ts",
    GUIDES_DATA_DIR / "items.tools.ts",
    GUIDES_DATA_DIR / "items.potions.ts",
    GUIDES_DATA_DIR / "items.scrolls.ts",
    GUIDES_DATA_DIR / "items.buildings.ts",
]


def get_existing_item_ids(base_item_files: List[Path] | None = None) -> Set[str]:
    """Extract all item IDs from base item files."""
    if base_item_files is None:
        base_item_files = BASE_ITEM_FILES

    existing_ids = set()

    for file_path in base_item_files:
        if not file_path.exists():
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Find all id: '...' patterns
        pattern = r"id:\s*['\"]([^'\"]+)['\"]"
        matches = re.findall(pattern, content)
        existing_ids.update(matches)

    return existing_ids


def normalize_item_id(item_id: str) -> str:
    """Convert ITEM_XXX to kebab-case ID."""
    if item_id.startswith("ITEM_"):
        item_id = item_id[5:]
    return item_id.lower().replace("_", "-")


def determine_category(item_id: str, item_name: str) -> Tuple[str, str | None]:
    """Determine item category and subcategory from ID and name."""
    item_lower = item_id.lower()
    name_lower = item_name.lower()

    # Weapons
    if any(x in item_lower for x in ["axe", "spear", "staff", "sword", "bow", "blowgun", "dagger"]):
        return "weapons", None

    # Armor
    if any(x in item_lower for x in ["armor", "gloves", "boots", "coat", "shield", "helmet"]):
        return "armor", None

    # Potions
    if any(x in item_lower for x in ["potion", "elixir", "brew"]):
        return "potions", None

    # Scrolls
    if "scroll" in item_lower:
        return "scrolls", None

    # Raw materials
    if any(x in item_lower for x in ["hide", "meat", "herb", "seed", "crystal", "essence", "ingot", "ore"]):
        subcategory = None
        if "herb" in item_lower or "seed" in item_lower:
            subcategory = "herbs"
        elif "hide" in item_lower or "meat" in item_lower:
            subcategory = "animal-parts"
        return "raw-materials", subcategory

    # Tools
    if any(x in item_lower for x in ["net", "bomb", "trap", "kit", "lure"]):
        return "tools", None

    # Buildings
    if any(x in item_lower for x in ["hut", "house", "forge", "workshop", "tower"]):
        return "buildings", None

    # Default to tools
    return "tools", None


def format_item(item_id: str, item_name: str, category: str, subcategory: str | None = None) -> str:
    """Format an item as TypeScript object."""
    normalized_id = normalize_item_id(item_id)
    category, subcategory = determine_category(normalized_id, item_name)

    lines = ["  {"]
    lines.append(f"    id: '{normalized_id}',")
    name_escaped = item_name.replace("'", "\\'")
    lines.append(f"    name: '{name_escaped}',")
    lines.append(f"    category: '{category}',")

    if subcategory:
        lines.append(f"    subcategory: '{subcategory}',")

    lines.append(f"    description: 'Imported from game data.',")
    lines.append("  },")

    return "\n".join(lines)


def load_recipes(recipes_json: Path) -> Tuple[List[Dict], Dict[str, str]]:
    """Load recipes and item IDs from JSON file."""
    with open(recipes_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    recipes = data.get("recipes", [])
    item_ids_map = data.get("itemIds", {})

    return recipes, item_ids_map


def collect_external_items(
    recipes: List[Dict],
    item_ids_map: Dict[str, str],
    existing_ids: Set[str],
) -> List[Tuple[str, str]]:
    """Collect all items from recipes that aren't in existing items."""
    # Collect all items from recipes
    all_item_ids = set()
    for recipe in recipes:
        # Result item
        result_item = recipe.get("itemId", "")
        if result_item:
            all_item_ids.add(result_item)

        # Ingredient items
        ingredients = recipe.get("ingredients", [])
        for ingredient in ingredients:
            all_item_ids.add(ingredient)

    # Filter out existing items
    external_items = []
    for item_id in all_item_ids:
        normalized_id = normalize_item_id(item_id)
        if normalized_id not in existing_ids:
            item_name = item_ids_map.get(item_id, item_id.replace("ITEM_", "").replace("_", " ").title())
            external_items.append((item_id, item_name))

    # Remove duplicates
    seen = set()
    unique_items = []
    for item_id, item_name in external_items:
        normalized_id = normalize_item_id(item_id)
        if normalized_id not in seen:
            seen.add(normalized_id)
            unique_items.append((item_id, item_name))

    return unique_items


def generate_external_items_ts_content(external_items: List[Tuple[str, str]]) -> str:
    """Generate TypeScript content for items.external.ts file."""
    content = """// Auto-generated from external/recipes.json
// Do not edit by hand. Re-generate via: python external/scripts/generate_external_items_from_recipes.py

import type { ItemData } from '@/types/items';

export const EXTERNAL_ITEMS: ItemData[] = [
"""

    for item_id, item_name in sorted(external_items, key=lambda x: x[1]):
        normalized_id = normalize_item_id(item_id)
        category, subcategory = determine_category(normalized_id, item_name)
        content += format_item(item_id, item_name, category, subcategory) + "\n"

    content += "];\n"
    return content


def write_external_items_ts(content: str, external_items_ts: Path) -> None:
    """Write external items TypeScript file."""
    external_items_ts.parent.mkdir(parents=True, exist_ok=True)
    with open(external_items_ts, "w", encoding="utf-8") as f:
        f.write(content)


def generate_external_items(
    recipes_json: Path | None = None,
    external_items_ts: Path | None = None,
    base_item_files: List[Path] | None = None,
) -> List[Tuple[str, str]]:
    """Generate external items TypeScript file from recipes JSON."""
    if recipes_json is None:
        recipes_json = DATA_DIR / "recipes.json"
    if external_items_ts is None:
        external_items_ts = GUIDES_DATA_DIR / "items.external.ts"
    if base_item_files is None:
        base_item_files = BASE_ITEM_FILES

    if not recipes_json.exists():
        raise FileNotFoundError(f"Recipes JSON not found: {recipes_json}")

    # Get existing item IDs
    print("Loading existing item IDs from base files...")
    existing_ids = get_existing_item_ids(base_item_files)
    print(f"Found {len(existing_ids)} existing items")

    # Load recipes
    print("\nLoading recipes from JSON...")
    recipes, item_ids_map = load_recipes(recipes_json)

    print(f"Loaded {len(recipes)} recipes")
    print(f"Found {len(item_ids_map)} item IDs in registry")

    # Collect external items
    external_items = collect_external_items(recipes, item_ids_map, existing_ids)

    print(f"\nFound {len(external_items)} external items not in base files")

    # Generate TypeScript
    content = generate_external_items_ts_content(external_items)

    # Write file
    write_external_items_ts(content, external_items_ts)

    print(f"\nCreated {external_items_ts}")
    print(f"Generated {len(external_items)} external items")

    return external_items


def generate_and_write(
    recipes_json: Path | None = None,
    external_items_ts: Path | None = None,
    base_item_files: List[Path] | None = None,
) -> List[Tuple[str, str]]:
    """Generate external items TypeScript file."""
    print("=" * 60)
    print("Generate External Items from Recipes")
    print("=" * 60)

    try:
        external_items = generate_external_items(recipes_json, external_items_ts, base_item_files)
        print("\n" + "=" * 60)
        print("Complete!")
        print("=" * 60)
        return external_items
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Run extract_recipes.py first")
        raise


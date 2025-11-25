"""Generate base item files (raw-materials, weapons, armor, etc.) from recipes.json."""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

from common_paths import DATA_DIR, GUIDES_DATA_DIR


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
    if any(x in item_lower for x in ["axe", "spear", "staff", "sword", "bow", "blowgun", "dagger", "club", "mace"]):
        return "weapons", None

    # Armor
    if any(x in item_lower for x in ["armor", "gloves", "boots", "coat", "shield", "helmet", "paws"]):
        return "armor", None

    # Potions
    if any(x in item_lower for x in ["potion", "elixir", "brew"]):
        return "potions", None

    # Scrolls
    if "scroll" in item_lower:
        return "scrolls", None

    # Raw materials
    if any(
        x in item_lower
        for x in ["hide", "meat", "herb", "seed", "crystal", "essence", "ingot", "ore", "bone", "fur", "skin", "feather", "horn", "claw", "fang", "venom", "spirit"]
    ):
        subcategory = None
        if "herb" in item_lower or "seed" in item_lower:
            subcategory = "herbs"
        elif any(x in item_lower for x in ["hide", "meat", "fur", "skin", "bone", "feather", "horn", "claw", "fang"]):
            subcategory = "animal-parts"
        elif "crystal" in item_lower or "essence" in item_lower or "spirit" in item_lower:
            subcategory = "essences"
        elif "ore" in item_lower or "ingot" in item_lower:
            subcategory = "metals"
        return "raw-materials", subcategory

    # Tools
    if any(x in item_lower for x in ["net", "bomb", "trap", "kit", "lure", "rope", "bag"]):
        return "tools", None

    # Buildings (building items, not building definitions)
    if any(x in item_lower for x in ["hut", "house", "forge", "workshop", "tower", "kit"]):
        return "buildings", None

    # Default to tools
    return "tools", None


def format_item_name(item_id: str, item_name: str) -> str:
    """Format item name from ITEM_XXX to readable name."""
    if item_name.startswith("ITEM_"):
        item_name = item_name[5:]

    # Convert SNAKE_CASE to Title Case
    parts = item_name.split("_")
    formatted = " ".join(word.capitalize() for word in parts)

    return formatted


def escape_typescript_string(s: str) -> str:
    """Escape a string for use in TypeScript single-quoted string."""
    if not s:
        return s
    result = []
    for char in s:
        if char == "\\":
            result.append("\\\\")
        elif char == "'":
            result.append("\\'")
        elif char == "\n":
            result.append("\\n")
        elif char == "\r":
            result.append("\\r")
        elif char == "\t":
            result.append("\\t")
        else:
            result.append(char)
    return "".join(result)


def format_item(item_id: str, item_name: str, category: str, subcategory: str | None = None, stats: Dict | None = None) -> str:
    """Format an item as TypeScript object."""
    normalized_id = normalize_item_id(item_id)
    formatted_name = format_item_name(item_id, item_name)

    lines = ["  {"]
    lines.append(f"    id: '{normalized_id}',")
    name_escaped = escape_typescript_string(formatted_name)
    lines.append(f"    name: '{name_escaped}',")
    lines.append(f"    category: '{category}',")

    if subcategory:
        lines.append(f"    subcategory: '{subcategory}',")

    lines.append(f"    description: 'Imported from game data.',")

    # Add stats if available
    if stats:
        stats_lines = []
        if "damage" in stats:
            stats_lines.append(f"    damage: {stats['damage']},")
        if "armor" in stats:
            stats_lines.append(f"    armor: {stats['armor']},")
        if "strength" in stats:
            stats_lines.append(f"    strength: {stats['strength']},")
        if "agility" in stats:
            stats_lines.append(f"    agility: {stats['agility']},")
        if "intelligence" in stats:
            stats_lines.append(f"    intelligence: {stats['intelligence']},")

        if stats_lines:
            lines.extend(stats_lines)

    lines.append("  },")

    return "\n".join(lines)


def load_recipes(recipes_json: Path) -> Tuple[List[Dict], Dict[str, str]]:
    """Load recipes and item IDs from JSON file."""
    with open(recipes_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    recipes = data.get("recipes", [])
    item_ids_map = data.get("itemIds", {})

    return recipes, item_ids_map


def load_item_stats(item_stats_json: Path) -> Dict[str, Dict]:
    """Load item stats from JSON file."""
    if not item_stats_json.exists():
        return {}

    with open(item_stats_json, "r", encoding="utf-8") as f:
        stats_data = json.load(f)

    stats_map = {}
    for item_id, item_stats in stats_data.items():
        normalized_id = normalize_item_id(item_id)
        stats_map[normalized_id] = item_stats

    return stats_map


def collect_all_items(recipes: List[Dict], item_ids_map: Dict[str, str]) -> Dict[str, Dict]:
    """Collect all items from recipes."""
    all_items: Dict[str, Dict] = {}

    for recipe in recipes:
        # Result item
        result_item = recipe.get("itemId", "")
        if result_item:
            item_name = item_ids_map.get(result_item, result_item)
            all_items[result_item] = {"name": item_name, "is_craftable": True}

        # Ingredient items
        ingredients = recipe.get("ingredients", [])
        for ingredient in ingredients:
            if ingredient not in all_items:
                item_name = item_ids_map.get(ingredient, ingredient)
                all_items[ingredient] = {"name": item_name, "is_craftable": False}

    return all_items


def categorize_items(all_items: Dict[str, Dict], stats_map: Dict[str, Dict]) -> Dict[str, List[Tuple[str, Dict]]]:
    """Categorize items by category."""
    categorized: Dict[str, List[Tuple[str, Dict]]] = defaultdict(list)

    for item_id, item_info in all_items.items():
        category, subcategory = determine_category(item_id, item_info["name"])
        normalized_id = normalize_item_id(item_id)
        item_stats = stats_map.get(normalized_id)
        categorized[category].append(
            (
                item_id,
                {
                    "name": item_info["name"],
                    "subcategory": subcategory,
                    "stats": item_stats,
                },
            )
        )

    return categorized


def generate_category_file_content(
    category: str,
    items: List[Tuple[str, Dict]],
    export_name: str,
    category_name: str,
) -> str:
    """Generate TypeScript content for a category file."""
    lines = [
        f"// Auto-generated from external/recipes.json",
        f"// Do not edit by hand. Re-generate via: python external/scripts/generate_base_items_from_recipes.py",
        "",
        "import type { ItemData } from '@/types/items';",
        "",
        f"export const {export_name}: ItemData[] = [",
    ]

    # Sort items by ID for consistency
    sorted_items = sorted(items, key=lambda x: x[0])

    for item_id, item_info in sorted_items:
        item_str = format_item(
            item_id,
            item_info["name"],
            category,
            item_info["subcategory"],
            item_info["stats"],
        )
        lines.append(item_str)

    lines.append("];")
    return "\n".join(lines)


def write_category_file(content: str, file_path: Path) -> None:
    """Write category TypeScript file."""
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)


# Category configuration
CATEGORY_FILES = {
    "raw-materials": "items.raw-materials.ts",
    "weapons": "items.weapons.ts",
    "armor": "items.armor.ts",
    "tools": "items.tools.ts",
    "potions": "items.potions.ts",
    "scrolls": "items.scrolls.ts",
    "buildings": "items.buildings.ts",
}

CATEGORY_EXPORTS = {
    "raw-materials": "RAW_MATERIAL_ITEMS",
    "weapons": "WEAPON_ITEMS",
    "armor": "ARMOR_ITEMS",
    "tools": "TOOL_ITEMS",
    "potions": "POTION_ITEMS",
    "scrolls": "SCROLL_ITEMS",
    "buildings": "BUILDING_ITEMS",
}

CATEGORY_NAMES = {
    "raw-materials": "Raw Materials",
    "weapons": "Weapons",
    "armor": "Armor",
    "tools": "Tools",
    "potions": "Potions",
    "scrolls": "Scrolls",
    "buildings": "Buildings",
}


def generate_base_items(
    recipes_json: Path | None = None,
    item_stats_json: Path | None = None,
    data_dir: Path | None = None,
) -> Dict[str, List[Tuple[str, Dict]]]:
    """Generate base item TypeScript files from recipes JSON."""
    if recipes_json is None:
        recipes_json = DATA_DIR / "recipes.json"
    if item_stats_json is None:
        item_stats_json = DATA_DIR / "item_stats.json"
    if data_dir is None:
        data_dir = GUIDES_DATA_DIR

    if not recipes_json.exists():
        raise FileNotFoundError(f"Recipes JSON not found: {recipes_json}")

    # Load recipes
    print("\nLoading recipes from JSON...")
    recipes, item_ids_map = load_recipes(recipes_json)

    print(f"Loaded {len(recipes)} recipes")
    print(f"Found {len(item_ids_map)} item IDs in registry")

    # Load item stats if available
    stats_map = load_item_stats(item_stats_json)
    if stats_map:
        print(f"Loaded stats for {len(stats_map)} items")

    # Collect all items from recipes
    all_items = collect_all_items(recipes, item_ids_map)

    print(f"\nFound {len(all_items)} unique items")

    # Categorize items
    categorized = categorize_items(all_items, stats_map)

    # Generate files for all categories, even if empty
    for category in CATEGORY_FILES.keys():
        filename = CATEGORY_FILES[category]
        export_name = CATEGORY_EXPORTS[category]
        category_name = CATEGORY_NAMES[category]

        file_path = data_dir / filename

        # Get items for this category (may be empty)
        items = categorized.get(category, [])

        # Generate file content
        content = generate_category_file_content(category, items, export_name, category_name)

        # Write file (even if empty)
        write_category_file(content, file_path)

        print(f"\nCreated {filename}")
        print(f"  Generated {len(items)} {category_name.lower()}")

    return categorized


def generate_and_write(
    recipes_json: Path | None = None,
    item_stats_json: Path | None = None,
    data_dir: Path | None = None,
) -> Dict[str, List[Tuple[str, Dict]]]:
    """Generate base item TypeScript files."""
    print("=" * 60)
    print("Generate Base Items from Recipes")
    print("=" * 60)

    try:
        categorized = generate_base_items(recipes_json, item_stats_json, data_dir)
        print("\n" + "=" * 60)
        print("Complete!")
        print("=" * 60)
        return categorized
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Run extract_recipes.py first")
        raise


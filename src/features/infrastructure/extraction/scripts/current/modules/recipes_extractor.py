"""Extract all item recipes from WurstScript source files."""

from __future__ import annotations

import re
import time
from collections import defaultdict
from pathlib import Path
from typing import Dict, List

from common_paths import REPO_ROOT, WURST_DIR

# Unit requirement constants mapping
UNIT_REQUIREMENTS = {
    "UNIT_FORGE": "forge",
    "UNIT_ARMORY": "armory",
    "UNIT_WORKSHOP": "workshop",
    "UNIT_TANNERY": "tannery",
    "UNIT_WITCH_DOCTORS_HUT": "witch_doctors_hut",
    "UNIT_MIXING_POT": "mixing_pot",
}


def extract_item_ids(assets_dir: Path | None = None) -> Dict[str, str]:
    """
    Extract item ID constants from LocalObjectIDs.wurst files.
    Returns a dict mapping ITEM_XXX to their registered names.
    """
    if assets_dir is None:
        assets_dir = WURST_DIR / "assets"

    item_ids = {}
    id_files = [
        assets_dir / "LocalObjectIDs.wurst",
        assets_dir / "LocalObjectIDs2.wurst",
    ]

    # Pattern: public let ITEM_XXX = ... registerObjectID("ITEM_XXX")
    # Handle both single-line and multi-line patterns
    pattern = r'public\s+let\s+(ITEM_\w+)\s*=\s*[^\n]*?\.\.registerObjectID\(["\']([^"\']+)["\']\)'

    for id_file in id_files:
        if not id_file.exists():
            continue
        with open(id_file, "r", encoding="utf-8") as f:
            content = f.read()
            # Use multiline mode to handle cases where registerObjectID might be on next line
            matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
            for match in matches:
                item_constant = match.group(1)
                registered_name = match.group(2)
                item_ids[item_constant] = registered_name

            # Also try a simpler pattern for cases where the format is slightly different
            simple_pattern = r'public\s+let\s+(ITEM_\w+)\s*=.*?registerObjectID\(["\']([^"\']+)["\']\)'
            simple_matches = re.finditer(simple_pattern, content, re.MULTILINE | re.DOTALL)
            for match in simple_matches:
                item_constant = match.group(1)
                registered_name = match.group(2)
                if item_constant not in item_ids:  # Don't overwrite existing
                    item_ids[item_constant] = registered_name

    return item_ids


def extract_unit_ids(assets_dir: Path | None = None) -> Dict[str, str]:
    """
    Extract unit ID constants for building requirements.
    """
    if assets_dir is None:
        assets_dir = WURST_DIR / "assets"

    unit_ids = {}
    id_file = assets_dir / "LocalObjectIDs.wurst"

    if not id_file.exists():
        return unit_ids

    # Pattern: public let UNIT_XXX = ... registerObjectID("UNIT_XXX")
    pattern = r'public\s+let\s+(UNIT_\w+)\s*=\s*[^.]*\.\.registerObjectID\(["\']([^"\']+)["\']\)'

    with open(id_file, "r", encoding="utf-8") as f:
        content = f.read()
        matches = re.finditer(pattern, content)
        for match in matches:
            unit_constant = match.group(1)
            registered_name = match.group(2)
            unit_ids[unit_constant] = registered_name

    return unit_ids


def normalize_lines(content: str) -> List[str]:
    """Normalize line endings and handle multi-line method chains."""
    normalized_lines = []
    lines = content.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        # If line ends with .., continue reading until we find a complete statement
        if line.endswith("..") or (line.strip().startswith("..") and not line.rstrip().endswith(")")):
            combined = line
            i += 1
            while i < len(lines) and not lines[i].strip().endswith(")"):
                combined += " " + lines[i].strip()
                i += 1
            if i < len(lines):
                combined += " " + lines[i].strip()
            normalized_lines.append(combined)
        else:
            normalized_lines.append(line)
        i += 1
    return normalized_lines


def parse_wurst_file(
    file_path: Path,
    item_ids: Dict[str, str],
    unit_ids: Dict[str, str],
    unit_requirements: Dict[str, str] | None = None,
    repo_root: Path | None = None,
) -> List[Dict]:
    """
    Parse a WurstScript file and extract recipe information.
    Returns a list of recipe dictionaries.
    """
    if repo_root is None:
        repo_root = REPO_ROOT

    if unit_requirements is None:
        unit_requirements = UNIT_REQUIREMENTS

    recipes = []

    if not file_path.exists():
        return recipes

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # First, find the file-level UNIT_REQUIREMENT constant
    # Pattern: let UNIT_REQUIREMENT = UNIT_XXX
    file_unit_req = None
    unit_req_match = re.search(r"let\s+UNIT_REQUIREMENT\s*=\s*(UNIT_\w+)", content)
    if unit_req_match:
        unit_const = unit_req_match.group(1)
        file_unit_req = unit_requirements.get(unit_const, unit_ids.get(unit_const, unit_const))

    # Normalize line endings and handle multi-line method chains
    normalized_lines = normalize_lines(content)

    current_item = None
    current_recipe = None
    current_unit_req = file_unit_req  # Default to file-level requirement
    current_mana_req = None

    for line in normalized_lines:
        # Match: new CustomItemType(ITEM_ID, ...)
        item_match = re.search(r"new\s+CustomItemType\s*\(\s*(ITEM_\w+)", line)
        if item_match:
            # Save previous recipe if exists
            if current_item and current_recipe is not None:
                recipes.append(
                    {
                        "itemId": current_item,
                        "itemName": item_ids.get(current_item, current_item),
                        "ingredients": current_recipe,
                        "unitRequirement": current_unit_req,
                        "mixingPotManaRequirement": current_mana_req,
                    }
                )

            # Start new recipe
            current_item = item_match.group(1)
            current_recipe = None
            current_unit_req = None
            current_mana_req = None

        # Match: ..setItemRecipe(ITEM_ID1, ITEM_ID2, ...) - handle multi-line
        # Look for setItemRecipe and extract everything until closing paren
        recipe_start = line.find("..setItemRecipe(")
        if recipe_start != -1:
            # Extract the full call, handling multi-line
            paren_count = 0
            start_pos = recipe_start + len("..setItemRecipe(")
            end_pos = start_pos

            for char in line[start_pos:]:
                if char == "(":
                    paren_count += 1
                elif char == ")":
                    if paren_count == 0:
                        break
                    paren_count -= 1
                end_pos += 1

            ingredients_str = line[start_pos:end_pos]
            # Extract all ITEM_XXX constants
            ingredients = re.findall(r"(ITEM_\w+)", ingredients_str)
            if ingredients:
                current_recipe = ingredients
            elif "setItemRecipe()" in line:  # Empty recipe
                current_recipe = []

        # Match: ..setUnitRequirement(UNIT_XXX)
        # If it's UNIT_REQUIREMENT, use the file-level constant we found
        unit_match = re.search(r"\.\.setUnitRequirement\s*\(\s*(UNIT_\w+)", line)
        if unit_match:
            unit_const = unit_match.group(1)
            if unit_const == "UNIT_REQUIREMENT" and file_unit_req:
                current_unit_req = file_unit_req
            else:
                current_unit_req = unit_requirements.get(unit_const, unit_ids.get(unit_const, unit_const))

        # Match: ..setMixingPotManaRequirement(number)
        mana_match = re.search(r"\.\.setMixingPotManaRequirement\s*\(\s*(\d+)", line)
        if mana_match:
            current_mana_req = int(mana_match.group(1))

    # Don't forget the last recipe
    if current_item and current_recipe is not None:
        recipes.append(
            {
                "itemId": current_item,
                "itemName": item_ids.get(current_item, current_item),
                "ingredients": current_recipe,
                "unitRequirement": current_unit_req,
                "mixingPotManaRequirement": current_mana_req,
            }
        )

    return recipes


def collect_recipe_files(
    crafting_dirs: List[Path] | None = None,
    items_dir: Path | None = None,
) -> List[Path]:
    """Collect all Wurst files that might contain recipes."""
    if crafting_dirs is None:
        crafting_dirs = [
            WURST_DIR / "systems" / "craftingV2",
            WURST_DIR / "systems" / "crafting",
        ]

    if items_dir is None:
        items_dir = WURST_DIR / "objects" / "items"

    files = []

    for crafting_dir in crafting_dirs:
        if crafting_dir.exists():
            files.extend(crafting_dir.rglob("*.wurst"))

    if items_dir.exists():
        files.extend(items_dir.rglob("*.wurst"))

    return files


def extract_all_recipes(
    crafting_dirs: List[Path] | None = None,
    items_dir: Path | None = None,
    assets_dir: Path | None = None,
    repo_root: Path | None = None,
) -> tuple[List[Dict], Dict[str, str], Dict[str, str]]:
    """Extract all recipes from Wurst files."""
    if assets_dir is None:
        assets_dir = WURST_DIR / "assets"

    # Extract item and unit ID mappings
    item_ids = extract_item_ids(assets_dir)
    unit_ids = extract_unit_ids(assets_dir)

    # Collect all recipes
    all_recipes = []
    recipe_files = collect_recipe_files(crafting_dirs, items_dir)

    for wurst_file in recipe_files:
        recipes = parse_wurst_file(wurst_file, item_ids, unit_ids, repo_root=repo_root)
        if recipes:
            all_recipes.extend(recipes)

    # Convert ingredient IDs to names
    for recipe in all_recipes:
        recipe["ingredientNames"] = [item_ids.get(ing, ing) for ing in recipe["ingredients"]]

    return all_recipes, item_ids, unit_ids


def build_recipes_output(
    recipes: List[Dict],
    item_ids: Dict[str, str],
    unit_ids: Dict[str, str],
) -> Dict:
    """Build the output structure for recipes JSON."""
    return {
        "recipes": recipes,
        "itemIds": item_ids,
        "unitIds": unit_ids,
        "metadata": {
            "totalRecipes": len(recipes),
            "extractedAt": time.time(),
        },
    }


def write_recipes_to_file(output_data: Dict, output_file: Path) -> None:
    """Write recipes data to JSON file."""
    import json

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)


def extract_and_write(
    output_file: Path | None = None,
    crafting_dirs: List[Path] | None = None,
    items_dir: Path | None = None,
    assets_dir: Path | None = None,
    repo_root: Path | None = None,
) -> List[Dict]:
    """Extract all recipes and write to file."""
    from common_paths import DATA_DIR

    if output_file is None:
        output_file = DATA_DIR / "recipes.json"

    print("Extracting item recipes from WurstScript files...")

    # Extract item and unit ID mappings
    print("Loading item ID mappings...")
    item_ids = extract_item_ids(assets_dir)
    print(f"Found {len(item_ids)} item IDs")

    print("Loading unit ID mappings...")
    unit_ids = extract_unit_ids(assets_dir)
    print(f"Found {len(unit_ids)} unit IDs")

    # Collect all recipes
    all_recipes = []

    if crafting_dirs is None:
        crafting_dirs = [
            WURST_DIR / "systems" / "craftingV2",
            WURST_DIR / "systems" / "crafting",
        ]

    if items_dir is None:
        items_dir = WURST_DIR / "objects" / "items"

    for crafting_dir in crafting_dirs:
        if not crafting_dir.exists():
            print(f"Warning: {crafting_dir} does not exist")
            continue

        print(f"\nScanning {crafting_dir}...")

        # Find all .wurst files recursively
        for wurst_file in crafting_dir.rglob("*.wurst"):
            recipes = parse_wurst_file(wurst_file, item_ids, unit_ids, repo_root=repo_root)
            if recipes:
                try:
                    rel_path = wurst_file.relative_to(repo_root or REPO_ROOT)
                except ValueError:
                    rel_path = wurst_file
                print(f"  Found {len(recipes)} recipes in {rel_path}")
                all_recipes.extend(recipes)

    # Also check item definition files
    if items_dir.exists():
        print(f"\nScanning {items_dir}...")
        for wurst_file in items_dir.rglob("*.wurst"):
            recipes = parse_wurst_file(wurst_file, item_ids, unit_ids, repo_root=repo_root)
            if recipes:
                try:
                    rel_path = wurst_file.relative_to(repo_root or REPO_ROOT)
                except ValueError:
                    rel_path = wurst_file
                print(f"  Found {len(recipes)} recipes in {rel_path}")
                all_recipes.extend(recipes)

    # Convert ingredient IDs to names
    for recipe in all_recipes:
        recipe["ingredientNames"] = [item_ids.get(ing, ing) for ing in recipe["ingredients"]]

    # Build and write output
    output_data = build_recipes_output(all_recipes, item_ids, unit_ids)
    write_recipes_to_file(output_data, output_file)

    print(f"\n[OK] Extracted {len(all_recipes)} recipes")
    print(f"[OK] Output written to {output_file}")

    # Print summary statistics
    print("\nSummary:")
    print(f"  Total recipes: {len(all_recipes)}")

    # Count by unit requirement
    by_unit = defaultdict(int)
    for recipe in all_recipes:
        unit = recipe.get("unitRequirement", "none")
        by_unit[unit] += 1

    print("\n  Recipes by crafting station:")
    for unit, count in sorted(by_unit.items(), key=lambda x: (x[0] is None, str(x[0]))):
        unit_display = unit if unit else "none"
        print(f"    {unit_display}: {count}")

    # Count items with mixing pot mana requirements
    mixing_pot_count = sum(1 for r in all_recipes if r.get("mixingPotManaRequirement"))
    if mixing_pot_count > 0:
        print(f"\n  Mixing pot recipes: {mixing_pot_count}")

    return all_recipes


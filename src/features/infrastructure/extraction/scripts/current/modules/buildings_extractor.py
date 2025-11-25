"""Extract building definitions from WurstScript game source code."""

from __future__ import annotations

import re
import time
from pathlib import Path
from typing import Dict, List

from common_paths import REPO_ROOT, WURST_DIR


def extract_unit_ids(assets_dir: Path | None = None) -> Dict[str, str]:
    """Extract all UNIT_* constants from LocalObjectIDs files."""
    if assets_dir is None:
        assets_dir = WURST_DIR / "assets"

    unit_ids = {}

    for obj_file in [assets_dir / "LocalObjectIDs.wurst", assets_dir / "LocalObjectIDs2.wurst"]:
        if not obj_file.exists():
            continue

        with open(obj_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Match: public let UNIT_XXX = ... registerObjectID("UNIT_XXX")
        pattern = r'public\s+let\s+(UNIT_\w+)\s*=\s*[^.]*\.\.registerObjectID\(["\'](UNIT_\w+)["\']\)'
        matches = re.findall(pattern, content)

        for match in matches:
            const_name = match[0]
            registered_name = match[1]
            unit_ids[const_name] = registered_name

    return unit_ids


def extract_building_from_file(file_path: Path, unit_ids: Dict[str, str], repo_root: Path | None = None) -> List[Dict]:
    """Extract building definitions from a file."""
    if repo_root is None:
        repo_root = REPO_ROOT

    buildings = []

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Look for building creation patterns
        # Pattern: createBuilding(UNIT_XXX) or createXXX() returns BuildingDefinition
        building_patterns = [
            r"createBuilding\((\w+)\)",
            r"function\s+create(\w+)\([^)]*\)\s+returns\s+BuildingDefinition",
            r"UNIT_(\w+)\s*=\s*compiletime",
        ]

        # Extract building unit IDs
        found_units = set()
        for pattern in building_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if match.startswith("UNIT_"):
                    found_units.add(match)
                else:
                    # Try to construct UNIT_ name
                    unit_name = f"UNIT_{match.upper()}"
                    if unit_name in unit_ids:
                        found_units.add(unit_name)

        # Extract properties from building definitions
        for unit_id in found_units:
            # Extract name
            name_pattern = rf"{re.escape(unit_id)}[^.]*\.\.setName\(['\"]([^'\"]+)['\"]\)"
            name_match = re.search(name_pattern, content)
            name = name_match.group(1) if name_match else unit_id.replace("UNIT_", "").replace("_", " ").title()

            # Extract tooltip/description
            tooltip_pattern = rf"{re.escape(unit_id)}[^.]*\.\.setTooltip(?:Basic|Extended)\(['\"]([^'\"]+)['\"]\)"
            tooltip_match = re.search(tooltip_pattern, content)
            description = tooltip_match.group(1) if tooltip_match else ""

            # Extract HP
            hp_pattern = rf"{re.escape(unit_id)}[^.]*\.\.setHitPointsMaximumBase\((\d+)\)"
            hp_match = re.search(hp_pattern, content)
            hp = int(hp_match.group(1)) if hp_match else None

            # Extract armor
            armor_pattern = rf"{re.escape(unit_id)}[^.]*\.\.setDefenseBase\((\d+)\)"
            armor_match = re.search(armor_pattern, content)
            armor = int(armor_match.group(1)) if armor_match else None

            try:
                file_path_rel = file_path.relative_to(repo_root)
            except ValueError:
                file_path_rel = file_path

            building_data = {
                "id": unit_id.lower().replace("unit_", "").replace("_", "-"),
                "unitId": unit_id,
                "name": name,
                "description": description,
                "hp": hp,
                "armor": armor,
                "filePath": str(file_path_rel),
            }

            buildings.append(building_data)

    except Exception as e:
        print(f"Error reading {file_path}: {e}")

    return buildings


def extract_craftable_items(crafting_dir: Path | None = None) -> Dict[str, List[str]]:
    """Extract which items can be crafted at which buildings from crafting system."""
    if crafting_dir is None:
        crafting_dir = WURST_DIR / "systems" / "craftingV2"

    craftable_items = {}

    if not crafting_dir.exists():
        return craftable_items

    # Map unit requirements to building names
    unit_to_building = {
        "UNIT_ARMORY": "armory",
        "UNIT_FORGE": "forge",
        "UNIT_WORKSHOP": "workshop",
        "UNIT_TANNERY": "tannery",
        "UNIT_WITCH_DOCTORS_HUT": "witch-doctors-hut",
        "UNIT_MIXING_POT": "mixing-pot",
    }

    for file in crafting_dir.glob("*.wurst"):
        try:
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()

            # Find UNIT_REQUIREMENT
            unit_req_match = re.search(r"let\s+UNIT_REQUIREMENT\s*=\s*(\w+)", content)
            if not unit_req_match:
                continue

            unit_req = unit_req_match.group(1)
            building_name = unit_to_building.get(unit_req)

            if not building_name:
                continue

            # Find all items crafted here (setItemRecipe calls)
            recipe_pattern = r"\.\.setItemRecipe\((\w+)(?:,\s*\w+)*\)"
            recipe_matches = re.findall(recipe_pattern, content)

            for match in recipe_matches:
                # First item is the result
                items = [item.strip() for item in match.split(",")]
                if items:
                    result_item = items[0]
                    if building_name not in craftable_items:
                        craftable_items[building_name] = []
                    craftable_items[building_name].append(result_item)

        except Exception as e:
            print(f"Error reading {file}: {e}")

    return craftable_items


def extract_all_buildings(
    buildings_dir: Path | None = None,
    crafting_dir: Path | None = None,
    assets_dir: Path | None = None,
    repo_root: Path | None = None,
) -> List[Dict]:
    """Extract all building definitions."""
    if buildings_dir is None:
        buildings_dir = WURST_DIR / "objects" / "units" / "Buildings"

    buildings = []
    unit_ids = extract_unit_ids(assets_dir)

    # Extract from building definition files
    if buildings_dir.exists():
        for file in buildings_dir.glob("*.wurst"):
            extracted = extract_building_from_file(file, unit_ids, repo_root)
            buildings.extend(extracted)

    # Extract craftable items
    craftable_items = extract_craftable_items(crafting_dir)

    # Merge craftable items into building data
    for building in buildings:
        building_id = building["id"]
        if building_id in craftable_items:
            building["craftableItems"] = craftable_items[building_id]

    return buildings


def build_buildings_output(buildings: List[Dict]) -> Dict:
    """Build the output structure for buildings JSON."""
    return {
        "buildings": buildings,
        "metadata": {
            "totalBuildings": len(buildings),
            "extractedAt": time.time(),
        },
    }


def write_buildings_to_file(output_data: Dict, output_file: Path) -> None:
    """Write buildings data to JSON file."""
    import json

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)


def extract_and_write(
    output_file: Path | None = None,
    buildings_dir: Path | None = None,
    crafting_dir: Path | None = None,
    assets_dir: Path | None = None,
    repo_root: Path | None = None,
) -> List[Dict]:
    """Extract all buildings and write to file."""
    from common_paths import DATA_DIR

    if output_file is None:
        output_file = DATA_DIR / "buildings.json"

    print("Extracting buildings from game source...")

    buildings = extract_all_buildings(buildings_dir, crafting_dir, assets_dir, repo_root)
    output_data = build_buildings_output(buildings)

    write_buildings_to_file(output_data, output_file)

    print(f"Extracted {len(buildings)} buildings")
    print(f"Output written to: {output_file}")

    # Print summary
    print("\nBuildings found:")
    for building in buildings:
        print(f"  - {building['name']} ({building['id']})")

    return buildings


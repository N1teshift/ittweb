#!/usr/bin/env python3
"""
Lightweight validation of extraction artifacts.
Ensures key JSON files exist, parse correctly, and contain records.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Tuple

from common_paths import DATA_DIR


def check_json(file_path: Path, minimum_keys: Tuple[str, ...] | None = None) -> Dict:
    if not file_path.exists():
        raise FileNotFoundError(f"{file_path} not found")

    with open(file_path, "r", encoding="utf-8") as fh:
        data = json.load(fh)

    if minimum_keys:
        for key in minimum_keys:
            if key not in data:
                raise ValueError(f"{file_path.name} missing key '{key}'")

    if isinstance(data, list) and not data:
        raise ValueError(f"{file_path.name} contains no entries")
    if isinstance(data, dict) and not data:
        raise ValueError(f"{file_path.name} contains no keys")

    return data


def main():
    print("=" * 60)
    print("Validate extraction outputs")
    print("=" * 60)

    stats = {}

    abilities = check_json(DATA_DIR / "abilities.json")
    stats["abilities"] = len(abilities)

    ability_desc = check_json(DATA_DIR / "ability_descriptions.json")
    stats["ability_descriptions"] = len(ability_desc)

    buildings = check_json(DATA_DIR / "buildings.json")
    stats["buildings"] = len(buildings)

    recipes = check_json(DATA_DIR / "recipes.json", minimum_keys=("recipes", "itemIds"))
    stats["recipes"] = len(recipes.get("recipes", []))
    stats["registered_items"] = len(recipes.get("itemIds", {}))

    units = check_json(DATA_DIR / "units.json")
    stats["units"] = len(units.get("units", [])) if isinstance(units, dict) else len(units)

    item_stats = check_json(DATA_DIR / "item_stats.json")
    stats["item_stats"] = len(item_stats)

    missing_items = DATA_DIR / "missing_items.json"
    if missing_items.exists():
        missing = check_json(missing_items)
        stats["missing_items"] = len(missing)

    print("\nSummary:")
    for key, value in stats.items():
        print(f"  {key}: {value}")

    print("\nAll checks passed.")


if __name__ == "__main__":
    main()


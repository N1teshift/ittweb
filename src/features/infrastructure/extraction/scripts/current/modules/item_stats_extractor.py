"""Extract item stats from CustomItemType definitions in WurstScript files."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Dict

from common_paths import WURST_DIR


def extract_item_stats_from_file(file_path: Path) -> Dict[str, Dict]:
    """Extract item stats from a crafting file."""
    stats = {}

    if not file_path.exists():
        return stats

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find CustomItemType instances
    # Pattern: new CustomItemType(ITEM_XXX, ...) or new CustomItemType(ITEM_XXX)..setXXX()
    item_pattern = r"new\s+CustomItemType\s*\(\s*(ITEM_\w+)\s*[^)]*\)"

    for match in re.finditer(item_pattern, content):
        item_id_const = match.group(1)
        item_id = item_id_const.lower().replace("_", "-")

        # Find the block after this item creation
        start_pos = match.end()
        # Look for chained method calls
        block_end = content.find("\n\n", start_pos)
        if block_end == -1:
            block_end = min(start_pos + 500, len(content))

        block = content[start_pos:block_end]

        item_stats = {}

        # Extract bonuses
        # Pattern: ..addBonusStrength(10) or ..addBonusAgility(5)
        strength_match = re.search(r"addBonusStrength\s*\(\s*(\d+)\s*\)", block)
        if strength_match:
            item_stats["strength"] = int(strength_match.group(1))

        agility_match = re.search(r"addBonusAgility\s*\(\s*(\d+)\s*\)", block)
        if agility_match:
            item_stats["agility"] = int(agility_match.group(1))

        int_match = re.search(r"addBonusIntelligence\s*\(\s*(\d+)\s*\)", block)
        if int_match:
            item_stats["intelligence"] = int(int_match.group(1))

        armor_match = re.search(r"addBonusArmo[u]?r\s*\(\s*(\d+)\s*\)", block)
        if armor_match:
            item_stats["armor"] = int(armor_match.group(1))

        damage_match = re.search(r"addBonusDamage\s*\(\s*(\d+)\s*\)", block)
        if damage_match:
            item_stats["damage"] = int(damage_match.group(1))

        hp_match = re.search(r"addBonusLife\s*\(\s*(\d+)\s*\)", block)
        if hp_match:
            item_stats["health"] = int(hp_match.group(1))

        mana_match = re.search(r"addBonusMana\s*\(\s*(\d+)\s*\)", block)
        if mana_match:
            item_stats["mana"] = int(mana_match.group(1))

        if item_stats:
            stats[item_id] = item_stats

    return stats


def collect_crafting_files(crafting_dir: Path | None = None) -> list[Path]:
    """Collect all crafting files to scan."""
    if crafting_dir is None:
        crafting_dir = WURST_DIR / "systems" / "craftingV2"

    if not crafting_dir.exists():
        return []

    files = []
    for file_path in crafting_dir.glob("*.wurst"):
        if not file_path.name.startswith("CustomItemType"):
            files.append(file_path)
    return files


def extract_all_item_stats(crafting_dir: Path | None = None) -> Dict[str, Dict]:
    """Extract item stats from all crafting files."""
    all_stats = {}
    files = collect_crafting_files(crafting_dir)

    for file_path in files:
        stats = extract_item_stats_from_file(file_path)
        all_stats.update(stats)

    return all_stats


def write_item_stats_to_file(stats: Dict[str, Dict], output_file: Path) -> None:
    """Write item stats to JSON file."""
    import json

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)


def extract_and_write(output_file: Path | None = None, crafting_dir: Path | None = None) -> Dict[str, Dict]:
    """Extract item stats and write to file."""
    from common_paths import DATA_DIR

    if output_file is None:
        output_file = DATA_DIR / "item_stats.json"

    print("Extracting item stats from crafting files...")
    stats = extract_all_item_stats(crafting_dir)

    print(f"\nExtracted stats for {len(stats)} items")
    write_item_stats_to_file(stats, output_file)
    print(f"Saved to: {output_file}")

    if stats:
        print("\nSample stats:")
        for i, (item_id, item_stats) in enumerate(list(stats.items())[:5]):
            print(f"  {item_id}: {item_stats}")

    return stats


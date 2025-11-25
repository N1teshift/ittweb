"""Extract troll/unit definitions from WurstScript game source code."""

from __future__ import annotations

import re
import time
from pathlib import Path
from typing import Dict, List, Optional

from common_paths import WURST_DIR


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


def extract_attribute_growth(units_dir: Path | None = None) -> Dict[str, Dict[str, float]]:
    """Extract attribute growth values from TrollUnitTextConstant.wurst."""
    if units_dir is None:
        units_dir = WURST_DIR / "objects" / "units"

    growth_map = {}

    text_file = units_dir / "TrollUnitTextConstant.wurst"
    if not text_file.exists():
        return growth_map

    try:
        with open(text_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Look for trollAttributeGrowth.put patterns
        # Pattern: ..put(UNIT_XXX, new AttributeGrowth(strength, agility, intelligence))
        growth_pattern = r"\.\.put\((\w+),\s*new\s+AttributeGrowth\(([^)]+)\)\)"
        matches = re.findall(growth_pattern, content)

        for match in matches:
            unit_id = match[0]
            values_str = match[1]
            # Handle values like "1.3", "2.", "0.5"
            values = []
            for v in values_str.split(","):
                v = v.strip()
                # Remove trailing dots
                if v.endswith("."):
                    v = v[:-1]
                try:
                    values.append(float(v))
                except ValueError:
                    continue

            if len(values) >= 3:
                growth_map[unit_id] = {
                    "strength": values[0],
                    "agility": values[1],
                    "intelligence": values[2],
                }

    except Exception as e:
        print(f"Error reading {text_file}: {e}")

    return growth_map


def determine_unit_type(unit_id: str) -> Optional[str]:
    """Determine if unit is base class, subclass, or superclass."""
    unit_lower = unit_id.lower()

    # Base classes
    base_classes = ["hunter", "mage", "priest", "thief", "scout", "gatherer", "beastmaster"]
    for base in base_classes:
        if unit_lower == f"unit_{base}":
            return "base"

    # Superclasses
    superclasses = ["juggernaut", "assassin", "sage", "dementia_master", "jungle_tyrant", "omnigatherer", "spy"]
    for superclass in superclasses:
        if superclass in unit_lower:
            return "superclass"

    # Subclasses
    subclasses = [
        "warrior",
        "tracker",
        "elementalist",
        "hypnotist",
        "dreamwalker",
        "booster",
        "master_healer",
        "rogue",
        "telethief",
        "contortionist",
        "escape_artist",
        "observer",
        "trapper",
        "radar_gatherer",
        "herb_master",
        "alchemist",
        "druid",
        "shapeshifter",
    ]
    for subclass in subclasses:
        if subclass in unit_lower:
            return "subclass"

    return None


def extract_unit_stats(unit_id: str, content: str) -> Dict:
    """Extract unit stats from content."""
    stats = {}

    # Extract base HP
    hp_pattern = rf"setHitPointsMaximumBase\((\d+)\)"
    hp_match = re.search(hp_pattern, content)
    if hp_match:
        stats["baseHp"] = int(hp_match.group(1))

    # Extract base mana
    mana_pattern = rf"setManaMaximum\((\d+)\)"
    mana_match = re.search(mana_pattern, content)
    if mana_match:
        stats["baseMana"] = int(mana_match.group(1))

    # Extract attack speed
    attack_speed_pattern = rf"setAttack\d+CooldownTime\(([0-9.]+)\)"
    attack_speed_match = re.search(attack_speed_pattern, content)
    if attack_speed_match:
        stats["baseAttackSpeed"] = float(attack_speed_match.group(1))

    # Extract move speed
    move_speed_pattern = rf"setAnimation(?:Run|Walk)Speed\((\d+)\)"
    move_speed_match = re.search(move_speed_pattern, content)
    if move_speed_match:
        stats["baseMoveSpeed"] = int(move_speed_match.group(1))

    return stats


def extract_all_units(
    units_dir: Path | None = None,
    assets_dir: Path | None = None,
) -> List[Dict]:
    """Extract all unit/troll definitions."""
    if units_dir is None:
        units_dir = WURST_DIR / "objects" / "units"

    units = []
    unit_ids = extract_unit_ids(assets_dir)
    attribute_growth = extract_attribute_growth(units_dir)

    # Extract from TrollUnitFactory.wurst to get stats
    factory_file = units_dir / "TrollUnitFactory.wurst"

    factory_content = ""
    if factory_file.exists():
        try:
            with open(factory_file, "r", encoding="utf-8") as f:
                factory_content = f.read()
        except Exception as e:
            print(f"Error reading {factory_file}: {e}")

    # Use attribute_growth as the source of truth for which units exist
    print(f"Found {len(attribute_growth)} units with growth data")
    print(f"Found {len(unit_ids)} unit IDs in registry")

    for unit_id, growth in attribute_growth.items():
        # Don't require unit_id to be in unit_ids - growth data is authoritative

        unit_type = determine_unit_type(unit_id)

        # Extract stats from factory file
        stats = extract_unit_stats(unit_id, factory_content)

        # Generate name from unit ID
        name = unit_id.replace("UNIT_", "").replace("_", " ").title()

        unit_data = {
            "id": unit_id.lower().replace("unit_", "").replace("_", "-"),
            "unitId": unit_id,
            "name": name,
            "type": unit_type or "unknown",
            "growth": growth,
            **stats,
        }

        units.append(unit_data)

    return units


def build_units_output(units: List[Dict]) -> Dict:
    """Build the output structure for units JSON."""
    return {
        "units": units,
        "metadata": {
            "totalUnits": len(units),
            "extractedAt": time.time(),
        },
    }


def write_units_to_file(output_data: Dict, output_file: Path) -> None:
    """Write units data to JSON file."""
    import json

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)


def extract_and_write(
    output_file: Path | None = None,
    units_dir: Path | None = None,
    assets_dir: Path | None = None,
) -> List[Dict]:
    """Extract all units and write to file."""
    from common_paths import DATA_DIR

    if output_file is None:
        output_file = DATA_DIR / "units.json"

    print("Extracting units/trolls from game source...")

    units = extract_all_units(units_dir, assets_dir)
    output_data = build_units_output(units)

    write_units_to_file(output_data, output_file)

    print(f"Extracted {len(units)} units")
    print(f"Output written to: {output_file}")

    # Print summary by type
    by_type = {}
    for unit in units:
        unit_type = unit.get("type", "unknown")
        by_type[unit_type] = by_type.get(unit_type, 0) + 1

    print("\nUnits by type:")
    for unit_type, count in sorted(by_type.items()):
        print(f"  {unit_type}: {count}")

    return units


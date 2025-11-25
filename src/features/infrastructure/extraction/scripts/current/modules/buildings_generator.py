"""Generate buildings.ts from buildings.json."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, List

from common_paths import DATA_DIR, GUIDES_DATA_DIR


def format_building(building: Dict) -> str:
    """Format a building as TypeScript object."""
    lines = ["  {"]
    lines.append(f"    id: '{building['id']}',")
    name_escaped = building["name"].replace("'", "\\'")
    lines.append(f"    name: '{name_escaped}',")

    desc = building.get("description", "").replace("'", "\\'")
    lines.append(f"    description: '{desc}',")

    if building.get("hp") is not None:
        lines.append(f"    hp: {int(building['hp'])},")

    if building.get("armor") is not None:
        lines.append(f"    armor: {int(building['armor'])},")

    if building.get("craftableItems"):
        items = [f"'{item}'" for item in building["craftableItems"]]
        lines.append(f"    craftableItems: [")
        # Group items for readability
        for i in range(0, len(items), 4):
            chunk = items[i : i + 4]
            lines.append(f"      {', '.join(chunk)},")
        lines.append(f"    ],")

    if building.get("iconPath"):
        lines.append(f"    iconPath: '{building['iconPath']}',")

    lines.append("  },")
    return "\n".join(lines)


def load_buildings(buildings_json: Path) -> List[Dict]:
    """Load buildings from JSON file."""
    import json

    with open(buildings_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("buildings", [])


def generate_buildings_ts_content(buildings: List[Dict]) -> str:
    """Generate TypeScript content for buildings file."""
    content = """import type { ItemData } from '@/types/items';

export type BuildingData = {
  id: string;
  name: string;
  description: string;
  hp?: number;
  armor?: number;
  craftableItems?: string[];
  iconPath?: string;
};

// Building definitions extracted from game source
export const BUILDINGS: BuildingData[] = [
"""

    for building in buildings:
        content += format_building(building) + "\n"

    content += """];

export function getBuildingById(id: string): BuildingData | undefined {
  return BUILDINGS.find(b => b.id === id);
}

export function getBuildingsByCraftableItem(itemId: string): BuildingData[] {
  return BUILDINGS.filter(b => 
    b.craftableItems?.some(item => item.toLowerCase() === itemId.toLowerCase())
  );
}
"""
    return content


def write_buildings_ts(content: str, buildings_ts: Path) -> None:
    """Write buildings TypeScript file."""
    buildings_ts.parent.mkdir(parents=True, exist_ok=True)
    with open(buildings_ts, "w", encoding="utf-8") as f:
        f.write(content)


def generate_buildings(
    buildings_json: Path | None = None,
    buildings_ts: Path | None = None,
) -> List[Dict]:
    """Generate TypeScript buildings file from JSON."""
    if buildings_json is None:
        buildings_json = DATA_DIR / "buildings.json"
    if buildings_ts is None:
        buildings_ts = GUIDES_DATA_DIR / "buildings.ts"

    if not buildings_json.exists():
        raise FileNotFoundError(f"Buildings JSON not found: {buildings_json}")

    print("Loading buildings from JSON...")
    buildings = load_buildings(buildings_json)
    print(f"Loaded {len(buildings)} buildings")

    # Generate TypeScript
    content = generate_buildings_ts_content(buildings)
    write_buildings_ts(content, buildings_ts)

    print(f"\nCreated {buildings_ts}")
    print(f"Generated {len(buildings)} buildings")

    return buildings


def generate_and_write(
    buildings_json: Path | None = None,
    buildings_ts: Path | None = None,
) -> List[Dict]:
    """Generate buildings TypeScript file."""
    print("=" * 60)
    print("Generate Buildings from JSON")
    print("=" * 60)

    try:
        buildings = generate_buildings(buildings_json, buildings_ts)
        print("\n" + "=" * 60)
        print("Complete!")
        print("=" * 60)
        return buildings
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Run extract_buildings.py first")
        raise


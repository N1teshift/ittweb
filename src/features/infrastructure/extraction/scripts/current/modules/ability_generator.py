"""Generate TypeScript ability files from abilities.json."""

from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path
from typing import Dict, List

from common_paths import DATA_DIR, GUIDES_DATA_DIR


def clean_description(desc: str) -> str:
    """Clean description text."""
    if not desc:
        return desc
    desc = re.sub(r"\|c[0-9a-fA-F]{6}", "", desc)
    desc = re.sub(r"\|r", "", desc)
    desc = re.sub(r"\|n", " ", desc)
    desc = desc.strip()
    desc = re.sub(r"\s+", " ", desc)
    return desc


def escape_typescript_string(s: str) -> str:
    """Escape a string for use in TypeScript single-quoted string."""
    if not s:
        return s
    # Escape characters that need escaping in TypeScript strings
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
        elif ord(char) < 32 or ord(char) > 126:
            result.append(f"\\u{ord(char):04x}")
        else:
            result.append(char)
    return "".join(result)


def format_ability(ability: Dict) -> str:
    """Format an ability as TypeScript object."""
    lines = ["    {"]
    lines.append(f"      id: '{ability['id']}',")
    name_escaped = escape_typescript_string(ability["name"])
    lines.append(f"      name: '{name_escaped}',")
    lines.append(f"      category: '{ability['category']}',")

    if ability.get("classRequirement"):
        lines.append(f"      classRequirement: '{ability['classRequirement']}',")

    desc = clean_description(ability.get("description", ""))
    if desc:
        desc = escape_typescript_string(desc)
        lines.append(f"      description: '{desc}',")
    else:
        lines.append(f"      description: 'Ability extracted from game source.',")

    if ability.get("manaCost") is not None:
        lines.append(f"      manaCost: {int(ability['manaCost'])},")

    if ability.get("cooldown") is not None:
        lines.append(f"      cooldown: {float(ability['cooldown'])},")

    if ability.get("range") is not None:
        lines.append(f"      range: {int(ability['range'])},")

    if ability.get("duration") is not None:
        lines.append(f"      duration: {float(ability['duration'])},")

    if ability.get("damage"):
        damage_escaped = escape_typescript_string(str(ability["damage"]))
        lines.append(f"      damage: '{damage_escaped}',")

    if ability.get("effects"):
        effects_str = ", ".join([f"'{e}'" for e in ability["effects"]])
        lines.append(f"      effects: [{effects_str}],")

    lines.append("    },")
    return "\n".join(lines)


def create_types_file(abilities_dir: Path) -> None:
    """Create abilities.types.ts file."""
    types_content = """export type AbilityCategory = 
  | 'basic' 
  | 'hunter' 
  | 'beastmaster' 
  | 'mage' 
  | 'priest' 
  | 'thief' 
  | 'scout' 
  | 'gatherer' 
  | 'subclass' 
  | 'superclass' 
  | 'item'
  | 'building'
  | 'unknown';

export type AbilityData = {
  id: string;
  name: string;
  category: AbilityCategory;
  classRequirement?: string;
  description: string;
  manaCost?: number;
  cooldown?: number;
  range?: number;
  duration?: number;
  damage?: string;
  effects?: string[];
};
"""
    types_file = abilities_dir / "abilities.types.ts"
    with open(types_file, "w", encoding="utf-8") as f:
        f.write(types_content)
    print(f"Created {types_file.name}")


def create_category_files(categorized: Dict[str, List[Dict]], abilities_dir: Path) -> None:
    """Create category files."""
    for category, abilities in sorted(categorized.items()):
        category_file = abilities_dir / f"abilities.{category}.ts"

        content = "import type { AbilityData } from './abilities.types';\n\n"
        content += f"// {category.capitalize()} Abilities\n"
        content += f"export const {category.upper()}_ABILITIES: AbilityData[] = [\n"

        for ability in abilities:
            content += format_ability(ability) + "\n"

        content += "];\n"

        with open(category_file, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"Created {category_file.name} with {len(abilities)} abilities")


def create_index_file(categorized: Dict[str, List[Dict]], abilities_dir: Path, guides_data_dir: Path) -> None:
    """Create abilities.index.ts file."""
    content = "// Re-export types\n"
    content += "export type { AbilityCategory, AbilityData } from './abilities.types';\n\n"

    # Imports
    for category in sorted(categorized.keys()):
        content += f"import {{ {category.upper()}_ABILITIES }} from './abilities.{category}';\n"

    content += "\n// Combine all abilities\n"
    content += "export const ABILITIES: AbilityData[] = [\n"

    for category in sorted(categorized.keys()):
        content += f"  ...{category.upper()}_ABILITIES,\n"

    content += "];\n\n"

    # Helper exports
    content += """export const ABILITY_CATEGORIES: Record<AbilityCategory, string> = {
  basic: 'Basic Abilities',
  hunter: 'Hunter Abilities',
  beastmaster: 'Beastmaster Abilities',
  mage: 'Mage Abilities',
  priest: 'Priest Abilities',
  thief: 'Thief Abilities',
  scout: 'Scout Abilities',
  gatherer: 'Gatherer Abilities',
  subclass: 'Subclass Abilities',
  superclass: 'Superclass Abilities',
  item: 'Item Abilities',
  building: 'Building Abilities',
  unknown: 'Unknown Abilities'
};

export function getAbilitiesByCategory(category: AbilityCategory): AbilityData[] {
  return ABILITIES.filter(ability => ability.category === category);
}

export function getAbilitiesByClass(classSlug: string): AbilityData[] {
  return ABILITIES.filter(ability => ability.classRequirement === classSlug);
}

export function getAbilityById(id: string): AbilityData | undefined {
  return ABILITIES.find(ability => ability.id === id);
}

export function searchAbilities(query: string): AbilityData[] {
  const lowerQuery = query.toLowerCase();
  return ABILITIES.filter(ability => 
    ability.name.toLowerCase().includes(lowerQuery) ||
    ability.description.toLowerCase().includes(lowerQuery) ||
    ability.id.toLowerCase().includes(lowerQuery)
  );
}
"""

    index_file = abilities_dir / "abilities.index.ts"
    with open(index_file, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created {index_file.name}")

    # Create abilities.ts re-export file
    abilities_ts = guides_data_dir / "abilities.ts"
    abilities_ts_content = "// Re-export from abilities directory\nexport * from './abilities/abilities.index';\n"
    with open(abilities_ts, "w", encoding="utf-8") as f:
        f.write(abilities_ts_content)
    print(f"Created {abilities_ts.name}")


def load_abilities(abilities_json: Path) -> List[Dict]:
    """Load abilities from JSON file."""
    import json

    with open(abilities_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("abilities", [])


def categorize_abilities(abilities: List[Dict]) -> Dict[str, List[Dict]]:
    """Categorize abilities by their category field."""
    categorized = defaultdict(list)
    for ability in abilities:
        category = ability.get("category", "unknown")
        categorized[category].append(ability)
    return dict(categorized)


def generate_abilities(
    abilities_json: Path | None = None,
    abilities_dir: Path | None = None,
    guides_data_dir: Path | None = None,
) -> Dict[str, List[Dict]]:
    """Generate TypeScript ability files from JSON."""
    if abilities_json is None:
        abilities_json = DATA_DIR / "abilities.json"
    if abilities_dir is None:
        abilities_dir = GUIDES_DATA_DIR / "abilities"
    if guides_data_dir is None:
        guides_data_dir = GUIDES_DATA_DIR

    if not abilities_json.exists():
        raise FileNotFoundError(f"Abilities JSON not found: {abilities_json}")

    print("Loading abilities from JSON...")
    abilities = load_abilities(abilities_json)
    print(f"Loaded {len(abilities)} abilities")

    # Categorize
    categorized = categorize_abilities(abilities)
    print(f"\nCategorized into {len(categorized)} categories:")
    for cat, abils in sorted(categorized.items()):
        print(f"  {cat}: {len(abils)} abilities")

    # Create directory
    abilities_dir.mkdir(parents=True, exist_ok=True)

    # Create files
    print("\nCreating TypeScript files...")
    create_types_file(abilities_dir)
    create_category_files(categorized, abilities_dir)
    create_index_file(categorized, abilities_dir, guides_data_dir)

    return categorized


def generate_and_write(
    abilities_json: Path | None = None,
    abilities_dir: Path | None = None,
    guides_data_dir: Path | None = None,
) -> Dict[str, List[Dict]]:
    """Generate abilities and write TypeScript files."""
    print("=" * 60)
    print("Generate Abilities from JSON")
    print("=" * 60)

    try:
        categorized = generate_abilities(abilities_json, abilities_dir, guides_data_dir)
        print("\n" + "=" * 60)
        print("Complete!")
        print("=" * 60)
        return categorized
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Run extract_abilities_from_wurst.py first")
        raise


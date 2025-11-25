"""Generate classes.ts and derivedClasses.ts from units.json."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Tuple

from common_paths import DATA_DIR, GUIDES_DATA_DIR

# Base class slugs
BASE_CLASSES = ["hunter", "beastmaster", "mage", "priest", "thief", "scout", "gatherer"]

# Known relationships (will need to be extracted or manually maintained)
CLASS_RELATIONSHIPS = {
    "hunter": {
        "subclasses": ["warrior", "tracker"],
        "superclasses": ["juggernaut"],
    },
    "beastmaster": {
        "subclasses": ["druid", "shapeshifter-wolf", "shapeshifter-bear", "shapeshifter-panther", "shapeshifter-tiger", "dire-wolf", "dire-bear"],
        "superclasses": ["jungle-tyrant"],
    },
    "mage": {
        "subclasses": ["elementalist", "hypnotist", "dreamwalker"],
        "superclasses": ["dementia-master"],
    },
    "priest": {
        "subclasses": ["booster", "master-healer"],
        "superclasses": ["sage"],
    },
    "thief": {
        "subclasses": ["rogue", "telethief", "escape-artist", "contortionist"],
        "superclasses": ["assassin"],
    },
    "scout": {
        "subclasses": ["observer", "trapper"],
        "superclasses": ["spy"],
    },
    "gatherer": {
        "subclasses": ["radar-gatherer", "herb-master", "alchemist"],
        "superclasses": ["omnigatherer"],
    },
}


def format_base_class(unit: Dict, relationships: Dict[str, Dict] | None = None) -> str:
    """Format a base class as TypeScript object."""
    if relationships is None:
        relationships = CLASS_RELATIONSHIPS

    slug = unit["id"]
    name = unit["name"]
    growth = unit.get("growth", {})

    # Get relationships
    rels = relationships.get(slug, {})
    subclasses = rels.get("subclasses", [])
    superclasses = rels.get("superclasses", [])

    lines = ["  {"]
    lines.append(f"    slug: '{slug}',")
    lines.append(f"    name: '{name}',")
    lines.append(f"    summary: 'Extracted from game source.',")

    if subclasses:
        subclasses_str = ", ".join([f"'{s}'" for s in subclasses])
        lines.append(f"    subclasses: [{subclasses_str}],")
    else:
        lines.append(f"    subclasses: [],")

    if superclasses:
        superclasses_str = ", ".join([f"'{s}'" for s in superclasses])
        lines.append(f"    superclasses: [{superclasses_str}],")

    lines.append(
        f"    growth: {{ strength: {growth.get('strength', 1.0)}, agility: {growth.get('agility', 1.0)}, intelligence: {growth.get('intelligence', 1.0)} }},"
    )
    lines.append(f"    baseAttackSpeed: {unit.get('baseAttackSpeed', 1.8)},")
    lines.append(f"    baseMoveSpeed: {unit.get('baseMoveSpeed', 300)},")
    lines.append(f"    baseHp: {unit.get('baseHp', 192)},")
    lines.append(f"    baseMana: {unit.get('baseMana', 192)},")
    lines.append("  },")

    return "\n".join(lines)


def format_derived_class(unit: Dict, parent_slug: str, class_type: str) -> str:
    """Format a derived class as TypeScript object."""
    slug = unit["id"]
    name = unit["name"]
    growth = unit.get("growth", {})

    lines = ["  {"]
    lines.append(f"    slug: '{slug}',")
    lines.append(f"    name: '{name}',")
    lines.append(f"    parentSlug: '{parent_slug}',")
    lines.append(f"    type: '{class_type}',")
    lines.append(f"    summary: 'Extracted from game source.',")

    lines.append(
        f"    growth: {{ strength: {growth.get('strength', 1.0)}, agility: {growth.get('agility', 1.0)}, intelligence: {growth.get('intelligence', 1.0)} }},"
    )
    lines.append(f"    baseAttackSpeed: {unit.get('baseAttackSpeed', 1.8)},")
    lines.append(f"    baseMoveSpeed: {unit.get('baseMoveSpeed', 300)},")
    lines.append(f"    baseHp: {unit.get('baseHp', 192)},")
    lines.append(f"    baseMana: {unit.get('baseMana', 192)},")
    lines.append("  },")

    return "\n".join(lines)


def determine_parent_and_type(unit_id: str, base_classes: List[str] | None = None, relationships: Dict[str, Dict] | None = None) -> Tuple[str | None, str | None]:
    """Determine parent class and type (sub/super) from unit ID."""
    if base_classes is None:
        base_classes = BASE_CLASSES
    if relationships is None:
        relationships = CLASS_RELATIONSHIPS

    unit_lower = unit_id.lower()

    # Check if it's a base class
    if unit_lower in base_classes:
        return None, "base"

    # Check relationships
    for parent, rels in relationships.items():
        if unit_lower in rels.get("subclasses", []):
            return parent, "sub"
        if unit_lower in rels.get("superclasses", []):
            return parent, "super"

    return None, None


def load_units(units_json: Path) -> List[Dict]:
    """Load units from JSON file."""
    import json

    with open(units_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("units", [])


def separate_classes(units: List[Dict], base_classes: List[str] | None = None, relationships: Dict[str, Dict] | None = None) -> Tuple[List[Dict], List[Dict]]:
    """Separate units into base classes and derived classes."""
    base_class_list = []
    derived_class_list = []

    for unit in units:
        unit_id = unit.get("id", "")
        parent, class_type = determine_parent_and_type(unit_id, base_classes, relationships)

        if class_type == "base":
            base_class_list.append(unit)
        elif parent:
            unit["parentSlug"] = parent
            unit["type"] = class_type
            derived_class_list.append(unit)

    return base_class_list, derived_class_list


def generate_classes_ts_content(base_classes: List[Dict], relationships: Dict[str, Dict] | None = None) -> str:
    """Generate TypeScript content for classes.ts file."""
    if relationships is None:
        relationships = CLASS_RELATIONSHIPS

    content = """export type TrollClassData = {
  slug: string;
  name: string;
  summary: string;
  // Optional explicit icon path, e.g. "/icons/itt/trolls/btnorcwarlock.png"
  iconSrc?: string;
  subclasses: string[];
  superclasses?: string[];
  tips?: string[];
  growth: { strength: number; agility: number; intelligence: number };
  baseAttackSpeed: number;
  baseMoveSpeed: number;
  baseHp: number;
  baseMana: number;
};

export const BASE_TROLL_CLASSES: TrollClassData[] = [
"""

    for unit in base_classes:
        content += format_base_class(unit, relationships) + "\n"

    content += """];

// Helper functions
export function getClassBySlug(slug: string): TrollClassData | undefined {
  return BASE_TROLL_CLASSES.find(cls => cls.slug === slug);
}

export const BASE_TROLL_CLASS_SLUGS = BASE_TROLL_CLASSES.map(cls => cls.slug);
"""
    return content


def generate_derived_classes_ts_content(derived_classes: List[Dict]) -> str:
    """Generate TypeScript content for derivedClasses.ts file."""
    content = """export type DerivedClassType = 'sub' | 'super';

export type DerivedClassData = {
  slug: string;
  name: string;
  parentSlug: string; // base class slug
  type: DerivedClassType;
  summary: string;
  // Optional explicit icon path, e.g. "/icons/itt/trolls/btnorcwarlock.png"
  iconSrc?: string;
  tips?: string[];
  growth: { strength: number; agility: number; intelligence: number };
  baseAttackSpeed: number;
  baseMoveSpeed: number;
  baseHp: number;
  baseMana: number;
};

export const DERIVED_CLASSES: DerivedClassData[] = [
"""

    for unit in derived_classes:
        parent = unit.get("parentSlug", "")
        class_type = unit.get("type", "sub")
        content += format_derived_class(unit, parent, class_type) + "\n"

    content += """];

export const SUBCLASS_SLUGS = DERIVED_CLASSES.filter(c => c.type === 'sub').map(c => c.slug);
export const SUPERCLASS_SLUGS = DERIVED_CLASSES.filter(c => c.type === 'super').map(c => c.slug);

export function getDerivedBySlug(slug: string): DerivedClassData | undefined {
  return DERIVED_CLASSES.find(c => c.slug === slug);
}

export function getSubclassesByParentSlug(parentSlug: string): DerivedClassData[] {
  return DERIVED_CLASSES.filter(c => c.parentSlug === parentSlug && c.type === 'sub');
}

export function getSupersByParentSlug(parentSlug: string): DerivedClassData[] {
  return DERIVED_CLASSES.filter(c => c.parentSlug === parentSlug && c.type === 'super');
}
"""
    return content


def write_classes_files(classes_content: str, derived_content: str, classes_ts: Path, derived_classes_ts: Path) -> None:
    """Write classes TypeScript files."""
    classes_ts.parent.mkdir(parents=True, exist_ok=True)
    with open(classes_ts, "w", encoding="utf-8") as f:
        f.write(classes_content)

    derived_classes_ts.parent.mkdir(parents=True, exist_ok=True)
    with open(derived_classes_ts, "w", encoding="utf-8") as f:
        f.write(derived_content)


def generate_classes(
    units_json: Path | None = None,
    classes_ts: Path | None = None,
    derived_classes_ts: Path | None = None,
    base_classes: List[str] | None = None,
    relationships: Dict[str, Dict] | None = None,
) -> Tuple[List[Dict], List[Dict]]:
    """Generate TypeScript class files from units JSON."""
    if units_json is None:
        units_json = DATA_DIR / "units.json"
    if classes_ts is None:
        classes_ts = GUIDES_DATA_DIR / "classes.ts"
    if derived_classes_ts is None:
        derived_classes_ts = GUIDES_DATA_DIR / "derivedClasses.ts"

    if not units_json.exists():
        raise FileNotFoundError(f"Units JSON not found: {units_json}")

    print("Loading units from JSON...")
    units = load_units(units_json)
    print(f"Loaded {len(units)} units")

    # Separate base classes and derived classes
    base_class_list, derived_class_list = separate_classes(units, base_classes, relationships)

    print(f"\nFound {len(base_class_list)} base classes")
    print(f"Found {len(derived_class_list)} derived classes")

    # Generate TypeScript content
    classes_content = generate_classes_ts_content(base_class_list, relationships)
    derived_content = generate_derived_classes_ts_content(derived_class_list)

    # Write files
    write_classes_files(classes_content, derived_content, classes_ts, derived_classes_ts)

    print(f"\nCreated {classes_ts}")
    print(f"Created {derived_classes_ts}")

    return base_class_list, derived_class_list


def generate_and_write(
    units_json: Path | None = None,
    classes_ts: Path | None = None,
    derived_classes_ts: Path | None = None,
) -> Tuple[List[Dict], List[Dict]]:
    """Generate classes TypeScript files."""
    print("=" * 60)
    print("Generate Classes from JSON")
    print("=" * 60)

    try:
        base_classes, derived_classes = generate_classes(units_json, classes_ts, derived_classes_ts)
        print("\n" + "=" * 60)
        print("Complete!")
        print("=" * 60)
        print("\n[NOTE] Class relationships (subclasses/superclasses) are hardcoded.")
        print("   You may need to update CLASS_RELATIONSHIPS in this script if relationships change.")
        return base_classes, derived_classes
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Run extract_units.py first")
        raise


"""Reusable helpers for extracting abilities."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence

from common_paths import DATA_DIR, REPO_ROOT, WURST_DIR

ABILITIES_DIR = WURST_DIR / "objects" / "abilities"
ABILITY_DESCRIPTIONS_JSON = DATA_DIR / "ability_descriptions.json"
DEFAULT_OUTPUT_FILE = DATA_DIR / "abilities.json"


def normalize_id(name: str) -> str:
    if name.startswith("ABILITY_"):
        name = name[8:]
    return name.lower().replace("_", "-")


def determine_category(file_path: Path, ability_id: str) -> str:
    path_str = str(file_path).lower()
    ability_lower = ability_id.lower()

    mappings = [
        (["hunter", "warrior", "tracker"], "hunter", {"juggernaut": "superclass", "warrior": "subclass", "tracker": "subclass"}),
        (["beastmaster", "druid", "shapeshifter"], "beastmaster", {"jungle": "superclass", "ultimate": "superclass", "druid": "subclass", "shapeshifter": "subclass"}),
        (["mage", "elementalist", "hypnotist"], "mage", {"dementia": "superclass", "elementalist": "subclass", "hypnotist": "subclass", "dreamwalker": "subclass"}),
        (["priest", "booster", "masterhealer"], "priest", {"sage": "superclass", "booster": "subclass", "masterhealer": "subclass"}),
        (["thief", "rogue", "telethief"], "thief", {"assassin": "superclass", "rogue": "subclass", "telethief": "subclass", "contortionist": "subclass"}),
        (["scout", "observer", "trapper"], "scout", {"spy": "superclass", "observer": "subclass", "trapper": "subclass"}),
        (["gatherer", "alchemist", "herb"], "gatherer", {"omni": "superclass", "alchemist": "subclass", "herb": "subclass", "radar": "subclass"}),
    ]

    for keywords, base_value, overrides in mappings:
        if any(word in path_str for word in keywords):
            for needle, value in overrides.items():
                if needle in path_str:
                    return value
            return base_value

    if "building" in path_str:
        return "building"
    if "item" in path_str or "spellbook" in path_str:
        return "item"
    if any(term in ability_lower for term in ("sleep", "eat", "hibernate")):
        return "basic"
    return "unknown"


def _clean_tooltip(text: Optional[str]) -> Optional[str]:
    if not text:
        return None
    cleaned = re.sub(r"\|c[0-9a-fA-F]{6}", "", text)
    cleaned = re.sub(r"\|r", "", cleaned)
    cleaned = re.sub(r"\|n", " ", cleaned)
    cleaned = cleaned.replace("\n", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned or None


def load_ability_descriptions(path: Path = ABILITY_DESCRIPTIONS_JSON) -> Dict[str, Dict]:
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as fh:
        raw = json.load(fh)
    return {value.get("id", key): value for key, value in raw.items()}


def extract_ability_from_file(file_path: Path, descriptions: Dict[str, Dict]) -> List[Dict]:
    abilities: List[Dict] = []
    try:
        content = file_path.read_text(encoding="utf-8")
    except OSError as exc:
        print(f"Error processing {file_path}: {exc}")
        return abilities

    def _match(pattern: str, cast):
        match = re.search(pattern, content)
        return cast(match.group(1)) if match else None

    cooldown = _match(r"let\s+COOLDOWN\s*=\s*([0-9.]+)", float)
    mana_cost = _match(r"let\s+MANACOST\s*=\s*(\d+)", int)
    duration = _match(r"let\s+DURATION\s*=\s*([0-9.]+)", float)
    tooltip_norm = _match(r'let\s+TOOLTIP_NORM\s*=\s*["\']([^"\']+)["\']', str)

    tooltip_extended = None
    extended_match = re.search(r'let\s+TOOLTIP_EXTENDED\s*=\s*["\']([^"\']*(?:\n[^"\']*)*?)["\']', content, re.MULTILINE | re.DOTALL)
    if extended_match:
        tooltip_extended = extended_match.group(1).strip()
    else:
        concat_match = re.search(r'let\s+TOOLTIP_EXTENDED\s*=\s*([^=]+?)(?:\.format\(|\.toToolTip|$)', content, re.MULTILINE | re.DOTALL)
        if concat_match:
            strings = re.findall(r'["\']([^"\']*(?:\\.[^"\']*)*)["\']', concat_match.group(1))
            if strings:
                tooltip_extended = " ".join(strings).strip()
    if tooltip_extended:
        tooltip_extended = tooltip_extended.replace("\\n", "\n")

    ability_ids = re.findall(r"new\s+\w+\((\w+)\s*[,)]", content)
    ability_consts = re.findall(r"ABILITY_([A-Z_]+)", content)
    combined_ids = set(ability_ids + [f"ABILITY_{const}" for const in ability_consts if const not in ("ID_GEN", "QM_")])
    if not combined_ids:
        stem = file_path.stem
        if stem not in {"abilities", "AutoSkill", "BossAbilities"}:
            combined_ids = {stem.upper().replace("-", "_")}

    for ability_const in combined_ids:
        ability_id = normalize_id(ability_const)
        description = None
        if ability_id in descriptions:
            description = descriptions[ability_id].get("description", "")
        elif tooltip_extended:
            description = _clean_tooltip(tooltip_extended)
        elif tooltip_norm:
            description = _clean_tooltip(tooltip_norm)

        try:
            relative_path = file_path.relative_to(REPO_ROOT)
        except ValueError:
            relative_path = file_path

        ability_data = {
            "id": ability_id,
            "name": tooltip_norm or ability_id.replace("-", " ").title(),
            "category": determine_category(file_path, ability_id),
            "description": description or "Ability extracted from game source.",
            "filePath": str(relative_path),
        }

        if mana_cost is not None:
            ability_data["manaCost"] = mana_cost
        if cooldown is not None:
            ability_data["cooldown"] = cooldown
        if duration is not None:
            ability_data["duration"] = duration

        abilities.append(ability_data)

    return abilities


def collect_ability_files(directory: Path = ABILITIES_DIR) -> List[Path]:
    if not directory.exists():
        return []
    return [
        path
        for path in directory.rglob("*.wurst")
        if path.name not in {"abilities.wurst", "AutoSkill.wurst", "BossAbilities.wurst"}
    ]


def extract_abilities(
    ability_files: Optional[Sequence[Path]] = None,
    descriptions: Optional[Dict[str, Dict]] = None,
) -> List[Dict]:
    ability_files = ability_files or collect_ability_files()
    descriptions = descriptions or load_ability_descriptions()

    collected: List[Dict] = []
    for file_path in ability_files:
        collected.extend(extract_ability_from_file(file_path, descriptions))

    unique: Dict[str, Dict] = {}
    for ability in collected:
        unique.setdefault(ability["id"], ability)
    return list(unique.values())


def build_ability_output(abilities: Sequence[Dict]) -> Dict:
    category_counts = Counter(ability.get("category", "unknown") for ability in abilities)
    return {
        "abilities": list(abilities),
        "metadata": {
            "totalAbilities": len(abilities),
            "categoryCounts": dict(sorted(category_counts.items())),
        },
    }


def write_abilities_to_file(output: Dict, destination: Path = DEFAULT_OUTPUT_FILE) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with open(destination, "w", encoding="utf-8") as fh:
        json.dump(output, fh, indent=2, ensure_ascii=False)


def extract_and_write(destination: Path = DEFAULT_OUTPUT_FILE) -> Dict:
    abilities = extract_abilities()
    output = build_ability_output(abilities)
    write_abilities_to_file(output, destination)
    return output


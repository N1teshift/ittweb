"""Helpers for scraping ability descriptions from wurst files."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, Iterable, Optional

from common_paths import DATA_DIR, REPO_ROOT, WURST_DIR

ABILITIES_DIR = WURST_DIR / "objects" / "abilities"
DEFAULT_OUTPUT_FILE = DATA_DIR / "ability_descriptions.json"


def normalize_id(name: str) -> str:
    cleaned = re.sub(r"\.color\([^)]+\)", "", name)
    cleaned = re.sub(r"\.format\([^)]+\)", "", cleaned)
    cleaned = re.sub(r"\.toToolTip[^()]+\(\)", "", cleaned)
    cleaned = cleaned.lower().replace(" ", "-").replace("_", "-")
    cleaned = re.sub(r"[^a-z0-9-]", "", cleaned)
    return cleaned


def extract_tooltip_variables(content: str) -> Dict[str, str]:
    tooltips: Dict[str, str] = {}
    norm_match = re.search(r'let\s+TOOLTIP_NORM\s*=\s*["\']([^"\']+)["\']', content)
    if norm_match:
        tooltips["norm"] = norm_match.group(1)

    extended_pattern = r'let\s+TOOLTIP_EXTENDED\s*=\s*["\']([^"\']*(?:\n[^"\']*)*?)["\']'
    extended_match = re.search(extended_pattern, content, re.MULTILINE | re.DOTALL)
    if extended_match:
        tooltips["extended"] = extended_match.group(1).strip()
    else:
        extended_concat = re.search(r'let\s+TOOLTIP_EXTENDED\s*=\s*([^=]+?)(?:\n\s*\.format\(|$)', content, re.MULTILINE | re.DOTALL)
        if extended_concat:
            text = extended_concat.group(1)
            text = re.sub(r"\.format\([^)]+\)", "", text)
            text = re.sub(r"\.color\([^)]+\)", "", text)
            text = re.sub(r"\.toToolTip[^()]+\(\)", "", text)
            strings = re.findall(r'["\']([^"\']+)["\']', text)
            if strings:
                tooltips["extended"] = " ".join(strings)
    return tooltips


def extract_ability_id_from_content(content: str, fallback: str) -> str:
    ability_id_matches = re.findall(r"ABILITY_([A-Z_]+)", content)
    for match in ability_id_matches:
        if match not in {"ID_GEN", "QM_", "TRACKER", "MAGE", "PRIEST"}:
            return match.lower().replace("_", "-")

    new_match = re.search(r"new\s+\w+\(ABILITY_([A-Z_]+)", content)
    if new_match:
        return new_match.group(1).lower().replace("_", "-")

    return fallback.lower().replace("_", "-")


def clean_tooltip(text: str) -> str:
    text = re.sub(r"\.color\([^)]+\)", "", text)
    text = re.sub(r"\{(\d+)\}", r"{\1}", text)
    text = re.sub(r"\.format\([^)]+\)", "", text)
    text = re.sub(r"\.toToolTip[^()]+\(\)", "", text)
    text = " ".join(text.split())
    return text.strip(" .")


def load_wurst_content(file_path: Path) -> Optional[str]:
    try:
        return file_path.read_text(encoding="utf-8")
    except OSError as exc:
        print(f"Error processing {file_path}: {exc}")
        return None


def extract_description_from_file(file_path: Path) -> Optional[Dict]:
    content = load_wurst_content(file_path)
    if not content:
        return None

    tooltips = extract_tooltip_variables(content)
    if not tooltips:
        return None

    ability_id = extract_ability_id_from_content(content, file_path.stem)
    description = tooltips.get("extended") or tooltips.get("norm", "")
    description = clean_tooltip(description)
    if not description:
        return None

    try:
        relative_file = file_path.relative_to(REPO_ROOT)
    except ValueError:
        relative_file = file_path

    return {
        "id": ability_id,
        "description": description,
        "file": str(relative_file),
    }


def extract_descriptions_from_directory(directory: Path = ABILITIES_DIR) -> Dict[str, Dict]:
    if not directory.exists():
        print(f"Abilities directory not found: {directory}")
        return {}

    descriptions: Dict[str, Dict] = {}
    for file_path in directory.rglob("*.wurst"):
        result = extract_description_from_file(file_path)
        if result:
            descriptions[result["id"]] = result

    return descriptions


def write_descriptions_to_file(descriptions: Dict[str, Dict], destination: Path = DEFAULT_OUTPUT_FILE) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with open(destination, "w", encoding="utf-8") as fh:
        json.dump(descriptions, fh, indent=2, ensure_ascii=False)


"""Shared path utilities for the extraction toolchain."""

from __future__ import annotations

from pathlib import Path


def find_repo_root() -> Path:
    """Ascend directories until we find the repo root (package.json sentinel)."""
    current = Path(__file__).resolve()
    for parent in [current, *current.parents]:
        if (parent / "package.json").exists():
            return parent
    raise RuntimeError("Could not locate repository root from current script location.")


REPO_ROOT = find_repo_root()
SRC_DIR = REPO_ROOT / "src"
FEATURES_DIR = SRC_DIR / "features"
INFRASTRUCTURE_DIR = FEATURES_DIR / "infrastructure"
EXTRACTION_DIR = INFRASTRUCTURE_DIR / "extraction"
SCRIPTS_DIR = EXTRACTION_DIR / "scripts" / "current"
DATA_DIR = EXTRACTION_DIR / "data"
DOCS_DIR = EXTRACTION_DIR / "docs"

EXTERNAL_ROOT = REPO_ROOT / "external"
ITT_DIR = EXTERNAL_ROOT / "island_troll_tribes"
WURST_DIR = ITT_DIR / "wurst"

GUIDES_DATA_DIR = FEATURES_DIR / "ittweb" / "guides" / "data"


def ensure_dir(path: Path) -> Path:
    """Create directory if it does not exist and return the path."""
    path.mkdir(parents=True, exist_ok=True)
    return path


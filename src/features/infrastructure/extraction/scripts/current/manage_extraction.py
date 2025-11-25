#!/usr/bin/env python3
"""
Unified CLI for the Island Troll Tribes extraction toolkit.

Examples:
    python manage_extraction.py extract
    python manage_extraction.py generate --only abilities classes
    python manage_extraction.py pipeline --skip-reset
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from dataclasses import dataclass
from typing import Iterable, List, Sequence

from common_paths import REPO_ROOT, SCRIPTS_DIR
from modules.ability_extractor import extract_and_write
from modules.ability_generator import generate_and_write as generate_abilities
from modules.buildings_extractor import extract_and_write as extract_buildings
from modules.buildings_generator import generate_and_write as generate_buildings
from modules.classes_generator import generate_and_write as generate_classes
from modules.base_items_generator import generate_and_write as generate_base_items
from modules.description_extractor import extract_descriptions_from_directory, write_descriptions_to_file
from modules.external_items_generator import generate_and_write as generate_external_items
from modules.items_ts_generator import generate_and_write as generate_items_ts
from modules.item_stats_extractor import extract_and_write as extract_item_stats
from modules.recipes_extractor import extract_and_write as extract_recipes
from modules.units_extractor import extract_and_write as extract_units


@dataclass(frozen=True)
class Step:
    key: str
    script: str
    description: str


EXTRACT_STEPS: Sequence[Step] = [
    Step("ability_descriptions", "extract_ability_descriptions.py", "Extract ability descriptions"),
    Step("abilities", "extract_abilities_from_wurst.py", "Extract abilities from wurst"),
    Step("item_stats", "extract_item_stats.py", "Extract item stats"),
    Step("buildings", "extract_buildings.py", "Extract buildings"),
    Step("units", "extract_units.py", "Extract units/trolls"),
    Step("recipes", "extract_recipes.py", "Extract recipes"),
]

GENERATE_STEPS: Sequence[Step] = [
    Step("base_items", "generate_base_items_from_recipes.py", "Generate base item files"),
    Step("abilities", "generate_abilities_from_json.py", "Generate ability files"),
    Step("buildings", "generate_buildings_from_json.py", "Generate buildings.ts"),
    Step("classes", "generate_classes_from_json.py", "Generate class files"),
    Step("external_items", "generate_external_items_from_recipes.py", "Generate items.external.ts"),
    Step("items_ts", "generate_items_ts.py", "Generate aggregated items.ts"),
]

INTEGRATION_STEPS: Sequence[Step] = [
    Step("integrate", "integrate_all_data.py", "Integrate descriptions and stats"),
]

VALIDATION_STEPS: Sequence[Step] = [
    Step("validate_outputs", "validate_outputs.py", "Validate extracted JSON outputs"),
]

RESET_STEP = Step("reset", "reset_all_data.py", "Reset generated assets")
FULL_PIPELINE = EXTRACT_STEPS + GENERATE_STEPS + INTEGRATION_STEPS + VALIDATION_STEPS


STEP_DISPATCH = {
    # Extraction steps
    ("extract_abilities_from_wurst.py",): lambda: extract_and_write(),
    ("extract_ability_descriptions.py",): lambda: write_descriptions_to_file(extract_descriptions_from_directory()),
    ("extract_item_stats.py",): lambda: extract_item_stats(),
    ("extract_buildings.py",): lambda: extract_buildings(),
    ("extract_units.py",): lambda: extract_units(),
    ("extract_recipes.py",): lambda: extract_recipes(),
    # Generation steps
    ("generate_abilities_from_json.py",): lambda: generate_abilities(),
    ("generate_buildings_from_json.py",): lambda: generate_buildings(),
    ("generate_classes_from_json.py",): lambda: generate_classes(),
    ("generate_external_items_from_recipes.py",): lambda: generate_external_items(),
    ("generate_base_items_from_recipes.py",): lambda: generate_base_items(),
    ("generate_items_ts.py",): lambda: generate_items_ts(),
}


def run_step(step: Step, extra_args: Iterable[str] | None = None) -> bool:
    """Execute a script and stream its output."""
    script_key = (step.script,)
    if script_key in STEP_DISPATCH and not extra_args:
        print("\n" + "=" * 80)
        print(step.description)
        print("=" * 80)
        try:
            STEP_DISPATCH[script_key]()
        except Exception as exc:  # pylint: disable=broad-except
            print(f"[FAIL] {step.key}: {exc}")
            return False
        print(f"[OK] {step.key}")
        return True

    cmd = [sys.executable, str(SCRIPTS_DIR / step.script)]
    if extra_args:
        cmd.extend(extra_args)

    print("\n" + "=" * 80)
    print(step.description)
    print("=" * 80)

    try:
        result = subprocess.run(cmd, cwd=REPO_ROOT, check=False)
    except FileNotFoundError:
        print(f"[ERROR] Script not found: {step.script}")
        return False

    if result.returncode == 0:
        print(f"[OK] {step.key}")
        return True

    print(f"[FAIL] {step.key} (exit code {result.returncode})")
    return False


def run_group(steps: Sequence[Step], selected_keys: Sequence[str] | None, extra_args: Iterable[str] | None) -> bool:
    """Run a subset of steps, preserving order."""
    lookup = {step.key: step for step in steps}
    order = [lookup[key] for key in selected_keys] if selected_keys else list(steps)

    success = True
    for step in order:
        success &= run_step(step, extra_args=extra_args)
    return success


def print_available_steps():
    def fmt_block(title: str, steps: Sequence[Step]):
        print(f"\n{title}:")
        for step in steps:
            print(f"  - {step.key:20s} -> {step.script}")

    fmt_block("Extraction", EXTRACT_STEPS)
    fmt_block("Generation", GENERATE_STEPS)
    fmt_block("Integration", INTEGRATION_STEPS)
    fmt_block("Validation", VALIDATION_STEPS)
    print(f"\nReset:\n  - {RESET_STEP.key:20s} -> {RESET_STEP.script}")


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Manage data extraction pipeline.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    def add_common(subparser: argparse.ArgumentParser):
        subparser.add_argument(
            "--only",
            nargs="+",
            help="Limit execution to specific step keys (see `list` command).",
        )
        subparser.add_argument(
            "--pass-arg",
            dest="pass_args",
            action="append",
            default=[],
            help="Additional argument forwarded to each script (can repeat).",
        )

    extract_parser = subparsers.add_parser("extract", help="Run extraction scripts.")
    add_common(extract_parser)

    generate_parser = subparsers.add_parser("generate", help="Run generation scripts.")
    add_common(generate_parser)

    integrate_parser = subparsers.add_parser("integrate", help="Run integration scripts.")
    add_common(integrate_parser)

    validate_parser = subparsers.add_parser("validate", help="Run validation scripts.")
    add_common(validate_parser)

    reset_parser = subparsers.add_parser("reset", help="Reset generated artifacts.")
    reset_parser.add_argument("--yes", action="store_true", help="Auto-confirm reset prompt.")

    pipeline_parser = subparsers.add_parser("pipeline", help="Run reset + extract + generate + integrate.")
    pipeline_parser.add_argument("--skip-reset", action="store_true", help="Do not run the reset step.")

    subparsers.add_parser("list", help="List available steps.")

    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])

    if args.command == "list":
        print_available_steps()
        return 0

    if args.command == "reset":
        extra = args.yes and ["--yes"] or []
        return 0 if run_step(RESET_STEP, extra) else 1

    if args.command == "extract":
        return 0 if run_group(EXTRACT_STEPS, args.only, args.pass_args) else 1

    if args.command == "generate":
        return 0 if run_group(GENERATE_STEPS, args.only, args.pass_args) else 1

    if args.command == "integrate":
        return 0 if run_group(INTEGRATION_STEPS, args.only, args.pass_args) else 1

    if args.command == "validate":
        return 0 if run_group(VALIDATION_STEPS, args.only, args.pass_args) else 1

    if args.command == "pipeline":
        success = True
        if not args.skip_reset:
            success &= run_step(RESET_STEP, extra_args=["--yes"])
        success &= run_group(EXTRACT_STEPS, None, None)
        success &= run_group(GENERATE_STEPS, None, None)
        success &= run_group(INTEGRATION_STEPS, None, None)
        success &= run_group(VALIDATION_STEPS, None, None)
        return 0 if success else 1

    raise ValueError(f"Unhandled command {args.command}")


if __name__ == "__main__":
    raise SystemExit(main())


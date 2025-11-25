#!/usr/bin/env python3
"""
Extract ability definitions directly from wurst source files.
This creates abilities.json which can then be used to generate TypeScript files.
"""

from common_paths import DATA_DIR
from modules.ability_extractor import (
    build_ability_output,
    collect_ability_files,
    extract_abilities,
    load_ability_descriptions,
    write_abilities_to_file,
)

OUTPUT_FILE = DATA_DIR / "abilities.json"


def main():
    print("Extracting abilities from wurst source files...")

    files = collect_ability_files()
    if not files:
        print("No ability files found – ensure the wurst directory is available.")
        return

    print(f"Scanning {len(files)} ability files...")
    descriptions = load_ability_descriptions()
    abilities = extract_abilities(files, descriptions)
    output_data = build_ability_output(abilities)
    write_abilities_to_file(output_data, OUTPUT_FILE)

    print(f"\nExtracted {output_data['metadata']['totalAbilities']} unique abilities")
    print(f"Output written to: {OUTPUT_FILE}")

    print("\nAbilities by category:")
    for cat, count in output_data["metadata"]["categoryCounts"].items():
        print(f"  {cat}: {count}")

if __name__ == '__main__':
    main()


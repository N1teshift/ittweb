#!/usr/bin/env python3
"""
Extract ability descriptions/tooltips from WurstScript ability files.
Looks for TOOLTIP_NORM, TOOLTIP_EXTENDED, and setTooltip* calls.
"""

from modules.description_extractor import (
    extract_descriptions_from_directory,
    write_descriptions_to_file,
)


def main():
    print("Extracting ability descriptions from game source...")
    descriptions = extract_descriptions_from_directory()
    print(f"\nExtracted {len(descriptions)} ability descriptions")
    write_descriptions_to_file(descriptions)

    if descriptions:
        print("\nSample descriptions:")
        for ability_id, data in list(descriptions.items())[:5]:
            print(f"  {ability_id}: {data['description'][:80]}...")


if __name__ == '__main__':
    main()



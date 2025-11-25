#!/usr/bin/env python3
"""
Generate base item files (raw-materials, weapons, armor, etc.) from recipes.json.
This creates the base item files that were manually curated before.
"""

from modules.base_items_generator import generate_and_write

if __name__ == "__main__":
    generate_and_write()

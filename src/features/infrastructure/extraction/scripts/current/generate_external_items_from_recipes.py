#!/usr/bin/env python3
"""
Generate items.external.ts from recipes.json.
Extracts all items that appear in recipes but aren't in base items.
"""

from modules.external_items_generator import generate_and_write

if __name__ == "__main__":
    generate_and_write()

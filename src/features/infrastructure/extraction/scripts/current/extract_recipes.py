#!/usr/bin/env python3
"""
Extract all item recipes from WurstScript source files.
Outputs a JSON file with all recipes that can be used on the website.
"""

from modules.recipes_extractor import extract_and_write

if __name__ == "__main__":
    extract_and_write()

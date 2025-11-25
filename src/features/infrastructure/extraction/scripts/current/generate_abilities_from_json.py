#!/usr/bin/env python3
"""
Generate TypeScript ability files from abilities.json.
Creates the abilities/ directory structure with category files.
"""

from modules.ability_generator import generate_and_write

if __name__ == "__main__":
    generate_and_write()

#!/usr/bin/env python3
"""
Generate classes.ts and derivedClasses.ts from units.json.
"""

from modules.classes_generator import generate_and_write

if __name__ == "__main__":
    generate_and_write()

#!/usr/bin/env python3
"""
Extract all troll/unit definitions from WurstScript game source code.
"""

from modules.units_extractor import extract_and_write

if __name__ == "__main__":
    extract_and_write()

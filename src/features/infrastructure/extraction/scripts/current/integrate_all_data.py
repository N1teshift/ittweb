#!/usr/bin/env python3
"""
Script to integrate extracted data into TypeScript files:
1. Integrate ability descriptions from ability_descriptions.json
2. Integrate item stats from item_stats.json
3. Update ability files with real descriptions
"""

import json
import re
from pathlib import Path

from common_paths import DATA_DIR, GUIDES_DATA_DIR

# Paths
ABILITIES_DIR = GUIDES_DATA_DIR / "abilities"
ABILITY_DESCRIPTIONS_JSON = DATA_DIR / "ability_descriptions.json"
ITEM_STATS_JSON = DATA_DIR / "item_stats.json"
ARMOR_TS = GUIDES_DATA_DIR / "items.armor.ts"
WEAPONS_TS = GUIDES_DATA_DIR / "items.weapons.ts"

def clean_description(desc: str) -> str:
    """Clean description text - remove color codes, format placeholders"""
    if not desc:
        return desc
    
    # Remove Warcraft 3 color codes like |cff, |r, etc.
    desc = re.sub(r'\|c[0-9a-fA-F]{6}', '', desc)
    desc = re.sub(r'\|r', '', desc)
    desc = re.sub(r'\|n', ' ', desc)
    
    # Clean up extra whitespace
    desc = desc.strip()
    desc = re.sub(r'\s+', ' ', desc)
    
    return desc

def escape_typescript_string(s: str) -> str:
    """Escape a string for use in TypeScript single-quoted string."""
    if not s:
        return s
    result = []
    for char in s:
        if char == '\\':
            result.append('\\\\')
        elif char == "'":
            result.append("\\'")
        elif char == '\n':
            result.append('\\n')
        elif char == '\r':
            result.append('\\r')
        elif char == '\t':
            result.append('\\t')
        else:
            result.append(char)
    return ''.join(result)

def integrate_ability_descriptions():
    """Integrate ability descriptions from JSON into ability category files"""
    print("Loading ability descriptions...")
    if not ABILITY_DESCRIPTIONS_JSON.exists():
        print("Ability descriptions JSON not found - skipping")
        return
    
    with open(ABILITY_DESCRIPTIONS_JSON, 'r', encoding='utf-8') as f:
        descriptions = json.load(f)
    
    print(f"Found {len(descriptions)} ability descriptions")
    
    # Check if abilities directory exists
    if not ABILITIES_DIR.exists():
        print("Abilities directory not found - skipping ability description integration")
        print("(Descriptions should already be in generated files)")
        return
    
    # Get all ability category files
    ability_files = list(ABILITIES_DIR.glob("abilities.*.ts"))
    if not ability_files:
        print("No ability category files found - skipping")
        return
    
    print(f"Found {len(ability_files)} ability category files to update")
    
    # Create mapping of ability ID to description
    desc_map = {}
    for key, value in descriptions.items():
        ability_id = value.get('id', key)
        desc = value.get('description', '')
        if desc:
            desc_map[ability_id] = clean_description(desc)
    
    # Process each ability category file
    total_updated = 0
    for ability_file in ability_files:
        if ability_file.name in ['abilities.index.ts', 'abilities.types.ts']:
            continue  # Skip index and types files
        
        with open(ability_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        updated_count = 0
        
        # Pattern to match ability objects with placeholder descriptions
        pattern = r"(id:\s*['\"])([^'\"]+)(['\"][^}]*?description:\s*['\"])([^'\"]*?)(ability extracted from game source\.?)(['\"])"
        
        def replace_description(match):
            nonlocal updated_count
            prefix = match.group(1) + match.group(2) + match.group(3)
            ability_id = match.group(2)
            suffix = match.group(6)
            
            # Check if we have a description for this ability
            if ability_id in desc_map:
                new_desc = escape_typescript_string(desc_map[ability_id])
                updated_count += 1
                return prefix + new_desc + suffix
            return match.group(0)
        
        # Replace placeholder descriptions
        new_content = re.sub(pattern, replace_description, content, flags=re.DOTALL | re.IGNORECASE)
        
        if new_content != original_content:
            with open(ability_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            total_updated += updated_count
            print(f"  Updated {updated_count} abilities in {ability_file.name}")
    
    if total_updated > 0:
        print(f"Updated {total_updated} ability descriptions total")
    else:
        print("No descriptions updated (might need manual review)")

def integrate_item_stats():
    """Integrate item stats from JSON into item TypeScript files"""
    print("\nLoading item stats...")
    if not ITEM_STATS_JSON.exists():
        print("Item stats JSON not found - skipping")
        return
    
    with open(ITEM_STATS_JSON, 'r', encoding='utf-8') as f:
        stats = json.load(f)
    
    print(f"Found {len(stats)} item stat entries")
    
    # Process armor items
    if ARMOR_TS.exists():
        print("Processing armor items...")
        with open(ARMOR_TS, 'r', encoding='utf-8') as f:
            armor_content = f.read()
        
        updated_armor = 0
        
        # Find items and update stats
        # Pattern: id: 'item-id', ... (look for items that need stats)
        for item_id, item_stats in stats.items():
            # Normalize item ID
            normalized_id = item_id.replace('_', '-').lower()
            
            # Check if item exists in armor file
            if normalized_id in armor_content:
                # Try to find the item block and add/update stats
                # This is a simplified approach - might need refinement
                pattern = rf"(id:\s*['\"]{re.escape(normalized_id)}['\"][^}}]*?)(\n\s*\}})"
                
                def add_stats(match):
                    nonlocal updated_armor
                    item_block = match.group(1)
                    closing = match.group(2)
                    
                    # Check if stats already exist
                    if 'damage:' in item_block or 'armor:' in item_block:
                        # Stats already present, skip
                        return match.group(0)
                    
                    # Add stats before closing brace
                    stats_lines = []
                    if 'damage' in item_stats:
                        stats_lines.append(f"    damage: {item_stats['damage']},")
                    if 'armor' in item_stats:
                        stats_lines.append(f"    armor: {item_stats['armor']},")
                    if 'strength' in item_stats:
                        stats_lines.append(f"    strength: {item_stats['strength']},")
                    if 'agility' in item_stats:
                        stats_lines.append(f"    agility: {item_stats['agility']},")
                    if 'intelligence' in item_stats:
                        stats_lines.append(f"    intelligence: {item_stats['intelligence']},")
                    
                    if stats_lines:
                        updated_armor += 1
                        return item_block + '\n' + '\n'.join(stats_lines) + closing
                    
                    return match.group(0)
                
                armor_content = re.sub(pattern, add_stats, armor_content, flags=re.DOTALL)
        
        if updated_armor > 0:
            with open(ARMOR_TS, 'w', encoding='utf-8') as f:
                f.write(armor_content)
            print(f"Updated {updated_armor} armor items with stats")
        else:
            print("No armor items updated")
    else:
        print("Armor file not found - skipping")
    
    # Process weapon items
    if WEAPONS_TS.exists():
        print("Processing weapon items...")
        with open(WEAPONS_TS, 'r', encoding='utf-8') as f:
            weapons_content = f.read()
        
        updated_weapons = 0
        
        for item_id, item_stats in stats.items():
            normalized_id = item_id.replace('_', '-').lower()
            
            if normalized_id in weapons_content:
                pattern = rf"(id:\s*['\"]{re.escape(normalized_id)}['\"][^}}]*?)(\n\s*\}})"
                
                def add_stats(match):
                    nonlocal updated_weapons
                    item_block = match.group(1)
                    closing = match.group(2)
                    
                    if 'damage:' in item_block:
                        return match.group(0)
                    
                    stats_lines = []
                    if 'damage' in item_stats:
                        stats_lines.append(f"    damage: {item_stats['damage']},")
                    
                    if stats_lines:
                        updated_weapons += 1
                        return item_block + '\n' + '\n'.join(stats_lines) + closing
                    
                    return match.group(0)
                
                weapons_content = re.sub(pattern, add_stats, weapons_content, flags=re.DOTALL)
        
        if updated_weapons > 0:
            with open(WEAPONS_TS, 'w', encoding='utf-8') as f:
                f.write(weapons_content)
            print(f"Updated {updated_weapons} weapon items with stats")
        else:
            print("No weapon items updated")
    else:
        print("Weapons file not found - skipping")

def main():
    print("=" * 60)
    print("Integrating Extracted Data")
    print("=" * 60)
    
    integrate_ability_descriptions()
    integrate_item_stats()
    
    print()
    print("=" * 60)
    print("Integration complete!")
    print("=" * 60)

if __name__ == '__main__':
    main()

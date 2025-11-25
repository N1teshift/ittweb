#!/usr/bin/env python3
"""
Extract all building definitions from WurstScript game source code.
"""

from modules.buildings_extractor import extract_and_write

if __name__ == "__main__":
    extract_and_write()

def extract_unit_ids() -> Dict[str, str]:
    """Extract all UNIT_* constants from LocalObjectIDs files."""
    unit_ids = {}
    
    for obj_file in [ASSETS_DIR / "LocalObjectIDs.wurst", ASSETS_DIR / "LocalObjectIDs2.wurst"]:
        if not obj_file.exists():
            continue
            
        with open(obj_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Match: public let UNIT_XXX = ... registerObjectID("UNIT_XXX")
        pattern = r'public\s+let\s+(UNIT_\w+)\s*=\s*[^.]*\.\.registerObjectID\(["\'](UNIT_\w+)["\']\)'
        matches = re.findall(pattern, content)
        
        for match in matches:
            const_name = match[0]
            registered_name = match[1]
            unit_ids[const_name] = registered_name
    
    return unit_ids

def extract_building_from_file(file_path: Path, unit_ids: Dict[str, str]) -> List[Dict]:
    """Extract building definitions from a file."""
    buildings = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for building creation patterns
        # Pattern: createBuilding(UNIT_XXX) or createXXX() returns BuildingDefinition
        building_patterns = [
            r'createBuilding\((\w+)\)',
            r'function\s+create(\w+)\([^)]*\)\s+returns\s+BuildingDefinition',
            r'UNIT_(\w+)\s*=\s*compiletime',
        ]
        
        # Extract building unit IDs
        found_units = set()
        for pattern in building_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if match.startswith('UNIT_'):
                    found_units.add(match)
                else:
                    # Try to construct UNIT_ name
                    unit_name = f"UNIT_{match.upper()}"
                    if unit_name in unit_ids:
                        found_units.add(unit_name)
        
        # Extract properties from building definitions
        for unit_id in found_units:
            # Extract name
            name_pattern = rf'{re.escape(unit_id)}[^.]*\.\.setName\(["\']([^"\']+)["\']\)'
            name_match = re.search(name_pattern, content)
            name = name_match.group(1) if name_match else unit_id.replace('UNIT_', '').replace('_', ' ').title()
            
            # Extract tooltip/description
            tooltip_pattern = rf'{re.escape(unit_id)}[^.]*\.\.setTooltip(?:Basic|Extended)\(["\']([^"\']+)["\']\)'
            tooltip_match = re.search(tooltip_pattern, content)
            description = tooltip_match.group(1) if tooltip_match else ''
            
            # Extract HP
            hp_pattern = rf'{re.escape(unit_id)}[^.]*\.\.setHitPointsMaximumBase\((\d+)\)'
            hp_match = re.search(hp_pattern, content)
            hp = int(hp_match.group(1)) if hp_match else None
            
            # Extract armor
            armor_pattern = rf'{re.escape(unit_id)}[^.]*\.\.setDefenseBase\((\d+)\)'
            armor_match = re.search(armor_pattern, content)
            armor = int(armor_match.group(1)) if armor_match else None
            
            building_data = {
                'id': unit_id.lower().replace('unit_', '').replace('_', '-'),
                'unitId': unit_id,
                'name': name,
                'description': description,
                'hp': hp,
                'armor': armor,
                'filePath': str(file_path.relative_to(REPO_ROOT)),
            }
            
            buildings.append(building_data)
    
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    
    return buildings

def extract_craftable_items() -> Dict[str, List[str]]:
    """Extract which items can be crafted at which buildings from crafting system."""
    craftable_items = {}
    
    # Look in crafting system files
    crafting_dir = WURST_DIR / "systems" / "craftingV2"
    
    if not crafting_dir.exists():
        return craftable_items
    
    # Map unit requirements to building names
    unit_to_building = {
        'UNIT_ARMORY': 'armory',
        'UNIT_FORGE': 'forge',
        'UNIT_WORKSHOP': 'workshop',
        'UNIT_TANNERY': 'tannery',
        'UNIT_WITCH_DOCTORS_HUT': 'witch-doctors-hut',
        'UNIT_MIXING_POT': 'mixing-pot',
    }
    
    for file in crafting_dir.glob('*.wurst'):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find UNIT_REQUIREMENT
            unit_req_match = re.search(r'let\s+UNIT_REQUIREMENT\s*=\s*(\w+)', content)
            if not unit_req_match:
                continue
            
            unit_req = unit_req_match.group(1)
            building_name = unit_to_building.get(unit_req)
            
            if not building_name:
                continue
            
            # Find all items crafted here (setItemRecipe calls)
            recipe_pattern = r'\.\.setItemRecipe\((\w+)(?:,\s*\w+)*\)'
            recipe_matches = re.findall(recipe_pattern, content)
            
            for match in recipe_matches:
                # First item is the result
                items = [item.strip() for item in match.split(',')]
                if items:
                    result_item = items[0]
                    if building_name not in craftable_items:
                        craftable_items[building_name] = []
                    craftable_items[building_name].append(result_item)
        
        except Exception as e:
            print(f"Error reading {file}: {e}")
    
    return craftable_items

def extract_all_buildings() -> List[Dict]:
    """Extract all building definitions."""
    buildings = []
    unit_ids = extract_unit_ids()
    
    # Extract from building definition files
    if BUILDINGS_DIR.exists():
        for file in BUILDINGS_DIR.glob('*.wurst'):
            extracted = extract_building_from_file(file, unit_ids)
            buildings.extend(extracted)
    
    # Extract craftable items
    craftable_items = extract_craftable_items()
    
    # Merge craftable items into building data
    for building in buildings:
        building_id = building['id']
        if building_id in craftable_items:
            building['craftableItems'] = craftable_items[building_id]
    
    return buildings

def main():
    print("Extracting buildings from game source...")
    
    buildings = extract_all_buildings()
    
    # Create output structure
    output = {
        'buildings': buildings,
        'metadata': {
            'totalBuildings': len(buildings),
            'extractedAt': time.time(),
        }
    }
    
    # Write to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(buildings)} buildings")
    print(f"Output written to: {OUTPUT_FILE}")
    
    # Print summary
    print("\nBuildings found:")
    for building in buildings:
        print(f"  - {building['name']} ({building['id']})")

if __name__ == '__main__':
    main()


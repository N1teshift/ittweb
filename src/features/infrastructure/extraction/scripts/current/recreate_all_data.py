#!/usr/bin/env python3
"""
Master script to recreate all data from game source.
Runs all extraction scripts in order, then generates TypeScript files.
"""

import subprocess
import sys

from common_paths import REPO_ROOT, SCRIPTS_DIR as CURRENT_SCRIPTS_DIR

ROOT = REPO_ROOT
SCRIPTS_DIR = CURRENT_SCRIPTS_DIR

def run_script(script_name: str, description: str):
    """Run a Python script and report results."""
    print(f"\n{'=' * 60}")
    print(f"{description}")
    print(f"{'=' * 60}")
    
    script_path = SCRIPTS_DIR / script_name
    
    if not script_path.exists():
        print(f"  ❌ Script not found: {script_name}")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=ROOT,
            capture_output=False,
            text=True
        )
        
        if result.returncode == 0:
            print(f"  [OK] {description} - SUCCESS")
            return True
        else:
            print(f"  [FAIL] {description} - FAILED (exit code {result.returncode})")
            return False
    except Exception as e:
        print(f"  [ERROR] {description} - ERROR: {e}")
        return False

def main():
    import sys
    
    print("=" * 60)
    print("RECREATE ALL DATA FROM GAME SOURCE")
    print("=" * 60)
    print()
    print("This will:")
    print("  1. Extract all data from wurst source files")
    print("  2. Generate TypeScript files from extracted JSON")
    print("  3. Integrate descriptions and stats")
    print()
    
    # Check for --yes flag
    skip_prompt = '--yes' in sys.argv or '-y' in sys.argv
    
    if not skip_prompt:
        response = input("Continue? (yes/no): ")
        if response.lower() not in ['yes', 'y']:
            print("Cancelled.")
            return
    else:
        print("Auto-confirming (--yes flag provided)")
    
    print()
    print("Starting extraction and generation process...")
    print()
    
    results = {}
    
    # Phase 1: Extract data from wurst files
    print("\n" + "=" * 60)
    print("PHASE 1: EXTRACT DATA FROM WURST FILES")
    print("=" * 60)
    
    results['extract_ability_descriptions'] = run_script(
        'extract_ability_descriptions.py',
        'Extracting ability descriptions'
    )
    
    results['extract_item_stats'] = run_script(
        'extract_item_stats.py',
        'Extracting item stats'
    )
    
    results['extract_buildings'] = run_script(
        'extract_buildings.py',
        'Extracting buildings'
    )
    
    results['extract_units'] = run_script(
        'extract_units.py',
        'Extracting units/trolls'
    )
    
    results['extract_recipes'] = run_script(
        'extract_recipes.py',
        'Extracting recipes'
    )
    
    # Phase 2: Generate TypeScript files
    print("\n" + "=" * 60)
    print("PHASE 2: GENERATE TYPESCRIPT FILES")
    print("=" * 60)
    
    results['generate_base_items'] = run_script(
        'generate_base_items_from_recipes.py',
        'Generating base item files'
    )
    
    results['extract_abilities_from_wurst'] = run_script(
        'extract_abilities_from_wurst.py',
        'Extracting abilities from wurst files'
    )
    
    results['generate_abilities'] = run_script(
        'generate_abilities_from_json.py',
        'Generating ability TypeScript files'
    )
    
    results['generate_buildings'] = run_script(
        'generate_buildings_from_json.py',
        'Generating buildings.ts'
    )
    
    results['generate_classes'] = run_script(
        'generate_classes_from_json.py',
        'Generating classes.ts and derivedClasses.ts'
    )
    
    results['generate_external_items'] = run_script(
        'generate_external_items_from_recipes.py',
        'Generating items.external.ts'
    )
    
    results['generate_items_ts'] = run_script(
        'generate_items_ts.py',
        'Generating items.ts (combines all items)'
    )
    
    # Phase 3: Integrate additional data
    print("\n" + "=" * 60)
    print("PHASE 3: INTEGRATE DESCRIPTIONS AND STATS")
    print("=" * 60)
    
    results['integrate_data'] = run_script(
        'integrate_all_data.py',
        'Integrating descriptions and stats'
    )
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    success_count = sum(1 for v in results.values() if v)
    total_count = len(results)
    
    for name, success in results.items():
        status = "[OK]" if success else "[FAIL]"
        print(f"  {status} {name}")
    
    print()
    print(f"Completed: {success_count}/{total_count} steps")
    
    if success_count == total_count:
        print("\n[SUCCESS] All steps completed successfully!")
        print("\nNext steps:")
        print("   1. Review the generated files")
        print("   2. Check for any missing data")
        print("   3. Run integration scripts to add descriptions/stats")
    else:
        print("\n[WARNING] Some steps failed. Check the output above for details.")
    
    print()

if __name__ == '__main__':
    main()


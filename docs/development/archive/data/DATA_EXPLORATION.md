# Data Exploration

**Date**: 2025-12-02  
**Summary**: Historical data exploration and extraction implementation summaries

## Overview

This document summarizes data exploration efforts, particularly around extracting and processing game data from Warcraft 3 map files and Wurst source code.

## Ability Data Extraction

### Enhanced war3map.w3a Extraction

**Script**: `extract-from-w3x.mjs`

**New Fields Extracted**:
- `areaOfEffect` (AOE) - from field `aare`
- `maxTargets` - from field `acap`
- `hotkey` - from field `ahky`
- `targetsAllowed` - from field `atar`
- `castTime` - from field `acat`
- `attachmentPoints` - visual effect attachment points
- `attachmentTarget` - target attachment point
- `levels` - level-specific data for all ability levels (not just level 0)

**Level-Specific Data**:
Now extracts data for all levels (0, 1, 2, etc.) for:
- Damage
- Mana cost
- Cooldown
- Duration
- Range
- Area of effect

### Wurst Source File Parser

**Script**: `extract-ability-details-from-wurst.mjs`

**Purpose**: Parses Wurst ability definition files to extract:
- Damage, mana cost, cooldown values (from constants)
- Area of effect, max targets
- Hotkeys, target types
- Visual effects (missile art, attachment points)
- Button positions

**Output**: `tmp/work-data/metadata/ability-details-wurst.json`

### Ability Relationships Extractor

**Script**: `extract-ability-relationships.mjs`

**Purpose**: Parses `TrollUnitTextConstant.wurst` to extract:
- Which classes get which abilities (HERO_SPELLS_*, NORMAL_SPELLS_*)
- Spellbook contents
- Ability inheritance chains

**Output**: `tmp/work-data/metadata/ability-relationships.json`

### Enhanced Ability Converter

**Script**: `ability-converter.mjs`

**Updates**:
- Includes all new fields in conversion
- Safely parses numeric values
- Handles level-specific data
- Merges data from multiple sources

## Item Data Exploration

### Item Data Extraction

**Purpose**: Extract and process item data from game files

**Key Areas**:
- Item properties
- Item relationships
- Item usage patterns
- Item statistics

**Implementation**: Similar patterns to ability data extraction

## Implementation Summary

### Data Extraction Pipeline

1. **Extract from game files** (war3map.w3x)
   - Parse binary map files
   - Extract structured data
   - Handle different data types

2. **Extract from source code** (Wurst files)
   - Parse source code files
   - Extract constants and definitions
   - Identify relationships

3. **Merge and convert**
   - Combine data from multiple sources
   - Convert to project data format
   - Validate and clean data

### Refactoring Plans

**Purpose**: Improve data extraction and processing

**Key Areas**:
- Code organization
- Error handling
- Data validation
- Performance optimization

## Current State

Data exploration efforts have resulted in:
- ✅ Comprehensive ability data extraction
- ✅ Item data extraction
- ✅ Relationship mapping
- ✅ Data conversion pipelines

## Lessons Learned

1. **Multiple data sources**: Combining data from binary files and source code provides comprehensive information
2. **Level-specific data**: Extracting data for all ability levels is important for accurate representation
3. **Relationship mapping**: Understanding relationships between entities (classes, abilities, items) is crucial
4. **Data validation**: Proper validation ensures data quality

## Related Documentation

- Guides data: `src/features/modules/guides/data/`
- Data processing scripts: `scripts/` (if applicable)


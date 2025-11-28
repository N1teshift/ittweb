# Data Pipeline Documentation

Complete documentation for the Island Troll Tribes data generation pipeline. This pipeline extracts game data from Warcraft III map files and converts it into TypeScript data files for the application.

## Quick Start

**To run the pipeline:**
```bash
node scripts/data/main.mjs
```

**For operational guide:**
→ See [`scripts/README.md`](../../../scripts/README.md) - Quick start and stage-by-stage commands

## Essential Documentation

- **[architecture.md](./architecture.md)** – High-level architecture, data flow diagrams, and component overview
- **[schemas.md](./schemas.md)** – Complete documentation of all data structures (Items, Abilities, Units)
- **[troubleshooting.md](./troubleshooting.md)** – Common errors, debugging procedures, and validation steps

## Specialized Guides

Located in [`guides/`](./guides/):

- **[icon-mapping.md](./guides/icon-mapping.md)** – Icon workflow end-to-end
- **[extract-w3x.md](./guides/extract-w3x.md)** – How to extract data from `.w3x` map files
- **[field-references.md](./guides/field-references.md)** – Glossary of tooltip/field references
- **[icon-extraction-list.md](./guides/icon-extraction-list.md)** – Generated list of icons to extract
- **[ability-field-identifiers.md](./guides/ability-field-identifiers.md)** – Field identifier meanings and mappings

## Pipeline Overview

The pipeline consists of 11 stages:

1. **Extract** - Parse war3map files from `external/Work/`
2. **Metadata** - Build derived metadata (units, buildings, recipes)
3. **Ability Details** - Extract from Wurst source
4. **Relationships** - Extract ability-to-class mappings
5. **Item Details** - Extract item properties
5.5. **Ability ID Mapping** - Generate ability ID mappings
5.6. **Extract Ability Codes** - Parse ability codes from items
6. **Convert** - Generate TypeScript data files
7. **Icon Map** - Generate icon mapping
8. **Fix Paths** - Validate and fix icon paths
9. **Resolve References** - Resolve field references in tooltips

## Key Resources

### Operational
- **Main README:** [`scripts/README.md`](../../../scripts/README.md) - Commands and quick reference
- **Refactoring Status:** [`scripts/data/REFACTORING_PLAN.md`](../../../scripts/data/REFACTORING_PLAN.md)

### Reference
- **System Overview:** [`docs/systems/README.md`](../README.md)

## Folder Structure

```
docs/systems/data-pipeline/
├── README.md                 # This file (index)
├── architecture.md           # High-level architecture and data flow
├── schemas.md                # Complete data structure documentation
├── troubleshooting.md        # Common errors and debugging guide
├── guides/                   # Specialized guides
│   ├── icon-mapping.md
│   ├── extract-w3x.md
│   ├── field-references.md
│   ├── icon-extraction-list.md
│   └── ability-field-identifiers.md
└── archive/                  # Historical documentation
    ├── refactoring-proposal.md
    ├── script-analysis.md
    └── ...
```

## Related Documentation

- [Pipeline Architecture](./architecture.md) - Understanding the pipeline flow
- [Data Schemas](./schemas.md) - Expected data structures
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions


# ⚠️ Documentation Moved

**This folder has been reorganized.**

All data pipeline documentation has been moved to:

→ **[`docs/systems/data-pipeline/`](../data-pipeline/README.md)**

## New Location

- **Main Documentation:** [`docs/systems/data-pipeline/README.md`](../data-pipeline/README.md)
- **Essential Docs:** Architecture, schemas, troubleshooting in `docs/systems/data-pipeline/`
- **Specialized Guides:** `docs/systems/data-pipeline/guides/`
- **Archive:** `docs/systems/data-pipeline/archive/`

## Quick Links

- [Complete Documentation Index](../data-pipeline/README.md)
- [Pipeline Architecture](../data-pipeline/architecture.md)
- [Data Schemas](../data-pipeline/schemas.md)
- [Troubleshooting](../data-pipeline/troubleshooting.md)

---

_This redirect will remain for backwards compatibility. All new references should point to `docs/systems/data-pipeline/`._

## Current References

- **Pipeline operations:** [`../../../scripts/README.md`](../../../scripts/README.md) – canonical quick start + stage-by-stage guide.
- **Refactoring status & backlog:** [`../../../scripts/data/REFACTORING_PLAN.md`](../../../scripts/data/REFACTORING_PLAN.md).
- **Global documentation index:** [`../README.md`](../README.md).

## Active Guides

### Essential Documentation

- **[PIPELINE_ARCHITECTURE.md](./PIPELINE_ARCHITECTURE.md)** – High-level architecture, data flow, and component overview.
- **[DATA_SCHEMAS.md](./DATA_SCHEMAS.md)** – Complete documentation of all data structures and schemas.
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** – Common errors, debugging procedures, and validation steps.

### Specialized Guides

- **[icon-mapping.md](./icon-mapping.md)** – explains the icon workflow end-to-end.
- **[extract-w3x.md](./extract-w3x.md)** – how to pull data from `.w3x` map files.
- **[field-references.md](./field-references.md)** – glossary of tooltip/field references.
- **[icon-extraction-list.md](./icon-extraction-list.md)** – generated list of icons to grab next.
- **[ability-field-identifiers.md](./ability-field-identifiers.md)** – field identifier meanings and mappings.

## Historical / Archive

These are still valuable for context, but the actionable pieces have been folded into the refactoring plan.

- **[archive/refactoring-proposal.md](./archive/refactoring-proposal.md)** – original monolithic vs modular proposal.
- **[archive/script-analysis.md](./archive/script-analysis.md)** – first-pass structure audit.
- **[archive/reorganization-summary.md](./archive/reorganization-summary.md)** – notes from the initial cleanup.
- **[archive/documentation-reorganization.md](./archive/documentation-reorganization.md)** – details on the previous doc shuffle.

## Folder Structure

```
docs/systems/scripts/
├── overview.md               # This file (index)
├── PIPELINE_ARCHITECTURE.md  # High-level architecture and data flow
├── DATA_SCHEMAS.md           # Complete data structure documentation
├── TROUBLESHOOTING.md        # Common errors and debugging guide
├── icon-mapping.md           # Icon workflow guide
├── extract-w3x.md            # .w3x file extraction guide
├── field-references.md       # Field reference glossary
├── icon-extraction-list.md   # Icon extraction checklist
├── ability-field-identifiers.md  # Field identifier mappings
└── archive/
    ├── documentation-reorganization.md
    ├── refactoring-proposal.md
    ├── reorganization-summary.md
    └── script-analysis.md
```

## Quick Navigation

**Need to...**

- **Run the pipeline?** → Start at [`scripts/README.md`](../../../scripts/README.md)
- **Understand the architecture?** → Read [`PIPELINE_ARCHITECTURE.md`](./PIPELINE_ARCHITECTURE.md)
- **Check data structures?** → See [`DATA_SCHEMAS.md`](./DATA_SCHEMAS.md)
- **Debug an error?** → Check [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)
- **Understand historical decisions?** → Browse the `archive/` folder

_Need to regenerate data? Start at `../../../scripts/README.md`. Need to understand why something was built the way it was? The guides and archival docs here have your back._

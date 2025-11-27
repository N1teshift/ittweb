# Scripts Documentation

This folder now focuses on deep dives and historical background for the pipeline that lives in `scripts/data/`. Use the resources below depending on whether you need to **run the pipeline**, **refactor it**, or **research past decisions**.

## Current References

- **Pipeline operations:** [`../../scripts/README.md`](../../scripts/README.md) – canonical quick start + stage-by-stage guide.
- **Refactoring status & backlog:** [`../../scripts/data/REFACTORING_PLAN.md`](../../scripts/data/REFACTORING_PLAN.md).
- **Global documentation index:** [`../README.md`](../README.md).

## Active Guides

- **[icon-mapping.md](./icon-mapping.md)** – explains the icon workflow end-to-end.
- **[extract-w3x.md](./extract-w3x.md)** – how to pull data from `.w3x` map files.
- **[field-references.md](./field-references.md)** – glossary of tooltip/field references.
- **[icon-extraction-list.md](./icon-extraction-list.md)** – generated list of icons to grab next.

## Historical / Archive

These are still valuable for context, but the actionable pieces have been folded into the refactoring plan.

- **[archive/refactoring-proposal.md](./archive/refactoring-proposal.md)** – original monolithic vs modular proposal.
- **[archive/script-analysis.md](./archive/script-analysis.md)** – first-pass structure audit.
- **[archive/reorganization-summary.md](./archive/reorganization-summary.md)** – notes from the initial cleanup.
- **[archive/documentation-reorganization.md](./archive/documentation-reorganization.md)** – details on the previous doc shuffle.

## Folder Structure

```
docs/systems/scripts/
├── overview.md               # This file
├── icon-mapping.md
├── extract-w3x.md
├── field-references.md
├── icon-extraction-list.md
└── archive/
    ├── documentation-reorganization.md
    ├── refactoring-proposal.md
    ├── reorganization-summary.md
    └── script-analysis.md
```

_Need to regenerate data? Start at `../../scripts/README.md`. Need to understand why something was built the way it was? The guides and archival docs here have your back._

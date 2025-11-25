# Extraction Docs

This folder complements the main process guide at `src/features/infrastructure/extraction/PROCESS.md`.

## What lives here

- `PROCESS.md` (same directory) — source of truth for the unified pipeline, CLI usage, validation, and testing.
- `README.md` (this file) — lightweight orientation plus links to the rest of the documentation set.
- `docs/features/extraction/archive/` — repository-level archive containing every historical status/progress report. These files moved out of `src/features/infrastructure/extraction/docs/` to reduce noise but remain available for reference.

## Current workflow (TL;DR)

```powershell
# Inspect available steps
python src/features/infrastructure/extraction/scripts/current/manage_extraction.py list

# Run the full pipeline (reset → extract → generate → integrate → validate)
python src/features/infrastructure/extraction/scripts/current/manage_extraction.py pipeline

# Quickly re-run extraction only
python src/features/infrastructure/extraction/scripts/current/manage_extraction.py extract

# Skip the reset step when you trust the JSON artifacts
python src/features/infrastructure/extraction/scripts/current/manage_extraction.py pipeline --skip-reset

# npm shortcut (runs the same pipeline command)
npm run extract:data
```

All extraction and generation logic now lives under `scripts/current/` and the reusable modules in `scripts/current/modules/`. Each script delegates to a module, which keeps the CLI fast and easier to test.

## Directory structure

```
extraction/
├── data/        # JSON + generated TS outputs
├── scripts/
│   └── current/
│       ├── manage_extraction.py
│       ├── modules/
│       └── tests/
├── PROCESS.md   # Master documentation
└── README.md    # Orientation (this file)

docs/
└── features/
    └── extraction/
        └── archive/  # Frozen legacy reports
```

## When to look in `docs/features/extraction/archive/`

Only if you need historical context such as the old “Action Plan”, “Data Completeness Report”, or similar narratives. None of those files reflect the current modular pipeline; they are stored strictly for posterity.

If you discover information in the archive that still matters today, migrate it into `PROCESS.md` (or a new focused doc) and then annotate the archive entry so future readers know it has been superseded.


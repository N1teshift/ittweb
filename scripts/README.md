# Scripts Directory

The `scripts/` folder hosts the end-to-end data regeneration pipeline for Island Troll Tribes. Everything you need to extract Warcraft III data, convert it to TypeScript, and rebuild the icon map lives in `scripts/data/`.

## Pipeline at a Glance

| Stage | Script | Purpose | Output |
| --- | --- | --- | --- |
| 1. Extract | `extract-from-w3x.mjs` | Parse `war3map.*` files from `external/Work/` | Raw JSON in `tmp/work-data/raw/` |
| 2. Metadata | `extract-metadata.mjs` | Build derived metadata (units/buildings/recipes) straight from extracted data + `war3map.j` | JSON in `tmp/work-data/metadata/` |
| 3. Convert | `convert-extracted-to-typescript.mjs` | Generate typed data consumed by the app | `src/features/modules/guides/data/**` |
| 4. Icon map | `regenerate-iconmap.mjs` | Produce `iconMap.ts` from PNG assets + generated data | `src/features/modules/guides/data/iconMap.ts` |

All stages can be orchestrated with one command:

```bash
node scripts/data/generate-from-work.mjs
```

## Running Individual Stages

Each script is standalone and can be executed directly when you need to re-run only one portion of the pipeline:

```bash
node scripts/data/extract-from-w3x.mjs
node scripts/data/extract-metadata.mjs
node scripts/data/convert-extracted-to-typescript.mjs
node scripts/data/regenerate-iconmap.mjs
```

When debugging, re-run the downstream stages only for the assets you changed to save time.

## Required Inputs

- `external/Work/` with the Warcraft III map exports (`war3map.w3t`, `.w3a`, `.w3u`, `.w3b`, etc.).
- `scripts/data/category-mappings.json` (manually curated categories used by the converter).
- Icon PNGs in `public/icons/itt/` for the icon-mapping stage.

## Outputs & Verification

- Intermediate JSON (raw + metadata) lives under `tmp/work-data/` and is regenerated every run.
- TypeScript data is written to `src/features/modules/guides/data/`.
- Icon mapping is regenerated at `src/features/modules/guides/data/iconMap.ts`.

After running the pipeline, spot-check:
1. `tmp/work-data/metadata/recipes.json` – verifies the recipe extractor parsed `war3map.j`.
2. `src/features/modules/guides/data/items/*.ts` – ensures the converter rebuilt TypeScript modules with fresh recipes/categories.
3. `src/features/modules/guides/data/iconMap.ts` – ensures icons line up with the latest assets.

## Documentation & References

- Operational details and manual steps: `docs/README.md` → **Systems › Scripts**.
- Refactoring backlog + status: `scripts/data/REFACTORING_PLAN.md`.
- Deep-dive guides (icon mapping, extractor notes, historical analysis): `docs/systems/scripts/`.

Need to refresh fixtures before testing? Both `docs/QUICK_START_TESTING.md` and `docs/TESTING_GUIDE.md` include links to this README so you always land back here.

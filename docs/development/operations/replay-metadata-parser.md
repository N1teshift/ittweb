## Replay Metadata Parser

> Date: 2025-12-02

### Overview
- Node/TypeScript parser that extracts Island Troll Tribes post-game metadata from `.w3g` files.
- Located under `scripts/replay-metadata-parser/` with a CLI (`replay-meta`) and library API.
- Depends on `w3gjs` for low-level replay parsing and a configurable encoder spec to stay in sync with the map.

### Spec Management
- The parser uses `MatchMetadataSpec` (`encodeChars`, `symbolOrderStrings`, `encoderUnitId`, `checksumModulo`).
- Default spec (`src/spec/defaultSpec.ts`) is a placeholder; production runs must supply a generated JSON spec exported from the map repo.
- Point to a custom spec via `REPLAY_META_SPEC_PATH` or `--spec <path>` on the CLI. JSON schema:
  ```json
  {
    "version": 1,
    "encoderUnitId": "XXXX",
    "checksumModulo": 1000000007,
    "encodeChars": ["\n","a","b","..."],
    "symbolOrderStrings": ["ord0","ord1","..."]
  }
  ```
- Keep `encodeChars.length === symbolOrderStrings.length`. The order of both arrays defines the bidirectional mapping.

### Building & Running
1. Build once:
   ```bash
   npm run replay-meta:build
   ```
2. Decode a replay:
   ```bash
   npm run replay-meta:decode -- ./tmp/demo.w3g --json --pretty --spec ./tmp/spec.json
   ```
3. Flags:
   - `--json` / `--pretty` control output shape.
   - `--raw` prints the decoded payload string.
   - `--spec` overrides the spec path (falls back to `REPLAY_META_SPEC_PATH`).
4. For iterative work use `npm run replay-meta:watch`.

### Library API
```ts
import { decodeReplay, decodeOrders } from "scripts/replay-metadata-parser/src";

await decodeReplay("path/to/file.w3g", { spec });
await decodeOrders(orderIds, { spec });
```
- Inject a custom `ReplayOrderReader` (e.g., mocks or streaming readers) via the `reader` option.
- `decodeReplay` returns `{ metadata, payload, orders, spec }`.

### Testing
- Unit and integration-like tests live in `scripts/replay-metadata-parser/__tests__/`.
- Run focused tests:
  ```bash
  npx jest scripts/replay-metadata-parser
  ```
- Fixtures use a stub spec; add real `.w3g` files under `scripts/replay-metadata-parser/__tests__/fixtures/` if they become available (remember to git-ignore large binaries).

### Troubleshooting
- **No metadata found** → ensure the spec matches the map build and that the replay was produced with the metadata encoder enabled.
- **Checksum mismatch** → indicates payload tampering or a stale `ENCODE_CHARS`/`SYMBOL_ORDER_STRINGS` list.
- **Unknown order id** → update the spec when map changes the dummy orders.
- Use `--raw` to log the decoded payload for manual inspection before JSON parsing.

### Follow-ups
- Automate spec export from the Wurst repo and commit it alongside the parser.
- Add end-to-end tests once real replay fixtures are available.
- Consider streaming decode support for backend ingestion pipelines.



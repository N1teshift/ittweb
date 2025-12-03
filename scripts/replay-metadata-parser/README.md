## Replay Metadata Parser

> Date: 2025-12-02

The parser described here has been implemented under `scripts/replay-metadata-parser/`.

### Highlights
- TypeScript CLI (`npm run replay-meta:decode`) and library (`decodeReplay`, `decodeOrders`).
- Configurable spec loader with a default placeholder plus support for external JSON specs.
- Replay reader built on `w3gjs` that extracts metadata order streams, decodes payloads, and validates checksums before emitting structured JSON.
- Jest coverage for order decoding, payload parsing, and the full pipeline (using stub readers/fixtures).
- Developer documentation now lives in `docs/development/operations/replay-metadata-parser.md`.

Refer to the documentation file for setup instructions, spec format, and troubleshooting tips.
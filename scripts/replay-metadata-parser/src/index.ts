export { decodeReplay, decodeOrders } from "./decodeReplay.js";
export { W3GReplayOrderReader } from "./order/w3gReplayOrderReader.js";
export { loadMatchMetadataSpec } from "./spec/specLoader.js";
export { DEFAULT_MATCH_METADATA_SPEC } from "./spec/defaultSpec.js";

export type {
  MatchMetadata,
  MatchPlayerMetadata,
  MatchMetadataSpec,
  ReplayDecodeResult,
  ReplayOrderEvent,
  ReplayOrderReader,
  DecodeReplayOptions,
  DecodeOrdersOptions,
} from "./types.js";


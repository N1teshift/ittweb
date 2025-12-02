import { decodeOrderStream } from "./decoder/orderDecoder.js";
import { extractMetadataOrderIds } from "./order/metadataExtractor.js";
import { W3GReplayOrderReader } from "./order/w3gReplayOrderReader.js";
import { parsePayload } from "./payload/payloadParser.js";
import { loadMatchMetadataSpec } from "./spec/specLoader.js";
import type {
  DecodeOrdersOptions,
  DecodeReplayOptions,
  MatchMetadata,
  MatchMetadataSpec,
  ReplayDecodeResult,
} from "./types.js";

const resolveSpec = async (
  options?: DecodeOrdersOptions
): Promise<MatchMetadataSpec> => {
  if (options?.spec) {
    return options.spec;
  }
  return loadMatchMetadataSpec(options?.specPath);
};

export const decodeReplay = async (
  filePath: string,
  options?: DecodeReplayOptions
): Promise<ReplayDecodeResult> => {
  const spec = await resolveSpec({
    specPath: options?.specPath,
    spec: options?.spec,
  });
  const reader = options?.reader ?? new W3GReplayOrderReader();
  const orderEvents = await reader.readOrderStream(filePath);
  const debug = process.env.DEBUG_REPLAY === "1";
  const metadataOrderIds = extractMetadataOrderIds(orderEvents, spec, debug);
  const payload = decodeOrderStream(metadataOrderIds, spec);

  if (debug) {
    console.error("[DEBUG] Decoded payload:", JSON.stringify(payload));
    console.error("[DEBUG] Payload length:", payload.length);
  }

  const metadata = parsePayload(payload, spec);

  return {
    metadata,
    payload,
    orders: metadataOrderIds,
    spec,
  };
};

export const decodeOrders = async (
  orderIds: string[],
  options?: DecodeOrdersOptions
): Promise<{ payload: string; metadata: MatchMetadata; spec: MatchMetadataSpec }> => {
  const spec = await resolveSpec(options);
  const payload = decodeOrderStream(orderIds, spec);
  const metadata = parsePayload(payload, spec);
  return { payload, metadata, spec };
};


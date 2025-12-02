import { computeChecksum } from "../../src/checksum/checksum.js";
import type {
  MatchMetadataSpec,
  ReplayOrderEvent,
  ReplayOrderReader,
} from "../../src/types";

const beforeChecksum = [
  "v1",
  "mapName:Test Map",
  "mapVersion:1.0.0",
  "matchId:demo-123",
  "startTime:0",
  "endTime:90",
  "duration:90",
  "playerCount:1",
  "player:0|Tester|HUM|0|WIN",
].join("\n");

const charsetSeed = `${beforeChecksum}\nchecksum:\nEND0123456789`;
const encodeChars = Array.from(new Set(charsetSeed.split("")));
const symbolOrderStrings = encodeChars.map(
  (_, idx) => `ord${idx.toString().padStart(3, "0")}`
);

export const sampleSpec: MatchMetadataSpec = {
  version: 99,
  encoderUnitId: "demo",
  checksumModulo: 1_000_000_007,
  encodeChars,
  symbolOrderStrings,
};

const checksumValue = computeChecksum(beforeChecksum, sampleSpec);

export const samplePayload = `${beforeChecksum}\nchecksum:${checksumValue}\nEND`;

const orderLookup = new Map<string, string>();
sampleSpec.encodeChars.forEach((char, idx) => {
  orderLookup.set(char, sampleSpec.symbolOrderStrings[idx]);
});

export const sampleOrders = samplePayload.split("").map((char) => {
  const order = orderLookup.get(char);
  if (!order) {
    throw new Error(`Missing order mapping for char "${char}"`);
  }
  return order;
});

export class StubReplayReader implements ReplayOrderReader {
  constructor(private readonly events: ReplayOrderEvent[]) {}

  static fromOrders(orderIds: string[]): StubReplayReader {
    const events = orderIds.map((orderId, idx) => ({
      orderId,
      playerId: 0,
      timestampMs: idx,
    }));
    return new StubReplayReader(events);
  }

  async readOrderStream(): Promise<ReplayOrderEvent[]> {
    return this.events;
  }
}



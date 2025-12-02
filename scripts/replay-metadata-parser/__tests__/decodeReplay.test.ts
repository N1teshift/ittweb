/** @jest-environment node */
import { decodeOrders, decodeReplay } from "../src/decodeReplay";
import {
  sampleOrders,
  samplePayload,
  sampleSpec,
  StubReplayReader,
} from "./helpers/sampleData";

describe("replay metadata decoding", () => {
  it("decodes raw order streams", async () => {
    const result = await decodeOrders(sampleOrders, { spec: sampleSpec });
    expect(result.payload).toBe(samplePayload);
    expect(result.metadata.mapName).toBe("Test Map");
    expect(result.metadata.players).toHaveLength(1);
  });

  it("decodes replay data via injected reader", async () => {
    const reader = StubReplayReader.fromOrders(sampleOrders);
    const result = await decodeReplay("fake.w3g", {
      reader,
      spec: sampleSpec,
    });

    expect(result.metadata.matchId).toBe("demo-123");
    expect(result.orders.length).toBe(sampleOrders.length);
  });
});


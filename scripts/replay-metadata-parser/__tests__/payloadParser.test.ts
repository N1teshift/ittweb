/** @jest-environment node */
import { ReplayMetaError, ReplayMetaErrorCode } from "../src/errors";
import { parsePayload } from "../src/payload/payloadParser";
import { samplePayload, sampleSpec } from "./helpers/sampleData";

describe("payload parser", () => {
  it("parses structured metadata", () => {
    const metadata = parsePayload(samplePayload, sampleSpec);
    expect(metadata.schemaVersion).toBe(1);
    expect(metadata.mapVersion).toBe("1.0.0");
    expect(metadata.players[0]).toMatchObject({
      name: "Tester",
      race: "HUM",
      result: "WIN",
    });
  });

  it("detects checksum mismatches", () => {
    const tampered = samplePayload.replace("Test Map", "Fake Map");
    try {
      parsePayload(tampered, sampleSpec);
      throw new Error("parsePayload should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ReplayMetaError);
      expect((error as ReplayMetaError).code).toBe(
        ReplayMetaErrorCode.CHECKSUM_MISMATCH
      );
    }
  });
});


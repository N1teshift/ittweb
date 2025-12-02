import { ReplayMetaError, ReplayMetaErrorCode } from "../errors.js";
import type { MatchMetadataSpec } from "../types.js";

export const decodeOrderStream = (
  orderIds: string[],
  spec: MatchMetadataSpec
): string => {
  const lookup = new Map<string, number>();
  spec.symbolOrderStrings.forEach((order: string, index: number) =>
    lookup.set(order, index)
  );

  const chars = orderIds.map((orderId) => {
    const index = lookup.get(orderId);
    if (index === undefined) {
      throw new ReplayMetaError(
        `Unknown order id ${orderId}`,
        ReplayMetaErrorCode.UNKNOWN_SYMBOL,
        { orderId }
      );
    }

    const char = spec.encodeChars[index];
    if (char === undefined) {
      throw new ReplayMetaError(
        `Missing char mapping for symbol index ${index}`,
        ReplayMetaErrorCode.SPEC_INVALID,
        { index }
      );
    }

    return char;
  });

  return chars.join("");
};


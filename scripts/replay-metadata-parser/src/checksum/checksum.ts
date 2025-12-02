import { ReplayMetaError, ReplayMetaErrorCode } from "../errors.js";
import type { MatchMetadataSpec } from "../types.js";

const buildCharIndex = (spec: MatchMetadataSpec): Map<string, number> => {
  const map = new Map<string, number>();
  spec.encodeChars.forEach((char: string, index: number) => {
    map.set(char, index);
  });
  return map;
};

export const computeChecksum = (
  payload: string,
  spec: MatchMetadataSpec
): number => {
  const modulo = spec.checksumModulo;
  const charIndex = buildCharIndex(spec);
  let sum = 0;

  for (const char of payload) {
    const idx = charIndex.get(char);
    const weight = idx !== undefined ? idx + 1 : char.codePointAt(0) ?? 0;
    sum = (sum + weight) % modulo;
  }

  return sum;
};

export const assertChecksum = (
  payload: string,
  declared: number,
  spec: MatchMetadataSpec
): void => {
  const computed = computeChecksum(payload, spec);
  if (computed !== declared) {
    throw new ReplayMetaError(
      `Checksum mismatch: expected ${declared}, computed ${computed}`,
      ReplayMetaErrorCode.CHECKSUM_MISMATCH,
      { declared, computed }
    );
  }
};


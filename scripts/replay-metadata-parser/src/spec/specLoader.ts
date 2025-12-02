import { readFile } from "node:fs/promises";
import { z } from "zod";
import { ReplayMetaError, ReplayMetaErrorCode } from "../errors.js";
import { MatchMetadataSpec } from "../types.js";
import { DEFAULT_MATCH_METADATA_SPEC } from "./defaultSpec.js";

const specSchema = z.object({
  version: z.number().int().nonnegative(),
  encoderUnitId: z.string().min(4).max(4),
  encodeChars: z.array(z.string().min(1)),
  symbolOrderStrings: z.array(z.string().min(1)),
  checksumModulo: z.number().int().positive(),
});

type RawSpec = z.infer<typeof specSchema>;

const normalizeSpec = (raw: RawSpec): MatchMetadataSpec => {
  if (raw.encodeChars.length !== raw.symbolOrderStrings.length) {
    throw new ReplayMetaError(
      "encodeChars length must match symbolOrderStrings length",
      ReplayMetaErrorCode.SPEC_INVALID,
      { encodeChars: raw.encodeChars.length, orderStrings: raw.symbolOrderStrings.length }
    );
  }

  return {
    version: raw.version,
    encoderUnitId: raw.encoderUnitId,
    encodeChars: [...raw.encodeChars],
    symbolOrderStrings: [...raw.symbolOrderStrings],
    checksumModulo: raw.checksumModulo,
  };
};

export const loadMatchMetadataSpec = async (
  specPath?: string
): Promise<MatchMetadataSpec> => {
  const resolvedPath = specPath ?? process.env.REPLAY_META_SPEC_PATH;
  if (!resolvedPath) {
    return DEFAULT_MATCH_METADATA_SPEC;
  }

  try {
    const contents = await readFile(resolvedPath, "utf8");
    const parsed = JSON.parse(contents) as unknown;
    const rawSpec = specSchema.parse(parsed);
    return normalizeSpec(rawSpec);
  } catch (error) {
    if (error instanceof ReplayMetaError) {
      throw error;
    }

    throw new ReplayMetaError(
      `Unable to load spec from ${resolvedPath}`,
      ReplayMetaErrorCode.SPEC_INVALID,
      { error }
    );
  }
};


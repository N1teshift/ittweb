export enum ReplayMetaErrorCode {
  SPEC_INVALID = "SPEC_INVALID",
  STREAM_NOT_FOUND = "STREAM_NOT_FOUND",
  UNKNOWN_SYMBOL = "UNKNOWN_SYMBOL",
  CHECKSUM_MISMATCH = "CHECKSUM_MISMATCH",
  PAYLOAD_INVALID = "PAYLOAD_INVALID",
  IO_ERROR = "IO_ERROR",
}

export class ReplayMetaError extends Error {
  readonly code: ReplayMetaErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ReplayMetaErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ReplayMetaError";
    this.code = code;
    this.details = details;
  }
}

export const assert = (condition: unknown, error: ReplayMetaError): void => {
  if (!condition) {
    throw error;
  }
};



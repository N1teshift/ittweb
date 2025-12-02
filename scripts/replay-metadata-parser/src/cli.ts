#!/usr/bin/env node
import process from "node:process";
import { decodeReplay } from "./decodeReplay.js";
import { readChatMessages } from "./chat/chatReader.js";
import { readMMDData } from "./mmd/mmdReader.js";
import { parsePayload } from "./payload/payloadParser.js";
import { loadMatchMetadataSpec } from "./spec/specLoader.js";
import { ReplayMetaError, ReplayMetaErrorCode } from "./errors.js";

type Command = "decode" | "chat" | "mmd" | "help";

interface CLIOptions {
  command: Command;
  input?: string;
  specPath?: string;
  json: boolean;
  pretty: boolean;
  raw: boolean;
}

const exitCodeByError: Record<ReplayMetaErrorCode, number> = {
  [ReplayMetaErrorCode.STREAM_NOT_FOUND]: 2,
  [ReplayMetaErrorCode.CHECKSUM_MISMATCH]: 3,
  [ReplayMetaErrorCode.UNKNOWN_SYMBOL]: 4,
  [ReplayMetaErrorCode.SPEC_INVALID]: 5,
  [ReplayMetaErrorCode.IO_ERROR]: 6,
  [ReplayMetaErrorCode.PAYLOAD_INVALID]: 7,
};

const parseArgs = (argv: string[]): CLIOptions => {
  const [command = "help", ...rest] = argv;
  const options: CLIOptions = {
    command: command === "decode" ? "decode" : command === "chat" ? "chat" : command === "mmd" ? "mmd" : "help",
    json: false,
    pretty: false,
    raw: false,
  };

  if (options.command === "help") {
    return options;
  }

  let pending: "input" | "specPath" | null = null;
  for (const arg of rest) {
    if (pending) {
      options[pending] = arg;
      pending = null;
      continue;
    }

    switch (arg) {
      case "--input":
      case "-i":
        pending = "input";
        break;
      case "--spec":
        pending = "specPath";
        break;
      case "--json":
        options.json = true;
        break;
      case "--pretty":
        options.pretty = true;
        break;
      case "--raw":
        options.raw = true;
        break;
      case "--help":
        options.command = "help";
        return options;
      default:
        if (!options.input) {
          options.input = arg;
        }
    }
  }

  if (pending) {
    throw new ReplayMetaError(
      `Missing value for flag ${pending}`,
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  return options;
};

const printUsage = (): void => {
  console.log(`replay-meta <command> <path> [options]

Commands:
  decode    Decode metadata from replay using order-based encoding
  chat      Decode metadata from replay using chat-based encoding
  mmd       Decode metadata from replay using w3mmd protocol (recommended)

Options:
  -i, --input <path>    Replay file to decode (.w3g)
      --spec <path>     Optional path to JSON spec (matches map constants)
      --json            Output JSON
      --pretty          Pretty-print JSON (implies --json)
      --raw             Include raw payload in CLI output
      --help            Show this help message

Examples:
  replay-meta mmd ./replay.w3g --pretty
  replay-meta decode ./replay.w3g --pretty
  replay-meta chat ./replay.w3g --json
`);
};

const handleSuccess = (
  options: CLIOptions,
  result: Awaited<ReturnType<typeof decodeReplay>>
): void => {
  if (options.json || options.pretty) {
    const payload = {
      metadata: result.metadata,
      specVersion: result.spec.version,
      orderCount: result.orders.length,
      payload: options.raw ? result.payload : undefined,
    };
    const space = options.pretty ? 2 : undefined;
    console.log(JSON.stringify(payload, null, space));
    return;
  }

  const lines = [
    `Replay decoded successfully`,
    `Match ID: ${result.metadata.matchId}`,
    `Map: ${result.metadata.mapName} v${result.metadata.mapVersion}`,
    `Duration: ${result.metadata.durationSeconds}s`,
    `Players: ${result.metadata.playerCount}`,
    `Spec version: ${result.spec.version}`,
  ];

  if (options.raw) {
    lines.push("", "Payload:", result.payload);
  }

  console.log(lines.join("\n"));
};

const handleMMDDecode = async (options: CLIOptions): Promise<void> => {
  if (!options.input) {
    throw new ReplayMetaError(
      "Missing input replay path",
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  console.error("[INFO] Reading w3mmd data from replay...");
  const mmdResult = await readMMDData(options.input);

  console.error(`[INFO] Total MMD messages: ${mmdResult.allMessages.length}`);
  console.error(`[INFO] Custom data entries: ${mmdResult.customData.size}`);

  if (options.raw) {
    console.error("[DEBUG] Custom data:");
    for (const [key, value] of mmdResult.customData) {
      console.error(`  ${key}: ${value}`);
    }
  }

  if (!mmdResult.ittMetadata?.payload) {
    throw new ReplayMetaError(
      "No ITT metadata found in w3mmd data",
      ReplayMetaErrorCode.STREAM_NOT_FOUND,
      { 
        totalMessages: mmdResult.allMessages.length,
        customDataKeys: [...mmdResult.customData.keys()]
      }
    );
  }

  console.error(`[INFO] ITT version: ${mmdResult.ittMetadata.version}`);
  console.error(`[INFO] ITT schema: ${mmdResult.ittMetadata.schema}`);
  console.error(`[INFO] Payload chunks: ${mmdResult.ittMetadata.chunks.length}`);
  console.error(`[INFO] Reconstructed payload length: ${mmdResult.ittMetadata.payload.length}`);

  if (options.raw) {
    console.error("[DEBUG] Payload:", mmdResult.ittMetadata.payload);
  }

  // Parse the payload - skip checksum validation for MMD as escaping can cause mismatches
  const spec = await loadMatchMetadataSpec(options.specPath);
  const metadata = parsePayload(mmdResult.ittMetadata.payload, spec, { 
    skipChecksumValidation: true 
  });

  if (options.json || options.pretty) {
    const output = {
      metadata,
      source: "mmd",
      ittVersion: mmdResult.ittMetadata.version,
      chunkCount: mmdResult.ittMetadata.chunks.length,
      payload: options.raw ? mmdResult.ittMetadata.payload : undefined,
    };
    const space = options.pretty ? 2 : undefined;
    console.log(JSON.stringify(output, null, space));
    return;
  }

  const lines = [
    `Replay decoded successfully (via w3mmd)`,
    `Match ID: ${metadata.matchId}`,
    `Map: ${metadata.mapName} v${metadata.mapVersion}`,
    `Duration: ${metadata.durationSeconds}s`,
    `Players: ${metadata.playerCount}`,
    `ITT Version: ${mmdResult.ittMetadata.version}`,
  ];

  if (options.raw) {
    lines.push("", "Payload:", mmdResult.ittMetadata.payload);
  }

  console.log(lines.join("\n"));
};

const handleChatDecode = async (options: CLIOptions): Promise<void> => {
  if (!options.input) {
    throw new ReplayMetaError(
      "Missing input replay path",
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  console.error("[INFO] Reading chat messages from replay...");
  const chatResult = await readChatMessages(options.input);

  console.error(`[INFO] Total chat messages: ${chatResult.allMessages.length}`);
  console.error(`[INFO] Metadata messages: ${chatResult.metadataMessages.length}`);

  if (options.raw || chatResult.metadataMessages.length === 0) {
    console.error("[DEBUG] All chat messages:");
    for (const msg of chatResult.allMessages) {
      console.error(`  [Player ${msg.playerId}]: ${msg.message}`);
    }
  }

  if (!chatResult.metadataPayload) {
    throw new ReplayMetaError(
      "No metadata found in chat messages",
      ReplayMetaErrorCode.STREAM_NOT_FOUND,
      { totalMessages: chatResult.allMessages.length }
    );
  }

  console.error(`[INFO] Reconstructed payload length: ${chatResult.metadataPayload.length}`);

  if (options.raw) {
    console.error("[DEBUG] Payload:", chatResult.metadataPayload);
  }

  // Parse the payload
  const spec = await loadMatchMetadataSpec(options.specPath);
  const metadata = parsePayload(chatResult.metadataPayload, spec);

  if (options.json || options.pretty) {
    const output = {
      metadata,
      source: "chat",
      messageCount: chatResult.metadataMessages.length,
      payload: options.raw ? chatResult.metadataPayload : undefined,
    };
    const space = options.pretty ? 2 : undefined;
    console.log(JSON.stringify(output, null, space));
    return;
  }

  const lines = [
    `Replay decoded successfully (via chat)`,
    `Match ID: ${metadata.matchId}`,
    `Map: ${metadata.mapName} v${metadata.mapVersion}`,
    `Duration: ${metadata.durationSeconds}s`,
    `Players: ${metadata.playerCount}`,
  ];

  if (options.raw) {
    lines.push("", "Payload:", chatResult.metadataPayload);
  }

  console.log(lines.join("\n"));
};

const handleError = (reason: unknown): void => {
  if (reason instanceof ReplayMetaError) {
    const exitCode = exitCodeByError[reason.code] ?? 1;
    process.exitCode = exitCode;
    console.error(reason.message);
    if (reason.details) {
      console.error(JSON.stringify(reason.details));
    }
    return;
  }

  process.exitCode = 1;
  console.error(reason);
};

const main = async (): Promise<void> => {
  try {
    const options = parseArgs(process.argv.slice(2));
    
    if (options.command === "help") {
      printUsage();
      return;
    }

    if (options.command === "chat") {
      await handleChatDecode(options);
      return;
    }

    if (options.command === "mmd") {
      await handleMMDDecode(options);
      return;
    }

    if (!options.input) {
      throw new ReplayMetaError(
        "Missing input replay path",
        ReplayMetaErrorCode.PAYLOAD_INVALID
      );
    }

    const result = await decodeReplay(options.input, {
      specPath: options.specPath,
    });
    handleSuccess(options, result);
  } catch (error) {
    handleError(error);
  }
};

void main();

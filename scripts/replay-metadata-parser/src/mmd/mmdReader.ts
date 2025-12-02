import { readFile } from "node:fs/promises";
import W3GReplayModule from "w3gjs/dist/lib/W3GReplay.js";
import { ReplayMetaError, ReplayMetaErrorCode } from "../errors.js";

/**
 * W3MMD action structure from w3gjs
 */
interface W3MMDAction {
  id: number;
  cache: {
    gamecache: string;
    key1: string;
    key2: string;
  };
  value: number;
}

interface W3GReplayInstance {
  parse(buffer: Buffer): Promise<void>;
  w3mmd: W3MMDAction[];
}

type W3GReplayConstructor = new () => W3GReplayInstance;
type W3GReplayModuleType = W3GReplayConstructor | { default: W3GReplayConstructor };

/**
 * Parsed MMD message from replay
 */
export interface MMDMessage {
  filename: string;
  missionKey: string;
  key: string;
  value: number;
}

/**
 * Result from reading MMD data
 */
export interface MMDReaderResult {
  allMessages: MMDMessage[];
  customData: Map<string, string>;
  ittMetadata: {
    version?: string;
    schema?: string;
    chunks: string[];
    payload?: string;
  } | null;
}

/**
 * Read w3mmd data from a W3G replay file.
 * Extracts custom ITT metadata messages.
 */
function createReplayInstance(): W3GReplayInstance {
  const moduleRef = W3GReplayModule as W3GReplayModuleType;
  if (typeof moduleRef === "function") {
    return new moduleRef();
  }
  if (moduleRef?.default) {
    return new moduleRef.default();
  }
  throw new ReplayMetaError(
    "Unable to instantiate W3GReplay",
    ReplayMetaErrorCode.IO_ERROR
  );
}

export const readMMDData = async (filePath: string): Promise<MMDReaderResult> => {
  const buffer = await loadReplay(filePath);
  const replay = createReplayInstance();

  try {
    await replay.parse(buffer);
  } catch (error) {
    // Continue even with parse errors - we want what we captured
    console.error("[WARN] Replay parsing had errors, continuing with captured data");
  }

  const allMessages: MMDMessage[] = [];
  const customData = new Map<string, string>();

  // Process w3mmd actions
  const debug = process.env.DEBUG_MMD === "1";
  for (const action of (replay.w3mmd || []) as W3MMDAction[]) {
    if (debug) {
      console.error("[DEBUG MMD] Raw action:", JSON.stringify(action));
    }
    
    // The actual structure from w3gjs is: cache.filename, cache.missionKey, cache.key
    const cacheData = action.cache as { filename?: string; missionKey?: string; key?: string } | undefined;
    const msg: MMDMessage = {
      filename: cacheData?.filename || "",
      missionKey: cacheData?.missionKey || "",
      key: cacheData?.key || "",
      value: action.value,
    };
    allMessages.push(msg);

    if (debug) {
      console.error(`[DEBUG MMD] Parsed: filename=${msg.filename}, missionKey=${msg.missionKey}, key=${msg.key}`);
    }

    // Extract custom data - MMD custom messages use key="custom <id> <data>"
    if (msg.key.startsWith("custom ")) {
      const content = msg.key.slice(7); // Remove "custom " prefix
      const spaceIndex = content.indexOf(" ");
      if (spaceIndex > 0) {
        const identifier = content.slice(0, spaceIndex);
        const data = content.slice(spaceIndex + 1);
        customData.set(identifier, data);
        if (debug) {
          console.error(`[DEBUG MMD] Custom data: ${identifier} = ${data}`);
        }
      }
    }
  }

  // Extract ITT-specific metadata
  const ittMetadata = extractITTMetadata(customData);

  return {
    allMessages,
    customData,
    ittMetadata,
  };
};

/**
 * Extract ITT-specific metadata from MMD custom data
 */
function extractITTMetadata(customData: Map<string, string>): MMDReaderResult["ittMetadata"] {
  const version = customData.get("itt_version");
  const schema = customData.get("itt_schema");
  const chunksCount = customData.get("itt_chunks");

  if (!chunksCount) {
    return null;
  }

  const numChunks = parseInt(chunksCount, 10);
  if (isNaN(numChunks) || numChunks <= 0) {
    return null;
  }

  // Collect chunks in order
  const chunks: string[] = [];
  for (let i = 0; i < numChunks; i++) {
    const chunk = customData.get(`itt_data_${i}`);
    if (chunk !== undefined) {
      chunks.push(chunk);
    }
  }

  // Reconstruct payload and unescape MMD escaped characters
  const rawPayload = chunks.join("");
  // MMD escapes spaces and backslashes: "\ " -> " ", "\\" -> "\"
  const payload = rawPayload
    .replace(/\\\\/g, "\x00") // Temp replace escaped backslash
    .replace(/\\ /g, " ")     // Unescape spaces
    .replace(/\x00/g, "\\");  // Restore backslashes

  return {
    version,
    schema,
    chunks,
    payload: payload || undefined,
  };
}

async function loadReplay(filePath: string): Promise<Buffer> {
  try {
    return await readFile(filePath);
  } catch (error) {
    throw new ReplayMetaError(
      `Unable to read replay at ${filePath}`,
      ReplayMetaErrorCode.IO_ERROR,
      { error }
    );
  }
}


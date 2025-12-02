import { readFile } from "node:fs/promises";
import ReplayParserModule from "w3gjs/dist/lib/parsers/ReplayParser.js";
import { ReplayMetaError, ReplayMetaErrorCode } from "../errors.js";

const METADATA_CHAT_PREFIX = "[ITT_META]";

type ChatBlock = {
  id: 0x20;
  playerId: number;
  mode: number;
  message: string;
};

type GameDataBlock = ChatBlock | Record<string, unknown>;

type ReplayParserInstance = {
  on(event: "gamedatablock", handler: (block: GameDataBlock) => void): void;
  parse(buffer: Buffer): Promise<unknown>;
};

type ReplayParserModuleType =
  | (new () => ReplayParserInstance)
  | { default?: new () => ReplayParserInstance };

const isChatBlock = (block: GameDataBlock): block is ChatBlock => {
  return (block as ChatBlock).id === 0x20 && typeof (block as ChatBlock).message === "string";
};

export interface ChatMessage {
  playerId: number;
  message: string;
}

export interface ChatReaderResult {
  allMessages: ChatMessage[];
  metadataMessages: ChatMessage[];
  metadataPayload: string | null;
}

/**
 * Read chat messages from a W3G replay file.
 * Extracts metadata messages prefixed with [ITT_META].
 */
export const readChatMessages = async (filePath: string): Promise<ChatReaderResult> => {
  const buffer = await loadReplay(filePath);
  const parser = createParser();
  const allMessages: ChatMessage[] = [];

  parser.on("gamedatablock", (block: GameDataBlock) => {
    if (isChatBlock(block)) {
      allMessages.push({
        playerId: block.playerId,
        message: block.message,
      });
    }
  });

  try {
    await parser.parse(buffer);
  } catch (error) {
    // Continue even if parsing has some errors - we want the chat we captured
    console.error("[WARN] Replay parsing had errors, continuing with captured data");
  }

  // Filter for metadata messages
  const metadataMessages = allMessages.filter((msg) =>
    msg.message.startsWith(METADATA_CHAT_PREFIX)
  );

  // Reconstruct payload from chunks
  const metadataPayload = reconstructPayload(metadataMessages);

  return {
    allMessages,
    metadataMessages,
    metadataPayload,
  };
};

/**
 * Reconstruct the metadata payload from chunked chat messages.
 * Format: [ITT_META]<chunk_index>:<chunk_data>
 */
function reconstructPayload(messages: ChatMessage[]): string | null {
  if (messages.length === 0) {
    return null;
  }

  const chunks: Map<number, string> = new Map();

  for (const msg of messages) {
    const content = msg.message.slice(METADATA_CHAT_PREFIX.length);
    const colonIndex = content.indexOf(":");
    if (colonIndex === -1) continue;

    const indexStr = content.slice(0, colonIndex);
    const chunkData = content.slice(colonIndex + 1);
    const chunkIndex = parseInt(indexStr, 10);

    if (!isNaN(chunkIndex)) {
      chunks.set(chunkIndex, chunkData);
    }
  }

  // Reassemble in order
  const sortedIndices = [...chunks.keys()].sort((a, b) => a - b);
  const payload = sortedIndices.map((idx) => chunks.get(idx) ?? "").join("");

  return payload || null;
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

function createParser(): ReplayParserInstance {
  const moduleRef = ReplayParserModule as ReplayParserModuleType;
  if (typeof moduleRef === "function") {
    return new moduleRef();
  }

  if (moduleRef?.default) {
    return new moduleRef.default();
  }

  throw new ReplayMetaError(
    "Unable to instantiate ReplayParser",
    ReplayMetaErrorCode.IO_ERROR
  );
}


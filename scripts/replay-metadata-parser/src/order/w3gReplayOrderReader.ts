import { readFile } from "node:fs/promises";
import ReplayParserModule from "w3gjs/dist/lib/parsers/ReplayParser.js";
import { ReplayMetaError, ReplayMetaErrorCode } from "../errors.js";
import type { ReplayOrderEvent, ReplayOrderReader } from "../types.js";
import { toOrderString } from "./orderFormatter.js";

type RawAction = Record<string, unknown>;
type CommandBlock = {
  playerId: number;
  actions: RawAction[];
};
type TimeslotBlock = {
  timeIncrement?: number;
  commandBlocks: CommandBlock[];
};
type GameDataBlock = TimeslotBlock | Record<string, unknown>;

type ReplayParserInstance = {
  on(event: "gamedatablock", handler: (block: GameDataBlock) => void): void;
  parse(buffer: Buffer): Promise<unknown>;
};

type ReplayParserModuleType =
  | (new () => ReplayParserInstance)
  | { default?: new () => ReplayParserInstance };

type ParserFactory = () => ReplayParserInstance;
type FileLoader = (filePath: string) => Promise<Buffer>;

interface ReaderOptions {
  parserFactory?: ParserFactory;
  fileLoader?: FileLoader;
}

const isTimeslotBlock = (block: GameDataBlock): block is TimeslotBlock => {
  return (
    typeof (block as TimeslotBlock).commandBlocks !== "undefined" &&
    Array.isArray((block as TimeslotBlock).commandBlocks)
  );
};

const extractOrderStrings = (action: RawAction): string[] => {
  const matches: string[] = [];
  const candidate = action as Record<string, unknown>;

  const maybePush = (value: unknown) => {
    if (Array.isArray(value)) {
      const formatted = toOrderString(value as number[]);
      if (formatted) {
        matches.push(formatted);
      }
    }
  };

  maybePush(candidate.orderId);
  maybePush(candidate.orderId1);
  maybePush(candidate.orderId2);

  return matches;
};

export class W3GReplayOrderReader implements ReplayOrderReader {
  private readonly parserFactory: ParserFactory;
  private readonly fileLoader: FileLoader;

  constructor(options?: ReaderOptions) {
    this.parserFactory =
      options?.parserFactory ?? this.createDefaultParserFactory();
    this.fileLoader = options?.fileLoader ?? readFile;
  }

  async readOrderStream(filePath: string): Promise<ReplayOrderEvent[]> {
    const buffer = await this.loadReplay(filePath);
    const parser = this.parserFactory();
    const events: ReplayOrderEvent[] = [];
    let elapsedMs = 0;

    parser.on("gamedatablock", (block: GameDataBlock) => {
      if (!isTimeslotBlock(block)) {
        return;
      }

      elapsedMs += block.timeIncrement ?? 0;
      block.commandBlocks.forEach((commandBlock: CommandBlock) => {
        commandBlock.actions.forEach((action) => {
          extractOrderStrings(action as RawAction).forEach((orderId) => {
            events.push({
              orderId,
              playerId: commandBlock.playerId,
              timestampMs: elapsedMs,
            });
          });
        });
      });
    });

    try {
      await parser.parse(buffer);
    } catch (error) {
      throw new ReplayMetaError(
        "Failed to parse replay data",
        ReplayMetaErrorCode.IO_ERROR,
        { error }
      );
    }
    return events;
  }

  private async loadReplay(filePath: string): Promise<Buffer> {
    try {
      return await this.fileLoader(filePath);
    } catch (error) {
      throw new ReplayMetaError(
        `Unable to read replay at ${filePath}`,
        ReplayMetaErrorCode.IO_ERROR,
        { error }
      );
    }
  }

  private createDefaultParserFactory(): ParserFactory {
    return () => {
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
    };
  }
}


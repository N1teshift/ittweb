declare module "w3gjs/dist/lib/parsers/ReplayParser.js" {
  import { EventEmitter } from "node:events";

  export default class ReplayParser extends EventEmitter {
    parse(input: Buffer): Promise<unknown>;
  }
}

declare module "w3gjs/dist/lib/W3GReplay.js" {
  interface W3MMDAction {
    id: number;
    cache: {
      gamecache: string;
      key1: string;
      key2: string;
    };
    value: number;
  }

  export default class W3GReplay {
    w3mmd: W3MMDAction[];
    parse(input: Buffer): Promise<void>;
  }
}

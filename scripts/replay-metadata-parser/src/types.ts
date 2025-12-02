export interface PlayerStats {
  damageTroll: number;
  selfHealing: number;
  allyHealing: number;
  goldAcquired: number;
  meatEaten: number;
  kills: {
    elk: number;
    hawk: number;
    snake: number;
    wolf: number;
    bear: number;
    panther: number;
  };
}

export interface MatchPlayerMetadata {
  slotIndex: number;
  name: string;
  race: string;
  team: number;
  result: string;
  stats?: PlayerStats; // Optional for schema v1 compatibility
}

export interface MatchMetadata {
  schemaVersion: number;
  mapName: string;
  mapVersion: string;
  matchId: string;
  startTimeGame: number;
  endTimeGame: number;
  durationSeconds: number;
  playerCount: number;
  players: MatchPlayerMetadata[];
  checksum: number;
  extras: Record<string, string>;
}

export interface MatchMetadataSpec {
  version: number;
  encoderUnitId: string;
  encodeChars: string[];
  symbolOrderStrings: string[];
  checksumModulo: number;
}

export interface ReplayOrderEvent {
  orderId: string;
  playerId: number;
  timestampMs: number;
}

export interface ReplayOrderReader {
  readOrderStream(filePath: string): Promise<ReplayOrderEvent[]>;
}

export interface DecodeReplayOptions {
  specPath?: string;
  spec?: MatchMetadataSpec;
  reader?: ReplayOrderReader;
}

export interface DecodeOrdersOptions {
  spec?: MatchMetadataSpec;
  specPath?: string;
}

export interface ReplayDecodeResult {
  metadata: MatchMetadata;
  payload: string;
  orders: string[];
  spec: MatchMetadataSpec;
}


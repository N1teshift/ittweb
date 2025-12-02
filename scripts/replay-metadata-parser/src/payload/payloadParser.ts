import { ReplayMetaError, ReplayMetaErrorCode } from "../errors.js";
import { assertChecksum } from "../checksum/checksum.js";
import type {
  MatchMetadata,
  MatchMetadataSpec,
  MatchPlayerMetadata,
  PlayerStats,
} from "../types.js";

const parseSchemaVersion = (line: string): number => {
  if (!line.startsWith("v")) {
    throw new ReplayMetaError(
      "Missing schema version header",
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  const version = Number(line.slice(1));
  if (Number.isNaN(version)) {
    throw new ReplayMetaError(
      "Invalid schema version header",
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  return version;
};

const parsePlayerLine = (line: string): MatchPlayerMetadata => {
  const parts = line.slice("player:".length).split("|");
  if (parts.length < 5) {
    throw new ReplayMetaError(
      `Invalid player line: ${line}`,
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  const [slot, name, race, team, result] = parts;
  const slotIndex = Number(slot);
  const teamId = Number(team);

  if (Number.isNaN(slotIndex) || Number.isNaN(teamId)) {
    throw new ReplayMetaError(
      `Invalid player numbers in line: ${line}`,
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  const player: MatchPlayerMetadata = {
    slotIndex,
    name,
    race,
    team: teamId,
    result,
  };

  // Schema v2+: Parse stats if present (16 fields total)
  // Format: slot|name|race|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther
  if (parts.length >= 16) {
    const stats: PlayerStats = {
      damageTroll: Number(parts[5]) || 0,
      selfHealing: Number(parts[6]) || 0,
      allyHealing: Number(parts[7]) || 0,
      goldAcquired: Number(parts[8]) || 0,
      meatEaten: Number(parts[9]) || 0,
      kills: {
        elk: Number(parts[10]) || 0,
        hawk: Number(parts[11]) || 0,
        snake: Number(parts[12]) || 0,
        wolf: Number(parts[13]) || 0,
        bear: Number(parts[14]) || 0,
        panther: Number(parts[15]) || 0,
      },
    };
    player.stats = stats;
  }

  return player;
};

const coerceNumber = (value: string, key: string): number => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new ReplayMetaError(
      `Invalid numeric value for ${key}`,
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }
  return parsed;
};

export interface ParsePayloadOptions {
  skipChecksumValidation?: boolean;
}

export const parsePayload = (
  payload: string,
  spec: MatchMetadataSpec,
  options?: ParsePayloadOptions
): MatchMetadata => {
  const normalized = payload.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  if (lines.length === 0) {
    throw new ReplayMetaError(
      "Empty payload",
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  const headerLine = lines.shift() ?? "";
  const schemaVersion = parseSchemaVersion(headerLine);
  const beforeChecksumLines = [headerLine];
  const players: MatchPlayerMetadata[] = [];
  const extras: Record<string, string> = {};
  const keyValues = new Map<string, string>();

  let checksumValue: number | null = null;
  let endSeen = false;
  let checksumEncountered = false;

  for (const line of lines) {
    if (line.startsWith("checksum:")) {
      checksumEncountered = true;
      const raw = line.slice("checksum:".length).trim();
      checksumValue = coerceNumber(raw, "checksum");
      continue;
    }

    if (!checksumEncountered) {
      beforeChecksumLines.push(line);
    }

    if (line.length === 0) {
      continue;
    }

    if (line === "END") {
      endSeen = true;
      continue;
    }

    if (line.startsWith("player:")) {
      players.push(parsePlayerLine(line));
      continue;
    }

    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) {
      throw new ReplayMetaError(
        `Invalid key/value line: ${line}`,
        ReplayMetaErrorCode.PAYLOAD_INVALID
      );
    }

    const value = rest.join(":");
    keyValues.set(key, value);
  }

  if (!checksumEncountered || checksumValue === null) {
    throw new ReplayMetaError(
      "Payload missing checksum line",
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  if (!endSeen) {
    throw new ReplayMetaError(
      "Payload missing END terminator",
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  const beforeChecksum = beforeChecksumLines.join("\n");
  if (!options?.skipChecksumValidation) {
    assertChecksum(beforeChecksum, checksumValue, spec);
  }

  const requireField = (key: string): string => {
    const value = keyValues.get(key);
    if (value === undefined) {
      throw new ReplayMetaError(
        `Missing field ${key}`,
        ReplayMetaErrorCode.PAYLOAD_INVALID
      );
    }
    return value;
  };

  const mapName = requireField("mapName");
  const mapVersion = requireField("mapVersion");
  const matchId = requireField("matchId");
  const durationSeconds = coerceNumber(requireField("duration"), "duration");
  const startTimeGame = coerceNumber(requireField("startTime"), "startTime");
  const endTimeGame = coerceNumber(requireField("endTime"), "endTime");
  const playerCount = coerceNumber(requireField("playerCount"), "playerCount");

  if (playerCount !== players.length) {
    throw new ReplayMetaError(
      "Player count mismatch",
      ReplayMetaErrorCode.PAYLOAD_INVALID,
      { expected: playerCount, actual: players.length }
    );
  }

  keyValues.forEach((value, key) => {
    if (
      ![
        "mapName",
        "mapVersion",
        "matchId",
        "duration",
        "startTime",
        "endTime",
        "playerCount",
      ].includes(key)
    ) {
      extras[key] = value;
    }
  });

  return {
    schemaVersion,
    mapName,
    mapVersion,
    matchId,
    startTimeGame,
    endTimeGame,
    durationSeconds,
    playerCount,
    players,
    checksum: checksumValue,
    extras,
  };
};


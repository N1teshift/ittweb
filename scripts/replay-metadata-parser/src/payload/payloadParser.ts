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

const parsePlayerLine = (line: string, schemaVersion: number): MatchPlayerMetadata => {
  const parts = line.slice("player:".length).split("|");
  if (parts.length < 5) {
    throw new ReplayMetaError(
      `Invalid player line: ${line}`,
      ReplayMetaErrorCode.PAYLOAD_INVALID
    );
  }

  // Schema v3+ format: slot|name|race|class|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther
  // Schema v2 format: slot|name|race|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther
  const hasClass = schemaVersion >= 3;
  
  let slot: string;
  let name: string;
  let race: string;
  let team: string;
  let result: string;
  let statsOffset: number;

  if (hasClass) {
    // v3+ format with class field
    [slot, name, race, , team, result] = parts;
    statsOffset = 6; // Stats start at index 6 (after slot|name|race|class|team|result)
  } else {
    // v2 format without class field
    [slot, name, race, team, result] = parts;
    statsOffset = 5; // Stats start at index 5 (after slot|name|race|team|result)
  }

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

  // Schema v2+: Parse stats if present
  // v2: 16 fields total (slot|name|race|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther)
  // v3+: 17 fields total (slot|name|race|class|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther)
  const minFieldsForStats = hasClass ? 17 : 16;
  if (parts.length >= minFieldsForStats) {
    const stats: PlayerStats = {
      damageTroll: Number(parts[statsOffset]) || 0,
      selfHealing: Number(parts[statsOffset + 1]) || 0,
      allyHealing: Number(parts[statsOffset + 2]) || 0,
      goldAcquired: Number(parts[statsOffset + 3]) || 0,
      meatEaten: Number(parts[statsOffset + 4]) || 0,
      kills: {
        elk: Number(parts[statsOffset + 5]) || 0,
        hawk: Number(parts[statsOffset + 6]) || 0,
        snake: Number(parts[statsOffset + 7]) || 0,
        wolf: Number(parts[statsOffset + 8]) || 0,
        bear: Number(parts[statsOffset + 9]) || 0,
        panther: Number(parts[statsOffset + 10]) || 0,
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
      players.push(parsePlayerLine(line, schemaVersion));
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


# Replay Parser - Information Extracted

Based on the replay metadata parser in `scripts/replay-metadata-parser/`, here's what information can be extracted from Warcraft 3 replay files (.w3g):

## Match Metadata Structure

The parser extracts the following information from replays:

### Match Information
- **schemaVersion**: Schema version number (v2, v3, v4)
- **mapName**: Name of the map (e.g., "Island Troll Tribes")
- **mapVersion**: Version of the map (e.g., "v3.29b")
- **matchId**: Unique identifier for the match
- **startTimeGame**: Game start time (timestamp)
- **endTimeGame**: Game end time (timestamp)
- **durationSeconds**: Duration of the match in seconds
- **playerCount**: Number of players in the match
- **checksum**: Checksum for validation
- **extras**: Additional metadata fields (key-value pairs)

### Player Information
For each player, the parser extracts:

- **slotIndex**: Player slot index (0-11)
- **name**: Player name
- **race**: Player race
- **team**: Team number
- **result**: Match result (e.g., "win", "loss", "draw")

### Player Statistics (if available in schema v2+)
- **damageTroll**: Damage dealt to trolls
- **selfHealing**: Self healing amount
- **allyHealing**: Healing provided to allies
- **goldAcquired**: Gold acquired during match
- **meatEaten**: Meat items consumed
- **kills**: Object containing:
  - elk
  - hawk
  - snake
  - wolf
  - bear
  - panther
- **items**: Array of item IDs (schema v4+)

## Parsing Methods

The parser supports three methods to extract metadata:

1. **MMD Method (Recommended)**: Uses w3mmd protocol to extract metadata
2. **Order-Based Method**: Decodes metadata from replay order streams
3. **Chat Method**: Extracts metadata from chat messages

## Usage

To parse a replay file, you can use:

```bash
# Build the parser first
npm run replay-meta:build

# Then use the CLI
node ./scripts/replay-metadata-parser/dist/cli.js mmd Replay_2025_12_05_2315.w3g --pretty
```

Or programmatically:

```javascript
import { decodeReplay } from './scripts/replay-metadata-parser/dist/decodeReplay.js';

const result = await decodeReplay('Replay_2025_12_05_2315.w3g');
console.log(result.metadata);
```

## Example Output Structure

```json
{
  "schemaVersion": 4,
  "mapName": "Island Troll Tribes",
  "mapVersion": "v3.29b",
  "matchId": "abc123",
  "startTimeGame": 1234567890,
  "endTimeGame": 1234567890,
  "durationSeconds": 3600,
  "playerCount": 12,
  "players": [
    {
      "slotIndex": 0,
      "name": "PlayerName",
      "race": "Orc",
      "team": 0,
      "result": "win",
      "stats": {
        "damageTroll": 5000,
        "selfHealing": 1000,
        "allyHealing": 500,
        "goldAcquired": 10000,
        "meatEaten": 20,
        "kills": {
          "elk": 5,
          "hawk": 2,
          "snake": 1,
          "wolf": 3,
          "bear": 0,
          "panther": 1
        },
        "items": [1, 2, 3, 4]
      }
    }
  ],
  "checksum": 12345,
  "extras": {}
}
```

## Next Steps

To parse your replay files:
1. Ensure the parser is built: `npm run replay-meta:build`
2. Run the parser on your replay file
3. The extracted metadata will show all match and player statistics

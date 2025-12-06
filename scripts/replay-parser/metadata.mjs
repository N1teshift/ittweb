/**
 * ITT Metadata Extraction and Parsing
 * Handles extraction of ITT metadata from W3MMD actions and parsing player stats
 */

/**
 * Extract ITT metadata from W3MMD actions
 */
export function extractITTMetadata(w3mmdActions) {
    const customData = new Map();

    for (const action of w3mmdActions) {
        const key = action?.cache?.key;
        if (!key || typeof key !== 'string') continue;

        if (key.startsWith('custom itt_')) {
            const content = key.slice('custom '.length);
            const firstSpace = content.indexOf(' ');
            if (firstSpace !== -1) {
                const identifier = content.substring(0, firstSpace);
                const data = content.substring(firstSpace + 1);
                customData.set(identifier, data);
            }
        }
    }

    const chunksCountStr = customData.get('itt_chunks');
    if (!chunksCountStr) {
        return undefined;
    }

    const numChunks = parseInt(chunksCountStr, 10);
    if (isNaN(numChunks) || numChunks <= 0) {
        return undefined;
    }

    const chunks = [];
    for (let i = 0; i < numChunks; i++) {
        const chunk = customData.get(`itt_data_${i}`);
        if (chunk !== undefined) {
            chunks.push(chunk);
        }
    }

    const payload = chunks.join('').replace(/\\(.)/g, '$1');
    const schemaVersion = customData.get('itt_schema') ? parseInt(customData.get('itt_schema'), 10) : undefined;

    const players = parseITTPayload(payload, schemaVersion);

    return {
        version: customData.get('itt_version'),
        schema: schemaVersion,
        payload,
        players,
        chunks
    };
}

/**
 * Parse ITT payload into player stats (Schema v4 only)
 * Format: slot|name|race|class|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther|items
 */
function parseITTPayload(payload, schemaVersion) {
    const players = [];
    const lines = payload.split('\n');

    for (const line of lines) {
        if (!line.startsWith('player:')) continue;

        try {
            const parts = line.slice('player:'.length).split('|');

            // Schema v4 format (18+ parts)
            // Format: slotIndex|name|race|class|team|result|damageTroll|...
            if (parts.length >= 18 && schemaVersion && schemaVersion >= 4) {
                const itemsStr = parts[17];
                const items = itemsStr ? itemsStr.split(',').map((id) => parseInt(id, 10) || 0) : [];
                const result = parts[5] || ''; // WIN, LOSS, LEAVE, etc.

                players.push({
                    slotIndex: parseInt(parts[0], 10) || 0,
                    name: parts[1] || '',
                    trollClass: parts[3] || undefined,
                    team: parseInt(parts[4], 10) || 0,
                    result: result.toUpperCase(), // WIN, LOSS, LEAVE, etc.
                    damageTroll: parseInt(parts[6], 10) || 0,
                    selfHealing: parseInt(parts[7], 10) || 0,
                    allyHealing: parseInt(parts[8], 10) || 0,
                    goldAcquired: parseInt(parts[9], 10) || 0,
                    meatEaten: parseInt(parts[10], 10) || 0,
                    killsElk: parseInt(parts[11], 10) || 0,
                    killsHawk: parseInt(parts[12], 10) || 0,
                    killsSnake: parseInt(parts[13], 10) || 0,
                    killsWolf: parseInt(parts[14], 10) || 0,
                    killsBear: parseInt(parts[15], 10) || 0,
                    killsPanther: parseInt(parts[16], 10) || 0,
                    items,
                });
            }
        } catch (error) {
            // Skip RangeError when accessing parts array (malformed player data)
            if (error.code === 'ERR_OUT_OF_RANGE' || error.name === 'RangeError') {
                continue;
            }
            throw error;
        }
    }

    return players;
}

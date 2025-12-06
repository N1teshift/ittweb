/**
 * Player Matching Logic
 * Matches replay players with ITT metadata players using multiple strategies
 */

/**
 * Match replay players with ITT metadata players
 * Returns matched players with merged stats
 */
export function matchPlayers(replayPlayers, ittPlayers) {
    const matchedIttPlayers = new Set();
    const matchedSlotIndices = new Set();
    const debugLines = [];

    debugLines.push(`[DEBUG] ========================================`);
    debugLines.push(`[DEBUG] Starting player matching`);
    debugLines.push(`[DEBUG] Total replay players: ${replayPlayers.length}`);
    debugLines.push(`[DEBUG] Total ITT players: ${ittPlayers?.length || 0}`);
    debugLines.push(`[DEBUG] Replay players: ${JSON.stringify(replayPlayers.map(p => ({ name: p.name, pid: p.id })))}`);
    debugLines.push(`[DEBUG] ITT players: ${JSON.stringify(ittPlayers?.map(p => ({ slotIndex: p.slotIndex, name: p.name })) || [])}`);
    debugLines.push(`[DEBUG] ========================================`);

    const matchedPlayers = replayPlayers.map((player) => {
        const debugPlayer = player.name && (player.name.includes('Scatman') || player.name.includes('Frodo'));

        if (debugPlayer) {
            debugLines.push(`\n[DEBUG] ========================================`);
            debugLines.push(`[DEBUG] Processing player: ${player.name} (pid: ${player.id})`);
            debugLines.push(`[DEBUG] Matching player: ${player.name} (pid: ${player.id})`);
            debugLines.push(`[DEBUG] Available ITT players:`);
            ittPlayers?.forEach(p => {
                debugLines.push(`  slotIndex:${p.slotIndex} name:${p.name} matched:${matchedIttPlayers.has(p)} slotMatched:${matchedSlotIndices.has(p.slotIndex)}`);
            });
        }

        // Priority 1: Match by Exact Name (most reliable)
        let ittPlayer = ittPlayers?.find(
            (p) => p.name === player.name && !matchedIttPlayers.has(p) && !matchedSlotIndices.has(p.slotIndex)
        );

        if (debugPlayer) {
            debugLines.push(`[DEBUG] Priority 1 (exact name): ${ittPlayer ? `MATCHED slotIndex ${ittPlayer.slotIndex} (${ittPlayer.name})` : 'NO MATCH'}`);
        }

        // Priority 2: Match by Name with # replaced by _ (common pattern)
        if (!ittPlayer && ittPlayers) {
            const playerNameWithUnderscore = player.name?.replace(/#/g, '_');
            ittPlayer = ittPlayers.find(
                (p) => p.name === playerNameWithUnderscore && !matchedIttPlayers.has(p) && !matchedSlotIndices.has(p.slotIndex)
            );
        }

        if (debugPlayer && !ittPlayer) {
            debugLines.push(`[DEBUG] Priority 2 (# → _): NO MATCH`);
        }

        // Priority 3: Match by Normalized Name (fallback - removes all non-alphanumeric)
        if (!ittPlayer && ittPlayers) {
            const normalizedPlayerName = (player.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (debugPlayer) {
                debugLines.push(`[DEBUG] Priority 3 (normalized name): Looking for "${normalizedPlayerName}"`);
            }

            for (const p of ittPlayers) {
                if (matchedIttPlayers.has(p) || matchedSlotIndices.has(p.slotIndex)) {
                    if (debugPlayer) {
                        debugLines.push(`[DEBUG]   Skipping slotIndex ${p.slotIndex} (${p.name}) - already matched`);
                    }
                    continue;
                }

                const normalizedIttName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                const matches = normalizedIttName === normalizedPlayerName;
                if (debugPlayer) {
                    debugLines.push(`[DEBUG]   Comparing with slotIndex ${p.slotIndex} (${p.name}): "${normalizedIttName}" === "${normalizedPlayerName}"? ${matches}`);
                }

                if (matches) {
                    ittPlayer = p;
                    if (debugPlayer) {
                        debugLines.push(`[DEBUG]   ✓ MATCHED to slotIndex ${p.slotIndex} (${p.name})`);
                        console.error(`[MATCH] ${player.name} (pid:${player.id}) → slotIndex ${p.slotIndex} (${p.name})`);
                    }
                    break;
                }
            }
        }

        if (ittPlayer) {
            matchedIttPlayers.add(ittPlayer);
            matchedSlotIndices.add(ittPlayer.slotIndex);
            if (debugPlayer) {
                debugLines.push(`[DEBUG] Final match: ${player.name} (pid: ${player.id}) → slotIndex ${ittPlayer.slotIndex} (${ittPlayer.name})`);
                debugLines.push(`[DEBUG] Matched slot indices so far: ${Array.from(matchedSlotIndices).join(', ')}`);
            }
        } else if (debugPlayer) {
            debugLines.push(`[DEBUG] ❌ NO MATCH FOUND for ${player.name} (pid: ${player.id})`);
        }

        // Derive flag from ITT metadata result
        let flag = 'unknown';
        if (ittPlayer) {
            // Check if result field exists (it should be extracted from ITT payload)
            const result = ittPlayer.result ? ittPlayer.result.toUpperCase() : '';
            if (result === 'WIN') {
                flag = 'winner';
            } else if (result === 'LOSS' || result === 'LEAVE') {
                flag = 'loser';
            } else if (result === 'DRAW') {
                flag = 'drawer';
            }
            // Debug: log if result is missing
            if (debugPlayer && !ittPlayer.result) {
                debugLines.push(`[DEBUG] ⚠️ No result field for ${ittPlayer.name} (slotIndex: ${ittPlayer.slotIndex})`);
            }
        }

        // Merge ITT stats if found
        const ittStats = ittPlayer ? {
            class: ittPlayer.trollClass,
            damageTroll: ittPlayer.damageTroll,
            selfHealing: ittPlayer.selfHealing,
            allyHealing: ittPlayer.allyHealing,
            goldAcquired: ittPlayer.goldAcquired,
            meatEaten: ittPlayer.meatEaten,
            killsElk: ittPlayer.killsElk,
            killsHawk: ittPlayer.killsHawk,
            killsSnake: ittPlayer.killsSnake,
            killsWolf: ittPlayer.killsWolf,
            killsBear: ittPlayer.killsBear,
            killsPanther: ittPlayer.killsPanther,
            ...(ittPlayer.items && { items: ittPlayer.items }),
        } : {};

        return {
            name: player.name || `Player ${player.id}`,
            pid: player.id,
            teamid: player.teamid,
            flag,
            ...ittStats,
        };
    });

    return { matchedPlayers, debugLines };
}

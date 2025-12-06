/**
 * Main Replay Parser
 * Parses Warcraft 3 replay files using w3gjs library
 */

import W3GReplayModule from 'w3gjs';
import { extractITTMetadata } from './metadata.mjs';
import { matchPlayers } from './matcher.mjs';

const W3GReplay = W3GReplayModule.default || W3GReplayModule;

/**
 * Validate buffer before parsing
 */
function validateBuffer(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('Invalid buffer: expected Buffer object');
    }

    if (buffer.length === 0) {
        throw new Error('Empty replay file');
    }

    if (buffer.length < 1024) {
        throw new Error(`Replay file too small (${buffer.length} bytes). File may be corrupted or incomplete.`);
    }
}

/**
 * Parse replay file
 */
export async function parseReplayFile(buffer) {
    validateBuffer(buffer);

    const replay = new W3GReplay();
    let parsed;
    
    // Suppress RangeError output during parsing
    const originalConsoleError = console.error;
    const originalStderrWrite = process.stderr.write.bind(process.stderr);
    let suppressedCount = 0;
    
    // Intercept console.error
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('RangeError [ERR_OUT_OF_RANGE]') || 
            message.includes('ERR_OUT_OF_RANGE') ||
            message.includes('The value of "offset" is out of range')) {
            suppressedCount++;
            return; // Suppress
        }
        originalConsoleError.apply(console, args);
    };
    
    // Intercept stderr.write
    process.stderr.write = function(chunk, encoding, callback) {
        const chunkStr = chunk?.toString() || '';
        if (chunkStr.includes('RangeError [ERR_OUT_OF_RANGE]') || 
            chunkStr.includes('ERR_OUT_OF_RANGE') ||
            chunkStr.includes('The value of "offset" is out of range')) {
            suppressedCount++;
            return true; // Suppress
        }
        return originalStderrWrite(chunk, encoding, callback);
    };
    
    try {
        parsed = await replay.parse(buffer);
    } catch (error) {
        if (error.code === 'ERR_OUT_OF_RANGE' || error.name === 'RangeError') {
            throw new Error(`Buffer out of range (${buffer.length} bytes) - file may be corrupted`);
        }
        throw error;
    } finally {
        // Restore original functions
        console.error = originalConsoleError;
        process.stderr.write = originalStderrWrite;
    }

    const players = parsed.players || [];
    if (players.length < 2) {
        throw new Error('Replay does not contain at least two players.');
    }

    // Get W3MMD data
    let w3mmdActions = [];
    if (Array.isArray(replay.w3mmd)) {
        w3mmdActions = replay.w3mmd;
    } else if (Array.isArray(parsed.w3mmd)) {
        w3mmdActions = parsed.w3mmd;
    }

    // Extract ITT metadata
    const ittMetadata = extractITTMetadata(w3mmdActions);

    // Step 1: Base replay data (from w3gjs)
    const step1_baseReplayData = {
        gameInfo: {
            gameId: parsed.randomseed || Date.now(),
            gamename: parsed.gamename || `Replay ${parsed.randomseed || 'unknown'}`,
            map: parsed.map?.path || parsed.map?.file || 'Unknown',
            creator: parsed.creator || 'Unknown',
            duration: parsed.duration ? Math.round(parsed.duration / 1000) : 0,
        },
        players: players.map(p => ({
            pid: p.id,
            name: p.name || `Player ${p.id}`,
            teamid: p.teamid,
        })),
    };

    // Step 2-3: W3MMD and ITT metadata extraction
    const step2_w3mmdExtraction = {
        actionCount: w3mmdActions.length,
        sample: w3mmdActions.slice(0, 5),
    };

    const step3_ittMetadataExtraction = ittMetadata ? {
        version: ittMetadata.version,
        schema: ittMetadata.schema,
        payload: ittMetadata.payload,
        players: ittMetadata.players.map(p => ({
            slotIndex: p.slotIndex,
            name: p.name,
            trollClass: p.trollClass,
            team: p.team,
            result: p.result,
            damageTroll: p.damageTroll,
            selfHealing: p.selfHealing,
            allyHealing: p.allyHealing,
            goldAcquired: p.goldAcquired,
            meatEaten: p.meatEaten,
            killsElk: p.killsElk,
            killsHawk: p.killsHawk,
            killsSnake: p.killsSnake,
            killsWolf: p.killsWolf,
            killsBear: p.killsBear,
            killsPanther: p.killsPanther,
            items: p.items,
        })),
    } : null;

    // Step 4: Player matching
    const { matchedPlayers, debugLines } = matchPlayers(players, ittMetadata?.players);
    
    const step4_playerMatching = {
        replayPlayers: step1_baseReplayData.players,
        ittPlayers: step3_ittMetadataExtraction?.players || [],
        matches: matchedPlayers.map((matched, index) => {
            const replayPlayer = players[index];
            const ittPlayer = ittMetadata?.players?.find(p => 
                (p.name === replayPlayer.name) ||
                (p.name === replayPlayer.name?.replace(/#/g, '_')) ||
                (p.name?.toLowerCase().replace(/[^a-z0-9]/g, '') === replayPlayer.name?.toLowerCase().replace(/[^a-z0-9]/g, ''))
            );
            return {
                replayPlayer: {
                    pid: replayPlayer.id,
                    name: replayPlayer.name,
                    teamid: replayPlayer.teamid,
                },
                ittPlayer: ittPlayer ? {
                    slotIndex: ittPlayer.slotIndex,
                    name: ittPlayer.name,
                    trollClass: ittPlayer.trollClass,
                } : null,
                matched: !!ittPlayer,
                mergedStats: matched.damageTroll !== undefined || matched.killsElk !== undefined,
            };
        }),
        debugLog: debugLines,
    };

    // Step 5: Final merged game data
    const step5_finalGameData = {
        gameId: parsed.randomseed || Date.now(),
        datetime: new Date().toISOString(),
        duration: parsed.duration ? Math.round(parsed.duration / 1000) : 0,
        gamename: parsed.gamename || `Replay ${parsed.randomseed || 'unknown'}`,
        map: parsed.map?.path || parsed.map?.file || 'Unknown',
        creatorName: parsed.creator || 'Unknown',
        ownername: parsed.creator || 'Unknown',
        category: 'Parsed',
        players: matchedPlayers,
    };

    return {
        // Structured by parsing steps
        parsingSteps: {
            step1_baseReplayData,
            step2_w3mmdExtraction,
            step3_ittMetadataExtraction,
            step4_playerMatching,
            step5_finalGameData,
        },
        // Legacy format for backward compatibility
        gameData: step5_finalGameData,
        w3mmd: {
            raw: w3mmdActions,
        },
        ittMetadata,
        debugMatching: debugLines,
    };
}

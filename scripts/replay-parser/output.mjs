/**
 * Output Formatting and Validation
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Validate parsing results
 */
export function validateResults(gameData, w3mmd, ittMetadata) {
    const checks = {
        fileLoaded: true,
        gameDataExtracted: !!gameData,
        playersDetected: gameData?.players?.length > 0,
        w3mmdFound: w3mmd?.raw?.length > 0,
        ittMetadataFound: !!ittMetadata,
        allPlayersMatched: true,
        allPlayersHaveStats: true
    };

    // Check if all players have stats
    if (gameData?.players) {
        for (const player of gameData.players) {
            const hasStats = player.damageTroll !== undefined ||
                player.selfHealing !== undefined ||
                player.killsElk !== undefined;
            if (!hasStats) {
                checks.allPlayersHaveStats = false;
            }
        }
    }

    return checks;
}

/**
 * Format output data for JSON file
 * Structured to show parsing pipeline step-by-step
 */
export function formatOutputData(fileName, checks, gameData, w3mmd, ittMetadata, debugMatching, parsingSteps) {
    const output = {
        file: fileName,
        parsedAt: new Date().toISOString(),
        checks,
    };

    // If parsingSteps is available, use the structured format
    if (parsingSteps) {
        output.parsingPipeline = {
            step1_baseReplayData: {
                description: "Base replay data extracted by w3gjs parser",
                data: parsingSteps.step1_baseReplayData,
            },
            step2_w3mmdExtraction: {
                description: "W3MMD (Warcraft 3 Mapped Data) custom messages extracted",
                data: parsingSteps.step2_w3mmdExtraction,
            },
            step3_ittMetadataExtraction: {
                description: "ITT metadata parsed from W3MMD custom messages",
                data: parsingSteps.step3_ittMetadataExtraction,
            },
            step4_playerMatching: {
                description: "Player matching: replay players (pid) matched with ITT players (slotIndex)",
                data: parsingSteps.step4_playerMatching,
            },
            step5_finalGameData: {
                description: "Final merged game data ready for website use",
                data: parsingSteps.step5_finalGameData,
            },
        };
    }

    // Also include legacy format for backward compatibility
    output.gameData = gameData;
    output.ittMetadata = ittMetadata || null;
    output.w3mmd = {
        actionCount: w3mmd.raw.length,
        sample: w3mmd.raw.slice(0, 5)
    };
    if (debugMatching && debugMatching.length > 0) {
        output.debugMatching = debugMatching;
    }

    return output;
}

/**
 * Write debug log to file (silently, no console output)
 */
export async function writeDebugLog(projectRoot, debugLines) {
    if (debugLines.length === 0) return;

    const debugOutput = debugLines.join('\n') + '\n';
    const debugPath = join(projectRoot, 'debug-matching.log');
    await writeFile(debugPath, debugOutput);
    // Debug log is saved to file but not displayed to avoid cluttering output
}

/**
 * Display parsing results
 */
export function displayResults(gameData, w3mmd, ittMetadata, checks, verbose) {
    console.log('\n✅ PARSING SUCCESSFUL\n');

    console.log('📊 GAME METADATA');
    console.log(`   Game ID: ${gameData.gameId}`);
    console.log(`   Game Name: ${gameData.gamename}`);
    console.log(`   Map: ${gameData.map}`);
    console.log(`   Duration: ${gameData.duration}s (${Math.floor(gameData.duration / 60)}m ${gameData.duration % 60}s)`);
    console.log(`   Date: ${gameData.datetime}`);
    console.log(`   Category: ${gameData.category}`);
    console.log(`   Creator: ${gameData.creatorName}`);

    console.log('\n👥 PLAYERS');
    console.log(`   Total: ${gameData.players.length}`);
    const flagCounts = gameData.players.reduce((acc, p) => {
        acc[p.flag] = (acc[p.flag] || 0) + 1;
        return acc;
    }, {});
    console.log(`   Winners: ${flagCounts.winner || 0}`);
    console.log(`   Losers: ${flagCounts.loser || 0}`);
    console.log(`   Draws: ${flagCounts.draw || 0}`);
    
    // List all players with their matching status
    console.log('\n   Player List:');
    for (const player of gameData.players) {
        const hasStats = player.damageTroll !== undefined || 
                         player.selfHealing !== undefined || 
                         player.killsElk !== undefined;
        const statsStatus = hasStats ? '✅' : '❌';
        const statsInfo = hasStats 
            ? ` (Class: ${player.class || 'N/A'}, Damage: ${player.damageTroll || 0})`
            : ' (No stats)';
        console.log(`   ${statsStatus} ${player.name} (PID: ${player.pid})${statsInfo}`);
    }
    
    // Show ITT metadata players if available
    if (ittMetadata && ittMetadata.players && ittMetadata.players.length > 0) {
        console.log('\n   ITT Metadata Players (by slotIndex):');
        for (const ittPlayer of ittMetadata.players) {
            const matched = gameData.players.some(p => 
                (p.pid === ittPlayer.slotIndex) || 
                (p.name === ittPlayer.name) ||
                (p.name?.toLowerCase().replace(/[^a-z0-9]/g, '') === ittPlayer.name?.toLowerCase().replace(/[^a-z0-9]/g, ''))
            );
            const matchStatus = matched ? '✅' : '⚠️';
            console.log(`   ${matchStatus} Slot ${ittPlayer.slotIndex}: ${ittPlayer.name} (Class: ${ittPlayer.trollClass || 'N/A'})`);
        }
    }

    console.log('\n📈 W3MMD DATA');
    console.log(`   Actions: ${w3mmd.raw.length}`);
    console.log(`   ITT Metadata: ${ittMetadata ? '✅ Yes' : '❌ No'}`);
    if (ittMetadata) {
        console.log(`   Schema Version: ${ittMetadata.schema}`);
        console.log(`   ITT Version: ${ittMetadata.version}`);
        console.log(`   Players in Metadata: ${ittMetadata.players.length}`);
    }

    console.log('\n🔍 VALIDATION CHECKS');
    console.log(`   ✅ File loaded: ${checks.fileLoaded}`);
    console.log(`   ${checks.gameDataExtracted ? '✅' : '❌'} Game data extracted: ${checks.gameDataExtracted}`);
    console.log(`   ${checks.playersDetected ? '✅' : '❌'} Players detected: ${checks.playersDetected}`);
    console.log(`   ${checks.w3mmdFound ? '✅' : '❌'} W3MMD data found: ${checks.w3mmdFound}`);
    console.log(`   ${checks.ittMetadataFound ? '✅' : '❌'} ITT metadata found: ${checks.ittMetadataFound}`);
    console.log(`   ${checks.allPlayersHaveStats ? '✅' : '⚠️'} All players have stats: ${checks.allPlayersHaveStats}`);

    if (verbose) {
        console.log('\n👤 DETAILED PLAYER INFORMATION\n');
        for (const player of gameData.players) {
            console.log(`   Player: ${player.name} (PID: ${player.pid})`);
            console.log(`      Flag: ${player.flag}`);
            if (player.class) console.log(`      Class: ${player.class}`);
            if (player.damageTroll !== undefined) console.log(`      Damage to Trolls: ${player.damageTroll}`);
            if (player.selfHealing !== undefined) console.log(`      Self Healing: ${player.selfHealing}`);
            if (player.allyHealing !== undefined) console.log(`      Ally Healing: ${player.allyHealing}`);
            if (player.goldAcquired !== undefined) console.log(`      Gold Acquired: ${player.goldAcquired}`);
            if (player.meatEaten !== undefined) console.log(`      Meat Eaten: ${player.meatEaten}`);

            const kills = [];
            if (player.killsElk) kills.push(`Elk: ${player.killsElk}`);
            if (player.killsHawk) kills.push(`Hawk: ${player.killsHawk}`);
            if (player.killsSnake) kills.push(`Snake: ${player.killsSnake}`);
            if (player.killsWolf) kills.push(`Wolf: ${player.killsWolf}`);
            if (player.killsBear) kills.push(`Bear: ${player.killsBear}`);
            if (player.killsPanther) kills.push(`Panther: ${player.killsPanther}`);

            if (kills.length > 0) {
                console.log(`      Kills: ${kills.join(', ')}`);
            }
            console.log('');
        }
    }
}

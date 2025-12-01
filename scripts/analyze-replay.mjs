#!/usr/bin/env node

/**
 * Replay File Analyzer
 * Analyzes WC3 replay files to check what data is available
 * 
 * Usage: node scripts/analyze-replay.mjs <path-to-replay.w3g>
 * 
 * Example: node scripts/analyze-replay.mjs ./replays/game.w3g
 */

import w3gjsModule from 'w3gjs';
// Handle different export formats
const W3GReplay = (typeof w3gjsModule === 'function' ? w3gjsModule : (w3gjsModule.default || w3gjsModule));
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function analyzeReplay(filePath) {
  console.log(colorize('\n🔍 WC3 Replay File Analyzer\n', colors.bright));
  console.log(colorize('File:', colors.cyan), filePath);
  
  // Read file
  let buffer;
  try {
    buffer = readFileSync(filePath);
    console.log(colorize('Size:', colors.cyan), formatBytes(buffer.length));
  } catch (error) {
    console.error(colorize('❌ Error reading file:', colors.red), error.message);
    process.exit(1);
  }

  // Parse replay
  console.log(colorize('\n📊 Parsing replay...\n', colors.bright));
  
  let replay;
  let parsed;
  
  try {
    replay = new W3GReplay();
    parsed = await replay.parse(buffer);
  } catch (error) {
    console.error(colorize('❌ Error parsing replay:', colors.red), error.message);
    console.error(colorize('Stack:', colors.gray), error.stack);
    process.exit(1);
  }

  // Analyze basic replay data
  console.log(colorize('═══════════════════════════════════════════════════════', colors.gray));
  console.log(colorize('BASIC REPLAY INFORMATION', colors.bright));
  console.log(colorize('═══════════════════════════════════════════════════════', colors.gray));
  
  const basicInfo = {
    'Game ID': parsed.randomseed || 'N/A',
    'Game Name': parsed.gamename || 'N/A',
    'Creator': parsed.creator || 'N/A',
    'Map': parsed.map?.path || parsed.map?.file || 'N/A',
    'Duration': parsed.duration ? `${Math.round(parsed.duration / 1000)}s` : 'N/A',
    'Version': parsed.version || 'N/A',
    'Build Number': parsed.buildNumber || 'N/A',
    'Game Type': parsed.type || 'N/A',
    'Expansion': parsed.expansion ? 'Yes' : 'No',
  };

  Object.entries(basicInfo).forEach(([key, value]) => {
    console.log(`  ${key.padEnd(20)}: ${value}`);
  });

  // Analyze players
  const players = parsed.players || [];
  console.log(colorize('\n═══════════════════════════════════════════════════════', colors.gray));
  console.log(colorize(`PLAYERS (${players.length})`, colors.bright));
  console.log(colorize('═══════════════════════════════════════════════════════', colors.gray));
  
  if (players.length === 0) {
    console.log(colorize('  ⚠️  No players found', colors.yellow));
  } else {
    players.forEach((player, idx) => {
      console.log(`\n  Player ${idx + 1}:`);
      console.log(`    Name:     ${player.name || 'N/A'}`);
      console.log(`    ID:       ${player.id}`);
      console.log(`    Team ID:  ${player.teamid}`);
      
      // Check for result/status properties
      const playerObj = player;
      const hasResult = 'result' in playerObj && playerObj.result !== undefined;
      const hasStatus = 'status' in playerObj && playerObj.status !== undefined;
      const hasWon = 'won' in playerObj && playerObj.won !== undefined;
      
      if (hasResult || hasStatus || hasWon) {
        console.log(colorize('    Result Properties:', colors.green));
        if (hasResult) console.log(`      result: ${playerObj.result}`);
        if (hasStatus) console.log(`      status: ${playerObj.status}`);
        if (hasWon) console.log(`      won: ${playerObj.won}`);
      } else {
        console.log(colorize('    Result Properties:', colors.yellow), 'None');
      }
      
      // Show all player properties
      const allKeys = Object.keys(player).filter(k => !['name', 'id', 'teamid'].includes(k));
      if (allKeys.length > 0) {
        console.log(colorize('    Other Properties:', colors.gray), allKeys.join(', '));
      }
    });
  }

  // Analyze winning team detection
  console.log(colorize('\n═══════════════════════════════════════════════════════', colors.gray));
  console.log(colorize('WINNING TEAM DETECTION', colors.bright));
  console.log(colorize('═══════════════════════════════════════════════════════', colors.gray));
  
  const winningTeamSources = {
    'parsed.winningTeamId': parsed.winningTeamId,
    'parsed.winnerTeamId': parsed.winnerTeamId,
  };
  
  let winnerFound = false;
  Object.entries(winningTeamSources).forEach(([source, value]) => {
    if (value !== undefined && typeof value === 'number' && value >= 0) {
      const isValid = players.some(p => p.teamid === value);
      if (isValid) {
        console.log(colorize(`  ✅ ${source}:`, colors.green), value);
        winnerFound = true;
      } else {
        console.log(colorize(`  ⚠️  ${source}:`, colors.yellow), value, '(invalid - no players on this team)');
      }
    } else {
      console.log(colorize(`  ❌ ${source}:`, colors.red), 'Not available');
    }
  });
  
  // Check player result properties
  const playersWithResult = players.filter(p => {
    const pObj = p;
    return ('result' in pObj && pObj.result !== undefined) ||
           ('status' in pObj && pObj.status !== undefined) ||
           ('won' in pObj && pObj.won !== undefined);
  });
  
  if (playersWithResult.length > 0) {
    console.log(colorize(`  ✅ Player result properties:`, colors.green), `${playersWithResult.length} players have result data`);
    playersWithResult.forEach(p => {
      const pObj = p;
      if (pObj.result === 'win' || pObj.status === 'winner' || pObj.won === true) {
        console.log(colorize(`    → Winner found:`, colors.green), `${p.name} (Team ${p.teamid})`);
        winnerFound = true;
      }
    });
  } else {
    console.log(colorize('  ❌ Player result properties:', colors.red), 'None');
  }
  
  if (!winnerFound) {
    console.log(colorize('  ⚠️  Could not determine winning team from basic sources', colors.yellow));
  }

  // Analyze W3MMD data
  console.log(colorize('\n═══════════════════════════════════════════════════════', colors.gray));
  console.log(colorize('W3MMD DATA ANALYSIS', colors.bright));
  console.log(colorize('═══════════════════════════════════════════════════════', colors.gray));
  
  const replayObj = replay;
  const parsedObj = parsed;
  
  // Check all possible W3MMD sources
  const w3mmdSources = {
    'replay.w3mmd': replayObj.w3mmd,
    'parsed.w3mmd': parsedObj.w3mmd,
    'replay.actions': replayObj.actions,
    'replay.w3mmdActions': replayObj.w3mmdActions,
    'replay.getW3mmd()': typeof replayObj.getW3mmd === 'function' ? replayObj.getW3mmd() : undefined,
  };
  
  let w3mmdActions = [];
  let w3mmdSource = null;
  
  Object.entries(w3mmdSources).forEach(([source, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      console.log(colorize(`  ✅ ${source}:`, colors.green), `${value.length} actions found`);
      if (!w3mmdSource) {
        w3mmdActions = value;
        w3mmdSource = source;
      }
    } else if (Array.isArray(value) && value.length === 0) {
      console.log(colorize(`  ⚠️  ${source}:`, colors.yellow), 'Empty array');
    } else if (value !== undefined) {
      console.log(colorize(`  ⚠️  ${source}:`, colors.yellow), typeof value, '(not an array)');
    } else {
      console.log(colorize(`  ❌ ${source}:`, colors.red), 'Not available');
    }
  });
  
  if (w3mmdActions.length === 0) {
    console.log(colorize('\n  ❌ NO W3MMD DATA FOUND', colors.red));
    console.log(colorize('  ⚠️  The replay file does not contain W3MMD data.', colors.yellow));
    console.log(colorize('  💡 This means either:', colors.cyan));
    console.log(colorize('     1. The game is not saving W3MMD data to replay files', colors.gray));
    console.log(colorize('     2. W3MMD is disabled in the game settings', colors.gray));
  } else {
    console.log(colorize(`\n  ✅ W3MMD DATA FOUND (${w3mmdActions.length} actions)`, colors.green));
    console.log(colorize(`  📍 Source: ${w3mmdSource}`, colors.cyan));
    
    // Analyze W3MMD structure
    const sampleAction = w3mmdActions[0];
    if (sampleAction && typeof sampleAction === 'object') {
      console.log(colorize('\n  Sample Action Structure:', colors.cyan));
      console.log('    Keys:', Object.keys(sampleAction).join(', '));
      
      if ('cache' in sampleAction && sampleAction.cache) {
        const cache = sampleAction.cache;
        console.log('    Cache:', typeof cache === 'object' ? Object.keys(cache).join(', ') : typeof cache);
        if (typeof cache === 'object' && cache.missionKey) {
          console.log('    Mission Key:', cache.missionKey);
        }
        if (typeof cache === 'object' && cache.key) {
          console.log('    Key:', cache.key);
        }
      }
      if ('value' in sampleAction) {
        console.log('    Value:', sampleAction.value);
      }
    }
    
    // Build lookup to check for winner/loser data
    const lookup = {};
    w3mmdActions.forEach((action) => {
      if (action && typeof action === 'object' && 'cache' in action && action.cache) {
        const cache = action.cache;
        if (typeof cache === 'object' && cache.missionKey && cache.key) {
          const missionKey = String(cache.missionKey).toLowerCase().replace(/[^a-z0-9]/g, '');
          const key = String(cache.key).toLowerCase();
          lookup[missionKey] = lookup[missionKey] || {};
          lookup[missionKey][key] = action.value;
        }
      }
    });
    
    // Check for winner/loser indicators in W3MMD
    const missionKeys = Object.keys(lookup);
    console.log(colorize(`\n  📊 W3MMD Lookup:`, colors.cyan), `${missionKeys.length} mission keys`);
    
    let w3mmdWinnerFound = false;
    for (const [missionKey, missionData] of Object.entries(lookup)) {
      for (const [key, value] of Object.entries(missionData)) {
        const normalizedKey = String(key).toLowerCase();
        const normalizedValue = String(value).toLowerCase();
        if ((normalizedKey.includes('winner') || normalizedKey.includes('win')) && (value > 0 || normalizedValue.includes('win'))) {
          console.log(colorize(`    ✅ Winner indicator found:`, colors.green), `${missionKey}.${key} = ${value}`);
          w3mmdWinnerFound = true;
        }
        if ((normalizedKey.includes('loser') || normalizedKey.includes('loss')) && (value > 0 || normalizedValue.includes('loss'))) {
          console.log(colorize(`    ✅ Loser indicator found:`, colors.green), `${missionKey}.${key} = ${value}`);
          w3mmdWinnerFound = true;
        }
      }
    }
    
    if (!w3mmdWinnerFound) {
      console.log(colorize('    ⚠️  No winner/loser indicators found in W3MMD data', colors.yellow));
    }
    
    // Show sample mission keys
    if (missionKeys.length > 0) {
      console.log(colorize('\n  Sample Mission Keys:', colors.cyan));
      missionKeys.slice(0, 5).forEach(mk => {
        const keys = Object.keys(lookup[mk]);
        console.log(`    ${mk}: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`);
      });
      if (missionKeys.length > 5) {
        console.log(colorize(`    ... and ${missionKeys.length - 5} more`, colors.gray));
      }
    }
  }

  // Summary
  console.log(colorize('\n═══════════════════════════════════════════════════════', colors.gray));
  console.log(colorize('SUMMARY', colors.bright));
  console.log(colorize('═══════════════════════════════════════════════════════', colors.gray));
  
  const summary = {
    'File Size': formatBytes(buffer.length),
    'Players': players.length,
    'Winning Team ID': parsed.winningTeamId !== undefined ? parsed.winningTeamId : 'Not available',
    'W3MMD Data': w3mmdActions.length > 0 ? `✅ Yes (${w3mmdActions.length} actions)` : '❌ No',
    'Can Detect Winner': winnerFound || w3mmdActions.length > 0 ? '✅ Yes' : '⚠️  Limited',
  };
  
  Object.entries(summary).forEach(([key, value]) => {
    const valueStr = String(value);
    const color = valueStr.includes('✅') ? colors.green : valueStr.includes('❌') ? colors.red : valueStr.includes('⚠️') ? colors.yellow : colors.reset;
    console.log(`  ${key.padEnd(20)}: ${colorize(valueStr, color)}`);
  });
  
  console.log('\n');
}

// Main execution
(async () => {
  let filePath = process.argv[2];

  // If no file path provided, look for .w3g files in current directory
  if (!filePath) {
    const cwd = process.cwd();
    const files = readdirSync(cwd).filter(f => f.endsWith('.w3g'));
    
    if (files.length === 0) {
      console.error(colorize('❌ Error: No file path provided and no .w3g files found in current directory', colors.red));
      console.log(colorize('\nUsage:', colors.cyan), 'node scripts/analyze-replay.mjs <path-to-replay.w3g>');
      console.log(colorize('Example:', colors.gray), 'node scripts/analyze-replay.mjs ./replays/game.w3g\n');
      process.exit(1);
    } else if (files.length === 1) {
      filePath = files[0];
      console.log(colorize(`\n📁 Auto-detected file: ${filePath}\n`, colors.cyan));
    } else {
      // Analyze all files
      console.log(colorize(`\n📁 Found ${files.length} .w3g files - analyzing all:\n`, colors.cyan));
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        console.log(colorize(`\n${'='.repeat(60)}`, colors.gray));
        console.log(colorize(`File ${i + 1} of ${files.length}: ${f}`, colors.bright));
        console.log(colorize(`${'='.repeat(60)}\n`, colors.gray));
        
        const resolvedPath = resolve(process.cwd(), f);
        try {
          await analyzeReplay(resolvedPath);
        } catch (error) {
          console.error(colorize(`❌ Error analyzing ${f}:`, colors.red), error.message);
          if (error.stack) {
            console.error(colorize('Stack:', colors.gray), error.stack);
          }
        }
        
        if (i < files.length - 1) {
          console.log('\n'); // Add spacing between files
        }
      }
      return; // Exit after analyzing all files
    }
  }

  // Resolve file path (support relative paths)
  const resolvedPath = resolve(process.cwd(), filePath);
  await analyzeReplay(resolvedPath);
})().catch((error) => {
  console.error(colorize('❌ Unexpected error:', colors.red), error);
  if (error.stack) {
    console.error(colorize('Stack:', colors.gray), error.stack);
  }
  process.exit(1);
});


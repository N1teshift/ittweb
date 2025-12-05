import { readFile } from 'node:fs/promises';
import W3GReplayModule from 'w3gjs';
const W3GReplay = W3GReplayModule.default || W3GReplayModule;
import { readMMDData } from './replay-metadata-parser/dist/mmd/mmdReader.js';
import { parsePayload } from './replay-metadata-parser/dist/payload/payloadParser.js';
import { loadMatchMetadataSpec } from './replay-metadata-parser/dist/spec/specLoader.js';
// Replicate extractITTMetadata logic inline
function extractITTMetadata(w3mmdActions) {
  const customData = new Map();

  for (const action of w3mmdActions) {
    const actionObj = action;
    const key = actionObj?.cache?.key;
    
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
  };
}

function parseITTPayload(payload, schemaVersion) {
  const players = [];
  const lines = payload.split('\n');

  for (const line of lines) {
    if (!line.startsWith('player:')) continue;

    const parts = line.slice('player:'.length).split('|');
    
    if (parts.length >= 17 && schemaVersion && schemaVersion >= 3) {
      players.push({
        slotIndex: parseInt(parts[0], 10) || 0,
        name: parts[1] || '',
        trollClass: parts[3] || undefined,
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
      });
    } else if (parts.length >= 16) {
      players.push({
        slotIndex: parseInt(parts[0], 10) || 0,
        name: parts[1] || '',
        damageTroll: parseInt(parts[5], 10) || 0,
        selfHealing: parseInt(parts[6], 10) || 0,
        allyHealing: parseInt(parts[7], 10) || 0,
        goldAcquired: parseInt(parts[8], 10) || 0,
        meatEaten: parseInt(parts[9], 10) || 0,
        killsElk: parseInt(parts[10], 10) || 0,
        killsHawk: parseInt(parts[11], 10) || 0,
        killsSnake: parseInt(parts[12], 10) || 0,
        killsWolf: parseInt(parts[13], 10) || 0,
        killsBear: parseInt(parts[14], 10) || 0,
        killsPanther: parseInt(parts[15], 10) || 0,
      });
    }
  }

  return players;
}

const replayFile = 'Replay_2025_12_04_2333.w3g';

console.log('='.repeat(60));
console.log('Parsing replay:', replayFile);
console.log('='.repeat(60));

const buffer = await readFile(replayFile);

// Parse with w3gjs (what the website parser uses)
console.log('\n1. W3GJS PARSER (what parseReplayFile uses):');
console.log('-'.repeat(60));
const replay = new W3GReplay();
let parsed = {};
try {
  parsed = await replay.parse(buffer);
} catch (e) {
  console.log('Note: Parse errors occurred, but continuing with partial data...');
}

const w3gjsPlayers = (parsed?.players || replay?.players || []);
console.log(`Found ${Array.isArray(w3gjsPlayers) ? w3gjsPlayers.length : 0} players from w3gjs:`);
if (Array.isArray(w3gjsPlayers)) {
  w3gjsPlayers.forEach((p) => {
    console.log(`  - Player ID: ${p.id}, Name: "${p.name}", Team: ${p.teamid}`);
  });
} else {
  console.log('  (No players array found)');
}

// Get W3MMD actions
let w3mmdActions = [];
if (Array.isArray(replay.w3mmd)) {
  w3mmdActions = replay.w3mmd;
} else if (Array.isArray(parsed?.w3mmd)) {
  w3mmdActions = parsed.w3mmd;
} else if (replay && typeof replay === 'object' && 'w3mmd' in replay) {
  w3mmdActions = Array.isArray(replay.w3mmd) ? replay.w3mmd : [];
}
console.log(`\nW3MMD actions found: ${w3mmdActions.length}`);

// Extract ITT metadata using website parser method
console.log('\n2. WEBSITE PARSER extractITTMetadata:');
console.log('-'.repeat(60));
const ittMetadata = extractITTMetadata(w3mmdActions);
if (ittMetadata) {
  console.log(`✓ ITT metadata found!`);
  console.log(`  Version: ${ittMetadata.version}`);
  console.log(`  Schema: ${ittMetadata.schema}`);
  console.log(`  Players in metadata: ${ittMetadata.players.length}`);
  console.log('\n  ITT Metadata Players:');
  ittMetadata.players.forEach((p) => {
    console.log(`    - SlotIndex: ${p.slotIndex}, Name: "${p.name}"`);
    console.log(`      Stats: damage=${p.damageTroll}, elk=${p.killsElk}, hawk=${p.killsHawk}`);
  });
} else {
  console.log('✗ No ITT metadata found');
}

// Extract using MMD reader (new parser)
console.log('\n3. MMD READER (new parser method):');
console.log('-'.repeat(60));
const mmdResult = await readMMDData(replayFile);
if (mmdResult.ittMetadata?.payload) {
  const spec = await loadMatchMetadataSpec();
  const metadata = parsePayload(mmdResult.ittMetadata.payload, spec, { 
    skipChecksumValidation: true 
  });
  console.log(`✓ Metadata found!`);
  console.log(`  Players: ${metadata.playerCount}`);
  console.log('\n  Metadata Players:');
  metadata.players.forEach((p) => {
    console.log(`    - SlotIndex: ${p.slotIndex}, Name: "${p.name}", Team: ${p.team}`);
    if (p.stats) {
      console.log(`      Stats: damage=${p.stats.damageTroll}, elk=${p.stats.kills.elk}, hawk=${p.stats.kills.hawk}`);
    }
  });
}

// Now show the matching problem
console.log('\n4. MATCHING ANALYSIS:');
console.log('-'.repeat(60));
console.log('How website parser matches players:');
console.log('  ittPlayer = ittMetadata.players.find(');
console.log('    p.slotIndex === player.id || normalized name match');
console.log('  )');
console.log('\nMatching results:');
if (!Array.isArray(w3gjsPlayers) || w3gjsPlayers.length === 0) {
  console.log('  (Cannot match - no w3gjs players found)');
} else {
  w3gjsPlayers.forEach((player) => {
  if (!ittMetadata) {
    console.log(`  Player ${player.id} ("${player.name}"): NO METADATA AVAILABLE`);
    return;
  }
  
  const ittPlayer = ittMetadata.players.find(
    (p) => p.slotIndex === player.id ||
      p.name.toLowerCase().replace(/[^a-z0-9]/g, '') ===
      (player.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  );
  
  if (ittPlayer) {
    console.log(`  ✓ Player ${player.id} ("${player.name}") → Matched to SlotIndex ${ittPlayer.slotIndex} ("${ittPlayer.name}")`);
    console.log(`    Stats: damage=${ittPlayer.damageTroll}, elk=${ittPlayer.killsElk}`);
  } else {
    console.log(`  ✗ Player ${player.id} ("${player.name}") → NO MATCH FOUND`);
    console.log(`    Available ITT players: ${ittMetadata.players.map(p => `slot${p.slotIndex}:"${p.name}"`).join(', ')}`);
  }
  });
}


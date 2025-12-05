import { readFile } from 'node:fs/promises';
import { readMMDData } from './replay-metadata-parser/dist/mmd/mmdReader.js';
import { parsePayload } from './replay-metadata-parser/dist/payload/payloadParser.js';
import { loadMatchMetadataSpec } from './replay-metadata-parser/dist/spec/specLoader.js';
import W3GReplayModule from 'w3gjs';
const W3GReplay = W3GReplayModule.default || W3GReplayModule;

const replayFile = 'Replay_2025_12_04_2333.w3g';

console.log('='.repeat(60));
console.log('Checking player status in replay:', replayFile);
console.log('='.repeat(60));

const buffer = await readFile(replayFile);

// Parse with w3gjs
const replay = new W3GReplay();
let parsed = {};
try {
  parsed = await replay.parse(buffer);
} catch (e) {
  // Continue with partial data
}

const w3gjsPlayers = (parsed?.players || replay?.players || []);

console.log('\n1. ALL PLAYERS IN REPLAY (from w3gjs):');
console.log('-'.repeat(60));
if (Array.isArray(w3gjsPlayers)) {
  w3gjsPlayers.forEach((p) => {
    console.log(`  Player ID: ${p.id}, Name: "${p.name}", Team: ${p.teamid}`);
    console.log(`    Result: ${p.result || 'unknown'}`);
    if (p.leftAt) console.log(`    Left at: ${p.leftAt}`);
    if (p.leftReason) console.log(`    Left reason: ${p.leftReason}`);
  });
} else {
  console.log('  (No players array found)');
}

// Get metadata
console.log('\n2. PLAYERS IN METADATA:');
console.log('-'.repeat(60));
const mmdResult = await readMMDData(replayFile);
if (mmdResult.ittMetadata?.payload) {
  const spec = await loadMatchMetadataSpec();
  const metadata = parsePayload(mmdResult.ittMetadata.payload, spec, { 
    skipChecksumValidation: true 
  });
  
  console.log(`Total players in metadata: ${metadata.playerCount}`);
  metadata.players.forEach((p) => {
    console.log(`  SlotIndex: ${p.slotIndex}, Name: "${p.name}", Team: ${p.team}, Result: ${p.result}`);
  });
  
  console.log('\n3. COMPARISON:');
  console.log('-'.repeat(60));
  console.log('Players in replay but NOT in metadata:');
  if (Array.isArray(w3gjsPlayers)) {
    w3gjsPlayers.forEach((player) => {
      const inMetadata = metadata.players.some(
        (p) => p.slotIndex === player.id || 
          p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === 
          (player.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (!inMetadata) {
        console.log(`  ✗ "${player.name}" (ID: ${player.id}) - NOT IN METADATA`);
        console.log(`    This suggests the player left early or wasn't present when metadata was recorded`);
      }
    });
  }
  
  console.log('\nPlayers in metadata but NOT in replay:');
  metadata.players.forEach((p) => {
    const inReplay = Array.isArray(w3gjsPlayers) && w3gjsPlayers.some(
      (player) => player.id === p.slotIndex ||
        (player.name || '').toLowerCase().replace(/[^a-z0-9]/g, '') === 
        p.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    if (!inReplay) {
      console.log(`  ✗ "${p.name}" (SlotIndex: ${p.slotIndex}) - NOT IN REPLAY`);
    }
  });
} else {
  console.log('No metadata found');
}


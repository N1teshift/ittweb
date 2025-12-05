#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { decodeReplay } from './replay-metadata-parser/dist/decodeReplay.js';
import { readMMDData } from './replay-metadata-parser/dist/mmd/mmdReader.js';
import { readChatMessages } from './replay-metadata-parser/dist/chat/chatReader.js';
import { parsePayload } from './replay-metadata-parser/dist/payload/payloadParser.js';
import { loadMatchMetadataSpec } from './replay-metadata-parser/dist/spec/specLoader.js';
import W3GReplay from 'w3gjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Import the old extractITTMetadata function
// We'll need to use dynamic import or read the file directly
// For now, let's replicate the logic inline
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

const REPLAYS = [
  'Replay_2025_12_04_2333.w3g',
  'Replay_2025_12_05_0023.w3g',
];

async function testOldMethod(buffer) {
  console.log('\n=== Testing OLD METHOD (extractITTMetadata) ===');
  try {
    const replay = new W3GReplay();
    const parsed = await replay.parse(buffer);
    const w3mmdActions = Array.isArray(replay.w3mmd) ? replay.w3mmd : (parsed.w3mmd || []);
    
    const ittMetadata = extractITTMetadata(w3mmdActions);
    
    if (ittMetadata) {
      console.log('✓ ITT metadata found via old method');
      console.log('  Version:', ittMetadata.version);
      console.log('  Schema:', ittMetadata.schema);
      console.log('  Players:', ittMetadata.players.length);
      console.log('  Payload length:', ittMetadata.payload.length);
      if (ittMetadata.players.length > 0) {
        console.log('  Sample player:', JSON.stringify(ittMetadata.players[0], null, 2));
      }
      return { success: true, metadata: ittMetadata };
    } else {
      console.log('✗ No ITT metadata found via old method');
      console.log('  W3MMD actions count:', w3mmdActions.length);
      return { success: false, reason: 'No ITT metadata in W3MMD' };
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testMMDMethod(filePath) {
  console.log('\n=== Testing MMD METHOD (w3mmd protocol) ===');
  try {
    const mmdResult = await readMMDData(filePath);
    
    console.log('  Total MMD messages:', mmdResult.allMessages.length);
    console.log('  Custom data entries:', mmdResult.customData.size);
    
    if (!mmdResult.ittMetadata?.payload) {
      console.log('✗ No ITT metadata found in MMD data');
      console.log('  Custom data keys:', Array.from(mmdResult.customData.keys()));
      return { success: false, reason: 'No ITT metadata in MMD' };
    }
    
    console.log('✓ ITT metadata found via MMD');
    console.log('  Version:', mmdResult.ittMetadata.version);
    console.log('  Schema:', mmdResult.ittMetadata.schema);
    console.log('  Chunks:', mmdResult.ittMetadata.chunks.length);
    console.log('  Payload length:', mmdResult.ittMetadata.payload.length);
    
    // Try to parse the payload
    const spec = await loadMatchMetadataSpec();
    const metadata = parsePayload(mmdResult.ittMetadata.payload, spec, { 
      skipChecksumValidation: true 
    });
    
    console.log('  Parsed metadata:');
    console.log('    Match ID:', metadata.matchId);
    console.log('    Map:', metadata.mapName, 'v' + metadata.mapVersion);
    console.log('    Players:', metadata.playerCount);
    console.log('    Duration:', metadata.durationSeconds, 's');
    
    return { success: true, metadata, raw: mmdResult.ittMetadata };
  } catch (error) {
    console.log('✗ Error:', error.message);
    if (error.stack) console.log('  Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
    return { success: false, error: error.message };
  }
}

async function testOrderMethod(filePath) {
  console.log('\n=== Testing ORDER METHOD (order-based encoding) ===');
  try {
    const result = await decodeReplay(filePath);
    
    console.log('✓ Metadata decoded via order method');
    console.log('  Match ID:', result.metadata.matchId);
    console.log('  Map:', result.metadata.mapName, 'v' + result.metadata.mapVersion);
    console.log('  Players:', result.metadata.playerCount);
    console.log('  Duration:', result.metadata.durationSeconds, 's');
    console.log('  Orders found:', result.orders.length);
    console.log('  Payload length:', result.payload.length);
    
    if (result.metadata.players.length > 0) {
      console.log('  Sample player:', JSON.stringify(result.metadata.players[0], null, 2));
    }
    
    return { success: true, result };
  } catch (error) {
    console.log('✗ Error:', error.message);
    if (error.stack) console.log('  Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
    return { success: false, error: error.message };
  }
}

async function testChatMethod(filePath) {
  console.log('\n=== Testing CHAT METHOD (chat-based encoding) ===');
  try {
    const chatResult = await readChatMessages(filePath);
    
    console.log('  Total chat messages:', chatResult.allMessages.length);
    console.log('  Metadata messages:', chatResult.metadataMessages.length);
    
    if (!chatResult.metadataPayload) {
      console.log('✗ No metadata found in chat messages');
      return { success: false, reason: 'No metadata in chat' };
    }
    
    console.log('✓ Metadata found via chat');
    console.log('  Payload length:', chatResult.metadataPayload.length);
    
    const spec = await loadMatchMetadataSpec();
    const metadata = parsePayload(chatResult.metadataPayload, spec);
    
    console.log('  Parsed metadata:');
    console.log('    Match ID:', metadata.matchId);
    console.log('    Map:', metadata.mapName, 'v' + metadata.mapVersion);
    console.log('    Players:', metadata.playerCount);
    
    return { success: true, metadata, raw: chatResult.metadataPayload };
  } catch (error) {
    console.log('✗ Error:', error.message);
    if (error.stack) console.log('  Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
    return { success: false, error: error.message };
  }
}

async function diagnoseReplay(filePath) {
  console.log('\n' + '='.repeat(60));
  console.log(`Diagnosing: ${filePath}`);
  console.log('='.repeat(60));
  
  const fullPath = join(projectRoot, filePath);
  const buffer = await readFile(fullPath);
  console.log('File size:', buffer.length, 'bytes');
  
  const results = {
    old: await testOldMethod(buffer),
    mmd: await testMMDMethod(fullPath),
    order: await testOrderMethod(fullPath),
    chat: await testChatMethod(fullPath),
  };
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log('Old method (extractITTMetadata):', results.old.success ? '✓' : '✗');
  console.log('MMD method (w3mmd protocol):', results.mmd.success ? '✓' : '✗');
  console.log('Order method (order-based):', results.order.success ? '✓' : '✗');
  console.log('Chat method (chat-based):', results.chat.success ? '✓' : '✗');
  
  // Identify the issue
  if (results.order.success && !results.old.success) {
    console.log('\n⚠️  ISSUE IDENTIFIED:');
    console.log('   Metadata is encoded using ORDER-BASED method,');
    console.log('   but parseReplayFile() uses the OLD METHOD.');
    console.log('   Solution: Update parseReplayFile() to use decodeReplay()');
  } else if (results.mmd.success && !results.old.success) {
    console.log('\n⚠️  ISSUE IDENTIFIED:');
    console.log('   Metadata is in MMD format, but old method is not finding it.');
    console.log('   Check the extractITTMetadata() function logic.');
  } else if (!results.order.success && !results.mmd.success && !results.chat.success) {
    console.log('\n⚠️  ISSUE IDENTIFIED:');
    console.log('   No metadata found in any format. Check if:');
    console.log('   1. The replay was recorded with metadata enabled');
    console.log('   2. The spec file matches the map version');
  }
  
  return results;
}

async function main() {
  console.log('Replay Diagnostic Tool');
  console.log('======================');
  
  for (const replay of REPLAYS) {
    try {
      await diagnoseReplay(replay);
    } catch (error) {
      console.error(`\n✗ Failed to process ${replay}:`, error.message);
      if (error.stack) {
        console.error(error.stack.split('\n').slice(0, 5).join('\n'));
      }
    }
  }
}

main().catch(console.error);


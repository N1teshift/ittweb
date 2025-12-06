#!/usr/bin/env node
/**
 * Master Replay Parser Script
 * 
 * This script replicates the EXACT SAME logic as the website parser
 * (src/features/modules/game-management/lib/mechanics/replay/parser.ts)
 * to ensure that testing with this script validates the production parser.
 * 
 * Usage:
 *   node scripts/parse-replay.mjs <replay-file.w3g>
 *   node scripts/parse-replay.mjs --all
 *   node scripts/parse-replay.mjs --verbose
 */

import { readFile, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, basename } from 'node:path';
import { parseReplayFile } from './replay-parser/parser.mjs';
import { validateResults, formatOutputData, writeDebugLog, displayResults } from './replay-parser/output.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const parseAll = args.includes('--all');
const verbose = args.includes('--verbose') || args.includes('-v');

// Get replay files to parse
let replayFiles = [];
if (parseAll) {
    const files = readdirSync(projectRoot);
    replayFiles = files.filter(f => f.endsWith('.w3g')).map(f => resolve(projectRoot, f));
} else if (args.length > 0 && !args[0].startsWith('--')) {
    replayFiles = args.filter(arg => !arg.startsWith('--')).map(f => resolve(projectRoot, f));
} else {
    replayFiles = [
        resolve(projectRoot, 'Replay_2025_12_05_2315.w3g'),
        resolve(projectRoot, 'Replay_2025_12_06_0022.w3g')
    ];
}

console.log('='.repeat(80));
console.log('MASTER REPLAY PARSER');
console.log('Uses the same parser as the website (src/features/modules/game-management/lib/mechanics/replay/parser.ts)');
console.log('='.repeat(80));
console.log(`\nParsing ${replayFiles.length} replay file(s)...\n`);

// Parse each replay
const results = [];
for (const replayPath of replayFiles) {
    const fileName = basename(replayPath);
    console.log('─'.repeat(80));
    console.log(`📁 File: ${fileName}`);
    console.log('─'.repeat(80));

    try {
        const buffer = await readFile(replayPath);
        console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
        console.log(`   Parsing with website parser...`);

        const result = await parseReplayFile(buffer);
        
        // Note: RangeErrors from w3gjs are automatically suppressed during parsing
        const { gameData, w3mmd, ittMetadata, debugMatching, parsingSteps } = result;

        // Write debug log
        await writeDebugLog(projectRoot, debugMatching);

        // Validate results
        const checks = validateResults(gameData, w3mmd, ittMetadata);

        // Display results
        displayResults(gameData, w3mmd, ittMetadata, checks, verbose);

        // Save to JSON file
        const outputPath = replayPath.replace('.w3g', '_parsed.json');
        const outputData = formatOutputData(fileName, checks, gameData, w3mmd, ittMetadata, debugMatching, parsingSteps);
        await writeFile(outputPath, JSON.stringify(outputData, null, 2));
        console.log(`\n💾 Results saved to: ${basename(outputPath)}`);

        results.push({
            file: fileName,
            success: true,
            checks
        });

    } catch (error) {
        if (error.code === 'ERR_OUT_OF_RANGE' || error.name === 'RangeError') {
            console.log(`   ❌ RangeError: ${error.message}`);
            console.log(`   (Multiple RangeErrors were suppressed during parsing)`);
            results.push({
                file: fileName,
                success: false,
                error: error.message
            });
            console.log('');
            continue;
        }

        console.log(`\n❌ PARSING FAILED`);
        console.log(`   Error: ${error.message}`);
        if (verbose && error.stack) {
            console.log(`\n   Stack trace:`);
            console.log(error.stack.split('\n').slice(0, 10).join('\n'));
        }

        results.push({
            file: fileName,
            success: false,
            error: error.message
        });
    }

    console.log('');
}

// Summary
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
const successful = results.filter(r => r.success).length;
const failed = results.filter(r => !r.success).length;
console.log(`✅ Successful: ${successful}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${results.length}`);

if (failed === 0) {
    console.log('\n🎉 All replays parsed successfully!');
} else {
    console.log('\n⚠️  Some replays failed to parse. Check the output above for details.');
}

console.log('\nTip: Use --verbose or -v flag for detailed player statistics');
console.log('='.repeat(80));

process.exit(failed > 0 ? 1 : 0);

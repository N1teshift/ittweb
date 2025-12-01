/**
 * Extract detailed ability properties from Wurst source files
 * 
 * Parses Wurst ability definition files to extract:
 * - Damage, mana cost, cooldown values
 * - Area of effect, max targets
 * - Hotkeys, target types
 * - Visual effects (missile art, etc.)
 * 
 * Usage: node scripts/data/extract-ability-details-from-wurst.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROOT_DIR } from '../lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WURST_ABILITIES_DIR = path.join(ROOT_DIR, 'island-troll-tribes', 'wurst', 'objects', 'abilities');

/**
 * Extract constant value from Wurst code
 */
function extractConstant(content, constantName) {
  // Match: let CONSTANT = value;
  const regex = new RegExp(`let\\s+${constantName}\\s*=\\s*([^;]+);`, 'i');
  const match = content.match(regex);
  if (!match) return undefined;
  
  const value = match[1].trim();
  // Remove quotes if string
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  // Parse numeric
  const num = parseFloat(value);
  return isNaN(num) ? value : num;
}

/**
 * Extract method call parameter
 */
function extractMethodCall(content, methodName) {
  // Match: this.setMethodName(level, value) or this.setMethodName(value)
  const regex = new RegExp(`this\\.${methodName}\\s*\\([^,]*,\\s*([^)]+)\\)`, 'i');
  const match = content.match(regex);
  if (!match) return undefined;
  
  const value = match[1].trim();
  // Remove quotes if string
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  // Parse numeric
  const num = parseFloat(value);
  return isNaN(num) ? value : num;
}

/**
 * Extract preset method call (for level-based values)
 */
function extractPresetMethod(content, methodName) {
  // Match: this.presetMethodName(lvl -> value)
  const regex = new RegExp(`this\\.${methodName}\\s*\\([^)]*->\\s*([^)]+)\\)`, 'i');
  const match = content.match(regex);
  if (!match) return undefined;
  
  const value = match[1].trim();
  // Remove quotes if string
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  // Parse numeric
  const num = parseFloat(value);
  return isNaN(num) ? value : num;
}

/**
 * Extract ability ID from file
 */
function extractAbilityId(content, filePath) {
  // Try to find ABILITY_* constant in create function
  const createMatch = content.match(/new\s+\w+\s*\(\s*(ABILITY_\w+)/);
  if (createMatch) {
    return createMatch[1].toLowerCase().replace(/_/g, '-').replace(/^ability-/, '');
  }
  
  // Try to find in class name
  const classMatch = content.match(/class\s+(\w+)\s+extends/);
  if (classMatch) {
    const className = classMatch[1];
    // Convert CamelCase to kebab-case
    return className
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }
  
  // Fallback to filename
  const fileName = path.basename(filePath, '.wurst');
  return fileName.toLowerCase().replace(/_/g, '-');
}

/**
 * Recursively find all .wurst files
 */
function findWurstFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findWurstFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.wurst')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Extract ability details from a Wurst file
 */
function extractAbilityFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if it doesn't look like an ability definition
  if (!content.includes('extends') && !content.includes('AbilityDefinition')) {
    return null;
  }
  
  const abilityId = extractAbilityId(content, filePath);
  
  // Extract constants
  const damage = extractConstant(content, 'DAMAGE') || extractConstant(content, 'DAMAGE_PER_TARGET');
  const manaCost = extractConstant(content, 'MANACOST') || extractConstant(content, 'MANA_COST');
  const cooldown = extractConstant(content, 'COOLDOWN');
  const aoe = extractConstant(content, 'AREA_OF_EFFECT') || extractConstant(content, 'AOE');
  const castRange = extractConstant(content, 'CAST_RANGE') || extractConstant(content, 'RANGE');
  const maxTargets = extractConstant(content, 'MAX_TARGETS') || extractConstant(content, 'MAXIMUM_TARGETS');
  const duration = extractConstant(content, 'DURATION') || extractConstant(content, 'TRACK_DURATION');
  
  // Extract method calls
  const hotkey = extractMethodCall(content, 'setHotkeyNormal') || extractPresetMethod(content, 'presetHotkeyNormal');
  const extractedAoe = extractMethodCall(content, 'setAreaofEffect') || extractPresetMethod(content, 'presetAreaofEffect');
  const extractedMaxTargets = extractMethodCall(content, 'setMaximumNumberofTargets') || extractPresetMethod(content, 'presetMaximumNumberofTargets');
  const missileArt = extractMethodCall(content, 'setMissileArt');
  const artEffect = extractMethodCall(content, 'setArtEffect');
  const artTarget = extractMethodCall(content, 'setArtTarget');
  const artCaster = extractMethodCall(content, 'setArtCaster');
  
  // Extract button position
  const buttonX = extractMethodCall(content, 'setButtonPositionNormalX');
  const buttonY = extractMethodCall(content, 'setButtonPositionNormalY');
  
  // Extract target types
  const targetTypes = extractPresetMethod(content, 'presetTargetTypes');
  const targetsAllowed = extractPresetMethod(content, 'presetTargetsAllowed');
  
  // Build result
  const result = {
    abilityId,
    source: path.relative(ROOT_DIR, filePath),
  };
  
  if (damage !== undefined) result.damage = damage;
  if (manaCost !== undefined) result.manaCost = manaCost;
  if (cooldown !== undefined) result.cooldown = cooldown;
  if (extractedAoe !== undefined) result.areaOfEffect = extractedAoe;
  else if (aoe !== undefined) result.areaOfEffect = aoe;
  if (extractedMaxTargets !== undefined) result.maxTargets = extractedMaxTargets;
  else if (maxTargets !== undefined) result.maxTargets = maxTargets;
  if (castRange !== undefined) result.castRange = castRange;
  if (duration !== undefined) result.duration = duration;
  if (hotkey !== undefined) result.hotkey = hotkey;
  if (targetTypes !== undefined) result.targetTypes = targetTypes;
  if (targetsAllowed !== undefined) result.targetsAllowed = targetsAllowed;
  if (missileArt !== undefined || artEffect !== undefined || artTarget !== undefined || artCaster !== undefined) {
    result.visualEffects = {};
    if (missileArt !== undefined) result.visualEffects.missileArt = missileArt;
    if (artEffect !== undefined) result.visualEffects.artEffect = artEffect;
    if (artTarget !== undefined) result.visualEffects.artTarget = artTarget;
    if (artCaster !== undefined) result.visualEffects.artCaster = artCaster;
  }
  if (buttonX !== undefined || buttonY !== undefined) {
    result.buttonPosition = {};
    if (buttonX !== undefined) result.buttonPosition.x = buttonX;
    if (buttonY !== undefined) result.buttonPosition.y = buttonY;
  }
  
  // Only return if we found something useful
  if (Object.keys(result).length > 2) {
    return result;
  }
  
  return null;
}

/**
 * Main extraction function
 */
function main() {
  console.log('🔍 Extracting ability details from Wurst source files...\n');
  
  if (!fs.existsSync(WURST_ABILITIES_DIR)) {
    console.warn(`⚠️  Wurst abilities directory not found: ${WURST_ABILITIES_DIR}`);
    return;
  }
  
  const wurstFiles = findWurstFiles(WURST_ABILITIES_DIR);
  console.log(`  Found ${wurstFiles.length} Wurst files to process\n`);
  
  const abilities = {};
  let extractedCount = 0;
  
  for (const file of wurstFiles) {
    try {
      const ability = extractAbilityFromFile(file);
      if (ability) {
        // Use abilityId as key, but also store by various possible IDs
        abilities[ability.abilityId] = ability;
        extractedCount++;
      }
    } catch (error) {
      console.warn(`  ⚠️  Error processing ${file}: ${error.message}`);
    }
  }
  
  console.log(`  ✅ Extracted details for ${extractedCount} abilities\n`);
  
  // Save results
  const outputDir = path.join(ROOT_DIR, 'tmp', 'work-data', 'metadata');
  fs.mkdirSync(outputDir, { recursive: true });
  
  const outputFile = path.join(outputDir, 'ability-details-wurst.json');
  const output = {
    generatedAt: new Date().toISOString(),
    source: 'Wurst source files',
    totalAbilities: extractedCount,
    abilities,
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`✅ Saved to: ${outputFile}`);
}

main();




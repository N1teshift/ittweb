/**
 * Resolve field references in tooltips and descriptions
 * 
 * This script replaces placeholders like <AMd5,Cool1> with actual values
 * by looking up the ability data.
 * 
 * Usage: node scripts/data/resolve-field-references.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRootDir, loadJson, getTypeScriptFiles } from '../lib/utils.mjs';
import { TMP_RAW_DIR, ABILITIES_TS_DIR, ITEMS_TS_DIR, UNITS_TS_DIR } from '../lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = getRootDir();

// Pattern to match field references: <CODE,Field> or <CODE,Field,suffix>
const FIELD_REF_PATTERN = /<([A-Za-z0-9!{}|~$]{4}),([A-Za-z0-9!{}|~$]+)(?:,([^>]*))?>/g;

/**
 * Map of ability raw ID -> ability data with field values
 */
const abilityFieldCache = new Map();

/**
 * Load ability data from extracted JSON files
 */
function loadAbilityData() {
  const abilitiesFile = path.join(TMP_RAW_DIR, 'abilities.json');
  const abilitiesData = loadJson(abilitiesFile);
  
  if (!abilitiesData || !abilitiesData.abilities) {
    console.warn('⚠️  No extracted ability data found. Run extraction first.');
    return {};
  }
  
  const abilityMap = {};
  
  for (const ability of abilitiesData.abilities) {
    if (!ability.id) continue;
    
    // Extract raw ID (first 4 chars)
    const rawId = ability.id.split(':')[0].substring(0, 4);
    
    if (!abilityMap[rawId]) {
      abilityMap[rawId] = {
        id: rawId,
        fullId: ability.id,
        name: ability.name,
        raw: ability.raw || [],
        cooldown: ability.cooldown,
        duration: ability.duration,
        manaCost: ability.manaCost,
        range: ability.range,
        damage: ability.damage,
        levels: ability.levels || {},
      };
    }
  }
  
  return abilityMap;
}

/**
 * Get field value from ability modifications
 */
function getFieldValue(modifications, fieldId, level = 1) {
  if (!Array.isArray(modifications)) return null;
  
  // Try level 1 first, then level 0, then any level
  for (const tryLevel of [level, 0]) {
    const field = modifications.find(m => 
      m.id && m.id.toLowerCase() === fieldId.toLowerCase() && m.level === tryLevel
    );
    if (field && field.value !== undefined && field.value !== null && field.value !== '') {
      return field.value;
    }
  }
  
  // Try any level
  const field = modifications.find(m => 
    m.id && m.id.toLowerCase() === fieldId.toLowerCase()
  );
  return field ? field.value : null;
}

/**
 * Map field identifier to Warcraft 3 field ID
 */
function mapFieldIdentifierToWC3Field(fieldIdentifier) {
  const mapping = {
    'Cool1': 'acdn',      // Cooldown
    'Dur1': 'adur',       // Duration
    'HeroDur1': 'ahdu',   // Hero Duration
    // DataA1, DataB1, DataC1 are context-dependent - handled separately
  };
  
  return mapping[fieldIdentifier] || null;
}

/**
 * Resolve a field reference
 */
function resolveFieldReference(abilityRawId, fieldIdentifier, abilityMap) {
  const ability = abilityMap[abilityRawId];
  if (!ability) {
    return null;
  }
  
  // Handle known field identifiers
  switch (fieldIdentifier) {
    case 'Cool1':
      // Try to get cooldown from extracted data first
      if (ability.cooldown !== undefined) {
        return ability.cooldown;
      }
      // Try from levels
      if (ability.levels && ability.levels.cooldown && ability.levels.cooldown['1']) {
        return ability.levels.cooldown['1'];
      }
      // Try from raw modifications
      return getFieldValue(ability.raw, 'acdn', 1) || 
             getFieldValue(ability.raw, 'acd1', 1) ||
             getFieldValue(ability.raw, 'acd2', 1);
      
    case 'Dur1':
      if (ability.duration !== undefined) {
        return ability.duration;
      }
      if (ability.levels && ability.levels.duration && ability.levels.duration['1']) {
        return ability.levels.duration['1'];
      }
      return getFieldValue(ability.raw, 'adur', 1);
      
    case 'HeroDur1':
      return getFieldValue(ability.raw, 'ahdu', 1);
      
    case 'DataA1':
    case 'DataB1':
    case 'DataC1':
      // Context-dependent - try common field mappings
      // DataA1 often maps to various fields depending on ability type
      // We'll try to find it in the raw modifications
      // Most abilities have DataA1 as the primary data field
      return getFieldValue(ability.raw, 'adta', 1) || // Try DataA field
             getFieldValue(ability.raw, 'adtb', 1) || // Try DataB field
             getFieldValue(ability.raw, 'adtc', 1);   // Try DataC field
      
    default:
      // Try to find the field directly
      const wc3Field = mapFieldIdentifierToWC3Field(fieldIdentifier);
      if (wc3Field) {
        return getFieldValue(ability.raw, wc3Field, 1);
      }
      return null;
  }
}

/**
 * Resolve all field references in text
 */
function resolveFieldReferences(text, abilityMap) {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(FIELD_REF_PATTERN, (match, abilityId, fieldIdentifier, suffix) => {
    const value = resolveFieldReference(abilityId, fieldIdentifier, abilityMap);
    
    if (value === null || value === undefined) {
      // Keep original if we can't resolve
      return match;
    }
    
    // Format the value
    let formattedValue = value;
    if (typeof value === 'number') {
      // For decimals, keep one decimal place if needed
      if (value % 1 !== 0) {
        formattedValue = value.toFixed(1).replace(/\.0$/, '');
      } else {
        formattedValue = value.toString();
      }
    }
    
    // Add suffix if provided (like %>% for percentage)
    if (suffix) {
      formattedValue += suffix;
    }
    
    return formattedValue;
  });
}

/**
 * Load all TypeScript ability files
 */
function loadTypeScriptAbilities() {
  return getTypeScriptFiles(ABILITIES_TS_DIR);
}

/**
 * Load all TypeScript item files
 */
function loadTypeScriptItems() {
  return getTypeScriptFiles(ITEMS_TS_DIR, ['index.ts', 'types.ts', 'abilityIdMapper.ts']);
}

/**
 * Load all TypeScript unit files
 */
function loadTypeScriptUnits() {
  return getTypeScriptFiles(UNITS_TS_DIR);
}

/**
 * Process a TypeScript file and resolve field references
 */
function processTypeScriptFile(filePath, abilityMap) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Find all tooltip and description fields
  const fieldPattern = /(tooltip|description):\s*['"]([^'"]*(?:\\.[^'"]*)*)['"]/g;
  
  const replacements = [];
  let match;
  
  while ((match = fieldPattern.exec(content)) !== null) {
    const fieldName = match[1];
    const originalText = match[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    const resolvedText = resolveFieldReferences(originalText, abilityMap);
    
    if (resolvedText !== originalText) {
      replacements.push({
        original: match[0],
        fieldName,
        originalText,
        resolvedText,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
      modified = true;
    }
  }
  
  // Apply replacements in reverse order to maintain indices
  if (replacements.length > 0) {
    replacements.sort((a, b) => b.startIndex - a.startIndex);
    
    for (const replacement of replacements) {
      const escapedResolved = replacement.resolvedText
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
      
      const newField = `${replacement.fieldName}: '${escapedResolved}',`;
      const originalField = content.substring(replacement.startIndex, replacement.endIndex);
      
      content = content.substring(0, replacement.startIndex) + 
                newField + 
                content.substring(replacement.endIndex);
    }
  }
  
  return { content, modified, replacements: replacements.length };
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Resolving field references in tooltips and descriptions...\n');
  
  // Load ability data
  console.log('📚 Loading ability data...');
  const abilityMap = loadAbilityData();
  console.log(`   Loaded ${Object.keys(abilityMap).length} abilities\n`);
  
  if (Object.keys(abilityMap).length === 0) {
    console.error('❌ No ability data found. Please run extraction first:');
    console.error('   node scripts/data/extract-from-w3x.mjs');
    process.exit(1);
  }
  
  // Process ability files
  console.log('🎯 Processing ability files...');
  const abilityFiles = loadTypeScriptAbilities();
  let totalResolved = 0;
  
  for (const filePath of abilityFiles) {
    const result = processTypeScriptFile(filePath, abilityMap);
    if (result.modified) {
      fs.writeFileSync(filePath, result.content, 'utf-8');
      totalResolved += result.replacements;
      console.log(`   ✅ ${path.relative(ROOT_DIR, filePath)}: ${result.replacements} references resolved`);
    }
  }
  
  // Process item files
  console.log('\n🎯 Processing item files...');
  const itemFiles = loadTypeScriptItems();
  
  for (const filePath of itemFiles) {
    const result = processTypeScriptFile(filePath, abilityMap);
    if (result.modified) {
      fs.writeFileSync(filePath, result.content, 'utf-8');
      totalResolved += result.replacements;
      console.log(`   ✅ ${path.relative(ROOT_DIR, filePath)}: ${result.replacements} references resolved`);
    }
  }
  
  // Process unit files
  console.log('\n🎯 Processing unit files...');
  const unitFiles = loadTypeScriptUnits();
  
  for (const filePath of unitFiles) {
    const result = processTypeScriptFile(filePath, abilityMap);
    if (result.modified) {
      fs.writeFileSync(filePath, result.content, 'utf-8');
      totalResolved += result.replacements;
      console.log(`   ✅ ${path.relative(ROOT_DIR, filePath)}: ${result.replacements} references resolved`);
    }
  }
  
  console.log(`\n✨ Resolved ${totalResolved} field references total`);
  
  if (totalResolved === 0) {
    console.log('\n💡 No field references found to resolve.');
    console.log('   This could mean:');
    console.log('   1. All references are already resolved');
    console.log('   2. Ability data needs to be extracted first');
    console.log('   3. Field references use different patterns');
  }
}

if (import.meta.url.endsWith('resolve-field-references.mjs')) {
  main();
}

export { resolveFieldReferences, resolveFieldReference, loadAbilityData };




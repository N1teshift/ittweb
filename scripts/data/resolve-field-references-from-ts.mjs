/**
 * Resolve field references in TypeScript data files
 * 
 * This script replaces placeholders like <AMd5,Cool1> with actual values
 * by looking up values from the same ability/item/unit object.
 * 
 * Since the TypeScript files already have extracted values (like cooldown: 10),
 * we can use those to replace the references in tooltips.
 * 
 * Usage: node scripts/data/resolve-field-references-from-ts.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRootDir } from './utils.mjs';
import { ABILITIES_TS_DIR, ITEMS_TS_DIR, UNITS_TS_DIR } from './paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = getRootDir();

// Pattern to match field references: <CODE,Field> or <CODE,Field,suffix>
const FIELD_REF_PATTERN = /<([A-Za-z0-9!{}|~$]{4}),([A-Za-z0-9!{}|~$]+)(?:,([^>]*))?>/g;

/**
 * Extract field value from ability/item/unit object based on field identifier
 */
function getFieldValueFromObject(obj, fieldIdentifier, rawAbilityId) {
  switch (fieldIdentifier) {
    case 'Cool1':
      // Try cooldown from levels first, then base cooldown
      if (obj.levels && obj.levels['1'] && obj.levels['1'].cooldown !== undefined) {
        return obj.levels['1'].cooldown;
      }
      return obj.cooldown;
      
    case 'Dur1':
    case 'HeroDur1':
      // Try duration from levels first, then base duration
      if (obj.levels && obj.levels['1'] && obj.levels['1'].duration !== undefined) {
        return obj.levels['1'].duration;
      }
      return obj.duration;
      
    case 'DataA1':
    case 'DataB1':
    case 'DataC1':
      // These are context-dependent and harder to resolve
      // We'd need to know what the ability is and what DataA1 represents for it
      // For now, return null so we keep the placeholder
      return null;
      
    default:
      return null;
  }
}

/**
 * Parse TypeScript object literal and extract object properties
 */
function parseTypeScriptObject(content, startIndex) {
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let currentIndex = startIndex;
  
  // Skip the opening brace
  if (content[currentIndex] !== '{') return null;
  depth = 1;
  currentIndex++;
  
  const start = currentIndex;
  
  while (currentIndex < content.length && depth > 0) {
    const char = content[currentIndex];
    
    if (escapeNext) {
      escapeNext = false;
      currentIndex++;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      currentIndex++;
      continue;
    }
    
    if (char === "'" || char === '"') {
      inString = !inString;
      currentIndex++;
      continue;
    }
    
    if (inString) {
      currentIndex++;
      continue;
    }
    
    if (char === '{') depth++;
    if (char === '}') depth--;
    
    currentIndex++;
  }
  
  return {
    content: content.substring(start, currentIndex - 1),
    endIndex: currentIndex,
  };
}

/**
 * Extract property value from TypeScript object content
 */
function extractPropertyValue(objContent, propertyName) {
  // Look for propertyName: value pattern
  const pattern = new RegExp(`${propertyName}\\s*:\\s*([^,}]+)`, 'i');
  const match = objContent.match(pattern);
  
  if (!match) return null;
  
  let valueStr = match[1].trim();
  
  // Remove trailing comma if present
  valueStr = valueStr.replace(/,\s*$/, '');
  
  // Try to parse as number
  if (/^-?\d+(\.\d+)?$/.test(valueStr)) {
    return parseFloat(valueStr);
  }
  
  // Try to parse string literal
  if ((valueStr.startsWith("'") && valueStr.endsWith("'")) || 
      (valueStr.startsWith('"') && valueStr.endsWith('"'))) {
    return valueStr.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  
  return valueStr;
}

/**
 * Load ability ID mapper to resolve raw IDs to ability slugs
 */
function loadAbilityIdMapper() {
  const mapperPath = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items', 'abilityIdMapper.ts');
  
  if (!fs.existsSync(mapperPath)) {
    return {};
  }
  
  const content = fs.readFileSync(mapperPath, 'utf-8');
  const mapper = {};
  
  // Extract mappings from RAW_ABILITY_ID_TO_SLUG object
  const pattern = /'([^']+)':\s*'([^']+)'/g;
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    mapper[match[1]] = match[2];
  }
  
  return mapper;
}

/**
 * Build a lookup of ability raw IDs to their data from TypeScript files
 */
function buildAbilityLookup(abilityMapper) {
  const lookup = new Map();
  
  // Load all ability TypeScript files
  if (!fs.existsSync(ABILITIES_TS_DIR)) {
    return lookup;
  }
  
  const files = fs.readdirSync(ABILITIES_TS_DIR, { recursive: true });
  
  for (const file of files) {
    if (!file.endsWith('.ts') || file === 'index.ts' || file === 'types.ts') {
      continue;
    }
    
    const filePath = path.join(ABILITIES_TS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Find all ability objects (array elements)
    const arrayPattern = /\{\s*id:\s*'([^']+)'/g;
    let match;
    
    while ((match = arrayPattern.exec(content)) !== null) {
      const abilityId = match[1];
      const objStart = match.index;
      
      // Parse the object
      const objContent = parseTypeScriptObject(content, objStart);
      if (!objContent) continue;
      
      // Extract properties
      const cooldown = extractPropertyValue(objContent.content, 'cooldown');
      const duration = extractPropertyValue(objContent.content, 'duration');
      const manaCost = extractPropertyValue(objContent.content, 'manaCost');
      
      // Extract levels data
      const levelsMatch = objContent.content.match(/levels:\s*\{[^}]*"1":\s*\{([^}]+)\}/);
      const levelsData = levelsMatch ? levelsMatch[1] : '';
      const levelCooldown = levelsData ? extractPropertyValue(levelsData, 'cooldown') : null;
      const levelDuration = levelsData ? extractPropertyValue(levelsData, 'duration') : null;
      
      // Find raw ability IDs that map to this ability slug
      for (const [rawId, slug] of Object.entries(abilityMapper)) {
        if (slug === abilityId) {
          lookup.set(rawId, {
            cooldown: levelCooldown !== null ? levelCooldown : cooldown,
            duration: levelDuration !== null ? levelDuration : duration,
            manaCost,
            abilityId,
          });
        }
      }
    }
  }
  
  return lookup;
}

/**
 * Resolve field references in text using ability lookup
 */
function resolveFieldReferences(text, abilityLookup) {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(FIELD_REF_PATTERN, (match, abilityId, fieldIdentifier, suffix) => {
    const abilityData = abilityLookup.get(abilityId);
    
    if (!abilityData) {
      // Keep original if we can't find the ability
      return match;
    }
    
    let value = null;
    
    switch (fieldIdentifier) {
      case 'Cool1':
        value = abilityData.cooldown;
        break;
      case 'Dur1':
      case 'HeroDur1':
        value = abilityData.duration;
        break;
      default:
        // Keep original for unknown fields
        return match;
    }
    
    if (value === null || value === undefined) {
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
 * Process a TypeScript file and resolve field references
 */
function processTypeScriptFile(filePath, abilityLookup) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let resolvedCount = 0;
  
  // Find all tooltip and description string fields
  const fieldPattern = /(tooltip|description):\s*['"]([^'"]*(?:\\.[^'"]*)*)['"]/g;
  
  const replacements = [];
  let match;
  
  while ((match = fieldPattern.exec(content)) !== null) {
    const fieldName = match[1];
    const originalText = match[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    const resolvedText = resolveFieldReferences(originalText, abilityLookup);
    
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
      
      // Count how many references were resolved
      const originalMatches = originalText.match(FIELD_REF_PATTERN) || [];
      const resolvedMatches = resolvedText.match(FIELD_REF_PATTERN) || [];
      resolvedCount += (originalMatches.length - resolvedMatches.length);
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
  
  return { content, modified, resolvedCount };
}

/**
 * Get all TypeScript data files
 */
function getAllTypeScriptFiles() {
  const files = [];
  
  [ABILITIES_TS_DIR, ITEMS_TS_DIR, UNITS_TS_DIR].forEach(dir => {
    if (fs.existsSync(dir)) {
      const dirFiles = fs.readdirSync(dir, { recursive: true });
      for (const file of dirFiles) {
        if (file.endsWith('.ts') && 
            file !== 'index.ts' && 
            file !== 'types.ts' && 
            !file.includes('abilityIdMapper')) {
          files.push(path.join(dir, file));
        }
      }
    }
  });
  
  return files;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Resolving field references in TypeScript data files...\n');
  
  // Load ability ID mapper
  console.log('📚 Loading ability ID mapper...');
  const abilityMapper = loadAbilityIdMapper();
  console.log(`   Loaded ${Object.keys(abilityMapper).length} ability ID mappings\n`);
  
  // Build ability lookup from TypeScript files
  console.log('🔍 Building ability lookup from TypeScript files...');
  const abilityLookup = buildAbilityLookup(abilityMapper);
  console.log(`   Found ${abilityLookup.size} abilities with data\n`);
  
  if (abilityLookup.size === 0) {
    console.warn('⚠️  No abilities found in lookup. This might mean:');
    console.warn('   1. Ability files need to be generated first');
    console.warn('   2. Ability ID mapper is missing mappings');
    console.warn('\n   Continuing anyway...\n');
  }
  
  // Process all TypeScript files
  console.log('🎯 Processing TypeScript data files...\n');
  const allFiles = getAllTypeScriptFiles();
  let totalResolved = 0;
  let filesModified = 0;
  
  for (const filePath of allFiles) {
    const result = processTypeScriptFile(filePath, abilityLookup);
    if (result.modified) {
      fs.writeFileSync(filePath, result.content, 'utf-8');
      totalResolved += result.resolvedCount;
      filesModified++;
      const relativePath = path.relative(ROOT_DIR, filePath);
      console.log(`   ✅ ${relativePath}: ${result.resolvedCount} references resolved`);
    }
  }
  
  console.log(`\n✨ Summary:`);
  console.log(`   Files processed: ${allFiles.length}`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   Total references resolved: ${totalResolved}`);
  
  if (totalResolved === 0) {
    console.log('\n💡 No field references were resolved.');
    console.log('   This could mean:');
    console.log('   1. All references are already resolved');
    console.log('   2. Ability ID mappings are missing');
    console.log('   3. Field references use patterns we don\'t recognize');
  }
}

if (import.meta.url.endsWith('resolve-field-references-from-ts.mjs')) {
  main();
}

export { resolveFieldReferences, buildAbilityLookup, loadAbilityIdMapper };


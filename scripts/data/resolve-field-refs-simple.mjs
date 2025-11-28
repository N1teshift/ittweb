/**
 * Simple field reference resolver
 * 
 * Replaces field references in tooltips with values from the same object.
 * For example: <AMd5,Cool1> -> 10 (using the cooldown value from the same ability)
 * 
 * Usage: node scripts/data/resolve-field-refs-simple.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRootDir } from './utils.mjs';
import { ABILITIES_TS_DIR, ITEMS_TS_DIR, UNITS_TS_DIR } from './paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = getRootDir();

// Pattern to match field references: <CODE,Field>
const FIELD_REF_PATTERN = /<([A-Za-z0-9!{}|~$]{4}),([A-Za-z0-9!{}|~$]+)(?:,([^>]*))?>/g;

/**
 * Load ability ID mapper
 */
function loadAbilityIdMapper() {
  const mapperPath = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items', 'abilityIdMapper.ts');
  
  if (!fs.existsSync(mapperPath)) {
    return {};
  }
  
  const content = fs.readFileSync(mapperPath, 'utf-8');
  const mapper = {};
  const reverseMapper = {}; // slug -> raw IDs
  
  // Extract mappings
  const pattern = /'([^']+)':\s*'([^']+)'/g;
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    const rawId = match[1];
    const slug = match[2];
    mapper[rawId] = slug;
    if (!reverseMapper[slug]) {
      reverseMapper[slug] = [];
    }
    reverseMapper[slug].push(rawId);
  }
  
  return { mapper, reverseMapper };
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
 * Extract object properties from TypeScript object literal
 */
function extractObjectProperties(objContent) {
  const props = {};
  
  // Extract id
  const idMatch = objContent.match(/id:\s*'([^']+)'/);
  if (idMatch) props.id = idMatch[1];
  
  // Extract cooldown (from base or levels)
  const cooldownMatch = objContent.match(/cooldown:\s*(\d+(?:\.\d+)?)/);
  if (cooldownMatch) props.cooldown = parseFloat(cooldownMatch[1]);
  
  const levelCooldownMatch = objContent.match(/"1":\s*\{[^}]*"cooldown":\s*(\d+(?:\.\d+)?)/);
  if (levelCooldownMatch) props.levelCooldown = parseFloat(levelCooldownMatch[1]);
  
  // Extract duration
  const durationMatch = objContent.match(/duration:\s*(\d+(?:\.\d+)?)/);
  if (durationMatch) props.duration = parseFloat(durationMatch[1]);
  
  const levelDurationMatch = objContent.match(/"1":\s*\{[^}]*"duration":\s*(\d+(?:\.\d+)?)/);
  if (levelDurationMatch) props.levelDuration = parseFloat(levelDurationMatch[1]);
  
  return props;
}

/**
 * Process a file and resolve field references
 */
function processFile(filePath, reverseMapper) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let resolvedCount = 0;
  
  // Find all ability/item/unit objects in the file
  // Look for: { id: '...', ... }
  const objectPattern = /\{\s*id:\s*'([^']+)'/g;
  const objects = [];
  let match;
  
  while ((match = objectPattern.exec(content)) !== null) {
    const objStart = match.index;
    const slug = match[1];
    
    // Find the end of this object (next object or array end)
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    let i = objStart;
    
    while (i < content.length) {
      const char = content[i];
      
      if (escapeNext) {
        escapeNext = false;
        i++;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        i++;
        continue;
      }
      
      if (char === "'" || char === '"') {
        inString = !inString;
        i++;
        continue;
      }
      
      if (!inString) {
        if (char === '{') depth++;
        if (char === '}') {
          depth--;
          if (depth === 0) {
            break;
          }
        }
        // Check if we hit the start of next object
        if (char === '{' && depth === 2 && content.substring(i, i + 10).includes("id:'")) {
          // This might be the next object, but we want to keep going until this one closes
        }
      }
      
      i++;
    }
    
    const objEnd = i + 1;
    const objContent = content.substring(objStart, objEnd);
    const props = extractObjectProperties(objContent);
    
    if (props.id) {
      objects.push({
        slug,
        start: objStart,
        end: objEnd,
        content: objContent,
        props,
      });
    }
  }
  
  // For each object, resolve field references in its tooltip/description
  // We need to do this in reverse order to maintain indices
  objects.reverse();
  
  for (const obj of objects) {
    const rawIds = reverseMapper[obj.slug] || [];
    if (rawIds.length === 0) continue;
    
    // Get the value to use (prefer level cooldown/duration if available)
    const cooldown = obj.props.levelCooldown !== undefined ? obj.props.levelCooldown : obj.props.cooldown;
    const duration = obj.props.levelDuration !== undefined ? obj.props.levelDuration : obj.props.duration;
    
    // Find and replace field references in tooltip and description fields
    const tooltipMatch = obj.content.match(/(tooltip|description):\s*'([^']*(?:\\.[^']*)*)'/);
    if (!tooltipMatch) continue;
    
    let tooltipText = tooltipMatch[2].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    let resolvedText = tooltipText;
    let foundAny = false;
    
    // Replace references for each raw ID that maps to this ability
    for (const rawId of rawIds) {
      resolvedText = resolvedText.replace(FIELD_REF_PATTERN, (match, abilityId, fieldId, suffix) => {
        if (abilityId !== rawId) return match;
        
        let value = null;
        
        if (fieldId === 'Cool1' && cooldown !== undefined) {
          value = cooldown;
        } else if ((fieldId === 'Dur1' || fieldId === 'HeroDur1') && duration !== undefined) {
          value = duration;
        }
        
        if (value === null || value === undefined) {
          return match;
        }
        
        foundAny = true;
        
        // Format value
        let formatted = typeof value === 'number' 
          ? (value % 1 === 0 ? value.toString() : value.toFixed(1).replace(/\.0$/, ''))
          : value.toString();
        
        if (suffix) formatted += suffix;
        
        return formatted;
      });
    }
    
    if (foundAny && resolvedText !== tooltipText) {
      // Count resolved references
      const originalRefs = (tooltipText.match(FIELD_REF_PATTERN) || []).length;
      const remainingRefs = (resolvedText.match(FIELD_REF_PATTERN) || []).length;
      resolvedCount += (originalRefs - remainingRefs);
      
      // Escape for TypeScript string
      const escaped = resolvedText.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      
      // Replace in content
      const fieldType = tooltipMatch[1];
      const oldField = `${fieldType}: '${tooltipMatch[2]}'`;
      const newField = `${fieldType}: '${escaped}'`;
      
      const objIndexInContent = content.indexOf(obj.content);
      const fieldIndexInObj = obj.content.indexOf(oldField);
      
      if (objIndexInContent !== -1 && fieldIndexInObj !== -1) {
        const absoluteFieldIndex = objIndexInContent + fieldIndexInObj;
        content = content.substring(0, absoluteFieldIndex) + 
                  newField + 
                  content.substring(absoluteFieldIndex + oldField.length);
        modified = true;
      }
    }
  }
  
  return { content, modified, resolvedCount };
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Resolving field references in tooltips...\n');
  
  // Load ability ID mapper
  console.log('📚 Loading ability ID mapper...');
  const { mapper, reverseMapper } = loadAbilityIdMapper();
  console.log(`   Loaded ${Object.keys(mapper).length} mappings\n`);
  
  // Get all files
  const allFiles = getAllTypeScriptFiles();
  console.log(`📁 Found ${allFiles.length} TypeScript data files\n`);
  
  let totalResolved = 0;
  let filesModified = 0;
  
  for (const filePath of allFiles) {
    const result = processFile(filePath, reverseMapper);
    
    if (result.modified) {
      fs.writeFileSync(filePath, result.content, 'utf-8');
      filesModified++;
      totalResolved += result.resolvedCount;
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
  }
}

if (import.meta.url.endsWith('resolve-field-refs-simple.mjs')) {
  main();
}

export { processFile, loadAbilityIdMapper };


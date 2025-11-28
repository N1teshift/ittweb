/**
 * Resolve field references in tooltips
 * 
 * Replaces placeholders like <AMd5,Cool1> with actual values from the same object.
 * 
 * This script works by:
 * 1. Finding field references in tooltip/description strings
 * 2. Looking up the cooldown/duration value from the same object
 * 3. Replacing the reference with the actual value
 * 
 * Usage: node scripts/resolve-field-references.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data');

// Pattern to match field references
const FIELD_REF_PATTERN = /<([A-Za-z0-9!{}|~$]{4}),([A-Za-z0-9!{}|~$]+)(?:,([^>]*))?>/g;

/**
 * Load ability ID mapper
 */
function loadAbilityIdMapper() {
  const mapperPath = path.join(DATA_DIR, 'items', 'abilityIdMapper.ts');
  
  if (!fs.existsSync(mapperPath)) {
    return {};
  }
  
  const content = fs.readFileSync(mapperPath, 'utf-8');
  const reverseMapper = {}; // slug -> [rawIds]
  
  const pattern = /'([^']+)':\s*'([^']+)'/g;
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    const rawId = match[1];
    const slug = match[2];
    if (!reverseMapper[slug]) {
      reverseMapper[slug] = [];
    }
    reverseMapper[slug].push(rawId);
  }
  
  return reverseMapper;
}

/**
 * Find all TypeScript data files
 */
function findAllDataFiles() {
  const files = [];
  
  ['abilities', 'items', 'units'].forEach(category => {
    const dir = path.join(DATA_DIR, category);
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.ts')) {
        if (entry.name !== 'index.ts' && entry.name !== 'types.ts' && !entry.name.includes('abilityIdMapper')) {
          files.push(path.join(dir, entry.name));
        }
      }
    }
  });
  
  return files;
}

/**
 * Process a single file
 */
function processFile(filePath, reverseMapper) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let resolvedCount = 0;
  
  // Find all objects with id fields
  const objectRegex = /{\s*id:\s*'([^']+)'[^}]*?(?=\s*}[,\n])/gs;
  
  // We'll process the file by finding each object and its properties
  // A simpler approach: find tooltip/description fields and resolve references inline
  
  // Find all tooltip and description fields
  const fieldRegex = /(tooltip|description):\s*'((?:[^'\\]|\\.)*)'/g;
  
  content = content.replace(fieldRegex, (match, fieldName, fieldValue) => {
    // Unescape the string
    const unescaped = fieldValue.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    
    // Find the object this field belongs to (look backwards for id:)
    const beforeMatch = content.substring(0, match.index);
    const idMatch = beforeMatch.match(/(?:^|,)\s*id:\s*'([^']+)'[^}]*$/);
    
    if (!idMatch) return match;
    
    const objectId = idMatch[1];
    const rawIds = reverseMapper[objectId] || [];
    
    // Extract cooldown and duration from the object
    // Look for cooldown/duration in the object definition
    const objectStart = beforeMatch.lastIndexOf('{', beforeMatch.lastIndexOf(`id: '${objectId}'`));
    const objectEnd = content.indexOf('},', match.index) + 2;
    const objectContent = content.substring(Math.max(0, objectStart), objectEnd);
    
    // Extract cooldown (prefer level cooldown)
    const levelCooldownMatch = objectContent.match(/"1":\s*\{[^}]*"cooldown":\s*(\d+(?:\.\d+)?)/);
    const baseCooldownMatch = objectContent.match(/cooldown:\s*(\d+(?:\.\d+)?)/);
    const cooldown = levelCooldownMatch ? parseFloat(levelCooldownMatch[1]) : 
                     (baseCooldownMatch ? parseFloat(baseCooldownMatch[1]) : null);
    
    // Extract duration (prefer level duration)
    const levelDurationMatch = objectContent.match(/"1":\s*\{[^}]*"duration":\s*(\d+(?:\.\d+)?)/);
    const baseDurationMatch = objectContent.match(/duration:\s*(\d+(?:\.\d+)?)/);
    const duration = levelDurationMatch ? parseFloat(levelDurationMatch[1]) : 
                     (baseDurationMatch ? parseFloat(baseDurationMatch[1]) : null);
    
    // Replace field references
    let resolved = unescaped;
    let changed = false;
    
    for (const rawId of rawIds) {
      resolved = resolved.replace(FIELD_REF_PATTERN, (refMatch, abilityId, fieldId, suffix) => {
        if (abilityId !== rawId) return refMatch;
        
        let value = null;
        
        if (fieldId === 'Cool1' && cooldown !== null) {
          value = cooldown;
        } else if ((fieldId === 'Dur1' || fieldId === 'HeroDur1') && duration !== null) {
          value = duration;
        }
        
        if (value === null) return refMatch;
        
        changed = true;
        let formatted = value % 1 === 0 ? value.toString() : value.toFixed(1).replace(/\.0$/, '');
        if (suffix) formatted += suffix;
        return formatted;
      });
    }
    
    if (changed) {
      modified = true;
      const beforeRefs = (unescaped.match(FIELD_REF_PATTERN) || []).length;
      const afterRefs = (resolved.match(FIELD_REF_PATTERN) || []).length;
      resolvedCount += (beforeRefs - afterRefs);
      
      // Escape for TypeScript
      const escaped = resolved.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `${fieldName}: '${escaped}'`;
    }
    
    return match;
  });
  
  return { content, modified, resolvedCount };
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Resolving field references in tooltips...\n');
  
  // Load ability ID mapper
  console.log('📚 Loading ability ID mapper...');
  const reverseMapper = loadAbilityIdMapper();
  const totalMappings = Object.values(reverseMapper).reduce((sum, ids) => sum + ids.length, 0);
  console.log(`   Loaded ${totalMappings} ability ID mappings\n`);
  
  // Find all data files
  console.log('📁 Finding TypeScript data files...');
  const files = findAllDataFiles();
  console.log(`   Found ${files.length} files\n`);
  
  let totalResolved = 0;
  let filesModified = 0;
  
  for (const filePath of files) {
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
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   Total references resolved: ${totalResolved}`);
  
  if (totalResolved === 0) {
    console.log('\n💡 No field references were resolved.');
  } else {
    console.log('\n🎉 All done! Your tooltips should now show actual values instead of placeholders.');
  }
}

main();


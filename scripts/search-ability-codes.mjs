/**
 * Search for ability reference codes like <AMd5,Cool1> in names and descriptions
 * across abilities, items, and units
 * 
 * Usage: node scripts/search-ability-codes.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

// Pattern to match: <CODE,Field> where CODE is alphanumeric and Field is alphanumeric
const PATTERN = /<([A-Za-z0-9!{}|~$]+),([A-Za-z0-9!{}|~$]+)>/g;

const DATA_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data');

function findAllFiles(dir, extensions = ['.ts']) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function searchInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = [];
  let match;
  
  // Reset regex
  PATTERN.lastIndex = 0;
  
  while ((match = PATTERN.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      code: match[1],
      field: match[2],
      line: content.substring(0, match.index).split('\n').length,
    });
  }
  
  return matches;
}

function isInNameOrDescription(content, matchIndex) {
  // Check if the match is within a name or description field
  const beforeMatch = content.substring(0, matchIndex);
  const lines = beforeMatch.split('\n');
  const currentLine = lines[lines.length - 1];
  
  // Check for name:, description:, or tooltip: fields
  const fieldPattern = /(name|description|tooltip)\s*:\s*['"]/;
  const lineMatch = currentLine.match(fieldPattern);
  
  if (lineMatch) {
    return true;
  }
  
  // Check if we're in a multi-line string that started with name/description/tooltip
  let checkLine = lines.length - 1;
  while (checkLine >= 0 && checkLine >= lines.length - 10) {
    if (/^\s*(name|description|tooltip)\s*:\s*['"]/.test(lines[checkLine])) {
      return true;
    }
    // Stop if we hit another property
    if (/^\s*\w+\s*:/.test(lines[checkLine]) && !/^\s*(name|description|tooltip)\s*:/.test(lines[checkLine])) {
      break;
    }
    checkLine--;
  }
  
  return false;
}

function extractEntityId(content, matchIndex) {
  // Extract the entity ID by finding the 'id:' field before this match
  const beforeMatch = content.substring(0, matchIndex);
  const lines = beforeMatch.split('\n');
  
  // Look backwards for an id field
  for (let i = lines.length - 1; i >= 0 && i >= lines.length - 50; i--) {
    const idMatch = lines[i].match(/id:\s*['"]([^'"]+)['"]/);
    if (idMatch) {
      return idMatch[1];
    }
    // Stop if we hit a new object start (but allow for nested objects)
    if (lines[i].trim() === '{' && i < lines.length - 5) {
      // Check if this is the start of a new entity (has id after it)
      for (let j = i + 1; j < lines.length; j++) {
        const idMatch2 = lines[j].match(/id:\s*['"]([^'"]+)['"]/);
        if (idMatch2) {
          return idMatch2[1];
        }
        // Stop if we hit another object start
        if (lines[j].trim() === '{' || lines[j].trim().startsWith('id:')) {
          break;
        }
      }
    }
  }
  
  return null;
}

function main() {
  console.log('Searching for ability codes like <CODE,Field> in names and descriptions...\n');
  
  const abilityFiles = findAllFiles(path.join(DATA_DIR, 'abilities'), ['.ts']);
  const itemFiles = findAllFiles(path.join(DATA_DIR, 'items'), ['.ts']);
  const unitFiles = findAllFiles(path.join(DATA_DIR, 'units'), ['.ts']);
  
  const allFiles = [...abilityFiles, ...itemFiles, ...unitFiles];
  
  const results = {
    abilities: { 
      uniqueEntities: new Set(),
      entityDetails: new Map(),
      totalOccurrences: 0,
    },
    items: { 
      uniqueEntities: new Set(),
      entityDetails: new Map(),
      totalOccurrences: 0,
    },
    units: { 
      uniqueEntities: new Set(),
      entityDetails: new Map(),
      totalOccurrences: 0,
    },
    uniqueCodes: new Set(),
  };
  
  for (const filePath of allFiles) {
    const matches = searchInFile(filePath);
    
    if (matches.length > 0) {
      const content = fs.readFileSync(filePath, 'utf-8');
      let category = 'other';
      
      if (filePath.includes('abilities')) {
        category = 'abilities';
      } else if (filePath.includes('items')) {
        category = 'items';
      } else if (filePath.includes('units')) {
        category = 'units';
      }
      
      if (category === 'other') continue;
      
      // Find all entity IDs in the file first
      const entityIdPattern = /id:\s*['"]([^'"]+)['"]/g;
      const entityIds = [];
      let idMatch;
      while ((idMatch = entityIdPattern.exec(content)) !== null) {
        entityIds.push({
          id: idMatch[1],
          index: idMatch.index,
        });
      }
      
      for (const match of matches) {
        // Find the actual index of the match
        PATTERN.lastIndex = 0;
        let matchIndex = -1;
        let searchFrom = 0;
        while (true) {
          const actualMatch = PATTERN.exec(content);
          if (!actualMatch) break;
          if (actualMatch[0] === match.fullMatch) {
            matchIndex = actualMatch.index;
            break;
          }
          searchFrom = actualMatch.index + 1;
          PATTERN.lastIndex = searchFrom;
        }
        
        if (matchIndex === -1) continue;
        
        if (isInNameOrDescription(content, matchIndex)) {
          results.uniqueCodes.add(`${match.code},${match.field}`);
          
          // Find which entity this match belongs to
          let entityId = null;
          for (let i = entityIds.length - 1; i >= 0; i--) {
            if (entityIds[i].index < matchIndex) {
              entityId = entityIds[i].id;
              break;
            }
          }
          
          if (entityId) {
            results[category].uniqueEntities.add(entityId);
            results[category].totalOccurrences++;
            
            if (!results[category].entityDetails.has(entityId)) {
              results[category].entityDetails.set(entityId, {
                id: entityId,
                codes: new Set(),
                file: path.relative(path.join(ROOT_DIR, 'src'), filePath),
              });
            }
            results[category].entityDetails.get(entityId).codes.add(match.fullMatch);
          }
        }
      }
    }
  }
  
  // Print results
  console.log('='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log();
  
  const totalUniqueEntities = 
    results.abilities.uniqueEntities.size + 
    results.items.uniqueEntities.size + 
    results.units.uniqueEntities.size;
  
  console.log(`Total unique entities with codes: ${totalUniqueEntities}`);
  console.log(`  - Abilities: ${results.abilities.uniqueEntities.size}`);
  console.log(`  - Items: ${results.items.uniqueEntities.size}`);
  console.log(`  - Units: ${results.units.uniqueEntities.size}`);
  console.log();
  
  console.log(`Total occurrences: ${results.abilities.totalOccurrences + results.items.totalOccurrences + results.units.totalOccurrences}`);
  console.log(`  - Abilities: ${results.abilities.totalOccurrences} occurrences`);
  console.log(`  - Items: ${results.items.totalOccurrences} occurrences`);
  console.log(`  - Units: ${results.units.totalOccurrences} occurrences`);
  console.log();
  
  console.log(`Unique code patterns: ${results.uniqueCodes.size}`);
  console.log();
  
  // Show some example entities
  console.log('Sample entities with codes:');
  for (const category of ['abilities', 'items', 'units']) {
    if (results[category].uniqueEntities.size > 0) {
      console.log(`\n${category.toUpperCase()} (showing first 5):`);
      const entities = Array.from(results[category].entityDetails.values()).slice(0, 5);
      for (const entity of entities) {
        const codesArray = Array.from(entity.codes);
        console.log(`  - ${entity.id} (${codesArray.length} unique code(s)): ${codesArray.slice(0, 3).join(', ')}${codesArray.length > 3 ? '...' : ''}`);
      }
      if (results[category].uniqueEntities.size > 5) {
        console.log(`  ... and ${results[category].uniqueEntities.size - 5} more`);
      }
    }
  }
  
  // Show unique codes
  console.log('\nUnique code patterns found:');
  const sortedCodes = Array.from(results.uniqueCodes).sort();
  for (const code of sortedCodes) {
    console.log(`  <${code}>`);
  }
}

main();




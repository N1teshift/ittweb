/**
 * Resolve Warcraft 3 object data field references in tooltips/descriptions
 * 
 * Format: <FieldID,Level> where:
 * - FieldID is a 4-character field code (e.g., AM2w, AIs6)
 * - Level is the data level (DataA1, DataB1, DataC1, etc.)
 * 
 * This script processes the extracted JSON files and resolves these references
 * by looking up the actual values in the raw modifications.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const EXTRACTED_DIR = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'extracted_from_w3x');

/**
 * Map level names to numeric levels
 * DataA1 = level 1, DataA2 = level 2, DataA3 = level 3, etc.
 * In Warcraft 3, DataA1/B1/C1 refer to level 1 (first data level)
 */
function getLevelNumber(levelStr) {
  // Extract the letter and number from level string (e.g., "DataA1" -> A, 1)
  const match = levelStr.match(/Data([A-F])(\d)/);
  if (!match) return 1; // Default to level 1
  
  const number = parseInt(match[2], 10);
  return number; // DataA1 = 1, DataA2 = 2, etc.
}

/**
 * Get field ID for a Data level in ability types
 * DataA = Agility/Armor, DataB = Intelligence, DataC = Strength
 */
function getFieldIdForDataLevel(dataLevel) {
  const match = dataLevel.match(/Data([A-F])(\d)/);
  if (!match) return null;
  
  const letter = match[1];
  const level = parseInt(match[2], 10);
  
  // Map Data levels to field IDs based on ability type
  // For "All Plus" abilities: DataA=Iagi, DataB=Iint, DataC=Istr
  // For Defense Bonus: DataA=Idef
  // We'll try common field IDs
  // Map Data levels to field IDs based on ability type
  // For "All Plus" abilities: DataA=Iagi, DataB=Iint, DataC=Istr
  // For Defense Bonus abilities: DataA=Idef
  // We need to try both possibilities for DataA (could be Iagi or Idef)
  const fieldMap = {
    'A': ['Idef', 'Iagi'], // Try Idef first (armor), then Iagi (agility)
    'B': ['Iint'], // Intelligence
    'C': ['Istr'], // Strength
    'D': ['Idef'], // Defense
  };
  
  return fieldMap[letter] || null;
}

/**
 * Find ability by field value (e.g., find ability with Iint=1 at level 1)
 */
function findAbilityByFieldValue(allAbilities, fieldId, level, expectedValue) {
  if (!allAbilities || !fieldId) return null;
  
  const fieldIds = Array.isArray(fieldId) ? fieldId : [fieldId];
  
  for (const fid of fieldIds) {
    const ability = allAbilities.find(a => {
      if (!a.raw) return false;
      const field = a.raw.find(m => m.id === fid && m.level === level);
      return field && field.value === expectedValue;
    });
    if (ability) return ability;
  }
  return null;
}

/**
 * Resolve field references in a string
 * Format: <AbilityRawCode,DataLevel> e.g., <AMef,DataC1>
 * This means: get the value from ability with raw code AMef, at DataC level 1
 */
function resolveFieldReferences(text, rawModifications, globalLookup = null, allAbilities = null, itemAbilities = null) {
  if (!text || typeof text !== 'string') return text;
  
  const referenceRegex = /<([A-Za-z0-9]{4}),([A-Za-z0-9]+)(?:,([^>]+))?>/g;
  
  return text.replace(referenceRegex, (match, abilityRawCode, dataLevel, suffix = '') => {
    const level = getLevelNumber(dataLevel);
    const fieldId = getFieldIdForDataLevel(dataLevel);
    
    // First, try to find the ability by its raw code
    let ability = null;
    if (allAbilities) {
      // Ability IDs are in format "RawCode:BaseId" or just "RawCode"
      ability = allAbilities.find(a => {
        const idParts = a.id.split(':');
        return idParts[0] === abilityRawCode || a.id === abilityRawCode;
      });
    }
    
    // If not found by raw code, try to find it in the item's abilities list
    // This handles cases where tooltip references a different ability than what's on the item
    // For example, tooltip might reference AM6l (INT_BONUS_1) but item has AM6m (INT_BONUS_2)
    if (!ability && itemAbilities && itemAbilities.length > 0 && fieldId) {
      // itemAbilities is a list of ability raw codes (e.g., ["AMef", "AM6m", "AM2t"])
      // Try to find abilities that match these codes and have the field we need
      const fieldIds = Array.isArray(fieldId) ? fieldId : [fieldId];
      
      // Find the best matching ability from the item's abilities
      // Priority: abilities with non-zero values for the target field
      let bestMatch = null;
      let bestValue = null;
      
      for (const itemAbilCode of itemAbilities) {
        const itemAbil = allAbilities?.find(a => {
          const idParts = a.id.split(':');
          return idParts[0] === itemAbilCode || a.id === itemAbilCode;
        });
        if (itemAbil && itemAbil.raw) {
          // Check if this ability has the field we're looking for
          for (const fid of fieldIds) {
            let field = itemAbil.raw.find(m => m.id === fid && m.level === level);
            if (!field && level !== 1) {
              field = itemAbil.raw.find(m => m.id === fid && m.level === 1);
            }
            // Prefer abilities with non-zero values
            if (field && field.value !== undefined && field.value !== null && field.value !== '') {
              const value = Number(field.value);
              if (value !== 0 && (!bestValue || Math.abs(value) > Math.abs(bestValue))) {
                bestMatch = itemAbil;
                bestValue = value;
              } else if (value === 0 && !bestMatch) {
                // Only use zero value as last resort
                bestMatch = itemAbil;
                bestValue = value;
              }
            }
          }
        }
      }
      
      if (bestMatch && bestValue !== 0) {
        ability = bestMatch;
      }
    }
    
    if (ability && ability.raw) {
      // fieldId might be an array (for DataA which could be Idef or Iagi)
      const fieldIds = fieldId ? (Array.isArray(fieldId) ? fieldId : [fieldId]) : [];
      
      // Try each field ID possibility first
      for (const fid of fieldIds) {
        // Find the field in the ability's raw modifications
        // Try the specified level first, then level 1 as fallback
        let field = ability.raw.find(m => m.id === fid && m.level === level);
        if (!field && level !== 1) {
          field = ability.raw.find(m => m.id === fid && m.level === 1);
        }
        if (field && field.value !== undefined && field.value !== null && field.value !== '') {
          const value = String(field.value);
          return suffix ? `${value}${suffix}` : value;
        }
      }
      
      // If fieldId didn't work, try to find any numeric field at the specified level
      // This handles cases like movement speed (Imvb), attack speed, etc.
      if (fieldIds.length === 0 || fieldIds.every(fid => !ability.raw.find(m => m.id === fid))) {
        // Look for common field patterns based on Data level
        // DataA often = first data field, DataB = second, DataC = third
        // But we need to be smart about which field to use
        const commonFields = [
          'Imvb', // Movement Speed Bonus
          'Iatk', // Attack Speed
          'Iatt', // Attack
          'Idef', // Defense/Armor
          'Istr', // Strength
          'Iint', // Intelligence
          'Iagi', // Agility
          'Ihp1', // Hit Points
          'Iman', // Mana
        ];
        
        // Try common fields at the specified level
        for (const fid of commonFields) {
          let field = ability.raw.find(m => m.id === fid && m.level === level);
          if (!field && level !== 1) {
            field = ability.raw.find(m => m.id === fid && m.level === 1);
          }
          if (field && field.value !== undefined && field.value !== null && field.value !== '' && field.value !== 0) {
            const value = String(field.value);
            return suffix ? `${value}${suffix}` : value;
          }
        }
        
        // Last resort: find any numeric field at the specified level
        const numericFields = ability.raw.filter(m => 
          (m.type === 'int' || m.type === 'unreal') && 
          m.level === level && 
          m.value !== undefined && 
          m.value !== null && 
          m.value !== '' && 
          m.value !== 0
        );
        if (numericFields.length > 0) {
          // Use the first non-zero numeric field
          const value = String(numericFields[0].value);
          return suffix ? `${value}${suffix}` : value;
        }
      }
    }
    
    // Fallback: try local raw modifications (in case it's a field reference, not ability)
    let field = rawModifications.find(m => m.id === abilityRawCode && m.level === level);
    if (!field && level !== 1) {
      field = rawModifications.find(m => m.id === abilityRawCode && m.level === 1);
    }
    if (!field) {
      field = rawModifications.find(m => m.id === abilityRawCode && m.level === 0);
    }
    
    // If not found locally, try global lookup
    if (!field && globalLookup) {
      const globalKey = `${abilityRawCode}_${level}`;
      const globalValue = globalLookup.get(globalKey);
      if (globalValue !== undefined) {
        const value = String(globalValue);
        return suffix ? `${value}${suffix}` : value;
      }
    }
    
    if (field && field.value !== undefined && field.value !== null && field.value !== '') {
      const value = String(field.value);
      if (suffix) {
        return `${value}${suffix}`;
      }
      return value;
    }
    
    return match;
  });
}

/**
 * Process items JSON
 */
function processItems() {
  const filePath = path.join(EXTRACTED_DIR, 'items.json');
  if (!fs.existsSync(filePath)) {
    console.log('Items file not found');
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let resolvedCount = 0;
  
  for (const item of data.items || []) {
    const raw = item.raw || [];
    let changed = false;
    
    // Also check raw modifications for references (they might be at different levels)
    for (const mod of raw) {
      if (mod.value && typeof mod.value === 'string' && mod.value.includes('<')) {
        const resolved = resolveFieldReferences(mod.value, raw);
        if (resolved !== mod.value) {
          mod.value = resolved;
          changed = true;
        }
      }
    }
    
    if (item.description) {
      const resolved = resolveFieldReferences(item.description, raw);
      if (resolved !== item.description) {
        item.description = resolved;
        changed = true;
      }
    }
    
    if (item.tooltip) {
      const resolved = resolveFieldReferences(item.tooltip, raw);
      if (resolved !== item.tooltip) {
        item.tooltip = resolved;
        changed = true;
      }
    }
    
    if (changed) resolvedCount++;
  }
  
  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Resolved ${resolvedCount} items with field references`);
}

/**
 * Process abilities JSON
 */
function processAbilities() {
  const filePath = path.join(EXTRACTED_DIR, 'abilities.json');
  if (!fs.existsSync(filePath)) {
    console.log('Abilities file not found');
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let resolvedCount = 0;
  
  for (const ability of data.abilities || []) {
    const raw = ability.raw || [];
    let changed = false;
    
    // Also check raw modifications for references (they might be at different levels)
    for (const mod of raw) {
      if (mod.value && typeof mod.value === 'string' && mod.value.includes('<')) {
        const resolved = resolveFieldReferences(mod.value, raw);
        if (resolved !== mod.value) {
          mod.value = resolved;
          changed = true;
        }
      }
    }
    
    if (ability.description) {
      const resolved = resolveFieldReferences(ability.description, raw);
      if (resolved !== ability.description) {
        ability.description = resolved;
        changed = true;
      }
    }
    
    // Update tooltip from raw modifications if it has references
    for (const mod of raw) {
      if ((mod.id === 'aub1' || mod.id === 'aub2' || mod.id === 'utub') && 
          mod.value && typeof mod.value === 'string' && mod.value.includes('<')) {
        const resolved = resolveFieldReferences(mod.value, raw);
        if (resolved !== mod.value) {
          mod.value = resolved;
          // Also update the extracted tooltip field
          if (!ability.tooltip || ability.tooltip === mod.value) {
            ability.tooltip = resolved;
          }
          changed = true;
        }
      }
    }
    
    if (ability.tooltip) {
      const resolved = resolveFieldReferences(ability.tooltip, raw);
      if (resolved !== ability.tooltip) {
        ability.tooltip = resolved;
        changed = true;
      }
    }
    
    if (changed) resolvedCount++;
  }
  
  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Resolved ${resolvedCount} abilities with field references`);
}

/**
 * Process units JSON
 */
function processUnits() {
  const filePath = path.join(EXTRACTED_DIR, 'units.json');
  if (!fs.existsSync(filePath)) {
    console.log('Units file not found');
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let resolvedCount = 0;
  
  for (const unit of data.units || []) {
    const raw = unit.raw || [];
    let changed = false;
    
    if (unit.description) {
      const resolved = resolveFieldReferences(unit.description, raw);
      if (resolved !== unit.description) {
        unit.description = resolved;
        changed = true;
      }
    }
    
    if (unit.tooltip) {
      const resolved = resolveFieldReferences(unit.tooltip, raw);
      if (resolved !== unit.tooltip) {
        unit.tooltip = resolved;
        changed = true;
      }
    }
    
    if (changed) resolvedCount++;
  }
  
  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Resolved ${resolvedCount} units with field references`);
}

/**
 * Build a global field lookup from all abilities/items
 * Some references might point to fields in other objects
 */
function buildGlobalFieldLookup(items, abilities, units) {
  const lookup = new Map();
  
  // Index all fields from all objects
  for (const item of items || []) {
    for (const mod of item.raw || []) {
      const key = `${mod.id}_${mod.level}`;
      if (!lookup.has(key)) {
        lookup.set(key, mod.value);
      }
    }
  }
  
  for (const ability of abilities || []) {
    for (const mod of ability.raw || []) {
      const key = `${mod.id}_${mod.level}`;
      if (!lookup.has(key)) {
        lookup.set(key, mod.value);
      }
    }
  }
  
  for (const unit of units || []) {
    for (const mod of unit.raw || []) {
      const key = `${mod.id}_${mod.level}`;
      if (!lookup.has(key)) {
        lookup.set(key, mod.value);
      }
    }
  }
  
  return lookup;
}

function main() {
  console.log('🔍 Resolving field references in extracted data...\n');
  
  // Load all data first to build global lookup
  const itemsData = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, 'items.json'), 'utf-8'));
  const abilitiesData = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, 'abilities.json'), 'utf-8'));
  const unitsData = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, 'units.json'), 'utf-8'));
  
  const globalLookup = buildGlobalFieldLookup(itemsData.items, abilitiesData.abilities, unitsData.units);
  console.log(`📚 Built global field lookup with ${globalLookup.size} entries\n`);
  
  // Process with global lookup and abilities for reference resolution
  processItemsWithLookup(itemsData, globalLookup, abilitiesData.abilities);
  processAbilitiesWithLookup(abilitiesData, globalLookup, abilitiesData.abilities);
  processUnitsWithLookup(unitsData, globalLookup, abilitiesData.abilities);
  
  console.log('\n✅ Done! Now re-run the conversion script to update TypeScript files.');
}

function processItemsWithLookup(data, globalLookup, allAbilities) {
  let resolvedCount = 0;
  for (const item of data.items || []) {
    const raw = item.raw || [];
    let changed = false;
    
    // Get item's abilities from iabi field
    const iabiField = raw.find(m => m.id === 'iabi');
    const itemAbilities = iabiField && typeof iabiField.value === 'string' 
      ? iabiField.value.split(',').map(s => s.trim()).filter(s => s)
      : null;
    
    for (const mod of raw) {
      if (mod.value && typeof mod.value === 'string' && mod.value.includes('<')) {
        const resolved = resolveFieldReferences(mod.value, raw, globalLookup, allAbilities, itemAbilities);
        if (resolved !== mod.value) {
          mod.value = resolved;
          changed = true;
        }
      }
    }
    
    if (item.description) {
      const resolved = resolveFieldReferences(item.description, raw, globalLookup, allAbilities, itemAbilities);
      if (resolved !== item.description) {
        item.description = resolved;
        changed = true;
      }
    }
    
    // Also check raw tooltip fields (utub, ides) - they might still have placeholders
    // even if the extracted tooltip was already resolved
    const utubField = raw.find(m => m.id === 'utub');
    const idesField = raw.find(m => m.id === 'ides');
    
    if (utubField && utubField.value && typeof utubField.value === 'string' && utubField.value.includes('<')) {
      const resolved = resolveFieldReferences(utubField.value, raw, globalLookup, allAbilities, itemAbilities);
      if (resolved !== utubField.value) {
        utubField.value = resolved;
        // Update extracted tooltip if it matches
        if (!item.tooltip || item.tooltip === utubField.value) {
          item.tooltip = resolved;
        }
        changed = true;
      }
    }
    
    if (idesField && idesField.value && typeof idesField.value === 'string' && idesField.value.includes('<')) {
      const resolved = resolveFieldReferences(idesField.value, raw, globalLookup, allAbilities, itemAbilities);
      if (resolved !== idesField.value) {
        idesField.value = resolved;
        // Update extracted description if it matches
        if (!item.description || item.description === idesField.value) {
          item.description = resolved;
        }
        changed = true;
      }
    }
    
    if (item.tooltip) {
      const resolved = resolveFieldReferences(item.tooltip, raw, globalLookup, allAbilities, itemAbilities);
      if (resolved !== item.tooltip) {
        item.tooltip = resolved;
        changed = true;
      }
    }
    
    if (changed) resolvedCount++;
  }
  
  fs.writeFileSync(path.join(EXTRACTED_DIR, 'items.json'), JSON.stringify(data, null, 2));
  console.log(`✅ Resolved ${resolvedCount} items with field references`);
}

function processAbilitiesWithLookup(data, globalLookup, allAbilities) {
  let resolvedCount = 0;
  for (const ability of data.abilities || []) {
    const raw = ability.raw || [];
    let changed = false;
    
    for (const mod of raw) {
      if ((mod.id === 'aub1' || mod.id === 'aub2' || mod.id === 'utub') && 
          mod.value && typeof mod.value === 'string' && mod.value.includes('<')) {
        const resolved = resolveFieldReferences(mod.value, raw, globalLookup, allAbilities);
        if (resolved !== mod.value) {
          mod.value = resolved;
          if (!ability.tooltip || ability.tooltip === mod.value) {
            ability.tooltip = resolved;
          }
          changed = true;
        }
      } else if (mod.value && typeof mod.value === 'string' && mod.value.includes('<')) {
        const resolved = resolveFieldReferences(mod.value, raw, globalLookup, allAbilities);
        if (resolved !== mod.value) {
          mod.value = resolved;
          changed = true;
        }
      }
    }
    
    if (ability.description) {
      const resolved = resolveFieldReferences(ability.description, raw, globalLookup, allAbilities);
      if (resolved !== ability.description) {
        ability.description = resolved;
        changed = true;
      }
    }
    
    if (ability.tooltip) {
      const resolved = resolveFieldReferences(ability.tooltip, raw, globalLookup, allAbilities);
      if (resolved !== ability.tooltip) {
        ability.tooltip = resolved;
        changed = true;
      }
    }
    
    if (changed) resolvedCount++;
  }
  
  fs.writeFileSync(path.join(EXTRACTED_DIR, 'abilities.json'), JSON.stringify(data, null, 2));
  console.log(`✅ Resolved ${resolvedCount} abilities with field references`);
}

function processUnitsWithLookup(data, globalLookup, allAbilities) {
  let resolvedCount = 0;
  for (const unit of data.units || []) {
    const raw = unit.raw || [];
    let changed = false;
    
    for (const mod of raw) {
      if (mod.value && typeof mod.value === 'string' && mod.value.includes('<')) {
        const resolved = resolveFieldReferences(mod.value, raw, globalLookup, allAbilities);
        if (resolved !== mod.value) {
          mod.value = resolved;
          changed = true;
        }
      }
    }
    
    if (unit.description) {
      const resolved = resolveFieldReferences(unit.description, raw, globalLookup, allAbilities);
      if (resolved !== unit.description) {
        unit.description = resolved;
        changed = true;
      }
    }
    
    if (unit.tooltip) {
      const resolved = resolveFieldReferences(unit.tooltip, raw, globalLookup, allAbilities);
      if (resolved !== unit.tooltip) {
        unit.tooltip = resolved;
        changed = true;
      }
    }
    
    if (changed) resolvedCount++;
  }
  
  fs.writeFileSync(path.join(EXTRACTED_DIR, 'units.json'), JSON.stringify(data, null, 2));
  console.log(`✅ Resolved ${resolvedCount} units with field references`);
}

main();


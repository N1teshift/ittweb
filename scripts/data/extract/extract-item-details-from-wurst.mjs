/**
 * Extract detailed item properties from Wurst source files
 * 
 * Parses Wurst item definition files to extract:
 * - Stat bonuses (strength, agility, intelligence, armor, damage, etc.)
 * - Item definition properties (lumber cost, stock, scaling, etc.)
 * - Item constants and IDs
 * 
 * Usage: node scripts/data/extract-item-details-from-wurst.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROOT_DIR, TMP_METADATA_DIR, ensureTmpDirs } from '../lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WURST_DIR = path.join(ROOT_DIR, 'island-troll-tribes', 'wurst');

ensureTmpDirs();

/**
 * Recursively find all Wurst files in a directory
 */
function findWurstFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        findWurstFiles(filePath, fileList);
      }
    } else if (file.endsWith('.wurst')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extract item ID from constant definition
 */
function extractItemId(content, itemConstPattern) {
  // Match: public constant ITEM_NAME = 'xxxx'
  const regex = new RegExp(`(?:public\\s+)?constant\\s+(${itemConstPattern})\\s*=\\s*([^\\n]+)`, 'gi');
  const matches = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const constName = match[1];
    const rawCode = match[2].trim().replace(/['"]/g, '').trim();
    
    // Normalize constant name (remove ITEM_ prefix, convert to lowercase with dashes)
    const normalizedId = constName
      .replace(/^ITEM_/, '')
      .toLowerCase()
      .replace(/_/g, '-');
    
    matches.push({
      constant: constName,
      rawCode: rawCode,
      normalizedId: normalizedId
    });
  }
  
  return matches;
}

/**
 * Extract stat bonuses from CustomItemType class instantiation
 */
function extractStatBonuses(content, itemId) {
  // Look for: new CustomItemType(ITEM_ID) ..addBonusStrength(5) ..addBonusAgility(3)
  // Or: CustomItemType item = new CustomItemType(ITEM_ID) ..setStrengthBonus(5)
  
  const bonuses = {
    strength: 0,
    agility: 0,
    intelligence: 0,
    armor: 0,
    damage: 0,
    attackSpeed: 0,
    health: 0,
    mana: 0
  };
  
  // Pattern 1: Method chaining with addBonus* methods
  const addBonusPatterns = {
    strength: /\.\.addBonusStrength\s*\(\s*([^)]+)\s*\)/gi,
    agility: /\.\.addBonusAgility\s*\(\s*([^)]+)\s*\)/gi,
    intelligence: /\.\.addBonusIntelligence\s*\(\s*([^)]+)\s*\)/gi,
    armor: /\.\.addBonusArmor\s*\(\s*([^)]+)\s*\)/gi,
    damage: /\.\.addBonusDamage\s*\(\s*([^)]+)\s*\)/gi,
    attackSpeed: /\.\.addBonusAttackSpeed\s*\(\s*([^)]+)\s*\)/gi,
    health: /\.\.addBonusHealth\s*\(\s*([^)]+)\s*\)/gi,
    mana: /\.\.addBonusMana\s*\(\s*([^)]+)\s*\)/gi
  };
  
  // Pattern 2: Direct property assignment (strengthBonus = value)
  const propertyPatterns = {
    strength: /strengthBonus\s*=\s*(\d+)/gi,
    agility: /agilityBonus\s*=\s*(\d+)/gi,
    intelligence: /intelligenceBonus\s*=\s*(\d+)/gi,
    armor: /armorBonus\s*=\s*(\d+)/gi,
    damage: /damageBonus\s*=\s*(\d+)/gi,
    attackSpeed: /attackSpeedBonus\s*=\s*([\d.]+)/gi,
    health: /hpBonus\s*=\s*(\d+)/gi,
    mana: /mpBonus\s*=\s*(\d+)/gi
  };
  
  // Pattern 3: Setter methods
  const setterPatterns = {
    strength: /\.\.setStrengthBonus\s*\(\s*([^)]+)\s*\)/gi,
    agility: /\.\.setAgilityBonus\s*\(\s*([^)]+)\s*\)/gi,
    intelligence: /\.\.setIntelligenceBonus\s*\(\s*([^)]+)\s*\)/gi,
    armor: /\.\.setArmorBonus\s*\(\s*([^)]+)\s*\)/gi,
    damage: /\.\.setDamageBonus\s*\(\s*([^)]+)\s*\)/gi,
    attackSpeed: /\.\.setAttackSpeedBonus\s*\(\s*([^)]+)\s*\)/gi,
    health: /\.\.setHealthBonus\s*\(\s*([^)]+)\s*\)/gi,
    mana: /\.\.setManaBonus\s*\(\s*([^)]+)\s*\)/gi
  };
  
  // Try to find item-specific block first
  // Look for patterns like: ITEM_NAME_DEFINITION = compiletime(createItem(ITEM_NAME) ..addBonusStrength(5))
  const itemBlockRegex = new RegExp(`(${itemId.toUpperCase().replace(/-/g, '_')}[^=]*=\\s*(?:compiletime\\s*)?[^}]+})`, 'is');
  const itemBlockMatch = content.match(itemBlockRegex);
  const searchContent = itemBlockMatch ? itemBlockMatch[1] : content;
  
  for (const [stat, pattern] of Object.entries(addBonusPatterns)) {
    const matches = [...searchContent.matchAll(pattern)];
    if (matches.length > 0) {
      // Take the last match (most specific)
      const value = parseFloat(matches[matches.length - 1][1].trim());
      if (!isNaN(value)) {
        bonuses[stat] = value;
      }
    }
  }
  
  // Fall back to property patterns if no method chaining found
  if (Object.values(bonuses).every(v => v === 0)) {
    for (const [stat, pattern] of Object.entries(propertyPatterns)) {
      const matches = [...searchContent.matchAll(pattern)];
      if (matches.length > 0) {
        const value = parseFloat(matches[matches.length - 1][1].trim());
        if (!isNaN(value)) {
          bonuses[stat] = value;
        }
      }
    }
  }
  
  // Also check setter patterns
  for (const [stat, pattern] of Object.entries(setterPatterns)) {
    const matches = [...searchContent.matchAll(pattern)];
    if (matches.length > 0) {
      const value = parseFloat(matches[matches.length - 1][1].trim());
      if (!isNaN(value)) {
        bonuses[stat] = value;
      }
    }
  }
  
  // Return only non-zero bonuses
  const nonZeroBonuses = {};
  for (const [stat, value] of Object.entries(bonuses)) {
    if (value !== 0) {
      nonZeroBonuses[stat] = value;
    }
  }
  
  return nonZeroBonuses;
}

/**
 * Extract item definition properties from CustomItemDefinition
 */
function extractItemDefinitionProperties(content, itemId) {
  const properties = {};
  
  // Look for item-specific definition
  const itemConstPattern = itemId.toUpperCase().replace(/-/g, '_');
  const itemDefRegex = new RegExp(`(${itemConstPattern}_DEFINITION\\s*=\\s*(?:compiletime\\s*)?[^}]+})`, 'is');
  const itemDefMatch = content.match(itemDefRegex);
  const searchContent = itemDefMatch ? itemDefMatch[1] : content;
  
  // Extract lumber cost
  const lumberCostMatch = searchContent.match(/\.\.setLumberCost\s*\(\s*(\d+)\s*\)/i);
  if (lumberCostMatch) {
    properties.lumberCost = parseInt(lumberCostMatch[1], 10);
  }
  
  // Extract stock maximum
  const stockMaxMatch = searchContent.match(/\.\.setStockMaximum\s*\(\s*(\d+)\s*\)/i);
  if (stockMaxMatch) {
    properties.stockMaximum = parseInt(stockMaxMatch[1], 10);
  }
  
  // Extract stock replenish interval
  const stockReplenishMatch = searchContent.match(/\.\.setStockReplenishInterval\s*\(\s*(\d+)\s*\)/i);
  if (stockReplenishMatch) {
    properties.stockReplenishInterval = parseInt(stockReplenishMatch[1], 10);
  }
  
  // Extract scaling value
  const scalingMatch = searchContent.match(/\.\.setScalingValue\s*\(\s*([\d.]+)\s*\)/i);
  if (scalingMatch) {
    properties.scalingValue = parseFloat(scalingMatch[1]);
  }
  
  // Extract model path
  const modelMatch = searchContent.match(/\.\.setModelUsed\s*\(\s*["']([^"']+)["']\s*\)/i);
  if (modelMatch) {
    properties.modelPath = modelMatch[1];
  }
  
  return properties;
}

/**
 * Main extraction function
 */
function extractItemDetailsFromWurst() {
  console.log('\n🔍 Extracting item details from Wurst source files...');
  
  const itemDetails = {};
  const itemConstants = {};
  
  // Find all Wurst files
  const wurstFiles = findWurstFiles(WURST_DIR);
  console.log(`  Found ${wurstFiles.length} Wurst files to scan`);
  
  // First pass: Extract item constants
  console.log('  Extracting item constants...');
  for (const filePath of wurstFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Look for ITEM_* constants
    const itemConsts = extractItemId(content, 'ITEM_[A-Z0-9_]+');
    for (const itemConst of itemConsts) {
      itemConstants[itemConst.normalizedId] = {
        constant: itemConst.constant,
        rawCode: itemConst.rawCode,
        file: path.relative(WURST_DIR, filePath)
      };
    }
  }
  
  console.log(`  Found ${Object.keys(itemConstants).length} item constants`);
  
  // Second pass: Extract item details
  console.log('  Extracting item stat bonuses and properties...');
  let itemsWithDetails = 0;
  
  for (const [itemId, constInfo] of Object.entries(itemConstants)) {
    // Find files that might contain this item's definition
    const relevantFiles = wurstFiles.filter(file => {
      const content = fs.readFileSync(file, 'utf-8');
      return content.includes(constInfo.constant) || 
             content.includes(constInfo.constant.replace('ITEM_', ''));
    });
    
    let bonuses = {};
    let properties = {};
    
    for (const filePath of relevantFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract stat bonuses
      const extractedBonuses = extractStatBonuses(content, itemId);
      if (Object.keys(extractedBonuses).length > 0) {
        bonuses = { ...bonuses, ...extractedBonuses };
      }
      
      // Extract definition properties
      const extractedProperties = extractItemDefinitionProperties(content, itemId);
      if (Object.keys(extractedProperties).length > 0) {
        properties = { ...properties, ...extractedProperties };
      }
    }
    
    if (Object.keys(bonuses).length > 0 || Object.keys(properties).length > 0) {
      itemDetails[itemId] = {
        constant: constInfo.constant,
        rawCode: constInfo.rawCode,
        bonuses: bonuses,
        properties: properties
      };
      itemsWithDetails++;
    }
  }
  
  console.log(`  Found details for ${itemsWithDetails} items`);
  
  return {
    generatedAt: new Date().toISOString(),
    source: 'island-troll-tribes/wurst/',
    itemConstants: itemConstants,
    itemDetails: itemDetails,
    totalItems: Object.keys(itemConstants).length,
    itemsWithDetails: itemsWithDetails
  };
}

/**
 * Main execution
 */
function main() {
  try {
    const data = extractItemDetailsFromWurst();
    
    const outputPath = path.join(TMP_METADATA_DIR, 'item-details-wurst.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log(`\n✅ Item details extracted to: ${outputPath}`);
    console.log(`   - ${data.totalItems} item constants found`);
    console.log(`   - ${data.itemsWithDetails} items with detailed properties`);
  } catch (error) {
    console.error('\n❌ Error extracting item details:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractItemDetailsFromWurst };




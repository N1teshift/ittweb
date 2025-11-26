/**
 * Convert extracted .w3x data to TypeScript format
 * 
 * This script reads the extracted JSON files and converts them to the TypeScript
 * data structure used by the application.
 * 
 * Usage: node scripts/convert-extracted-to-typescript.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const EXTRACTED_DIR = path.join(ROOT_DIR, 'external', 'island_troll_tribes', 'extracted_from_w3x');
const RECIPES_FILE = path.join(ROOT_DIR, 'external', 'island_troll_tribes', 'recipes.json');

// TypeScript output directories
const ITEMS_DIR = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'items');
const ABILITIES_DIR = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'abilities');
const UNITS_DIR = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'units');
const BUILDINGS_DIR = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'buildings');

/**
 * Load JSON file
 */
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Convert Windows path to icon path format
 */
function convertIconPath(iconPath) {
  if (!iconPath) return undefined;
  
  // Convert Windows backslashes to forward slashes
  let converted = iconPath.replace(/\\/g, '/');
  
  // Remove "ReplaceableTextures/CommandButtons/" prefix if present
  converted = converted.replace(/^ReplaceableTextures\/CommandButtons\//i, '');
  
  // Remove .blp extension and add .png (or keep original extension)
  converted = converted.replace(/\.blp$/i, '.png');
  
  return converted;
}

/**
 * Generate slug from name
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Escape string for TypeScript/JavaScript
 */
function escapeString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/'/g, "\\'")     // Escape single quotes
    .replace(/\n/g, '\\n')    // Escape newlines
    .replace(/\r/g, '\\r')    // Escape carriage returns
    .replace(/\t/g, '\\t');   // Escape tabs
}

/**
 * Map item to category based on name and properties
 */
function mapItemCategory(item) {
  const name = (item.name || '').toLowerCase();
  const id = (item.id || '').toLowerCase();
  
  // Scrolls
  if (name.includes('scroll of') || name.includes(' scroll') || name.startsWith('scroll ')) {
    return { category: 'scrolls' };
  }
  
  // Potions
  if (name.includes('potion') || name.includes('essence') || name.includes('salve')) {
    if (name.includes('healing') || name.includes('health')) {
      return { category: 'potions', subcategory: 'healing-potions' };
    }
    if (name.includes('mana')) {
      return { category: 'potions', subcategory: 'mana-potions' };
    }
    return { category: 'potions', subcategory: 'special-potions' };
  }
  
  // Armor
  if (/(coat|cuirass|robe|gloves|boots|cloak|armor|shield)/i.test(name)) {
    return { category: 'armor' };
  }
  
  // Weapons
  if (/(axe|staff|dagger|sword|spear|bow|blowgun|tidebringer|masher|fist)/i.test(name)) {
    return { category: 'weapons' };
  }
  
  // Buildings
  if (/(kit|tower|hut|armory|tannery|forge|pot|fire)/i.test(name) || item.class === 'PowerUp') {
    return { category: 'buildings' };
  }
  
  // Raw materials
  if (/(hide|bone|mushroom|leaf|seed|egg|scale|tinder|stick|flint|acorn|clay|iron|steel|ingot|gem|magic|crystal)/i.test(name)) {
    const isHerbLike = /(mushroom|leaf|seed|herb)/i.test(name);
    const isAnimalPart = /(hide|bone|scale|fang|quill)/i.test(name);
    const isMetal = /(iron|steel|ingot)/i.test(name);
    
    if (isHerbLike) return { category: 'raw-materials', subcategory: 'herbs' };
    if (isAnimalPart) return { category: 'raw-materials', subcategory: 'animal-parts' };
    if (isMetal) return { category: 'raw-materials', subcategory: 'metals' };
    return { category: 'raw-materials', subcategory: 'materials' };
  }
  
  // Default to tools
  return { category: 'tools' };
}

/**
 * Map ability to category based on name and properties
 */
function mapAbilityCategory(ability) {
  const name = (ability.name || '').toLowerCase();
  
  // Item abilities
  if (ability.item === true) {
    return { category: 'item' };
  }
  
  // Building abilities
  if (ability.race === 'other' || name.includes('build') || name.includes('craft')) {
    return { category: 'building' };
  }
  
  // Class-specific abilities (based on common patterns)
  if (name.includes('hunt') || name.includes('track') || name.includes('net')) {
    return { category: 'hunter' };
  }
  if (name.includes('beast') || name.includes('bear') || name.includes('wolf') || name.includes('panther') || name.includes('tiger') || name.includes('shape')) {
    return { category: 'beastmaster' };
  }
  if (name.includes('mage') || name.includes('fire') || name.includes('ice') || name.includes('lightning') || name.includes('bolt') || name.includes('spell')) {
    return { category: 'mage' };
  }
  if (name.includes('priest') || name.includes('heal') || name.includes('cure') || name.includes('bless')) {
    return { category: 'priest' };
  }
  if (name.includes('thief') || name.includes('steal') || name.includes('pick') || name.includes('lock')) {
    return { category: 'thief' };
  }
  if (name.includes('scout') || name.includes('spy') || name.includes('trap') || name.includes('observe')) {
    return { category: 'scout' };
  }
  if (name.includes('gather') || name.includes('find') || name.includes('mix') || name.includes('herb')) {
    return { category: 'gatherer' };
  }
  
  // Basic abilities (common ones)
  if (name.includes('eat') || name.includes('sleep') || name.includes('panic') || name.includes('pump')) {
    return { category: 'basic' };
  }
  
  // Default to unknown
  return { category: 'unknown' };
}

/**
 * Load recipes to get crafting information
 */
function loadRecipes() {
  const recipesData = loadJson(RECIPES_FILE);
  if (!recipesData || !recipesData.recipes) return new Map();
  
  const recipeMap = new Map();
  for (const recipe of recipesData.recipes) {
    const itemId = recipe.itemId || recipe.itemName;
    if (itemId) {
      recipeMap.set(itemId, {
        ingredients: recipe.ingredients || recipe.ingredientNames || [],
        craftedAt: recipe.unitRequirement || recipe.craftedAt,
        mixingPotManaRequirement: recipe.mixingPotManaRequirement
      });
    }
  }
  
  return recipeMap;
}

/**
 * Convert extracted item to TypeScript ItemData
 */
function convertItem(extractedItem, recipes) {
  const categoryInfo = mapItemCategory(extractedItem);
  const recipe = recipes.get(extractedItem.id) || recipes.get(extractedItem.name);
  
  // Trim whitespace from strings
  const name = (extractedItem.name || extractedItem.id || '').trim();
  const description = (extractedItem.description || '').trim();
  const tooltip = extractedItem.tooltip ? extractedItem.tooltip.trim() : undefined;
  
  return {
    id: slugify(name),
    name: name,
    category: categoryInfo.category,
    subcategory: categoryInfo.subcategory,
    description: description,
    tooltip: tooltip,
    iconPath: convertIconPath(extractedItem.icon),
    recipe: recipe?.ingredients || undefined,
    craftedAt: recipe?.craftedAt || undefined,
    mixingPotManaRequirement: recipe?.mixingPotManaRequirement || undefined,
    // Note: stats would need to be extracted from raw modifications if needed
  };
}

/**
 * Convert extracted ability to TypeScript AbilityData
 */
function convertAbility(extractedAbility) {
  const categoryInfo = mapAbilityCategory(extractedAbility);
  
  // Try to extract mana cost, cooldown, etc. from raw modifications
  const raw = extractedAbility.raw || [];
  const getField = (fieldId) => {
    const field = raw.find(r => r.id === fieldId && r.level === 0);
    return field ? field.value : undefined;
  };
  
  // Trim whitespace from strings
  const name = (extractedAbility.name || extractedAbility.id || '').trim();
  const description = (extractedAbility.description || '').trim();
  const tooltip = extractedAbility.tooltip ? extractedAbility.tooltip.trim() : undefined;
  
  return {
    id: slugify(name),
    name: name,
    category: categoryInfo.category,
    classRequirement: categoryInfo.classRequirement,
    description: description,
    tooltip: tooltip,
    iconPath: convertIconPath(extractedAbility.icon),
    manaCost: getField('amcs') || getField('amc1') || getField('amc2') || undefined,
    cooldown: getField('acdn') || getField('acd1') || getField('acd2') || undefined,
    range: getField('aran') || getField('arng') || undefined,
    duration: getField('adur') || getField('ahdu') || undefined,
    damage: getField('ahd1') || getField('ahd2') || undefined,
    // effects would need more complex parsing
  };
}

/**
 * Write TypeScript file with items
 */
function writeItemsFile(filePath, items, category) {
  const content = `import type { ItemData } from '@/types/items';

export const ${category.toUpperCase().replace(/-/g, '_')}_ITEMS: ItemData[] = [
${items.map(item => {
  const lines = [`  {`];
  lines.push(`    id: '${item.id}',`);
  lines.push(`    name: '${escapeString(item.name)}',`);
  lines.push(`    category: '${item.category}',`);
  if (item.subcategory) {
    lines.push(`    subcategory: '${item.subcategory}',`);
  }
  if (item.description) {
    lines.push(`    description: '${escapeString(item.description)}',`);
  } else {
    lines.push(`    description: '',`);
  }
  if (item.tooltip) {
    lines.push(`    tooltip: '${escapeString(item.tooltip)}',`);
  }
  if (item.iconPath) {
    lines.push(`    iconPath: '${item.iconPath}',`);
  }
  if (item.recipe && item.recipe.length > 0) {
    lines.push(`    recipe: [${item.recipe.map(r => `'${r}'`).join(', ')}],`);
  }
  if (item.craftedAt) {
    lines.push(`    craftedAt: '${item.craftedAt}',`);
  }
  if (item.mixingPotManaRequirement !== undefined) {
    lines.push(`    mixingPotManaRequirement: ${item.mixingPotManaRequirement},`);
  }
  lines.push(`  }`);
  return lines.join('\n');
}).join(',\n')}
];
`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Write TypeScript file with abilities
 */
function writeAbilitiesFile(filePath, abilities, category) {
  const constName = category.toUpperCase().replace(/-/g, '_') + '_ABILITIES';
  
  const content = `import type { AbilityData } from './types';

export const ${constName}: AbilityData[] = [
${abilities.map(ability => {
  const lines = [`  {`];
  lines.push(`    id: '${ability.id}',`);
  lines.push(`    name: '${escapeString(ability.name)}',`);
  lines.push(`    category: '${ability.category}',`);
  if (ability.classRequirement) {
    lines.push(`    classRequirement: '${ability.classRequirement}',`);
  }
  if (ability.description) {
    lines.push(`    description: '${escapeString(ability.description)}',`);
  } else {
    lines.push(`    description: '',`);
  }
  if (ability.tooltip) {
    lines.push(`    tooltip: '${escapeString(ability.tooltip)}',`);
  }
  if (ability.iconPath) {
    lines.push(`    iconPath: '${ability.iconPath}',`);
  }
  if (ability.manaCost !== undefined) {
    lines.push(`    manaCost: ${ability.manaCost},`);
  }
  if (ability.cooldown !== undefined) {
    lines.push(`    cooldown: ${ability.cooldown},`);
  }
  if (ability.range !== undefined) {
    lines.push(`    range: ${ability.range},`);
  }
  if (ability.duration !== undefined) {
    lines.push(`    duration: ${ability.duration},`);
  }
  if (ability.damage !== undefined) {
    lines.push(`    damage: '${ability.damage}',`);
  }
  lines.push(`  }`);
  return lines.join('\n');
}).join(',\n')}
];
`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Main conversion function
 */
function main() {
  console.log('🔄 Converting extracted .w3x data to TypeScript format...\n');
  
  // Load extracted data
  const itemsData = loadJson(path.join(EXTRACTED_DIR, 'items.json'));
  const abilitiesData = loadJson(path.join(EXTRACTED_DIR, 'abilities.json'));
  const recipes = loadRecipes();
  
  if (!itemsData || !itemsData.items) {
    console.error('❌ No items data found');
    return;
  }
  
  if (!abilitiesData || !abilitiesData.abilities) {
    console.error('❌ No abilities data found');
    return;
  }
  
  console.log(`📦 Processing ${itemsData.items.length} items...`);
  console.log(`✨ Processing ${abilitiesData.abilities.length} abilities...\n`);
  
  // Convert items (deduplicate by name)
  const itemMap = new Map();
  for (const item of itemsData.items) {
    if (item.name && !itemMap.has(item.name)) {
      itemMap.set(item.name, convertItem(item, recipes));
    }
  }
  const convertedItems = Array.from(itemMap.values());
  
  // Group items by category
  const itemsByCategory = {};
  for (const item of convertedItems) {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  }
  
  // Write item files
  const categoryFileMap = {
    'scrolls': 'scrolls.ts',
    'weapons': 'weapons.ts',
    'armor': 'armor.ts',
    'tools': 'tools.ts',
    'potions': 'potions.ts',
    'raw-materials': 'raw-materials.ts',
    'buildings': 'buildings.ts', // Note: buildings might also go to buildings/ directory
  };
  
  for (const [category, items] of Object.entries(itemsByCategory)) {
    const fileName = categoryFileMap[category] || `${category}.ts`;
    const filePath = path.join(ITEMS_DIR, fileName);
    writeItemsFile(filePath, items, category);
    console.log(`✅ Wrote ${items.length} items to ${fileName}`);
  }
  
  // Convert abilities (deduplicate by name)
  const abilityMap = new Map();
  for (const ability of abilitiesData.abilities) {
    if (ability.name && !abilityMap.has(ability.name)) {
      abilityMap.set(ability.name, convertAbility(ability));
    }
  }
  const convertedAbilities = Array.from(abilityMap.values());
  
  // Group abilities by category
  const abilitiesByCategory = {};
  for (const ability of convertedAbilities) {
    if (!abilitiesByCategory[ability.category]) {
      abilitiesByCategory[ability.category] = [];
    }
    abilitiesByCategory[ability.category].push(ability);
  }
  
  // Write ability files
  const abilityFileMap = {
    'basic': 'basic.ts',
    'hunter': 'hunter.ts',
    'beastmaster': 'beastmaster.ts',
    'mage': 'mage.ts',
    'priest': 'priest.ts',
    'thief': 'thief.ts',
    'scout': 'scout.ts',
    'gatherer': 'gatherer.ts',
    'subclass': 'subclass.ts',
    'superclass': 'superclass.ts',
    'item': 'item.ts',
    'building': 'building.ts',
    'unknown': 'unknown.ts',
  };
  
  for (const [category, abilities] of Object.entries(abilitiesByCategory)) {
    const fileName = abilityFileMap[category] || `${category}.ts`;
    const filePath = path.join(ABILITIES_DIR, fileName);
    writeAbilitiesFile(filePath, abilities, category);
    console.log(`✅ Wrote ${abilities.length} abilities to ${fileName}`);
  }
  
  console.log('\n✅ Conversion complete!');
  console.log(`\n📊 Summary:`);
  console.log(`  Items: ${convertedItems.length}`);
  console.log(`  Abilities: ${convertedAbilities.length}`);
  console.log(`  Item categories: ${Object.keys(itemsByCategory).length}`);
  console.log(`  Ability categories: ${Object.keys(abilitiesByCategory).length}`);
}

main();


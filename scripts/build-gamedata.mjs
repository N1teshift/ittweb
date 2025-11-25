/**
 * Build modular game data from existing extracted JSON files.
 * 
 * Outputs to:
 *   src/features/ittweb/guides/data/gamedata/
 *     - units/     (trolls/classes)
 *     - abilities/
 *     - items/
 *     - buildings/
 *     - _index.json (metadata & summary)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const EXTERNAL_DIR = path.join(ROOT_DIR, 'external', 'island_troll_tribes');
const OUTPUT_DIR = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'gamedata');

// Class relationships (source of truth)
const CLASS_RELATIONSHIPS = {
  hunter: {
    name: "Hunter",
    subclasses: ["warrior", "tracker"],
    superclass: "juggernaut"
  },
  mage: {
    name: "Mage", 
    subclasses: ["elementalist", "hypnotist", "dreamwalker"],
    superclass: "dementia-master"
  },
  priest: {
    name: "Priest",
    subclasses: ["booster", "master-healer"],
    superclass: "sage"
  },
  beastmaster: {
    name: "Beastmaster",
    subclasses: ["druid", "shapeshifter-wolf", "shapeshifter-bear", "shapeshifter-panther", "shapeshifter-tiger", "dire-wolf", "dire-bear"],
    superclass: "jungle-tyrant"
  },
  thief: {
    name: "Thief",
    subclasses: ["rogue", "telethief", "escape-artist", "contortionist"],
    superclass: "assassin"
  },
  scout: {
    name: "Scout",
    subclasses: ["observer", "trapper"],
    superclass: "spy"
  },
  gatherer: {
    name: "Gatherer",
    subclasses: ["radar-gatherer", "herb-master", "alchemist"],
    superclass: "omnigatherer"
  }
};

function loadJson(filename) {
  const filepath = path.join(EXTERNAL_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: ${filename} not found`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeJson(dir, filename, data) {
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2));
}

function buildUnits(unitsData) {
  const unitsDir = path.join(OUTPUT_DIR, 'units');
  ensureDir(unitsDir);
  
  const allUnits = [];
  
  for (const [baseSlug, rel] of Object.entries(CLASS_RELATIONSHIPS)) {
    const baseUnitData = unitsData?.units?.find(u => u.id === baseSlug);
    
    // Base class
    const baseClass = {
      id: baseSlug,
      name: rel.name,
      type: "base",
      subclasses: rel.subclasses,
      superclass: rel.superclass,
      stats: baseUnitData ? {
        growth: baseUnitData.growth,
        baseHp: baseUnitData.baseHp,
        baseMana: baseUnitData.baseMana,
        baseMoveSpeed: baseUnitData.baseMoveSpeed
      } : null,
      abilities: [],
      tips: [],
      description: ""
    };
    allUnits.push(baseClass);
    
    // Subclasses
    for (const subSlug of rel.subclasses) {
      const subUnitData = unitsData?.units?.find(u => u.id === subSlug);
      allUnits.push({
        id: subSlug,
        name: subUnitData?.name || formatName(subSlug),
        type: "subclass",
        parentClass: baseSlug,
        stats: subUnitData ? {
          growth: subUnitData.growth,
          baseHp: subUnitData.baseHp,
          baseMana: subUnitData.baseMana,
          baseMoveSpeed: subUnitData.baseMoveSpeed
        } : null,
        abilities: [],
        tips: [],
        description: ""
      });
    }
    
    // Superclass
    const superSlug = rel.superclass;
    const superUnitData = unitsData?.units?.find(u => u.id === superSlug);
    allUnits.push({
      id: superSlug,
      name: superUnitData?.name || formatName(superSlug),
      type: "superclass",
      parentClass: baseSlug,
      stats: superUnitData ? {
        growth: superUnitData.growth,
        baseHp: superUnitData.baseHp,
        baseMana: superUnitData.baseMana,
        baseMoveSpeed: superUnitData.baseMoveSpeed
      } : null,
      abilities: [],
      tips: [],
      description: ""
    });
  }
  
  // Write one file per base class family
  for (const [baseSlug, rel] of Object.entries(CLASS_RELATIONSHIPS)) {
    const familyUnits = allUnits.filter(u => 
      u.id === baseSlug || 
      u.parentClass === baseSlug
    );
    writeJson(unitsDir, `${baseSlug}.json`, familyUnits);
  }
  
  // Write index
  writeJson(unitsDir, '_index.json', {
    description: "Troll classes - base, subclass, and superclass definitions",
    files: Object.keys(CLASS_RELATIONSHIPS).map(s => `${s}.json`),
    totalCount: allUnits.length
  });
  
  return allUnits;
}

function buildAbilities(abilitiesData) {
  const abilitiesDir = path.join(OUTPUT_DIR, 'abilities');
  ensureDir(abilitiesDir);
  
  if (!abilitiesData?.abilities) {
    writeJson(abilitiesDir, '_index.json', { description: "No abilities data", files: [], totalCount: 0 });
    return [];
  }
  
  // Filter out garbage abilities
  const validAbilities = abilitiesData.abilities.filter(a => {
    if (!a.id || a.id.length < 3) return false;
    if (a.id.includes('dummy')) return false;
    if (a.id.startsWith('buff-')) return false;
    if (a.id === 'icon' || a.id === 'id' || a.id === 'abilid') return false;
    return true;
  });
  
  // Group by category
  const byCategory = {};
  for (const ability of validAbilities) {
    const cat = ability.category || 'misc';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({
      id: ability.id,
      name: ability.name,
      description: ability.description || "",
      manaCost: ability.manaCost || null,
      cooldown: ability.cooldown || null,
      duration: ability.duration || null,
      range: ability.range || null
    });
  }
  
  // Write one file per category
  for (const [cat, abilities] of Object.entries(byCategory)) {
    writeJson(abilitiesDir, `${cat}.json`, abilities);
  }
  
  // Write index
  writeJson(abilitiesDir, '_index.json', {
    description: "Abilities grouped by category",
    files: Object.keys(byCategory).map(c => `${c}.json`),
    totalCount: validAbilities.length,
    countByCategory: Object.fromEntries(
      Object.entries(byCategory).map(([k, v]) => [k, v.length])
    )
  });
  
  return validAbilities;
}

function buildItems(recipesData) {
  const itemsDir = path.join(OUTPUT_DIR, 'items');
  ensureDir(itemsDir);
  
  if (!recipesData?.recipes) {
    writeJson(itemsDir, '_index.json', { description: "No items data", files: [], totalCount: 0 });
    return [];
  }
  
  // Group by category based on item naming patterns
  const categorize = (recipe) => {
    const name = recipe.name?.toLowerCase() || '';
    const id = recipe.id?.toLowerCase() || '';
    
    if (name.includes('coat') || name.includes('boot') || name.includes('glove') || name.includes('armor') || name.includes('shield')) return 'armor';
    if (name.includes('axe') || name.includes('spear') || name.includes('sword') || name.includes('bow') || name.includes('blow')) return 'weapons';
    if (name.includes('potion') || name.includes('salve') || name.includes('healing')) return 'potions';
    if (name.includes('scroll')) return 'scrolls';
    if (id.includes('raw') || name.includes('tinder') || name.includes('stick') || name.includes('flint')) return 'materials';
    return 'misc';
  };
  
  const byCategory = {};
  for (const recipe of recipesData.recipes) {
    const cat = categorize(recipe);
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description || "",
      ingredients: recipe.ingredients || [],
      result: recipe.result || null
    });
  }
  
  for (const [cat, items] of Object.entries(byCategory)) {
    writeJson(itemsDir, `${cat}.json`, items);
  }
  
  writeJson(itemsDir, '_index.json', {
    description: "Items/recipes grouped by category",
    files: Object.keys(byCategory).map(c => `${c}.json`),
    totalCount: recipesData.recipes.length,
    countByCategory: Object.fromEntries(
      Object.entries(byCategory).map(([k, v]) => [k, v.length])
    )
  });
  
  return recipesData.recipes;
}

function buildBuildings(buildingsData) {
  const buildingsDir = path.join(OUTPUT_DIR, 'buildings');
  ensureDir(buildingsDir);
  
  if (!buildingsData?.buildings) {
    writeJson(buildingsDir, '_index.json', { description: "No buildings data", files: [], totalCount: 0 });
    return [];
  }
  
  const buildings = buildingsData.buildings.map(b => ({
    id: b.id,
    name: b.name,
    description: b.description || "",
    buildTime: b.buildTime || null,
    hp: b.hp || null
  }));
  
  writeJson(buildingsDir, 'all.json', buildings);
  writeJson(buildingsDir, '_index.json', {
    description: "Building definitions",
    files: ['all.json'],
    totalCount: buildings.length
  });
  
  return buildings;
}

function formatName(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function main() {
  console.log('='.repeat(60));
  console.log('Building modular gamedata');
  console.log('='.repeat(60));
  
  // Load source data
  const unitsData = loadJson('units.json');
  const abilitiesData = loadJson('abilities.json');
  const recipesData = loadJson('recipes.json');
  const buildingsData = loadJson('buildings.json');
  
  console.log(`\nLoaded source data:`);
  console.log(`  - Units: ${unitsData?.units?.length || 0}`);
  console.log(`  - Abilities: ${abilitiesData?.abilities?.length || 0}`);
  console.log(`  - Recipes: ${recipesData?.recipes?.length || 0}`);
  console.log(`  - Buildings: ${buildingsData?.buildings?.length || 0}`);
  
  // Build modular output
  const units = buildUnits(unitsData);
  const abilities = buildAbilities(abilitiesData);
  const items = buildItems(recipesData);
  const buildings = buildBuildings(buildingsData);
  
  // Write root index
  writeJson(OUTPUT_DIR, '_index.json', {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    sourceMap: "Island.Troll.Tribes.v3.28.w3x",
    description: "Modular game data. Edit individual JSON files to curate.",
    folders: ['units', 'abilities', 'items', 'buildings'],
    counts: {
      units: units.length,
      abilities: abilities.length,
      items: items.length,
      buildings: buildings.length
    }
  });
  
  console.log(`\nOutput written to: ${OUTPUT_DIR}`);
  console.log(`\nStructure:`);
  console.log(`  gamedata/`);
  console.log(`    _index.json`);
  console.log(`    units/      (${units.length} trolls)`);
  console.log(`    abilities/  (${abilities.length} abilities)`);
  console.log(`    items/      (${items.length} items)`);
  console.log(`    buildings/  (${buildings.length} buildings)`);
  
  console.log('\n' + '='.repeat(60));
  console.log('Done! Edit individual JSON files to curate the data.');
  console.log('='.repeat(60));
}

main();

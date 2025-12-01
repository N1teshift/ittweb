/**
 * Ability converter - converts extracted ability data to TypeScript AbilityData format
 */

import { slugify, stripColorCodes, convertIconPath, getField } from '../lib/utils.mjs';
import { mapAbilityCategory, isGarbageAbilityName } from './category-mapper.mjs';

/**
 * Convert extracted ability to TypeScript AbilityData
 */
export function convertAbility(extractedAbility) {
  const raw = extractedAbility.raw || [];
  
  const getAbilityField = (fieldId) => {
    return getField(raw, fieldId.toLowerCase(), 0) || undefined;
  };
  
  const getStringField = (...fieldIds) => {
    for (const id of fieldIds) {
      const value = getField(raw, id.toLowerCase(), 0);
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return undefined;
  };
  
  let name = (extractedAbility.name || '').trim();
  if (!name) {
    name =
      getStringField('atp1', 'atp2', 'atp3', 'aret', 'arut', 'aub1', 'anam', 'unam') ||
      (extractedAbility.tooltip ? extractedAbility.tooltip.split('\n').find(line => line.trim())?.trim() : undefined) ||
      (extractedAbility.id || '').trim();
  }
  
  const safeName = name || (extractedAbility.id || 'unknown-ability');
  const cleanName = stripColorCodes(safeName).trim();
  const slug = slugify(cleanName);
  
  // Check if it's an item ability first (from extracted data)
  let categoryInfo;
  if (extractedAbility.item === true) {
    categoryInfo = { category: 'item', classRequirement: undefined };
  } else {
    // Try to map category using the slug and ability name (for pattern matching)
    categoryInfo = mapAbilityCategory(slug, cleanName);
    
    // Also try with the original ability ID if slug didn't match
    if (categoryInfo.category === 'unknown' && extractedAbility.id) {
      const idSlug = slugify(extractedAbility.id);
      if (idSlug !== slug) {
        const idCategoryInfo = mapAbilityCategory(idSlug, cleanName);
        if (idCategoryInfo.category !== 'unknown') {
          categoryInfo = idCategoryInfo;
        }
      }
    }
  }
  
  const description = (extractedAbility.description || '').trim();
  const tooltip = extractedAbility.tooltip ? extractedAbility.tooltip.trim() : undefined;
  
  // Extract numeric values safely
  const parseNumeric = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  };
  
  const parseInteger = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return Math.floor(value);
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  };
  
  // Get level-specific data if available
  const getLevelData = (fieldName, fieldIds) => {
    if (extractedAbility.levels && extractedAbility.levels[fieldName]) {
      return extractedAbility.levels[fieldName];
    }
    // Fallback to single value
    for (const fieldId of fieldIds) {
      const value = getAbilityField(fieldId);
      if (value !== undefined) return value;
    }
    return undefined;
  };
  
  // Helper to get level 1 value from levels if base value not available
  const getLevel1Value = (fieldName) => {
    if (extractedAbility.levels && extractedAbility.levels[fieldName]) {
      const levelValues = extractedAbility.levels[fieldName];
      if (typeof levelValues === 'object' && levelValues['1'] !== undefined) {
        return parseNumeric(levelValues['1']);
      }
    }
    // Also check if levels are already in level-based format
    if (extractedAbility.levels && extractedAbility.levels['1']) {
      return parseNumeric(extractedAbility.levels['1'][fieldName]);
    }
    return undefined;
  };
  
  const baseResult = {
    id: slug,
    name: cleanName,
    category: categoryInfo.category,
    classRequirement: categoryInfo.classRequirement,
    description: description,
    tooltip: tooltip,
    iconPath: convertIconPath(extractedAbility.icon),
    manaCost: parseNumeric(extractedAbility.manaCost) || getLevel1Value('manaCost') || parseNumeric(getAbilityField('amcs') || getAbilityField('amc1') || getAbilityField('amc2')),
    cooldown: parseNumeric(extractedAbility.cooldown) || getLevel1Value('cooldown') || parseNumeric(getAbilityField('acdn') || getAbilityField('acd1') || getAbilityField('acd2')),
    range: parseNumeric(extractedAbility.range) || getLevel1Value('range') || parseNumeric(getAbilityField('aran') || getAbilityField('arng')),
    duration: parseNumeric(extractedAbility.duration) || getLevel1Value('duration') || parseNumeric(getAbilityField('adur') || getAbilityField('ahdu')),
    damage: getAbilityField('ahd1') || getAbilityField('ahd2') || undefined,
  };
  
  // Add new fields if available (prefer extractedAbility, fallback to raw)
  const areaOfEffect = extractedAbility.areaOfEffect !== undefined ? extractedAbility.areaOfEffect : getAbilityField('aare');
  if (areaOfEffect !== undefined) {
    baseResult.areaOfEffect = parseNumeric(areaOfEffect);
  }
  
  const maxTargets = extractedAbility.maxTargets !== undefined ? extractedAbility.maxTargets : getAbilityField('acap');
  if (maxTargets !== undefined) {
    baseResult.maxTargets = parseInteger(maxTargets);
  }
  
  // Always try to get hotkey and targetsAllowed from extractedAbility first, then raw
  if (extractedAbility.hotkey) {
    baseResult.hotkey = String(extractedAbility.hotkey).trim();
  } else {
    const hotkeyFromRaw = getAbilityField('ahky');
    if (hotkeyFromRaw) {
      baseResult.hotkey = String(hotkeyFromRaw).trim();
    }
  }
  
  if (extractedAbility.targetsAllowed) {
    baseResult.targetsAllowed = String(extractedAbility.targetsAllowed).trim();
  } else {
    const targetsFromRaw = getAbilityField('atar');
    if (targetsFromRaw) {
      baseResult.targetsAllowed = String(targetsFromRaw).trim();
    }
  }
  
  if (extractedAbility.castTime || getAbilityField('acat')) {
    baseResult.castTime = extractedAbility.castTime || getAbilityField('acat');
  }
  
  // Levels - transform from field-based to level-based structure if needed
  if (extractedAbility.levels) {
    // Check if levels are in field-based format (cooldown: {1: 45, 2: 40}) or level-based (1: {cooldown: 45})
    const firstKey = Object.keys(extractedAbility.levels)[0];
    const firstValue = extractedAbility.levels[firstKey];
    
    // If first value is an object with numeric keys, it's field-based format - transform it
    if (firstValue && typeof firstValue === 'object' && !isNaN(parseInt(firstKey))) {
      // Already in level-based format: { "1": { cooldown: 45 }, "2": { cooldown: 40 } }
      baseResult.levels = extractedAbility.levels;
    } else if (firstValue && typeof firstValue === 'object' && Object.keys(firstValue).some(k => !isNaN(parseInt(k)))) {
      // Field-based format: { cooldown: { "1": 45, "2": 40 }, duration: { "1": 15, "2": 20 } }
      // Transform to level-based format
      const levelData = {};
      for (const [fieldName, levelValues] of Object.entries(extractedAbility.levels)) {
        if (levelValues && typeof levelValues === 'object') {
          for (const [levelStr, value] of Object.entries(levelValues)) {
            const level = parseInt(levelStr);
            if (!isNaN(level)) {
              if (!levelData[level]) {
                levelData[level] = {};
              }
              if (fieldName === 'damage') {
                levelData[level][fieldName] = value;
              } else {
                const num = parseNumeric(value);
                if (num !== undefined) {
                  levelData[level][fieldName] = num;
                }
              }
            }
          }
        }
      }
      if (Object.keys(levelData).length > 0) {
        baseResult.levels = levelData;
      }
    } else {
      // Unknown format, use as-is
      baseResult.levels = extractedAbility.levels;
    }
  } else {
    // Try to build levels from raw modifications
    const levelData = {};
    const levelFields = ['manaCost', 'cooldown', 'duration', 'range', 'areaOfEffect', 'damage'];
    const fieldMappings = {
      manaCost: ['amcs', 'amc1', 'amc2'],
      cooldown: ['acdn', 'acd1', 'acd2'],
      duration: ['adur', 'ahdu'],
      range: ['aran', 'arng'],
      areaOfEffect: ['aare'],
      damage: ['ahd1', 'ahd2'],
    };
    
    // Find all levels present in raw data
    const levelsFound = new Set();
    raw.forEach(mod => {
      if (mod.level !== undefined && mod.level !== null) {
        levelsFound.add(mod.level);
      }
    });
    
    // Build level data if we have multiple levels
    if (levelsFound.size > 1 || (levelsFound.size === 1 && Array.from(levelsFound)[0] !== 0)) {
      for (const level of levelsFound) {
        levelData[level] = {};
        for (const fieldName of levelFields) {
          const fieldIds = fieldMappings[fieldName];
          for (const fieldId of fieldIds) {
            const value = getField(raw, fieldId.toLowerCase(), level);
            if (value !== undefined && value !== null && value !== '') {
              if (fieldName === 'damage') {
                levelData[level][fieldName] = value;
              } else {
                const num = parseNumeric(value);
                if (num !== undefined) {
                  levelData[level][fieldName] = num;
                }
              }
              break;
            }
          }
        }
        // Only add level if it has at least one field
        if (Object.keys(levelData[level]).length === 0) {
          delete levelData[level];
        }
      }
      if (Object.keys(levelData).length > 0) {
        baseResult.levels = levelData;
      }
    }
  }
  if (extractedAbility.attachmentPoints && extractedAbility.attachmentPoints.length > 0) {
    baseResult.visualEffects = {
      attachmentPoints: extractedAbility.attachmentPoints,
      ...(extractedAbility.attachmentTarget && { attachmentTarget: extractedAbility.attachmentTarget }),
    };
  }
  if (extractedAbility.availableToClasses && extractedAbility.availableToClasses.length > 0) {
    baseResult.availableToClasses = extractedAbility.availableToClasses;
  }
  if (extractedAbility.spellbook) {
    baseResult.spellbook = extractedAbility.spellbook;
  }
  
  return baseResult;
}

// isGarbageAbilityName is re-exported from category-mapper


/**
 * Ability converter - converts extracted ability data to TypeScript AbilityData format
 */

import { slugify, stripColorCodes, convertIconPath, getField } from '../utils.mjs';
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
  const categoryInfo = mapAbilityCategory(slug);
  
  const description = (extractedAbility.description || '').trim();
  const tooltip = extractedAbility.tooltip ? extractedAbility.tooltip.trim() : undefined;
  
  return {
    id: slug,
    name: cleanName,
    category: categoryInfo.category,
    classRequirement: categoryInfo.classRequirement,
    description: description,
    tooltip: tooltip,
    iconPath: convertIconPath(extractedAbility.icon),
    manaCost: getAbilityField('amcs') || getAbilityField('amc1') || getAbilityField('amc2') || undefined,
    cooldown: getAbilityField('acdn') || getAbilityField('acd1') || getAbilityField('acd2') || undefined,
    range: getAbilityField('aran') || getAbilityField('arng') || undefined,
    duration: getAbilityField('adur') || getAbilityField('ahdu') || undefined,
    damage: getAbilityField('ahd1') || getAbilityField('ahd2') || undefined,
  };
}

// isGarbageAbilityName is re-exported from category-mapper


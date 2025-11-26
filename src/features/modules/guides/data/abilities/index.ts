// Re-export types
export type { AbilityCategory, AbilityData } from './types';

import type { AbilityCategory, AbilityData } from './types';
import { BASIC_ABILITIES } from './basic';
import { BEASTMASTER_ABILITIES } from './beastmaster';
import { GATHERER_ABILITIES } from './gatherer';
import { HUNTER_ABILITIES } from './hunter';
import { ITEM_ABILITIES } from './item';
import { MAGE_ABILITIES } from './mage';
import { PRIEST_ABILITIES } from './priest';
import { SCOUT_ABILITIES } from './scout';
import { THIEF_ABILITIES } from './thief';
import { UNKNOWN_ABILITIES } from './unknown';

// Combine all abilities
export const ABILITIES: AbilityData[] = [
  ...BASIC_ABILITIES,
  ...BEASTMASTER_ABILITIES,
  ...GATHERER_ABILITIES,
  ...HUNTER_ABILITIES,
  ...ITEM_ABILITIES,
  ...MAGE_ABILITIES,
  ...PRIEST_ABILITIES,
  ...SCOUT_ABILITIES,
  ...THIEF_ABILITIES,
  ...UNKNOWN_ABILITIES,
];

export const ABILITY_CATEGORIES: Record<AbilityCategory, string> = {
  basic: 'Basic Abilities',
  hunter: 'Hunter Abilities',
  beastmaster: 'Beastmaster Abilities',
  mage: 'Mage Abilities',
  priest: 'Priest Abilities',
  thief: 'Thief Abilities',
  scout: 'Scout Abilities',
  gatherer: 'Gatherer Abilities',
  item: 'Item Abilities',
  building: 'Building Abilities',
  unknown: 'Unknown Abilities'
};

export function getAbilitiesByCategory(category: AbilityCategory): AbilityData[] {
  return ABILITIES.filter(ability => ability.category === category);
}

export function getAbilitiesByClass(classSlug: string): AbilityData[] {
  return ABILITIES.filter(ability => ability.classRequirement === classSlug);
}

export function getAbilityById(id: string): AbilityData | undefined {
  return ABILITIES.find(ability => ability.id === id);
}

export function searchAbilities(query: string): AbilityData[] {
  const lowerQuery = query.toLowerCase();
  return ABILITIES.filter(ability => 
    ability.name.toLowerCase().includes(lowerQuery) ||
    ability.description.toLowerCase().includes(lowerQuery) ||
    ability.id.toLowerCase().includes(lowerQuery)
  );
}

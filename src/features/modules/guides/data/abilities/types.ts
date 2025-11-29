export type AbilityCategory = 
  | 'basic' 
  | 'hunter' 
  | 'beastmaster' 
  | 'mage' 
  | 'priest' 
  | 'thief' 
  | 'scout' 
  | 'gatherer' 
  | 'item'
  | 'building'
  | 'auradummy'
  | 'bonushandler'
  | 'buff'
  | 'unknown';

export type AbilityData = {
  id: string;
  name: string;
  category: AbilityCategory;
  classRequirement?: string;
  description: string;
  tooltip?: string;
  iconPath?: string;
  manaCost?: number;
  cooldown?: number;
  range?: number;
  duration?: number;
  damage?: string;
  effects?: string[];
  // Targeting & effects
  areaOfEffect?: number;
  maxTargets?: number;
  targetsAllowed?: string;
  // Usage
  hotkey?: string;
  castTime?: number | string;
  // Class relationships
  availableToClasses?: string[];
  spellbook?: 'hero' | 'normal' | string;
  // Visual effects
  visualEffects?: unknown;
  // Level-specific data
  levels?: {
    [level: string]: {
      damage?: number | string;
      manaCost?: number;
      cooldown?: number;
      range?: number;
      areaOfEffect?: number;
      duration?: number;
      [key: string]: unknown;
    };
  };
  // Allow additional properties
  [key: string]: unknown;
};

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
  | 'bonushandler'
  | 'buff'
  | 'auradummy'
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
  // Additional properties
  hotkey?: string;
  areaOfEffect?: number;
  maxTargets?: number;
  castTime?: number | string;
  targetsAllowed?: string;
  availableToClasses?: string[];
  spellbook?: 'hero' | 'normal' | string;
  visualEffects?: unknown;
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

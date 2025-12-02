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
  availableToClasses?: string[]; // Classes that can use this ability (from extraction scripts)
  spellbook?: string; // Spellbook this ability belongs to (from extraction scripts)
  description: string;
  tooltip?: string;
  iconPath?: string;
  manaCost?: number;
  cooldown?: number;
  range?: number;
  duration?: number;
  damage?: string;
  effects?: string[];
  // Fields extracted from game data (war3map.w3a and Wurst source files)
  areaOfEffect?: number;
  maxTargets?: number;
  hotkey?: string;
  targetsAllowed?: string;
  castTime?: number | string; // Can be a number (seconds) or string (model path from extraction)
  visualEffects?: {
    attachmentPoints?: (string | number)[];
    attachmentTarget?: string;
    [key: string]: unknown; // Allow other visual effect properties
  };
  // Level-specific data (keys are level numbers as strings, e.g., "1", "2")
  levels?: Record<string, {
    manaCost?: number;
    cooldown?: number;
    duration?: number;
    range?: number;
    damage?: string;
    areaOfEffect?: number;
    [key: string]: unknown; // Allow other level-specific properties
  }>;
};


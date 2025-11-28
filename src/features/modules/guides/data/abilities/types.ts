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

export type AbilityLevelData = {
  manaCost?: number;
  cooldown?: number;
  range?: number;
  duration?: number;
  damage?: string | number;
  areaOfEffect?: number;
  maxTargets?: number;
  castTime?: number;
};

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
  hotkey?: string;
  levels?: Record<string, AbilityLevelData>;
  areaOfEffect?: number;
  maxTargets?: number;
  targetsAllowed?: string;
  availableToClasses?: string[];
  spellbook?: 'hero' | 'normal';
  castTime?: number;
  visualEffects?: {
    attachmentPoints?: Array<string | number>;
    attachmentTarget?: string;
  };
};

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
  | 'unknown';

export type AbilityData = {
  id: string;
  name: string;
  category: AbilityCategory;
  classRequirement?: string;
  description: string;
  tooltip?: string; // Extended tooltip from game data
  iconPath?: string; // Icon path from game data
  manaCost?: number;
  cooldown?: number;
  range?: number;
  duration?: number;
  damage?: string;
  effects?: string[];
};

export type AbilityCategory = 
  | 'basic' 
  | 'hunter' 
  | 'beastmaster' 
  | 'mage' 
  | 'priest' 
  | 'thief' 
  | 'scout' 
  | 'gatherer' 
  | 'subclass' 
  | 'superclass' 
  | 'item'
  | 'building';

export type AbilityData = {
  id: string;
  name: string;
  category: AbilityCategory;
  classRequirement?: string;
  description: string;
  manaCost?: number;
  cooldown?: number;
  range?: number;
  duration?: number;
  damage?: string;
  effects?: string[];
};

export const ABILITIES: AbilityData[] = [
  // Basic Abilities
  {
    id: 'sleep',
    name: 'Sleep',
    category: 'basic',
    description: 'Puts the troll to sleep to regenerate health and mana faster.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Increased health regeneration', 'Increased mana regeneration', 'Vulnerability while sleeping']
  },
  {
    id: 'eat',
    name: 'Eat',
    category: 'basic',
    description: 'Consume food to restore health.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Restores health based on food type']
  },

  // Hunter Abilities
  {
    id: 'track',
    name: 'Track',
    category: 'hunter',
    classRequirement: 'Hunter',
    description: 'Reveals the location of the nearest enemy troll.',
    manaCost: 25,
    cooldown: 30,
    range: 2000,
    effects: ['Reveals enemy position', 'Shows on minimap']
  },
  {
    id: 'net',
    name: 'Net',
    category: 'hunter',
    classRequirement: 'Hunter',
    description: 'Throws a net to ensnare an enemy, preventing movement.',
    manaCost: 15,
    cooldown: 8,
    range: 400,
    duration: 4,
    effects: ['Immobilizes target', 'Prevents blink/teleport']
  },
  {
    id: 'bash',
    name: 'Bash',
    category: 'hunter',
    classRequirement: 'Warrior',
    description: 'Stuns target and deals bonus damage.',
    manaCost: 12,
    cooldown: 6,
    range: 128,
    duration: 2,
    damage: '+50 damage',
    effects: ['Stuns target', 'Bonus damage']
  },
  {
    id: 'pulverize',
    name: 'Pulverize',
    category: 'hunter',
    classRequirement: 'Warrior',
    description: 'Area attack that damages all nearby enemies.',
    manaCost: 25,
    cooldown: 8,
    range: 250,
    damage: '100-150 area damage',
    effects: ['Area of effect damage']
  },

  // Beastmaster Abilities
  {
    id: 'tame',
    name: 'Tame Animal',
    category: 'beastmaster',
    classRequirement: 'Beastmaster',
    description: 'Tames a wild animal to fight alongside you.',
    manaCost: 35,
    cooldown: 15,
    range: 400,
    effects: ['Converts animal to ally', 'Animal follows and fights for you']
  },
  {
    id: 'spirit_beast',
    name: 'Spirit of the Beast',
    category: 'beastmaster',
    classRequirement: 'Beastmaster',
    description: 'Passive ability that slows nearby animals and increases damage.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Slows hostile animals', 'Increases damage vs animals']
  },
  {
    id: 'shapeshift_wolf',
    name: 'Shapeshift - Wolf',
    category: 'beastmaster',
    classRequirement: 'Shapeshifter',
    description: 'Transform into a wolf form with increased speed and lifesteal.',
    manaCost: 20,
    cooldown: 5,
    duration: 45,
    effects: ['Increased movement speed', 'Lifesteal on attacks', 'Cannot use items']
  },
  {
    id: 'shapeshift_bear',
    name: 'Shapeshift - Bear',
    category: 'beastmaster',
    classRequirement: 'Shapeshifter',
    description: 'Transform into a bear form with increased health and armor.',
    manaCost: 20,
    cooldown: 5,
    duration: 45,
    effects: ['Increased health', 'Damage reduction', 'Cannot use items']
  },
  {
    id: 'shapeshift_panther',
    name: 'Shapeshift - Panther',
    category: 'beastmaster',
    classRequirement: 'Shapeshifter',
    description: 'Transform into a panther form with stealth and critical strikes.',
    manaCost: 20,
    cooldown: 5,
    duration: 45,
    effects: ['Stealth/prowl', 'Critical strike chance', 'Cannot use items']
  },

  // Mage Abilities
  {
    id: 'mage_fire',
    name: 'Mage Fire',
    category: 'mage',
    classRequirement: 'Mage',
    description: 'Creates a magical fire for cooking food.',
    manaCost: 15,
    cooldown: 0,
    effects: ['Can cook raw food', 'Provides warmth']
  },
  {
    id: 'zap',
    name: 'Zap',
    category: 'mage',
    classRequirement: 'Mage',
    description: 'Deals magic damage to target enemy.',
    manaCost: 18,
    cooldown: 3,
    range: 500,
    damage: '80-120 magic damage',
    effects: ['Magic damage']
  },
  {
    id: 'fireball',
    name: 'Fireball',
    category: 'mage',
    classRequirement: 'Elementalist',
    description: 'Hurls a fireball that explodes on impact.',
    manaCost: 35,
    cooldown: 8,
    range: 600,
    damage: '150-200 fire damage',
    effects: ['Area damage on impact', 'Fire damage']
  },
  {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    category: 'mage',
    classRequirement: 'Elementalist',
    description: 'Lightning that jumps between multiple enemies.',
    manaCost: 45,
    cooldown: 12,
    range: 500,
    damage: '100-150 per target',
    effects: ['Jumps to nearby enemies', 'Decreasing damage per jump']
  },
  {
    id: 'hypnosis',
    name: 'Hypnosis',
    category: 'mage',
    classRequirement: 'Hypnotist',
    description: 'Controls an enemy unit for a short time.',
    manaCost: 60,
    cooldown: 25,
    range: 400,
    duration: 8,
    effects: ['Mind control enemy', 'Enemy fights for you']
  },

  // Priest Abilities
  {
    id: 'heal',
    name: 'Heal',
    category: 'priest',
    classRequirement: 'Priest',
    description: 'Restores health to target ally.',
    manaCost: 25,
    cooldown: 3,
    range: 400,
    effects: ['Restores 100-150 health']
  },
  {
    id: 'cure_all',
    name: 'Cure All',
    category: 'priest',
    classRequirement: 'Priest',
    description: 'Removes all negative effects from target.',
    manaCost: 30,
    cooldown: 8,
    range: 400,
    effects: ['Removes debuffs', 'Removes poison/disease']
  },
  {
    id: 'increase_stats',
    name: 'Increase Stats',
    category: 'priest',
    classRequirement: 'Booster',
    description: 'Temporarily increases all attributes of target ally.',
    manaCost: 40,
    cooldown: 5,
    range: 400,
    duration: 60,
    effects: ['+5 to all stats', 'Stacks with other buffs']
  },
  {
    id: 'mass_heal',
    name: 'Mass Heal',
    category: 'priest',
    classRequirement: 'Master Healer',
    description: 'Heals all nearby allied units.',
    manaCost: 75,
    cooldown: 15,
    range: 400,
    effects: ['Heals all allies in area', '80-120 health restored']
  },

  // Thief Abilities
  {
    id: 'blink',
    name: 'Blink',
    category: 'thief',
    classRequirement: 'Thief',
    description: 'Instantly teleports to target location.',
    manaCost: 20,
    cooldown: 8,
    range: 700,
    effects: ['Instant teleportation', 'Can escape nets/roots']
  },
  {
    id: 'cloak',
    name: 'Cloak',
    category: 'thief',
    classRequirement: 'Thief',
    description: 'Becomes invisible for a short duration.',
    manaCost: 35,
    cooldown: 15,
    duration: 20,
    effects: ['Invisibility', 'Breaks on attacking', 'Increased movement speed']
  },
  {
    id: 'steal',
    name: 'Steal',
    category: 'thief',
    classRequirement: 'Thief',
    description: 'Steals an item from target enemy.',
    manaCost: 15,
    cooldown: 8,
    range: 200,
    effects: ['Steals random item', 'Works on buildings too']
  },
  {
    id: 'backstab',
    name: 'Backstab',
    category: 'thief',
    classRequirement: 'Assassin',
    description: 'Massive damage when attacking from behind.',
    manaCost: 25,
    cooldown: 12,
    range: 128,
    damage: '3x normal damage',
    effects: ['Must attack from behind', 'Critical strike']
  },

  // Scout Abilities
  {
    id: 'radar',
    name: 'Radar',
    category: 'scout',
    classRequirement: 'Scout',
    description: 'Reveals all enemies in a large area.',
    manaCost: 30,
    cooldown: 20,
    range: 1500,
    duration: 10,
    effects: ['Reveals enemies', 'Shows on minimap', 'Large detection radius']
  },
  {
    id: 'ward',
    name: 'Ward',
    category: 'scout',
    classRequirement: 'Observer',
    description: 'Places an invisible ward that provides vision.',
    manaCost: 25,
    cooldown: 5,
    range: 300,
    duration: 180,
    effects: ['Permanent vision', 'Invisible to enemies', 'Limited uses']
  },
  {
    id: 'trap',
    name: 'Trap',
    category: 'scout',
    classRequirement: 'Trapper',
    description: 'Places an invisible trap that snares enemies.',
    manaCost: 30,
    cooldown: 8,
    range: 300,
    duration: 60,
    effects: ['Invisible until triggered', 'Immobilizes enemy', 'Limited uses']
  },

  // Gatherer Abilities
  {
    id: 'herb_radar',
    name: 'Herb Radar',
    category: 'gatherer',
    classRequirement: 'Gatherer',
    description: 'Reveals locations of nearby herbs and items.',
    manaCost: 20,
    cooldown: 15,
    range: 1200,
    effects: ['Shows herbs on minimap', 'Shows items on minimap']
  },
  {
    id: 'tele_gather',
    name: 'Tele Gather',
    category: 'gatherer',
    classRequirement: 'Radar Gatherer',
    description: 'Teleports items from fires directly to inventory.',
    manaCost: 25,
    cooldown: 10,
    range: 2000,
    effects: ['Teleports items from fires', 'Works across map']
  },
  {
    id: 'mix',
    name: 'Mix',
    category: 'gatherer',
    classRequirement: 'Herb Master',
    description: 'Creates potions from herbs without needing a mixing pot.',
    manaCost: 15,
    cooldown: 3,
    effects: ['Create potions anywhere', 'Uses herb combinations']
  },

  // Building Abilities
  {
    id: 'build_fire',
    name: 'Build Fire',
    category: 'building',
    description: 'Creates a fire for cooking and warmth.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Provides warmth', 'Cooking station', 'Light source']
  },
  {
    id: 'build_tent',
    name: 'Build Tent',
    category: 'building',
    description: 'Constructs a tent for sleeping and storage.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Safe sleeping', 'Item storage', 'Spawn point']
  },
  {
    id: 'build_armory',
    name: 'Build Armory',
    category: 'building',
    description: 'Constructs an armory for creating weapons and armor.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Craft weapons', 'Craft armor', 'Advanced crafting']
  },
  {
    id: 'build_tannery',
    name: 'Build Tannery',
    category: 'building',
    description: 'Constructs a tannery for processing hides and creating items.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Process hides', 'Create leather items', 'Craft coats']
  },

  // Item Abilities
  {
    id: 'mana_crystal',
    name: 'Mana Crystal',
    category: 'item',
    description: 'Restores mana when used.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Restores 100 mana', 'Consumable item']
  },
  {
    id: 'healing_potion',
    name: 'Healing Potion',
    category: 'item',
    description: 'Restores health when consumed.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Restores health', 'Various strengths available']
  },
  {
    id: 'mana_potion',
    name: 'Mana Potion',
    category: 'item',
    description: 'Restores mana when consumed.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Restores mana', 'Various strengths available']
  },
  {
    id: 'teleport_beacon',
    name: 'Teleport Beacon',
    category: 'item',
    description: 'Allows teleportation to set beacon location.',
    manaCost: 50,
    cooldown: 30,
    effects: ['Set teleport point', 'Teleport to beacon', 'Long range travel']
  }
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
  subclass: 'Subclass Abilities',
  superclass: 'Superclass Abilities',
  item: 'Item Abilities',
  building: 'Building Abilities'
};

export function getAbilitiesByCategory(category: AbilityCategory): AbilityData[] {
  return ABILITIES.filter(ability => ability.category === category);
}

export function getAbilitiesByClass(className: string): AbilityData[] {
  return ABILITIES.filter(ability => 
    ability.classRequirement?.toLowerCase() === className.toLowerCase()
  );
}

export function getAbilityById(id: string): AbilityData | undefined {
  return ABILITIES.find(ability => ability.id === id);
}

export function searchAbilities(query: string): AbilityData[] {
  const searchTerm = query.toLowerCase();
  return ABILITIES.filter(ability => 
    ability.name.toLowerCase().includes(searchTerm) ||
    ability.description.toLowerCase().includes(searchTerm) ||
    ability.effects?.some(effect => effect.toLowerCase().includes(searchTerm))
  );
}
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
  {
    id: 'battle_armor',
    name: 'Battle Armor',
    category: 'hunter',
    classRequirement: 'Warrior',
    description: 'Increases armor and magic resistance.',
    manaCost: 30,
    cooldown: 5,
    duration: 60,
    effects: ['+5 armor', '+25% magic resistance', 'Stacks with other buffs']
  },
  {
    id: 'detect_tracks',
    name: 'Detect Tracks',
    category: 'hunter',
    classRequirement: 'Tracker',
    description: 'Reveals footprint trails of enemies.',
    manaCost: 20,
    cooldown: 15,
    duration: 30,
    effects: ['Shows enemy movement trails', 'Tracks recent paths', 'Counter-thief ability']
  },
  {
    id: 'true_sight',
    name: 'True Sight',
    category: 'hunter',
    classRequirement: 'Tracker',
    description: 'Reveals invisible and cloaked units in area.',
    manaCost: 35,
    cooldown: 20,
    range: 800,
    duration: 15,
    effects: ['Reveals invisible units', 'Counters cloak', 'Area detection']
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
  {
    id: 'shapeshift_tiger',
    name: 'Shapeshift - Tiger',
    category: 'beastmaster',
    classRequirement: 'Shapeshifter',
    description: 'Transform into a tiger form with fierce attacks.',
    manaCost: 20,
    cooldown: 5,
    duration: 45,
    effects: ['High damage', 'Fast attack speed', 'Cannot use items']
  },
  {
    id: 'devour',
    name: 'Devour',
    category: 'beastmaster',
    classRequirement: 'Jungle Tyrant',
    description: 'Consumes an animal to gain its abilities permanently.',
    manaCost: 40,
    cooldown: 30,
    range: 200,
    effects: ['Gains animal abilities', 'Permanent effect', 'Stacks multiple animals']
  },
  {
    id: 'entangle',
    name: 'Entangle',
    category: 'beastmaster',
    classRequirement: 'Druid',
    description: 'Roots target enemy with vines.',
    manaCost: 25,
    cooldown: 10,
    range: 500,
    duration: 8,
    effects: ['Immobilizes target', 'Nature damage over time', 'Prevents escape abilities']
  },
  {
    id: 'rejuvenation',
    name: 'Rejuvenation',
    category: 'beastmaster',
    classRequirement: 'Druid',
    description: 'Heals target over time.',
    manaCost: 30,
    cooldown: 5,
    range: 400,
    duration: 20,
    effects: ['Healing over time', 'Works on pets', 'Stacks with other heals']
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
  {
    id: 'energy_drain',
    name: 'Energy Drain',
    category: 'mage',
    classRequirement: 'Hypnotist',
    description: 'Drains mana from target enemy.',
    manaCost: 20,
    cooldown: 5,
    range: 500,
    effects: ['Steals enemy mana', 'Restores your mana', 'Disables enemy abilities']
  },
  {
    id: 'sleep_spell',
    name: 'Sleep',
    category: 'mage',
    classRequirement: 'Dreamwalker',
    description: 'Puts target enemy to sleep.',
    manaCost: 35,
    cooldown: 12,
    range: 400,
    duration: 10,
    effects: ['Target cannot move/attack', 'Breaks on damage', 'Regenerates target health']
  },
  {
    id: 'nightmare',
    name: 'Nightmare',
    category: 'mage',
    classRequirement: 'Dreamwalker',
    description: 'Causes target to lose health over time.',
    manaCost: 40,
    cooldown: 15,
    range: 400,
    duration: 15,
    effects: ['Health drain over time', 'Mana drain over time', 'Vision reduction']
  },
  {
    id: 'ice_bolt',
    name: 'Ice Bolt',
    category: 'mage',
    classRequirement: 'Elementalist',
    description: 'Deals cold damage and slows target.',
    manaCost: 30,
    cooldown: 6,
    range: 500,
    damage: '100-140 cold damage',
    effects: ['Cold damage', 'Slows movement speed', 'Slows attack speed']
  },
  {
    id: 'metronome',
    name: 'Metronome',
    category: 'mage',
    classRequirement: 'Dementia Master',
    description: 'Casts a random spell effect.',
    manaCost: 50,
    cooldown: 20,
    effects: ['Random spell effect', 'Unpredictable results', 'Can be very powerful']
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
  {
    id: 'brilliance_aura',
    name: 'Brilliance Aura',
    category: 'priest',
    classRequirement: 'Priest',
    description: 'Increases mana regeneration of nearby allies.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Passive aura', 'Increased mana regen for allies', 'Stacks with other auras']
  },
  {
    id: 'inner_fire',
    name: 'Inner Fire',
    category: 'priest',
    classRequirement: 'Booster',
    description: 'Increases damage and armor of target ally.',
    manaCost: 35,
    cooldown: 5,
    range: 400,
    duration: 45,
    effects: ['+damage boost', '+armor boost', 'Long duration buff']
  },
  {
    id: 'mix_herbs',
    name: 'Mix Herbs',
    category: 'priest',
    classRequirement: 'Master Healer',
    description: 'Creates healing potions from herbs.',
    manaCost: 20,
    cooldown: 3,
    effects: ['Creates healing potions', 'Uses available herbs', 'No mixing pot required']
  },
  {
    id: 'restore_mana',
    name: 'Restore Mana',
    category: 'priest',
    classRequirement: 'Master Healer',
    description: 'Restores mana to target ally.',
    manaCost: 0,
    cooldown: 5,
    range: 400,
    effects: ['Restores ally mana', 'Uses your mana to restore theirs', 'Efficient transfer']
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
    id: 'panic',
    name: 'Panic',
    category: 'thief',
    classRequirement: 'Escape Artist',
    description: 'Greatly increases movement speed when health is low.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Passive ability', 'Activates at low health', 'Massive speed boost']
  },
  {
    id: 'teleport_other',
    name: 'Teleport Other',
    category: 'thief',
    classRequirement: 'TeleThief',
    description: 'Teleports target enemy to a random location.',
    manaCost: 40,
    cooldown: 15,
    range: 400,
    effects: ['Teleports enemy away', 'Random destination', 'Disrupts enemy plans']
  },
  {
    id: 'dimension_door',
    name: 'Dimension Door',
    category: 'thief',
    classRequirement: 'TeleThief',
    description: 'Creates a portal for quick travel between two points.',
    manaCost: 60,
    cooldown: 30,
    duration: 60,
    effects: ['Creates two-way portal', 'Team can use portal', 'Long distance travel']
  },
  {
    id: 'contortion',
    name: 'Contortion',
    category: 'thief',
    classRequirement: 'Contortionist',
    description: 'Escapes from any immobilizing effect.',
    manaCost: 25,
    cooldown: 12,
    effects: ['Removes roots/nets/stuns', 'Brief invulnerability', 'Emergency escape']
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
  {
    id: 'reveal',
    name: 'Reveal',
    category: 'scout',
    classRequirement: 'Observer',
    description: 'Reveals a large area permanently.',
    manaCost: 40,
    cooldown: 15,
    range: 1000,
    effects: ['Large area revealed', 'Permanent vision', 'Reveals invisible units']
  },
  {
    id: 'detect_magic',
    name: 'Detect Magic',
    category: 'scout',
    classRequirement: 'Spy',
    description: 'Shows magical auras and enchantments.',
    manaCost: 25,
    cooldown: 10,
    duration: 30,
    effects: ['Reveals magical effects', 'Shows buff/debuff auras', 'Detects magic items']
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
  {
    id: 'philosophers_stone',
    name: 'Philosopher\'s Stone',
    category: 'gatherer',
    classRequirement: 'Alchemist',
    description: 'Conjures potion effects using stored energy.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Uses stone energy instead of mana', 'Can create any potion effect', 'Rechargeable stone']
  },
  {
    id: 'item_radar',
    name: 'Item Radar',
    category: 'gatherer',
    classRequirement: 'Omnigatherer',
    description: 'Shows all items on the map.',
    manaCost: 30,
    cooldown: 20,
    duration: 45,
    effects: ['Reveals all items globally', 'Shows item types', 'Long range detection']
  },
  {
    id: 'warp_item',
    name: 'Warp Item',
    category: 'gatherer',
    classRequirement: 'Omnigatherer',
    description: 'Teleports any item to your location.',
    manaCost: 35,
    cooldown: 10,
    range: 2000,
    effects: ['Teleports any item', 'Works across map', 'No line of sight needed']
  },

  // Superclass Abilities
  {
    id: 'rampage',
    name: 'Rampage',
    category: 'superclass',
    classRequirement: 'Juggernaut',
    description: 'Increases attack and movement speed with each kill.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Passive ability', 'Stacks with kills', 'Massive speed/damage boost']
  },
  {
    id: 'spell_immunity',
    name: 'Spell Immunity',
    category: 'superclass',
    classRequirement: 'Juggernaut',
    description: 'Becomes immune to magic for a short time.',
    manaCost: 75,
    cooldown: 45,
    duration: 10,
    effects: ['Magic immunity', 'Spell resistance', 'Temporary effect']
  },
  {
    id: 'dark_ritual',
    name: 'Dark Ritual',
    category: 'superclass',
    classRequirement: 'Dementia Master',
    description: 'Sacrifices health to gain mana.',
    manaCost: 0,
    cooldown: 5,
    effects: ['Converts health to mana', 'Efficient mana gain', 'Risk vs reward']
  },
  {
    id: 'omnislash',
    name: 'Omnislash',
    category: 'superclass',
    classRequirement: 'Assassin',
    description: 'Teleports between enemies dealing massive damage.',
    manaCost: 100,
    cooldown: 60,
    range: 800,
    damage: 'Massive damage per hit',
    effects: ['Multiple teleport strikes', 'Hits multiple enemies', 'Ultimate ability']
  },
  {
    id: 'sage_wisdom',
    name: 'Sage Wisdom',
    category: 'superclass',
    classRequirement: 'Sage',
    description: 'Reduces cooldowns of all abilities.',
    manaCost: 0,
    cooldown: 0,
    effects: ['Passive ability', 'Reduces all cooldowns', 'Stacks with items']
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

  // Additional Class Abilities
  {
    id: 'ensnare',
    name: 'Ensnare',
    category: 'hunter',
    classRequirement: 'Hunter',
    description: 'Alternative to net with different properties.',
    manaCost: 18,
    cooldown: 10,
    range: 450,
    duration: 5,
    effects: ['Immobilizes air and ground units', 'Longer duration than net']
  },
  {
    id: 'mage_masher',
    name: 'Mage Masher',
    category: 'hunter',
    classRequirement: 'Warrior',
    description: 'Deals extra damage to mages and silences them.',
    manaCost: 30,
    cooldown: 15,
    range: 128,
    damage: 'Extra damage vs mages',
    effects: ['Bonus damage to mages', 'Silences target', 'Anti-mage ability']
  },
  {
    id: 'poison_spear',
    name: 'Poison Spear',
    category: 'hunter',
    classRequirement: 'Tracker',
    description: 'Throws a poisoned spear that deals damage over time.',
    manaCost: 25,
    cooldown: 8,
    range: 600,
    damage: 'Initial + poison damage',
    effects: ['Poison damage over time', 'Long range attack', 'Stackable poison']
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
  },
  {
    id: 'spirit_wind',
    name: 'Spirit Wind',
    category: 'item',
    description: 'Increases movement speed temporarily.',
    manaCost: 0,
    cooldown: 0,
    duration: 15,
    effects: ['Increased movement speed', 'Consumable item', 'Stacks with other speed boosts']
  },
  {
    id: 'stone_skin_potion',
    name: 'Stone Skin Potion',
    category: 'item',
    description: 'Increases armor and magic resistance.',
    manaCost: 0,
    cooldown: 0,
    duration: 45,
    effects: ['Increased armor', 'Magic resistance', 'Temporary defensive buff']
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

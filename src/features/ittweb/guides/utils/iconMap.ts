import { ITTIconCategory } from './iconUtils';

export type IconMap = {
  abilities: Record<string, string>;
  items: Record<string, string>;
  buildings: Record<string, string>;
  trolls: Record<string, string>;
};

// Central, explicit mapping (display name/id -> icon filename without path, with extension)
// Start empty; we will fill incrementally as you provide associations.
export const ICON_MAP: IconMap = {
  abilities: {
    'Blink': 'btnblink.png',
    'Chain Lightning': 'btnchainlightning.png',
    'Cure All': 'btnlesserclaritypotion.png',
    'Cyclone': 'btncyclone.png',
    'Drunk Potion': 'btnlesserinvulneralbility.png',
    'Eat': 'btncannibalize.png',
    'Entangle': 'btnentanglingroots.png',
    'Find Flints': 'btnstaffofsanctuary.png',
    'Find Mana Crystals': 'BTNManaCrystal.png',
    'Find Mushrooms': 'BTNMushroom.png',
    'Find Sticks': 'btnnaturetouchgrow.png',
    'Find Tinders': 'btnshimmerweed.png',
    'Fire Bolt': 'btnfirebolt.png',
    'Hawk Spellbook': 'BTNHawkSwoop.png',
    'Mist': 'btncloudoffog.png',
    'Mix Energy': 'btnmanadrain.png',
    'Mix Health': 'btnlifedrain.png',
    'Mix Herbs': 'btndizzy.png',
    'Net': 'btnensnare.png',
    'Panic': 'btnberserkfortrolls.png',
    'Pump Up': 'btnbloodlust.png',
    'Radar Gatherer Spellbook': 'btnspy.png',
    'Sleep Outside': 'btnsleep.png',
  },
  items: {
    'Acid Bomb': 'btnacidbomb.png',
    'Acorn': 'btnacorn.png',
    'Battle Armor': 'btnrobeofthemagi.png',
    'Battle Axe': 'btnorcmeleeupthree.png',
    'Bear Presence Coat': 'BTNCoatOfBearPresence.png',
    'Blowgun': 'btnalleriaflute.png',
    'Bone Boots': 'btnboots.png',
    'Bone Coat': 'BTNBoneCoat.png',
    'Bone Gloves': 'btngauntletsofogrepower.png',
    'Clay Ball': 'btnthunderlizardegg.png',
    'Cloak Of Flames': 'BTNCloakOfInferno.png',
    'Cloak Of Frost': 'BTNCloakOfFrost.png',
    'Cloak Of Healing': 'BTNCloakOfHealing.png',
    'Cloak Of Mana': 'BTNCloakOfMana.png',
    'Cooked Meat': 'btnmonsterlure.png',
    'Cyclone Scroll': 'btnbansheemaster.png',
    'Elk Skin Boots': 'btnbootsofspeed.png',
    'Emp': 'btnwispsplode.png',
    'Entangle Scroll': 'btnscrollofregenerationgreen.png',
    'Fever Potion': 'btngreaterinvulneralbility.png',
    'Fire Bomb': 'btnliquidfire.png',
    'Fire Kit': 'btnfire.png',
    'Flint': 'btnstaffofsanctuary.png',
    'Gem of Knowledge': 'btngem.png',
    'Healing Potion': 'btnlesserrejuvpotion.png',
    'Health Potion': 'btngreaterrejuvpotion.png',
    'Iron Armor': 'btnadvancedmoonarmor.png',
    'Iron Axe': 'btnorcmeleeuptwo.png',
    'Iron Ingot': 'BTNIronIngot.png',
    'Iron Spear': 'btnstrengthofthemoon.png',
    'Mage Masher': 'btnspiritwalkermastertraining.png',
    'Magefist': 'btncontrolmagic.png',
    'Magic': 'btnmoonstone.png',
    'Mana Crystal': 'BTNManaCrystal.png',
    'Mana Potion': 'btnpotionbluesmall.png',
    'Mushroom': 'BTNMushroom.png',
    'Panther Fang': 'BTNPantherFang.png',
    'Poison Thistles': 'BTNPoisonQuill.png',
    'River Root': 'btnwandofneutralization.png',
    'River Stem': 'btndotadepttraining.png',
    'Scroll Stone Armor': 'btnscrolluber.png',
    'Spirit of Water': 'btnorboffrost.png',
    'Spirit of Wind': 'btnorboflightning.png',
    'Steel Axe': 'btnspiritwalkeradepttraining.png',
    'Steel Gloves': 'btnadvancedunholystrength.png',
    'Steel Ingot': 'BTNSteelIngot.png',
    'Steel Shield': 'btnthoriumarmor.png',
    'Steel Spear': 'btnthoriumranged.png',
    'Stick': 'btnnaturetouchgrow.png',
    'Tent Kit': 'BTNTent.png',
    'Tinder': 'btnshimmerweed.png',
    'Transport Ship Kit': 'btnnightelftransport.png',
    'Troll Protector': 'BTNTrollProtector.png',
    'Wolfs Stamina Boots': 'BTNBootsOfWolfStamina.png',
  },
  buildings: {
    'Armory': 'btnforge.png',
    'Omni Tower': 'btntower.png',
    'Tannery': 'btnpigfarm.png',
    'Witch Doctors Hut': 'btnvoodoolounge.png',
  },
  trolls: {
    'Gatherer': 'btnorcwarlock.png',
    'Mage': 'btnwitchdoctor.png',
    'Priest': 'btnshadowhunter.png',
  },
};

export function resolveExplicitIcon(category: ITTIconCategory, key: string): string | undefined {
  // First, check the requested category
  const table = ICON_MAP[category];
  const filename = table[key];
  
  if (!filename) {
    // If not found in requested category, search all categories
    const allCategories: ITTIconCategory[] = ['abilities', 'items', 'buildings', 'trolls'];
    for (const cat of allCategories) {
      const catTable = ICON_MAP[cat];
      const foundFilename = catTable[key];
      if (foundFilename) {
        // Found the mapping, now determine which directory the file is in
        return findIconPath(foundFilename);
      }
    }
    return undefined;
  }
  
  // Found in requested category, determine which directory the file is actually in
  return findIconPath(filename);
}

/**
 * Finds the actual directory path for an icon filename.
 * Since icons can be shared across categories, we check which category
 * has this filename mapped and prefer items directory for shared icons.
 */
function findIconPath(filename: string): string {
  const allCategories: ITTIconCategory[] = ['items', 'abilities', 'buildings', 'trolls'];
  
  // Check each category to see if this filename is mapped there
  // Priority: items first (most shared icons are there), then others
  for (const cat of allCategories) {
    const catTable = ICON_MAP[cat];
    if (Object.values(catTable).includes(filename)) {
      return `/icons/itt/${cat}/${filename}`;
    }
  }
  
  // Fallback: if somehow not found, try items directory (most common)
  return `/icons/itt/items/${filename}`;
}



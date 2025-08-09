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
    'Sleep': 'btnelunesblessing.png',
    'Blink': 'btnblink.png',
    'Cyclone': 'btncyclone.png',
    'Net': 'btnensnare.png',
    'Entangle': 'btnentanglingroots.png',
    'Eat': 'btncannibalize.png',
    'Panic': 'btnberserkfortrolls.png',
    'Mix Herbs': 'btndizzy.png',
    'Chain Lightning': 'btnchainlightning.png',
    'Mist': 'btncloudoffog.png',
  },
  items: {
    'Acid Bomb': 'btnacidbomb.png',
    'Acorn': 'btnacorn.png',
    'Iron Armor': 'btnadvancedmoonarmor.png',
    'Steel Gloves': 'btnadvancedunholystrength.png',
    'Blowgun': 'btnalleriaflute.png',
    'Cyclone Scroll': 'btnbansheemaster.png',
    'Bone Boots': 'btnboots.png',
    'Elk Skin Boots': 'btnbootsofspeed.png',
    'Fire Cloak': 'btncloakofflames.png',
    'Magefist': 'btncontrolmagic.png',
    'River Stem': 'btndotadepttraining.png',
    'Gem of Knowledge': 'btngem.png',
    'Fever Potion': 'btngreaterinvulneralbility.png',
    'Health Potion': 'btngreaterrejuvpotion.png',
    'Mage Masher': 'btnspiritwalkermastertraining.png',
    'Entangle Scroll': 'btnscrollofregenerationgreen.png',
    'Battle Armor': 'btnrobeofthemagi.png',
    'Stick': 'btnnaturetouchgrow.png',
    'Cooked Meat': 'btnmonsterlure.png',
    'Spirit of Water': 'btnorboffrost.png',
    'Spirit of Wind': 'btnorboflightning.png',
  },
  buildings: {
    'Armory': 'btnforge.png',
    'Omni Tower': 'btnorctower.png',
  },
  trolls: {
    // 'Hunter': 'BTNTrollPredator.png',
    'Priest': 'btnshadowhunter.png',
    'Mage': 'btnwitchdoctor.png',
    'Gatherer': 'btnorcwarlock.png',
  },
};

export function resolveExplicitIcon(category: ITTIconCategory, key: string): string | undefined {
  const table = ICON_MAP[category];
  const exact = table[key];
  if (exact) return `/icons/itt/${category}/${exact}`;
  return undefined;
}



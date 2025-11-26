import type { AbilityData } from './types';

export const THIEF_ABILITIES: AbilityData[] = [
  {
    id: 'telethief-abilities',
    name: 'Telethief Abilities',
    category: 'thief',
    description: '',
    tooltip: 'Contains dimentional magic of Telethief',
    iconPath: 'BTNSpellBookBLS.png',
  },
  {
    id: 'tele-thief',
    name: 'Tele-Thief',
    category: 'thief',
    description: '',
    tooltip: 'The thief uses a powerful magic designating the targeted fire as its tele-thiefing outlet. While tele-thiefing, any item picked up near enemy buildings warps to the tele-thiefing outlet. Lasts |cff7DBEF1100|r seconds, has |cff7DBEF1140|r seconds cooldown.',
    iconPath: 'BTNSpellSteal.png',
  },
  {
    id: 'tele-thief-person-buff',
    name: 'Tele-Thief person buff',
    category: 'thief',
    description: '',
  },
  {
    id: 'a-thief-s-pocket',
    name: 'A Thief\'s pocket',
    category: 'thief',
    description: '',
    tooltip: 'Thief has a secret pocket granting him an extra slot. \nThief\'s pocket can only hold items that are stolen or come from thief\'s bush.',
    iconPath: 'BTNThiefPouch.png',
  },
  {
    id: 'steal',
    name: 'Steal',
    category: 'thief',
    description: '',
    tooltip: 'Steal an item from a target. Different targets are allowed depending on the lvl of the Rogue:|cFFFFCC00\n\nLvl 2|r - Can be used on thief\'s bush to find a hidden item.|cFFFFCC00\n\nLvl 3|r - Can be used on enemy trolls to steal a stone/hide/mana crystal/flint.|cFFFFCC00\n\nLvl 4|r - Can be used on a trading ship to steal a random item. You can only steal a single item from a ship.\n|cff6495ED60 |rseconds cooldown',
    iconPath: 'BTNPickUpItem.png',
  }
];

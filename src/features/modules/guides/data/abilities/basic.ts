import type { AbilityData } from './types';

export const BASIC_ABILITIES: AbilityData[] = [
  {
    id: 'sleep-outside',
    name: 'Sleep Outside',
    category: 'basic',
    description: '',
    tooltip: 'The Troll can sleep outside to restore |cff00EAFF80|r mana but lose |cffFF020220|r health point and |cffFE890D15|r heat. This can kill you if any of your stats reach 0. Has |cff6495ED<AMd5,Cool1>|r seconds cooldown.',
  },
  {
    id: 'sleep-inside-tent',
    name: 'Sleep Inside Tent',
    category: 'basic',
    description: '',
    tooltip: 'The Troll can sleep inside the tent to restore |cff00EAFF80|r mana. Has |cff6495ED<AMdc,Cool1>|r seconds cooldown.',
  },
  {
    id: 'sleep-inside-hut',
    name: 'Sleep Inside Hut',
    category: 'basic',
    description: '',
    tooltip: 'The Troll can sleep inside the hut to restore |cff00EAFF200|r mana. Has |cff6495ED<AMdd,Cool1>|r seconds cooldown.',
  },
  {
    id: 'hibernate',
    name: 'Hibernate',
    category: 'basic',
    description: '',
    tooltip: 'The Dire Bear can hibernate, restoring |cff7DBEF180.0|r mana and |cff1FBF002.0|rx|cffFE890DStrength|r life based on missing life.Healing reaches maximum effect at |cff94959625%|r\nDuring hibernation Dire Bear has |cffFE890D35.0|r% damage reduction and lowers healing reduction by |cff1FBF0050|r per second.\nConsuming any food will reduce Hibernate cooldown by |cff7DBEF11|r second.\nHibernation can only be interrupted if bear\'s life drops below what it was at the beginning of Hibernation. Has |cff6495ED<AM4z,Cool1>|r seconds cooldown.',
    iconPath: 'BTNAbility_Hibernation.png',
  },
  {
    id: 'cook-meat',
    name: 'Cook Meat',
    category: 'basic',
    description: '',
    tooltip: 'Cooks all the corpses around the fire into Cooked Meat',
    iconPath: 'BTNMonsterLure.png',
  },
  {
    id: 'cook-and-collect-meat',
    name: 'Cook and collect Meat',
    category: 'basic',
    description: '',
    tooltip: 'Cooks all the corpses around the fire and collects all meat within |cff7DBEF1800|r range and stores it in the building\'s inventory.|cFFFFCC00\nMeat cannot be collected if there is an enemy in range.|r',
    iconPath: 'BTNMonsterLure.png',
  },
  {
    id: 'pass-meat',
    name: 'Pass Meat',
    category: 'basic',
    description: '',
    tooltip: 'Use this ability to pass meat to an ally.\n|cff7DBEF110|r seconds charge recovery.',
    iconPath: 'BTNPassMeat6.png',
  }
];

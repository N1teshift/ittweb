import type { AbilityData } from './types';

export const BEASTMASTER_ABILITIES: AbilityData[] = [
  {
    id: 'friend-of-the-hive',
    name: 'Friend of the Hive',
    category: 'beastmaster',
    description: '',
    tooltip: 'Dire Bear visits bee hives so often, he is considered part of the hive.\nGain a permanent bee protecting you per unique hidden stash scavenged.\nBees inflict |cffFF02021|r magic damage per second.|cFFFFCC00\n\nLevel 1: |rMaximum bees: |cFFFFCC003|r|cFFFFCC00\nLevel 4: |rMaximum bees: |cFFFFCC005|r',
    iconPath: 'BTNFriendOfTheHive.png',
  },
  {
    id: 'scavenged-mushroom',
    name: 'Scavenged Mushroom',
    category: 'beastmaster',
    description: '',
    tooltip: 'dummy spell',
  },
  {
    id: 'night-stalker',
    name: 'Night Stalker.',
    category: 'beastmaster',
    description: '',
    tooltip: 'Dire Wolf is as effective at stalking prey at night as during the day.\nYour night vision is equal to your day vision.',
    iconPath: 'PASUNITWolf.png',
  },
  {
    id: 'bears-tenacity',
    name: 'Bears Tenacity',
    category: 'beastmaster',
    description: '',
    tooltip: 'Causes your troll to go into a panic, making him move |cffFE890D30%|r faster, but take |cffFF020210%|r extra damage.|n Lasts |cff7DBEF12|r seconds, has |cff7DBEF115|r seconds cooldown.|cFFFFFFC9Tip: Use this as often as possible to maximize efficiency.|r',
  }
];

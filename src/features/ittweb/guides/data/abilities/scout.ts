import type { AbilityData } from './types';

export const SCOUT_ABILITIES: AbilityData[] = [
  {
    id: 'trap-toolkit',
    name: 'Trap Toolkit',
    category: 'scout',
    description: '',
    tooltip: 'The Trapper Toolkit, contains a few trap spell.',
    iconPath: 'BTNPackBeast.png',
  },
  {
    id: 'advanced-scout-radar',
    name: 'Advanced Scout Radar',
    category: 'scout',
    description: '',
    tooltip: 'An improved better radar to locate unit around him with high precision.',
    iconPath: 'BTNSpy.png',
  },
  {
    id: 'spiked-trap',
    name: 'Spiked Trap',
    category: 'scout',
    description: '',
    tooltip: 'An itchy trap, troll who walks on it will get slowed by |cffFE890D80%|r for |cffFE890D5|r seconds. Spiked Trap last |cff7DBEF1240|r seconds, has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'BTNMeatapult.png',
  },
  {
    id: 'quick-make-ensnare-trap',
    name: 'Quick make Ensnare Trap',
    category: 'scout',
    description: '',
    tooltip: 'Put those materials in the correct order to get an Ensnare Trap. Deals few ranged damage, can net trolls & animals, good for killing hawk :\n\n1x |cff1FBF00Tinder|r + 1x |cffFFD700Bone|r + 1x |cff1FBF00Stick|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'BTNCOP.png',
  }
];

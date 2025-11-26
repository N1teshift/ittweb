import type { AbilityData } from './types';

export const MAGE_ABILITIES: AbilityData[] = [
  {
    id: 'firebolt',
    name: 'Firebolt',
    category: 'mage',
    description: '',
  },
  {
    id: 'metronome-impale',
    name: 'Metronome Impale',
    category: 'mage',
    description: '',
    duration: 0.5,
  },
  {
    id: 'negative-blast',
    name: 'Negative Blast',
    category: 'mage',
    description: '',
    tooltip: 'Blasts a target with negative energy dealing |cffFF020240|r damage and slowing for a short duration. Has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnwandofshadowsight.png',
  },
  {
    id: 'cyclone',
    name: 'Cyclone',
    category: 'mage',
    description: '',
    tooltip: 'Greater Hawk circles around an ally creating a cyclone, protecting him for the duration.\nTarget becomes invulnerable for |cff7DBEF13|r seconds and causes |cffFF020240|r damage to enemies upon landing.\nHas |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btntornado.png',
  }
];

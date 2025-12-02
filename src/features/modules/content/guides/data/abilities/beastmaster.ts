import type { AbilityData } from './types';

export const BEASTMASTER_ABILITIES: AbilityData[] = [
  {
    id: 'friend-of-the-hive',
    name: 'Friend of the Hive',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Dire Bear visits bee hives so often, he is considered part of the hive.\nGain a permanent bee protecting you per unique hidden stash scavenged.\nBees inflict |cffFF02021|r magic damage per second.|cFFFFCC00\n\nLevel 1: |rMaximum bees: |cFFFFCC003|r|cFFFFCC00\nLevel 4: |rMaximum bees: |cFFFFCC005|r',
    iconPath: 'btnfriendofthehive.png',
    range: 99999,
    duration: 9999,
    areaOfEffect: 400,
    targetsAllowed: 'air,enemies,ground',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 9999,
                  "range": 99999,
                  "areaOfEffect": 400
            },
            "2": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 9999,
                  "range": 99999,
                  "areaOfEffect": 400
            },
            "3": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 9999,
                  "range": 99999,
                  "areaOfEffect": 400
            },
            "4": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 9999,
                  "range": 99999,
                  "areaOfEffect": 400
            },
            "5": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 9999,
                  "range": 99999,
                  "areaOfEffect": 400
            }
      },
  },
  {
    id: 'release-pet',
    name: 'Release Pet',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Releases your pet back into the wild allowing you to tame another. The released pet will run away never to be seen again.',
    iconPath: 'btnreleasepet.png',
    cooldown: 5,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 5
            }
      },
  },
  {
    id: 'omnivore',
    name: 'Omnivore',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Dire Bear is an omnivore and is capable of eating almost anything, even the mushrooms other would find poisonous.',
    iconPath: 'btnomnivore.png',
  },
  {
    id: 'voracious-bear',
    name: 'Voracious Bear',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Dire Bear is a huge animal with even bigger appetite that cannot be satisfied with regular amount of food.\nHealing from food has only |cffFF020270|r% effect on you.',
    iconPath: 'btnhungrybear.png',
  },
  {
    id: 'hibernate',
    name: 'Hibernate',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'The Dire Bear can hibernate, restoring |cff7DBEF180.0|r mana and |cff1FBF002.0|rx|cffFE890DStrength|r life based on missing life.Healing reaches maximum effect at |cff94959625%|r\nDuring hibernation Dire Bear has |cffFE890D35.0|r% damage reduction and lowers healing reduction by |cff1FBF0050|r per second.\nConsuming any food will reduce Hibernate cooldown by |cff7DBEF11|r second.\nHibernation can only be interrupted if bear\'s life drops below what it was at the beginning of Hibernation. Has |cff6495ED<AM4z,Cool1>|r seconds cooldown.',
    iconPath: 'btnability_hibernation.png',
    cooldown: 25,
    range: 300,
    duration: 1,
    hotkey: 'F',
    targetsAllowed: 'friend,ground,hero,self',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 1,
                  "range": 99999
            }
      },
  },
  {
    id: 'grow-pet',
    name: 'Grow Pet',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Your pet matures to the next stage of its development.',
    iconPath: 'btnadvancelife.png',
    manaCost: 3,
    range: 99999,
    hotkey: 'V',
    levels: {
            "1": {
                  "manaCost": 3,
                  "cooldown": 0,
                  "range": 99999
            }
      },
  },
  {
    id: 'pet-sleep',
    name: 'Pet Sleep',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Your pet goes to sleep, recovering |cff1FBF0060|r health point. Lasts |cff7DBEF110|r seconds, has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnelunesblessing.png',
    cooldown: 20,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 20
            }
      },
  },
  {
    id: 'tame-pet',
    name: 'Tame Pet',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Tames a baby animal. The following animals killed by the |cffDEB887Beastmaster|r will leave a baby behind: |cffFFFC00Elk|r, |cffFFFC00Wolf|r, |cffFFFC00Bear|r.|cffFF0202\n\nYou can tame only 1 animal at once.|r',
    iconPath: 'btntamepet.png',
    cooldown: 10,
    range: 600,
    hotkey: 'Q',
    targetsAllowed: 'neutral,nonhero,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 10,
                  "range": 600
            }
      },
  },
  {
    id: 'transform-wolf',
    name: 'Transform (Wolf)',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Transform into a wolf, gaining the |cffffcc00Wolf\'s Hunger|r ability for stealing life from your opponents.',
    iconPath: 'btndirewolf.png',
    hotkey: 'Q',
  },
  {
    id: 'transform-bear',
    name: 'Transform (Bear)',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Transform into a bear, gaining the |cffffcc00Bear\'s Bulwark|r ability for increasing the durability of your team.',
    iconPath: 'btngrizzlybear.png',
    hotkey: 'W',
  },
  {
    id: 'transform-panther',
    name: 'Transform (Panther)',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Transform into a panther, gaining the |cffffcc00Prowl|r ability to stalk your prey.',
    iconPath: 'btnpanther.png',
    hotkey: 'E',
  },
  {
    id: 'transform-tiger',
    name: 'Transform (Tiger)',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Transform into a tiger, gaining the |cffffcc00Vicious Strikes|r ability to mutilate your enemies.',
    iconPath: 'btntiger.png',
    hotkey: 'R',
  },
  {
    id: 'wolf-life-steal',
    name: 'Wolf Life Steal',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    iconPath: 'btndirewolf.png',
  },
  {
    id: 'the-shapeshifter-is-strong-in-battle-and-versatile-he-can-transform-himself-into-a-wolf-a-b-edd38a49',
    name: 'The Shapeshifter is strong in battle and versatile, he can transform himself into a wolf,a bear,a panther or a tiger. Each form got a unique ability allowing the shapeshifter to either,get lifesteal,buff his allies armor and health regeneration,escape or cripple the enemy. Can only choose 1 subClass!',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'The Shapeshifter is strong in battle and versatile, he can transform himself into a wolf,a bear,a panther or a tiger. Each form got a unique ability allowing the shapeshifter to either,get lifesteal,buff his allies armor and health regeneration,escape or cripple the enemy. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btnbearform.png',
    hotkey: 'Q',
  },
  {
    id: 'permanently-transform-into-a-dire-wolf',
    name: 'Permanently transform into a Dire Wolf.',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Permanently transform into a Dire Wolf.\nDire Wolf can only consume raw meat and has various abilities related to generating and consuming raw meat.|cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btndirewolf.png',
    hotkey: 'E',
  },
  {
    id: 'permanently-transform-into-a-dire-bear',
    name: 'Permanently transform into a Dire Bear.',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Permanently transform into a Dire Bear.\nDire Bear is strong and durable fighter.|cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btngrizzlybear.png',
    hotkey: 'R',
  }
];


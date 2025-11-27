import type { AbilityData } from './types';

export const BEASTMASTER_ABILITIES: AbilityData[] = [
  {
    id: 'friend-of-the-hive',
    name: 'Friend of the Hive',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Dire Bear visits bee hives so often, he is considered part of the hive.\nGain a permanent bee protecting you per unique hidden stash scavenged.\nBees inflict |cffFF02021|r magic damage per second.|cFFFFCC00\n\nLevel 1: |rMaximum bees: |cFFFFCC003|r|cFFFFCC00\nLevel 4: |rMaximum bees: |cFFFFCC005|r',
    iconPath: 'BTNFriendOfTheHive.png',
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
    iconPath: 'BTNReleasePet.png',
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
    iconPath: 'BTNOmnivore.png',
  },
  {
    id: 'voracious-bear',
    name: 'Voracious Bear',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Dire Bear is a huge animal with even bigger appetite that cannot be satisfied with regular amount of food.\nHealing from food has only |cffFF020270|r% effect on you.',
    iconPath: 'BTNHungryBear.png',
  },
  {
    id: 'hibernate',
    name: 'Hibernate',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'The Dire Bear can hibernate, restoring |cff7DBEF180.0|r mana and |cff1FBF002.0|rx|cffFE890DStrength|r life based on missing life.Healing reaches maximum effect at |cff94959625%|r\nDuring hibernation Dire Bear has |cffFE890D35.0|r% damage reduction and lowers healing reduction by |cff1FBF0050|r per second.\nConsuming any food will reduce Hibernate cooldown by |cff7DBEF11|r second.\nHibernation can only be interrupted if bear\'s life drops below what it was at the beginning of Hibernation. Has |cff6495ED<AM4z,Cool1>|r seconds cooldown.',
    iconPath: 'BTNAbility_Hibernation.png',
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
    id: 'shapeshifter-forms',
    name: 'Shapeshifter Forms',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Shapeshift into an animal form. Unlock following transformation :\n|cffFFD700Level 1 - Wolf\nLevel 2 - Bear\nLevel 3 - Panther\nLevel 4 - Tiger|r',
    iconPath: 'btnbearform.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            },
            "2": {
                  "cooldown": 0
            },
            "3": {
                  "cooldown": 0
            },
            "4": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'dire-bear-abilities',
    name: 'Dire Bear Abilities',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Dire Bear Abilities.',
    iconPath: 'btnbearform.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            },
            "2": {
                  "cooldown": 0
            },
            "3": {
                  "cooldown": 0
            },
            "4": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'druidic-spells',
    name: 'Druidic Spells',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Spells that connect the Druid and his team with the ebb and flow of life.',
    iconPath: 'btncancel.png',
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0
            },
            "2": {
                  "cooldown": 0
            },
            "3": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'pet-spells',
    name: 'Pet Spells',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Use these to control your pet.',
    iconPath: 'BTNBeastCall.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
    availableToClasses: ['beastmaster', 'druid', 'jungle-tyrant'],
    spellbook: 'normal',
  },
  {
    id: 'devour',
    name: 'Devour',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Completely devour an elk, restoring 3 raw meat.\nDire wolf swallows up and digests every part of the animal, therefore, no hides , bones nor corpses are dropped upon the animal death.\nDevouring a hostile animal will unlock a corresponding passive, you can freely switch between them but only one can be active at a time.\nHas |cff7DBEF160.0|r seconds cooldown.',
    iconPath: 'BTNLycanWolfBite.png',
    cooldown: 60,
    range: 128,
    hotkey: 'R',
    targetsAllowed: 'enemies,nonhero,organic,nonancient',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 25,
                  "range": 128
            }
      },
  },
  {
    id: 'wolf-voracity',
    name: 'Wolf Voracity',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
  },
  {
    id: 'the-druid-takes-great-care-of-the-spirit-of-those-around-him-granting-allies-0-33-health-regeneration',
    name: 'The Druid takes great care of the spirit of those around him, granting allies 0.33 health regeneration.',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'The Druid takes great care of the spirit of those around him, granting allies |cffD67A7A0.33|r health regeneration.\n\nAdditionally pets affected by |cffC2E8EBSpiritual Guidance|r are able to transcend into their spirit form, gaining |cffD67A7A2|r points for every stats (armor & attack damage).',
    iconPath: 'PASBTNSpiritualGuidance.png',
    areaOfEffect: 800,
    levels: {
            "1": {
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'the-druid-and-his-pet-unleash-a-mighty-roar-inspiring-allies-and-striking-fear-into-the-hearts-of-enemies-has-45-seconds-cooldown',
    name: 'The Druid and his pet unleash a mighty roar, inspiring allies and striking fear into the hearts of enemies. Has 45 seconds cooldown.',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'The Druid and his pet unleash a mighty roar, inspiring allies and striking fear into the hearts of enemies. Has |cff7DBEF145|r seconds cooldown.|cffFF6347\n\nDruid\n|rIncreases nearby allies\' damage by |cffFF020230%|r.|cffFF6347\n\nElk\n|rIncreases nearby allies movement speed by |cffFE890D50|r.|cffFF6347\n\nWolf\n|rDecreases nearby enemies\' movement speed by |cffFE890D10%|r and attack speed by |cffFFFC0020%|r.|cffFF6347\n\nBear\n|rDecreases nearby enemies\' damage by |cffFF020230%|r.',
    iconPath: 'BTNVerdantSong.png',
    manaCost: 20,
    cooldown: 45,
    duration: 7,
    hotkey: 'W',
    targetsAllowed: 'air,ground,friend,self,vulnerable,invulnerable,nonsapper',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 45,
                  "duration": 7
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
    iconPath: 'BTNAdvanceLife.png',
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
    iconPath: 'BTNTamePet.png',
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
    iconPath: 'BTNPanther.png',
    hotkey: 'E',
  },
  {
    id: 'transform-tiger',
    name: 'Transform (Tiger)',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'Transform into a tiger, gaining the |cffffcc00Vicious Strikes|r ability to mutilate your enemies.',
    iconPath: 'BTNTiger.png',
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
    id: 'the-shapeshifter-is-strong-in-battle-and-versatile-he-can-transform-himself-into-a-wolf-a-bear-a-panther-or-a-tiger-each-form-got-a-unique-ability-allowing-the-shapeshifter-to-either-get-lifesteal-buff-his-allies-armor-and-health-regeneration-escape-or-cripple-the-enemy-can-only-choose-1-subclass',
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
    id: 'the-druid-is-focused-on-using-nature-and-his-pet-s-to-support-his-team-and-turn-the-battle-in-his-favor-can-only-choose-1-subclass',
    name: 'The Druid is focused on using nature and his pet\'s to support his team and turn the battle in his favor.Can only choose 1 subClass!',
    category: 'beastmaster',
    classRequirement: 'beastmaster',
    description: '',
    tooltip: 'The Druid is focused on using nature and his pet\'s to support his team and turn the battle in his favor.|cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'BTNDruidoftheClawForestTrollIconV1.png',
    hotkey: 'W',
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

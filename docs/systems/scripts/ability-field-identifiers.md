# Ability Field Identifiers Mapping

## Overview

This document maps the field identifiers used in Warcraft 3 ability tooltip references (like `<AMd5,Cool1>`, `<AM2w,DataA1>`) to their actual meanings. This information was extracted from the Wurst source code in `external/island-troll-tribes/`.

## Format

Field references follow the pattern: `<AbilityID,FieldIdentifier>` where:
- `AbilityID`: 4-character raw ability code (e.g., `AMd5`, `AM2w`, `AIs6`)
- `FieldIdentifier`: Field name indicating what data to retrieve (e.g., `Cool1`, `DataA1`, `HeroDur1`)

## Field Identifier Meanings

Based on analysis of `ToolTipsUtils.wurst` and item definition files:

### Common Field Identifiers

#### `Cool1` - Cooldown (Level 1)
- **Meaning**: Cooldown time in seconds for the ability at level 1
- **Example**: `<AMd5,Cool1>` → cooldown value for ability `AMd5`
- **Source**: `ToolTipsUtils.wurst` line 100: `"<{0},Cool1>"` used in `formatCooldown()`
- **Usage**: "Has X seconds cooldown"

#### `Dur1` - Duration (Level 1)
- **Meaning**: Duration in seconds for the ability at level 1
- **Example**: `<A0ED,Dur1>` → duration value for ability `A0ED`
- **Source**: `ToolTipsUtils.wurst` line 103: `"<{0},Dur1>"` used in `formatDuration()`
- **Usage**: "Last X seconds"

#### `HeroDur1` - Hero Duration (Level 1)
- **Meaning**: Hero-specific duration in seconds at level 1
- **Example**: `<ABILITY_HYDRA_CLAWS_POISON,HeroDur1>` → hero duration value
- **Source**: Used in item definitions for abilities with different hero/normal durations
- **Usage**: Hero duration values (usually longer than normal duration)

### Data Field Identifiers (Ability-Type Dependent)

The `DataA1`, `DataB1`, `DataC1` fields are **context-dependent** - they represent different things depending on the ability type. These are generic data fields that Warcraft 3 uses for different ability properties.

#### `DataA1` - Primary Data Field (Level 1)

**Usage depends on ability type:**

- **Attack Speed Bonuses**: Movement speed bonus value
  - Example: `ABILITY_SPEED_BONUS_60` → movement speed bonus
  - Source: `BootsDefinition.wurst` line 34

- **Stat Bonuses (Armor, Agility, Attack)**: The bonus value
  - Example: `ABILITY_ARMOR_BONUS_2` → armor bonus value
  - Example: `ABILITY_AGI_BONUS_4` → agility bonus value
  - Example: `AbilityIds.attackBonusPlus2` → attack damage bonus
  - Source: `GlovesDefinition.wurst` line 69: "DataA1 being the bonus attack speed, damage or armor for each respective abilities"

- **Attack Speed Percent**: Attack speed increase percentage
  - Example: `ABILITY_ATTACK_SPEED_10` → attack speed % (used with `getAbilityDataFieldPercent()`)
  - Source: `GlovesDefinition.wurst` line 71

- **Damage/Effect Values**: Primary effect value
  - Example: `ABILITY_CLOAK_FLAMES` → damage per second
  - Source: `CloaksDefinition.wurst`

#### `DataB1` - Secondary Data Field (Level 1)

**Common uses:**

- **Intelligence Bonuses**: Intelligence stat bonus value
  - Example: `ABILITY_INT_BONUS_2` → intelligence bonus
  - Source: `BootsDefinition.wurst` line 35: "DataB1 being the intelligence bonus field for the all stat bonus ability"

- **Poison/Effect Percentages**: Secondary effect percentage
  - Example: `ABILITY_HYDRA_CLAWS_POISON` → poison percentage (used with `getAbilityDataFieldPercent()`)
  - Source: `GlovesDefinition.wurst` line 145

- **Secondary Stat Bonuses**: Various secondary stat values
  - Used for intelligence bonuses in multi-stat items

#### `DataC1` - Tertiary Data Field (Level 1)

**Common uses:**

- **Strength Bonuses**: Strength stat bonus value
  - Example: `ABILITY_STR_BONUS_8` → strength bonus
  - Source: `CoatDefinition.wurst`, `BootsDefinition.wurst`

- **Tertiary Effect Values**: Third effect value in abilities with multiple effects
  - Example: `ABILITY_HYDRA_CLAWS_POISON` → tertiary poison effect (used with `getAbilityDataFieldPercent()`)
  - Source: `GlovesDefinition.wurst` line 146

## Examples from Source Code

### ToolTipsUtils.wurst

```wurst
// Cooldown reference
public function formatCooldown(int abilId) returns string
    return " Has " + ("<{0},Cool1>".format(abilId.toRawCode())).color(ENERGY_COLOR) + " seconds cooldown."

// Duration reference
public function formatDuration(int abilId) returns string
    return " Last " + ("<{0},Dur1>".format(abilId.toRawCode())).color(ENERGY_COLOR) + " seconds."

// Generic data field reference
public function getAbilityDataField(int abilId, string dataField) returns string
    return "<{0},{1}>".format(abilId.toRawCode(), dataField)
```

### BootsDefinition.wurst

```wurst
// DataA1 = movement speed bonus
getAbilityDataField(ABILITY_SPEED_BONUS_60, "DataA1")

// DataB1 = intelligence bonus
getAbilityDataField(ABILITY_INT_BONUS_2, "DataB1")

// DataC1 = strength bonus
getAbilityDataField(ABILITY_STR_BONUS_8, "DataC1")
```

### GlovesDefinition.wurst

```wurst
// DataA1 = attack speed % (when used with Percent)
getAbilityDataFieldPercent(ABILITY_ATTACK_SPEED_10, "DataA1")

// DataA1 = attack damage bonus
getAbilityDataField(AbilityIds.attackBonusPlus2, "DataA1")

// DataA1 = armor bonus
getAbilityDataField(ABILITY_ARMOR_BONUS_2, "DataA1")

// DataC1 = strength bonus
getAbilityDataField(ABILITY_STR_BONUS_8, "DataC1")

// Multiple fields for complex abilities
getAbilityDataField(ABILITY_HYDRA_CLAWS_POISON, "DataA1")    // Damage
getAbilityDataFieldPercent(ABILITY_HYDRA_CLAWS_POISON, "DataB1")  // Poison %
getAbilityDataFieldPercent(ABILITY_HYDRA_CLAWS_POISON, "DataC1")  // Tertiary effect
getAbilityDataField(ABILITY_HYDRA_CLAWS_POISON, "HeroDur1")       // Hero duration
getAbilityDataField(ABILITY_HYDRA_CLAWS_POISON, "Dur1")           // Normal duration
```

## Notes from ToolTipsUtils.wurst Comments

```wurst
/**
    It is possible to get the int value of certain data field from an ability using following formatting : <{abilId},{fieldId}>
    e.g, <AHtb,DataA1> would get the Level 1 - Data - Damage from the storm bolt ability
    TODO: Find documentation onto which data field can be fetched this way
**/
```

This indicates that:
- The format is `<{abilId},{fieldId}>`
- `DataA1` can represent "Level 1 - Data - Damage" (in the Storm Bolt example)
- The exact field meaning depends on the ability type

## Field Identifier Reference Table

| Field Identifier | Common Meaning | Context Dependency |
|-----------------|----------------|-------------------|
| `Cool1` | Cooldown (Level 1) | Low - always cooldown |
| `Dur1` | Duration (Level 1) | Low - always duration |
| `HeroDur1` | Hero Duration (Level 1) | Low - always hero duration |
| `DataA1` | Primary data field | **High** - varies by ability type |
| `DataB1` | Secondary data field | **High** - varies by ability type |
| `DataC1` | Tertiary data field | **High** - varies by ability type |

## Context-Dependent Examples

### DataA1 Usage Examples:
- **Movement Speed Ability**: `DataA1` = movement speed bonus
- **Attack Speed Ability**: `DataA1` = attack speed % (when used with Percent formatter)
- **Damage Bonus Ability**: `DataA1` = damage bonus value
- **Armor Bonus Ability**: `DataA1` = armor bonus value
- **Agility Bonus Ability**: `DataA1` = agility bonus value

### DataB1 Usage Examples:
- **Intelligence Bonus Ability**: `DataB1` = intelligence bonus value
- **Poison Ability**: `DataB1` = poison percentage

### DataC1 Usage Examples:
- **Strength Bonus Ability**: `DataC1` = strength bonus value
- **Complex Ability**: `DataC1` = tertiary effect value

## How to Resolve Field References

To resolve these references in tooltips, you need to:

1. **Extract the raw ability data** from `war3map.w3a` or ability definitions
2. **Identify the ability type** to determine what DataA1/DataB1/DataC1 represent
3. **Look up the field value** in the ability's raw modification data
4. **Replace the reference** with the actual numeric value

The challenge is that these references point to **base Warcraft 3 object data**, not just modifications. The `.w3x` file only contains modifications to base objects, not the base objects themselves.

## Related Files

- **Source Documentation**: `external/island-troll-tribes/wurst/utils/ToolTipsUtils.wurst`
- **Item Definitions**: 
  - `external/island-troll-tribes/wurst/objects/items/BootsDefinition.wurst`
  - `external/island-troll-tribes/wurst/objects/items/GlovesDefinition.wurst`
  - `external/island-troll-tribes/wurst/objects/items/CoatDefinition.wurst`
- **Field References Doc**: `docs/systems/scripts/field-references.md`
- **Ability ID Mapper**: `src/features/modules/guides/data/items/abilityIdMapper.ts`


# Guides Tests

This document outlines all tests needed for the guides module including data loading, utilities, components, and hooks.

## Guide Data Loading

### `src/features/modules/guides/data/abilities/index.ts`

- [ ] Test `ABILITIES` aggregates all category arrays
  - **What**: Verify all ability categories are aggregated
  - **Expected**: All categories combined into single array
  - **Edge cases**: Empty categories, missing categories, duplicate abilities

- [ ] Test `getAbilitiesByCategory` filters by category
  - **What**: Verify category filtering works
  - **Expected**: Returns only abilities from specified category
  - **Edge cases**: Invalid category, empty category, missing category

- [ ] Test `getAbilitiesByClass` filters by class requirement
  - **What**: Verify class filtering works
  - **Expected**: Returns only abilities for specified class
  - **Edge cases**: Invalid class, no abilities for class, missing class

- [ ] Test `getAbilityById` returns exact ability match
  - **What**: Verify ability lookup by ID works
  - **Expected**: Returns ability matching exact ID
  - **Edge cases**: Invalid ID, missing ability, case sensitivity

- [ ] Test `searchAbilities` matches name, description, and ID fields
  - **What**: Verify search functionality works
  - **Expected**: Searches across name, description, and ID fields
  - **Edge cases**: Partial matches, no matches, special characters

### `src/features/modules/guides/data/items/index.ts`

- [ ] Test `ITEMS_DATA` concatenates all item groups
  - **What**: Verify all item groups are concatenated
  - **Expected**: All groups (raw materials, weapons, armor, potions, scrolls, buildings, unknown) combined
  - **Edge cases**: Empty groups, missing groups, duplicate items

- [ ] Test `ITEMS_BY_CATEGORY` groups items by category
  - **What**: Verify items are grouped by category
  - **Expected**: Items organized by category in map/object
  - **Edge cases**: Empty categories, items without category, many categories

- [ ] Test `getItemById` returns undefined for missing IDs and matches by slug
  - **What**: Verify item lookup works
  - **Expected**: Returns item for valid ID/slug, undefined for missing
  - **Edge cases**: Invalid ID, missing item, slug variations

- [ ] Test `getItemsByCategory` returns empty array for categories without entries
  - **What**: Verify empty category handling
  - **Expected**: Returns empty array for categories with no items
  - **Edge cases**: Invalid category, missing category, all categories empty

- [ ] Test `getItemsBySubcategory` filters by subcategory
  - **What**: Verify subcategory filtering works
  - **Expected**: Returns items matching subcategory
  - **Edge cases**: Invalid subcategory, empty subcategory, missing subcategory

- [ ] Test `searchItems` matches name, description, and recipe ingredients (case-insensitive)
  - **What**: Verify item search works
  - **Expected**: Searches name, description, and ingredients, case-insensitive
  - **Edge cases**: Partial matches, no matches, special characters, unicode

### `src/features/modules/guides/data/units/classes.ts`

- [ ] Test `BASE_TROLL_CLASS_SLUGS` lists every base class slug
  - **What**: Verify all base class slugs are included
  - **Expected**: Array contains all base class slugs
  - **Edge cases**: Missing classes, duplicate slugs, invalid slugs

- [ ] Test `getClassBySlug` returns correct class data and undefined for invalid slug
  - **What**: Verify class lookup works
  - **Expected**: Returns class data for valid slug, undefined for invalid
  - **Edge cases**: Invalid slug, missing class, case sensitivity

- [ ] Test base class entries include subclass and superclass relationships
  - **What**: Verify class relationships are included
  - **Expected**: Subclass and superclass relationships present
  - **Edge cases**: Missing relationships, circular relationships, invalid relationships

- [ ] Test growth stats and base stats are preserved for each class
  - **What**: Verify stat data is preserved
  - **Expected**: Growth and base stats present for all classes
  - **Edge cases**: Missing stats, invalid stats, stat calculations

### `src/features/modules/guides/data/units/derivedClasses.ts`

- [ ] Test derived classes inherit correct parent slug and type (sub vs super)
  - **What**: Verify inheritance works correctly
  - **Expected**: Parent slug and type (sub/super) correct
  - **Edge cases**: Missing parent, invalid type, circular inheritance

- [ ] Test derived class entries include growth and base stat fields
  - **What**: Verify stat fields are present
  - **Expected**: Growth and base stat fields included
  - **Edge cases**: Missing stats, invalid stats, stat calculations

- [ ] Test derived classes include optional metadata (tips, iconSrc) when provided
  - **What**: Verify optional metadata is included
  - **Expected**: Optional fields included when provided
  - **Edge cases**: Missing optional fields, invalid metadata, all optional fields

### `src/features/modules/guides/hooks/useItemsData.ts`

- [ ] Test initial state uses cached values when available
  - **What**: Verify caching works
  - **Expected**: Cached values used on mount if available
  - **Edge cases**: Stale cache, invalid cache, cache expiration

- [ ] Test successful fetch updates `items`, `meta`, and clears errors
  - **What**: Verify successful fetch handling
  - **Expected**: Items and meta updated, errors cleared
  - **Edge cases**: Partial updates, malformed data, concurrent fetches

- [ ] Test fetch failure sets error and stops loading state
  - **What**: Verify error handling
  - **Expected**: Error set, loading state false on failure
  - **Edge cases**: Network errors, timeout, malformed responses

- [ ] Test in-flight request is reused across mounts
  - **What**: Verify request deduplication
  - **Expected**: Same request reused if already in flight
  - **Edge cases**: Rapid mounts, request cancellation, timeout

- [ ] Test `refetch` clears caches and reloads data
  - **What**: Verify refetch functionality
  - **Expected**: Cache cleared, fresh data loaded
  - **Edge cases**: Refetch during fetch, cache errors, network errors

- [ ] Test cleanup prevents state updates after unmount
  - **What**: Verify cleanup works
  - **Expected**: No state updates after component unmounts
  - **Edge cases**: Delayed responses, async operations, memory leaks

### `src/features/modules/guides/data/iconMap.ts`

- [ ] Test ICON_MAP contains required categories
  - **What**: Verify all required categories present
  - **Expected**: Categories (abilities, items, buildings, trolls, units) all present
  - **Edge cases**: Missing categories, extra categories, invalid categories

- [ ] Test entries map to filenames (no directory prefixes) and are serializable
  - **What**: Verify icon mapping format
  - **Expected**: Entries map to filenames, structure is serializable
  - **Edge cases**: Directory prefixes, invalid filenames, circular references

- [ ] Test icon lookups can round-trip known keys from each category
  - **What**: Verify icon lookup works
  - **Expected**: Keys can be looked up and return correct paths
  - **Edge cases**: Invalid keys, missing icons, case sensitivity

## Guide Utilities

### `src/features/modules/guides/utils/iconMap.ts`

- [ ] Test `resolveExplicitIcon` returns category-specific matches
  - **What**: Verify category-specific lookup works
  - **Expected**: Returns icon from specified category if found
  - **Edge cases**: Missing icon in category, invalid category, case sensitivity

- [ ] Test `resolveExplicitIcon` searches across categories when not found in requested category
  - **What**: Verify fallback search works
  - **Expected**: Searches other categories if not found in requested
  - **Edge cases**: Icon in different category, icon missing everywhere, many categories

- [ ] Test `resolveExplicitIcon` returns undefined when key is missing everywhere
  - **What**: Verify missing icon handling
  - **Expected**: Returns undefined when icon not found in any category
  - **Edge cases**: Invalid key, empty key, malformed key

- [ ] Test resolved paths include `/icons/itt/` prefix
  - **What**: Verify path prefix is included
  - **Expected**: All resolved paths include `/icons/itt/` prefix
  - **Edge cases**: Missing prefix, duplicate prefix, relative paths

### `src/features/modules/guides/utils/iconUtils.ts`

- [ ] Test `getDefaultIconPath` returns default fallback path
  - **What**: Verify default icon path
  - **Expected**: Returns default fallback icon path
  - **Edge cases**: Missing default, invalid path, path resolution

- [ ] Test default path is used when icon mapping is missing
  - **What**: Verify fallback behavior
  - **Expected**: Default path used when mapping fails
  - **Edge cases**: Mapping errors, missing mappings, invalid mappings

### `src/features/modules/guides/utils/itemIdMapper.ts`

- [ ] Test `itemConstantToId` strips ITEM_ prefix and converts to kebab-case
  - **What**: Verify constant to ID conversion
  - **Expected**: ITEM_ prefix removed, converted to kebab-case
  - **Edge cases**: Missing prefix, already kebab-case, special characters

- [ ] Test `itemIdToConstant` prefixes ITEM_ and uppercases
  - **What**: Verify ID to constant conversion
  - **Expected**: ITEM_ prefix added, converted to uppercase
  - **Edge cases**: Already prefixed, already uppercase, invalid format

- [ ] Test `mapCraftingStation` maps known stations and capitalizes unknown values
  - **What**: Verify crafting station mapping
  - **Expected**: Known stations mapped, unknown values capitalized
  - **Edge cases**: Missing station, invalid station, case variations

- [ ] Test `normalizeIngredientName` applies `INGREDIENT_NAME_MAP` overrides
  - **What**: Verify ingredient name normalization
  - **Expected**: Override map applied, names normalized
  - **Edge cases**: Missing overrides, invalid names, case sensitivity

## Guides Components

### `src/features/modules/guides/components/GuideCard.tsx`

- [ ] Test renders guide card
  - **What**: Verify guide card is rendered
  - **Expected**: Card displayed with guide information
  - **Edge cases**: Missing data, long text, special characters

- [ ] Test renders icon
  - **What**: Verify icon is displayed
  - **Expected**: Guide icon rendered correctly
  - **Edge cases**: Missing icon, invalid icon path, icon loading errors

- [ ] Test handles navigation
  - **What**: Verify navigation works
  - **Expected**: Clicking card navigates to guide page
  - **Edge cases**: Invalid route, navigation errors, disabled navigation

### `src/features/modules/guides/components/ClassHeader.tsx`

- [ ] Test renders class name
  - **What**: Verify class name is displayed
  - **Expected**: Class name rendered correctly
  - **Edge cases**: Missing name, long name, special characters

- [ ] Test renders class icon
  - **What**: Verify class icon is displayed
  - **Expected**: Class icon rendered correctly
  - **Edge cases**: Missing icon, invalid icon path, icon loading errors

- [ ] Test renders stats
  - **What**: Verify class stats are displayed
  - **Expected**: Class statistics rendered correctly
  - **Edge cases**: Missing stats, zero values, very large values

### `src/features/modules/guides/components/ClassIcon.tsx`

- [ ] Test renders icon with correct path
  - **What**: Verify icon path is correct
  - **Expected**: Icon loaded from correct path
  - **Edge cases**: Invalid path, missing file, path resolution

- [ ] Test handles missing icon
  - **What**: Verify missing icon handling
  - **Expected**: Fallback icon or placeholder shown when icon missing
  - **Edge cases**: Broken path, loading errors, network errors

### `src/features/modules/guides/components/GuideIcon.tsx`

- [ ] Test renders guide icon
  - **What**: Verify guide icon is rendered
  - **Expected**: Icon displayed correctly
  - **Edge cases**: Missing icon, invalid icon, icon loading errors

- [ ] Test handles different icon types
  - **What**: Verify different icon types work
  - **Expected**: All icon types rendered correctly
  - **Edge cases**: Unknown types, invalid types, type mismatches

### `src/features/modules/guides/components/StatsCard.tsx`

- [ ] Test renders stat values
  - **What**: Verify stat values are displayed
  - **Expected**: Stat values rendered correctly
  - **Edge cases**: Missing values, zero values, very large values

- [ ] Test formats numbers correctly
  - **What**: Verify number formatting works
  - **Expected**: Numbers formatted appropriately (commas, decimals, etc.)
  - **Edge cases**: Very large numbers, decimals, negative numbers

### `src/features/modules/guides/components/ColoredText.tsx`

- [ ] Test applies color codes
  - **What**: Verify color codes are applied
  - **Expected**: Text colored according to color codes
  - **Edge cases**: Invalid codes, missing codes, code combinations

- [ ] Test renders text correctly
  - **What**: Verify text rendering works
  - **Expected**: Text rendered with correct styling
  - **Edge cases**: Long text, special characters, unicode


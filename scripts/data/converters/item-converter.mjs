/**
 * Item converter - converts extracted item data to TypeScript ItemData format
 */

import path from 'path';
import { loadJson, slugify, convertIconPath } from '../lib/utils.mjs';
import { mapItemCategory } from './category-mapper.mjs';
import { TMP_METADATA_DIR } from '../lib/paths.mjs';

const RECIPES_FILE = path.join(TMP_METADATA_DIR, 'recipes.json');
const ITEM_DETAILS_FILE = path.join(TMP_METADATA_DIR, 'item-details-wurst.json');

const normalizeRecipeObjectId = (id) => {
  if (!id || typeof id !== 'string') return null;
  return id.trim().toUpperCase();
};

/**
 * Load item details from Wurst extraction
 */
let itemDetailsCache = null;
function loadItemDetails() {
  if (itemDetailsCache !== null) {
    return itemDetailsCache;
  }
  
  const itemDetailsData = loadJson(ITEM_DETAILS_FILE);
  itemDetailsCache = itemDetailsData?.itemDetails || {};
  return itemDetailsCache;
}

/**
 * Find matching item details by slugified name or constant
 */
function findItemDetails(extractedItem, slugifiedName) {
  const itemDetails = loadItemDetails();
  
  // Try to find by normalized ID (slugified name)
  for (const [itemId, details] of Object.entries(itemDetails)) {
    // Match by slugified name
    if (itemId.toLowerCase() === slugifiedName.toLowerCase()) {
      return details;
    }
    
    // Match by constant name without ITEM_ prefix
    const constWithoutPrefix = details.constant?.replace(/^ITEM_/, '').toLowerCase().replace(/_/g, '-');
    if (constWithoutPrefix === slugifiedName.toLowerCase()) {
      return details;
    }
  }
  
  return null;
}

/**
 * Convert extracted item to TypeScript ItemData
 */
export function convertItem(extractedItem) {
  const name = (extractedItem.name || extractedItem.id || '').trim();
  const slugifiedName = slugify(name);
  
  const itemForMapping = {
    ...extractedItem,
    name: name,
    id: slugifiedName
  };
  
  const categoryInfo = mapItemCategory(itemForMapping);
  if (!categoryInfo) {
    return null;
  }
  
  const description = (extractedItem.description || '').trim();
  const tooltip = extractedItem.tooltip ? extractedItem.tooltip.trim() : undefined;
  
  // Find matching item details from Wurst extraction
  const itemDetails = findItemDetails(extractedItem, slugifiedName);
  
  // Build stats object from Wurst bonuses and W3T fields
  const stats = {};
  if (itemDetails?.bonuses) {
    if (itemDetails.bonuses.strength) stats.strength = itemDetails.bonuses.strength;
    if (itemDetails.bonuses.agility) stats.agility = itemDetails.bonuses.agility;
    if (itemDetails.bonuses.intelligence) stats.intelligence = itemDetails.bonuses.intelligence;
    if (itemDetails.bonuses.armor) stats.armor = itemDetails.bonuses.armor;
    if (itemDetails.bonuses.damage) stats.damage = itemDetails.bonuses.damage;
    if (itemDetails.bonuses.attackSpeed) stats.attackSpeed = itemDetails.bonuses.attackSpeed;
    if (itemDetails.bonuses.health) stats.health = itemDetails.bonuses.health;
    if (itemDetails.bonuses.mana) stats.mana = itemDetails.bonuses.mana;
  }
  
  // Use Wurst properties if available, otherwise fall back to W3T fields
  const lumberCost = itemDetails?.properties?.lumberCost ?? extractedItem.lumberCost ?? undefined;
  const stockMaximum = itemDetails?.properties?.stockMaximum ?? extractedItem.stockMaximum ?? undefined;
  const stockReplenishInterval = itemDetails?.properties?.stockReplenishInterval ?? extractedItem.stockReplenishInterval ?? undefined;
  
  const result = {
    id: slugifiedName,
    name: name,
    category: categoryInfo.category,
    subcategory: categoryInfo.subcategory,
    description: description,
    tooltip: tooltip,
    iconPath: convertIconPath(extractedItem.icon),
  };
  
  // Add cost information
  if (extractedItem.cost && extractedItem.cost > 0) {
    result.cost = extractedItem.cost;
  }
  if (lumberCost && lumberCost > 0) {
    result.lumberCost = lumberCost;
  }
  
  // Add usage information
  if (extractedItem.hotkey) {
    result.hotkey = extractedItem.hotkey;
  }
  if (extractedItem.uses && extractedItem.uses > 0) {
    result.uses = extractedItem.uses;
  }
  if (extractedItem.hitPoints && extractedItem.hitPoints > 0) {
    result.hitPoints = extractedItem.hitPoints;
  }
  if (extractedItem.maxStack && extractedItem.maxStack > 0) {
    result.maxStack = extractedItem.maxStack;
  }
  
  // Add stock information
  if (stockMaximum && stockMaximum > 0) {
    result.stockMaximum = stockMaximum;
  }
  if (stockReplenishInterval && stockReplenishInterval > 0) {
    result.stockReplenishInterval = stockReplenishInterval;
  }
  
  // Add abilities list
  if (extractedItem.abilities && Array.isArray(extractedItem.abilities) && extractedItem.abilities.length > 0) {
    result.abilities = extractedItem.abilities;
  }
  
  // Add stats if any
  if (Object.keys(stats).length > 0) {
    result.stats = stats;
  }
  
  return result;
}

/**
 * Load recipes map
 */
export function loadRecipesMap() {
  const recipesData = loadJson(RECIPES_FILE);
  const recipeMap = new Map();

  if (!recipesData || !Array.isArray(recipesData.recipes)) {
    return recipeMap;
  }

  for (const recipe of recipesData.recipes) {
    const objectId = normalizeRecipeObjectId(
      recipe.item?.objectId || recipe.itemObjectId
    );
    if (!objectId) {
      continue;
    }

    const ingredientCodes = (recipe.ingredients || [])
      .map((ingredient) => normalizeRecipeObjectId(ingredient?.objectId))
      .filter(Boolean);

    recipeMap.set(objectId, {
      ingredients: ingredientCodes,
      craftedAtCode: normalizeRecipeObjectId(recipe.craftedAt?.objectId),
      craftedAtConst: recipe.craftedAt?.const || null,
      craftedAtName: recipe.craftedAt?.name || null,
      mixingPotManaRequirement: recipe.mixingPotManaRequirement ?? null,
    });
  }

  return recipeMap;
}


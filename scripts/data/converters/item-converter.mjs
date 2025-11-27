/**
 * Item converter - converts extracted item data to TypeScript ItemData format
 */

import path from 'path';
import { loadJson, slugify, convertIconPath } from '../utils.mjs';
import { mapItemCategory } from './category-mapper.mjs';
import { TMP_METADATA_DIR } from '../paths.mjs';

const RECIPES_FILE = path.join(TMP_METADATA_DIR, 'recipes.json');

const normalizeRecipeObjectId = (id) => {
  if (!id || typeof id !== 'string') return null;
  return id.trim().toUpperCase();
};

/**
 * Convert extracted item to TypeScript ItemData
 */
export function convertItem(extractedItem) {
  const name = (extractedItem.name || extractedItem.id || '').trim();
  
  const itemForMapping = {
    ...extractedItem,
    name: name,
    id: slugify(name)
  };
  
  const categoryInfo = mapItemCategory(itemForMapping);
  if (!categoryInfo) {
    return null;
  }
  
  const description = (extractedItem.description || '').trim();
  const tooltip = extractedItem.tooltip ? extractedItem.tooltip.trim() : undefined;
  
  return {
    id: slugify(name),
    name: name,
    category: categoryInfo.category,
    subcategory: categoryInfo.subcategory,
    description: description,
    tooltip: tooltip,
    iconPath: convertIconPath(extractedItem.icon),
  };
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


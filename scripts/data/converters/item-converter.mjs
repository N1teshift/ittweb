/**
 * Item converter - converts extracted item data to TypeScript ItemData format
 */

import path from 'path';
import { getRootDir, loadJson, slugify, convertIconPath } from '../utils.mjs';
import { mapItemCategory } from './category-mapper.mjs';

const ROOT_DIR = getRootDir();
const RECIPES_FILE = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'recipes.json');

/**
 * Load recipes to get crafting information
 */
function loadRecipes() {
  const recipesData = loadJson(RECIPES_FILE);
  if (!recipesData || !recipesData.recipes) return new Map();
  
  const recipeMap = new Map();
  for (const recipe of recipesData.recipes) {
    const itemId = recipe.itemId || recipe.itemName;
    if (itemId) {
      recipeMap.set(itemId, {
        ingredients: recipe.ingredients || recipe.ingredientNames || [],
        craftedAt: recipe.unitRequirement || recipe.craftedAt,
        mixingPotManaRequirement: recipe.mixingPotManaRequirement
      });
    }
  }
  
  return recipeMap;
}

/**
 * Convert extracted item to TypeScript ItemData
 */
export function convertItem(extractedItem, recipes) {
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
  
  const recipe = recipes.get(extractedItem.id) || recipes.get(extractedItem.name) || recipes.get(name);
  
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
    recipe: recipe?.ingredients || undefined,
    craftedAt: recipe?.craftedAt || undefined,
    mixingPotManaRequirement: recipe?.mixingPotManaRequirement || undefined,
  };
}

/**
 * Load recipes map
 */
export function loadRecipesMap() {
  return loadRecipes();
}


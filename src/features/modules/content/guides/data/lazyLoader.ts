/**
 * Lazy loading wrapper for large guides data files
 * This helps with performance by loading data only when needed
 */

// Lazy load functions for large data files
export const loadAllUnits = () => import('./units/allUnits');
export const loadUnknownAbilities = () => import('./abilities/unknown');
export const loadUnknownItems = () => import('./items/unknown');
export const loadBuildingData = () => import('./abilities/building');

// Type-safe lazy loading with caching
type LoadedModule = Record<string, unknown>;
const loadedData = new Map<string, LoadedModule>();

export async function getAllUnits() {
  const key = 'allUnits';
  if (!loadedData.has(key)) {
    const importedModule = await loadAllUnits();
    loadedData.set(key, importedModule);
  }
  return loadedData.get(key);
}

export async function getUnknownAbilities() {
  const key = 'unknownAbilities';
  if (!loadedData.has(key)) {
    const importedModule = await loadUnknownAbilities();
    loadedData.set(key, importedModule);
  }
  return loadedData.get(key);
}

export async function getUnknownItems() {
  const key = 'unknownItems';
  if (!loadedData.has(key)) {
    const importedModule = await loadUnknownItems();
    loadedData.set(key, importedModule);
  }
  return loadedData.get(key);
}

export async function getBuildingData() {
  const key = 'buildingData';
  if (!loadedData.has(key)) {
    const importedModule = await loadBuildingData();
    loadedData.set(key, importedModule);
  }
  return loadedData.get(key);
}


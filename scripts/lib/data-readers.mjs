/**
 * TypeScript data file readers
 * 
 * Shared functions for reading and parsing TypeScript data files
 */

import fs from 'fs';
import path from 'path';
import { PATHS, ITEM_FILES, ABILITY_FILES } from './constants.mjs';

/**
 * Read items from TypeScript files
 * @returns {Array<{id: string, name: string, iconPath: string|null}>}
 */
export function readItemsFromTS(itemsDir = PATHS.ITEMS_DIR) {
  const items = [];
  
  for (const file of ITEM_FILES) {
    const filePath = path.join(itemsDir, file);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const arrayMatches = content.matchAll(/export const \w+_ITEMS[^=]*=\s*\[([\s\S]*?)\];/g);
    
    for (const arrayMatch of arrayMatches) {
      const arrayContent = arrayMatch[1];
      const itemMatches = arrayContent.matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
      
      for (const match of itemMatches) {
        const itemContent = match[0];
        const iconMatch = itemContent.match(/iconPath:\s*'([^']+)'/);
        const iconPath = iconMatch ? iconMatch[1] : null;
        
        items.push({
          id: match[1],
          name: match[2].replace(/\\$/, ''), // Remove trailing backslash
          iconPath: iconPath
        });
      }
    }
  }
  
  return items;
}

/**
 * Read abilities from TypeScript files
 * @returns {Array<{id: string, name: string, iconPath: string|null}>}
 */
export function readAbilitiesFromTS(abilitiesDir = PATHS.ABILITIES_DIR) {
  const abilities = [];
  
  for (const file of ABILITY_FILES) {
    const filePath = path.join(abilitiesDir, file);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const arrayMatches = content.matchAll(/export const \w+_ABILITIES[^=]*=\s*\[([\s\S]*?)\];/g);
    
    for (const arrayMatch of arrayMatches) {
      const arrayContent = arrayMatch[1];
      const abilityMatches = arrayContent.matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
      
      for (const match of abilityMatches) {
        const abilityContent = match[0];
        const iconMatch = abilityContent.match(/iconPath:\s*'([^']+)'/);
        const iconPath = iconMatch ? iconMatch[1] : null;
        
        abilities.push({
          id: match[1],
          name: match[2].replace(/\\$/, ''), // Remove trailing backslash
          iconPath: iconPath
        });
      }
    }
  }
  
  return abilities;
}

/**
 * Read units from TypeScript file
 * @returns {Array<{id: string, name: string, iconPath: string|null}>}
 */
export function readUnitsFromTS(unitsFile = PATHS.UNITS_FILE) {
  if (!fs.existsSync(unitsFile)) return [];
  
  const content = fs.readFileSync(unitsFile, 'utf-8');
  const match = content.match(/export const ALL_UNITS[^=]*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  
  const units = [];
  const unitMatches = match[1].matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
  
  for (const match of unitMatches) {
    const unitContent = match[0];
    const iconMatch = unitContent.match(/iconPath:\s*'([^']+)'/);
    const iconPath = iconMatch ? iconMatch[1] : null;
    
    units.push({
      id: match[1],
      name: match[2].replace(/\\$/, ''),
      iconPath: iconPath
    });
  }
  
  return units;
}

/**
 * Read base classes from TypeScript file
 * @returns {Array<{slug: string, name: string, iconSrc: string|null, isDerived: false}>}
 */
export function readBaseClassesFromTS() {
  const classes = [];
  
  if (fs.existsSync(PATHS.CLASSES_FILE)) {
    const content = fs.readFileSync(PATHS.CLASSES_FILE, 'utf-8');
    const match = content.match(/export const BASE_TROLL_CLASSES[^=]*=\s*\[([\s\S]*?)\];/);
    if (match) {
      const classMatches = match[1].matchAll(/\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
      for (const match of classMatches) {
        const classContent = match[0];
        const iconMatch = classContent.match(/iconSrc:\s*'([^']+)'/);
        const iconSrc = iconMatch ? iconMatch[1] : null;
        
        classes.push({
          slug: match[1],
          name: match[2],
          iconSrc: iconSrc,
          isDerived: false
        });
      }
    }
  }
  
  return classes;
}

/**
 * Read derived classes from TypeScript file
 * @returns {Array<{slug: string, name: string, iconSrc: string|null, isDerived: true}>}
 */
export function readDerivedClassesFromTS() {
  const classes = [];
  
  if (fs.existsSync(PATHS.DERIVED_CLASSES_FILE)) {
    const content = fs.readFileSync(PATHS.DERIVED_CLASSES_FILE, 'utf-8');
    const match = content.match(/export const DERIVED_CLASSES[^=]*=\s*\[([\s\S]*?)\];/);
    if (match) {
      const classMatches = match[1].matchAll(/\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
      for (const match of classMatches) {
        const classContent = match[0];
        const iconMatch = classContent.match(/iconSrc:\s*'([^']+)'/);
        const iconSrc = iconMatch ? iconMatch[1] : null;
        
        classes.push({
          slug: match[1],
          name: match[2],
          iconSrc: iconSrc,
          isDerived: true
        });
      }
    }
  }
  
  return classes;
}

/**
 * Read all classes from TypeScript files (both base and derived)
 * @returns {Array<{slug: string, name: string, iconSrc: string|null, isDerived: boolean}>}
 */
export function readClassesFromTS() {
  const baseClasses = readBaseClassesFromTS();
  const derivedClasses = readDerivedClassesFromTS();
  return [...baseClasses, ...derivedClasses];
}


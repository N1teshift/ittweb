/**
 * Fix icon paths in generated data files
 * 
 * This script validates and fixes icon paths in the generated TypeScript files.
 * It checks if icon files exist and tries to find case-insensitive matches.
 * Handles abilities, items, and units.
 * 
 * Usage: node scripts/data/fix-icon-paths.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRootDir, getAllIconFiles } from '../lib/utils.mjs';
import { ITEMS_TS_DIR, ABILITIES_TS_DIR, UNITS_TS_DIR } from '../lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = getRootDir();
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');

// Default fallback icon
const FALLBACK_ICON = 'btncancel.png';

/**
 * Normalize icon path by removing subdirectories and converting to lowercase basename
 */
function normalizeIconPath(iconPath) {
  if (!iconPath) return null;
  
  // Remove any directory prefixes (like ReplaceableTextures/CommandButtons/, UI/Cursor/, etc.)
  const filename = path.basename(iconPath);
  // Remove extension and convert to lowercase for matching
  const basename = path.basename(filename, '.png').toLowerCase();
  return basename;
}

/**
 * Calculate similarity score between two strings (simple Levenshtein-like)
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // Check if one contains the other (high similarity)
  if (longer.includes(shorter)) return 0.8;
  
  // Simple character overlap
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  return matches / longer.length;
}

/**
 * Find the correct icon filename for a given iconPath using multiple strategies
 * Always returns lowercase filename (standardized format)
 */
function findIconFile(iconPath, iconMap, searchIndex) {
  if (!iconPath) return null;
  
  // Strategy 1: Exact match (case-insensitive, with subdirectory handling)
  const filename = path.basename(iconPath);
  const lowerFilename = filename.toLowerCase();
  if (iconMap.has(lowerFilename)) {
    // Return lowercase version (standardize all paths)
    return lowerFilename;
  }
  
  // Strategy 2: Match by basename (without extension)
  const normalized = normalizeIconPath(iconPath);
  if (normalized && searchIndex.has(normalized)) {
    const candidates = searchIndex.get(normalized);
    // Return the first match in lowercase (usually there's only one)
    if (candidates.length > 0) {
      return candidates[0].toLowerCase();
    }
  }
  
  // Strategy 2b: Try case-insensitive match by removing BTN prefix variations
  if (normalized) {
    // Try removing BTN prefix and matching
    const withoutBtn = normalized.replace(/^btn/, '');
    if (withoutBtn !== normalized && searchIndex.has(withoutBtn)) {
      const candidates = searchIndex.get(withoutBtn);
      if (candidates.length > 0) {
        return candidates[0].toLowerCase();
      }
    }
    // Try adding btn prefix
    const withBtn = normalized.startsWith('btn') ? normalized : `btn${normalized}`;
    if (withBtn !== normalized && searchIndex.has(withBtn)) {
      const candidates = searchIndex.get(withBtn);
      if (candidates.length > 0) {
        return candidates[0].toLowerCase();
      }
    }
  }
  
  // Strategy 3: Fuzzy matching for common variations
  // Handle common naming variations
  const variations = [
    // Weapon vs Armor variations (common mistake)
    normalized?.replace(/weapon/g, 'armor'),
    normalized?.replace(/armor/g, 'weapon'),
    // Temp variations (placeholder icons)
    normalized?.replace(/temp/g, 'cancel'),
    // Common prefix/suffix removals
    normalized?.replace(/^btn/, ''),
    normalized?.replace(/btn$/, ''),
    // Remove numbers at the end (e.g., "up2" -> "up")
    normalized?.replace(/\d+$/, ''),
    // Handle "up" variations
    normalized?.replace(/up(\d+)?/g, 'up'),
  ].filter(Boolean);
  
  for (const variant of variations) {
    if (searchIndex.has(variant)) {
      const candidates = searchIndex.get(variant);
      if (candidates.length > 0) {
        return candidates[0].toLowerCase();
      }
    }
  }
  
  // Strategy 3b: Try matching with number variations (e.g., "nagaweaponup2" -> "nagaarmorup2")
  if (normalized) {
    const baseMatch = normalized.replace(/\d+$/, '');
    for (const [basename, filenames] of searchIndex.entries()) {
      const basenameBase = basename.replace(/\d+$/, '');
      if (basenameBase === baseMatch.replace(/weapon/g, 'armor') || 
          basenameBase === baseMatch.replace(/armor/g, 'weapon')) {
        return filenames[0].toLowerCase();
      }
    }
  }
  
  // Strategy 4: Partial matching (find icons that contain key parts)
  if (normalized) {
    // Extract key words from the normalized name
    const keywords = normalized.split(/[^a-z0-9]+/).filter(k => k.length > 3);
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [basename, filenames] of searchIndex.entries()) {
      for (const keyword of keywords) {
        if (basename.includes(keyword)) {
          const score = calculateSimilarity(normalized, basename);
          if (score > bestScore && score > 0.5) {
            bestScore = score;
            bestMatch = filenames[0];
          }
        }
      }
    }
    
    if (bestMatch) {
      return bestMatch.toLowerCase();
    }
  }
  
  return null;
}

/**
 * Parse and update icon paths in a TypeScript file
 */
function fixIconPathsInFile(filePath, iconMap, searchIndex) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return { fixed: 0, notFound: 0 };
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fixed = 0;
  let notFound = 0;
  
  // Match iconPath: '...' or iconPath: "..."
  // Process in reverse order to maintain string positions
  const iconPathRegex = /iconPath:\s*(['"])([^'"]+)\1/g;
  const matches = [...content.matchAll(iconPathRegex)].reverse();
  
  for (const match of matches) {
    const quote = match[1];
    const iconPath = match[2];
    const fullMatch = match[0];
    
    // Skip if already using fallback
    if (iconPath === FALLBACK_ICON) continue;
    
    // Normalize path: remove subdirectories and convert to lowercase
    // All icon paths should be lowercase filenames only (no subdirectories)
    const normalizedPath = path.basename(iconPath).toLowerCase();
    const lowerNormalized = normalizedPath;
    
    // Always check iconMap first to get the actual filename (for existence check)
    let actualFile = null;
    if (iconMap.has(lowerNormalized)) {
      actualFile = iconMap.get(lowerNormalized);
    }
    
    // Check if file exists
    const fullPathWithCorrectCasing = actualFile ? path.join(ICONS_DIR, actualFile) : null;
    const fullPathNormalized = path.join(ICONS_DIR, normalizedPath);
    
    // Check existence (case-insensitive on Windows, but we want lowercase)
    const exists = actualFile ? fs.existsSync(fullPathWithCorrectCasing) : 
                   fs.existsSync(fullPathNormalized);
    
    // Always normalize to lowercase filename only (standardize all paths)
    // Check if current path needs normalization (has subdirectories or wrong case)
    const needsNormalization = iconPath !== normalizedPath;
    
    if (needsNormalization) {
      // Normalize to lowercase filename only
      const replacement = `iconPath: ${quote}${normalizedPath}${quote}`;
      const before = content.substring(0, match.index);
      const after = content.substring(match.index + fullMatch.length);
      content = before + replacement + after;
      fixed++;
      console.log(`  Normalized: ${iconPath} -> ${normalizedPath}`);
      continue;
    }
    
    if (!exists) {
      // Try to find a matching file
      const foundIcon = findIconFile(iconPath, iconMap, searchIndex);
      
      if (foundIcon) {
        // Replace with found icon (convert to lowercase)
        const newIconPath = foundIcon.toLowerCase();
        const replacement = `iconPath: ${quote}${newIconPath}${quote}`;
        // Replace from the end to maintain positions
        const before = content.substring(0, match.index);
        const after = content.substring(match.index + fullMatch.length);
        content = before + replacement + after;
        fixed++;
        console.log(`  Fixed: ${iconPath} -> ${newIconPath}`);
      } else {
        // Use fallback
        const replacement = `iconPath: ${quote}${FALLBACK_ICON}${quote}`;
        // Replace from the end to maintain positions
        const before = content.substring(0, match.index);
        const after = content.substring(match.index + fullMatch.length);
        content = before + replacement + after;
        notFound++;
        console.log(`  Not found, using fallback: ${iconPath} -> ${FALLBACK_ICON}`);
      }
    }
  }
  
  // Write back if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return { fixed, notFound };
}

/**
 * Process all TypeScript files in a directory
 */
function processDirectory(dirPath, dirName, iconMap, searchIndex) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Skipping ${dirName} directory (not found)`);
    return { fixed: 0, notFound: 0 };
  }
  
  let totalFixed = 0;
  let totalNotFound = 0;
  
  const files = fs.readdirSync(dirPath);
  const tsFiles = files.filter(f => f.endsWith('.ts'));
  
  if (tsFiles.length === 0) {
    return { fixed: 0, notFound: 0 };
  }
  
  for (const file of tsFiles) {
    const filePath = path.join(dirPath, file);
    const { fixed, notFound } = fixIconPathsInFile(filePath, iconMap, searchIndex);
    totalFixed += fixed;
    totalNotFound += notFound;
    
    if (fixed > 0 || notFound > 0) {
      console.log(`  ${file}: ${fixed} fixed, ${notFound} using fallback`);
    }
  }
  
  return { fixed: totalFixed, notFound: totalNotFound };
}

/**
 * Process a specific file (for allUnits.ts)
 */
function processFile(filePath, fileName, iconMap, searchIndex) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${fileName} (not found)`);
    return { fixed: 0, notFound: 0 };
  }
  
  const { fixed, notFound } = fixIconPathsInFile(filePath, iconMap, searchIndex);
  if (fixed > 0 || notFound > 0) {
    console.log(`  ${fileName}: ${fixed} fixed, ${notFound} using fallback`);
  }
  
  return { fixed, notFound };
}

/**
 * Main function
 */
function main() {
  console.log('Fixing icon paths in generated data files...\n');
  
  // Get all icon files
  console.log('Loading icon files...');
  const { iconMap, searchIndex } = getAllIconFiles(ICONS_DIR, 'map');
  console.log(`Found ${iconMap.size} icon files\n`);
  
  let totalFixed = 0;
  let totalNotFound = 0;
  
  // Process abilities
  console.log('Processing abilities...');
  const abilitiesResult = processDirectory(ABILITIES_TS_DIR, 'abilities', iconMap, searchIndex);
  totalFixed += abilitiesResult.fixed;
  totalNotFound += abilitiesResult.notFound;
  if (abilitiesResult.fixed > 0 || abilitiesResult.notFound > 0) {
    console.log(`  Abilities: ${abilitiesResult.fixed} fixed, ${abilitiesResult.notFound} using fallback\n`);
  } else {
    console.log(`  Abilities: No issues found\n`);
  }
  
  // Process items
  console.log('Processing items...');
  const itemsResult = processDirectory(ITEMS_TS_DIR, 'items', iconMap, searchIndex);
  totalFixed += itemsResult.fixed;
  totalNotFound += itemsResult.notFound;
  if (itemsResult.fixed > 0 || itemsResult.notFound > 0) {
    console.log(`  Items: ${itemsResult.fixed} fixed, ${itemsResult.notFound} using fallback\n`);
  } else {
    console.log(`  Items: No issues found\n`);
  }
  
  // Process units - handle allUnits.ts specifically
  console.log('Processing units...');
  let unitsFixed = 0;
  let unitsNotFound = 0;
  
  const allUnitsFile = path.join(UNITS_TS_DIR, 'allUnits.ts');
  if (fs.existsSync(allUnitsFile)) {
    const unitsFileResult = processFile(allUnitsFile, 'allUnits.ts', iconMap, searchIndex);
    unitsFixed += unitsFileResult.fixed;
    unitsNotFound += unitsFileResult.notFound;
  }
  
  // Also process any other unit files in the directory (excluding allUnits.ts)
  const files = fs.existsSync(UNITS_TS_DIR) ? fs.readdirSync(UNITS_TS_DIR) : [];
  const otherUnitFiles = files.filter(f => f.endsWith('.ts') && f !== 'allUnits.ts');
  
  for (const file of otherUnitFiles) {
    const filePath = path.join(UNITS_TS_DIR, file);
    const result = fixIconPathsInFile(filePath, iconMap, searchIndex);
    unitsFixed += result.fixed;
    unitsNotFound += result.notFound;
    if (result.fixed > 0 || result.notFound > 0) {
      console.log(`  ${file}: ${result.fixed} fixed, ${result.notFound} using fallback`);
    }
  }
  
  totalFixed += unitsFixed;
  totalNotFound += unitsNotFound;
  
  if (unitsFixed > 0 || unitsNotFound > 0) {
    console.log(`  Units: ${unitsFixed} fixed, ${unitsNotFound} using fallback\n`);
  } else {
    console.log(`  Units: No issues found\n`);
  }
  
  console.log('='.repeat(50));
  console.log(`Total: ${totalFixed} paths fixed, ${totalNotFound} using fallback`);
  console.log('Done!');
}

// Run if executed directly
main();


/**
 * Enhanced item data extractor from Wurst source files
 * Extracts: name, tooltip, icon, and other item properties
 * 
 * Usage: node scripts/extract-item-data.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const WURST_DIR = path.join(ROOT_DIR, 'external', 'island_troll_tribes', 'wurst');
const OUTPUT_JSON = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'items_extracted.json');

function walkFiles(startDir, filterExt = ['.wurst']) {
  const results = [];
  const stack = [startDir];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (e) {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
      } else if (ent.isFile()) {
        if (filterExt.length === 0 || filterExt.includes(path.extname(ent.name))) {
          results.push(full);
        }
      }
    }
  }
  return results;
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

/**
 * Extract tooltip constants from a file
 * Looks for patterns like: public let HASTE_TT = "text"...
 * Handles multi-line definitions with method chaining
 */
function extractTooltipConstants(content) {
  const tooltips = {};
  
  // Match: public let NAME_TT = "text" ... (may span multiple lines)
  // Pattern matches from "public let" to the next "public let" or end of meaningful block
  const tooltipRegex = /public\s+let\s+([A-Z0-9_]+_TT)\s*=\s*"([^"]+)"([\s\S]*?)(?=\npublic\s+let|\npublic\s+constant|\n@compiletime|\nfunction|\nclass|\ninit\b|\npackage|\nimport|\n$)/g;
  for (const m of content.matchAll(tooltipRegex)) {
    const constName = m[1];
    const baseText = m[2];
    const rest = m[3] || '';
    
    // Extract the base description (first quoted string)
    // This is the main tooltip text before .format() or method chaining
    tooltips[constName] = {
      baseText: baseText,
      fullDefinition: m[0],
      // Try to extract additional text from concatenated strings
      additionalText: rest.match(/\+?\s*"([^"]+)"/g)?.map(s => s.match(/"([^"]+)"/)?.[1]).filter(Boolean).join(' ') || ''
    };
  }
  
  return tooltips;
}

/**
 * Extract items from Wurst file content
 */
function extractItemsFromWurst(content, filePath, tooltipConstants = {}) {
  const items = [];
  
  // Gather string constants within the file
  const stringConsts = {};
  const constRegex = /(?:public\s+)?(?:let|constant)\s+([A-Z0-9_]+)\s*=\s*"([^"]+)"/g;
  for (const m of content.matchAll(constRegex)) {
    stringConsts[m[1]] = m[2];
  }
  
  // Find CustomItemDefinition blocks
  // Pattern: compiletime(new CustomItemDefinition(ITEM_ID) ... ) or new CustomItemDefinition(ITEM_ID) ... )
  // Match content until we find ..constructItemShopDummyUnit(...) followed by ) on new line, or just ) on new line
  const customDefRegex = /(?:compiletime\s*\(\s*)?new\s+CustomItemDefinition\s*\(\s*([A-Z0-9_]+)\s*\)/g;
  for (const m of content.matchAll(customDefRegex)) {
    const codeId = m[1];
    const afterDef = content.substring(m.index + m[0].length);
    
    // Find the block content - look for common ending patterns
    // Pattern 1: ..constructItemShopDummyUnit(...) followed by ) on new line
    let blockEnd = -1;
    const constructMatch = afterDef.match(/\.\.constructItemShopDummyUnit\([^)]*\)/);
    if (constructMatch) {
      const afterConstruct = afterDef.substring(constructMatch.index + constructMatch[0].length);
      const closeMatch = afterConstruct.match(/^\s*\)/m);
      if (closeMatch) {
        blockEnd = constructMatch.index + constructMatch[0].length + closeMatch.index;
      }
    }
    
    // Pattern 2: Just a ) on a new line (for items without constructItemShopDummyUnit)
    if (blockEnd === -1) {
      const closeMatch = afterDef.match(/^\s*\)/m);
      if (closeMatch && closeMatch.index < 2000) { // reasonable limit
        blockEnd = closeMatch.index;
      }
    }
    
    if (blockEnd === -1) continue;
    
    const block = afterDef.substring(0, blockEnd);
    const item = {
      codeId,
      name: undefined,
      tooltip: undefined,
      tooltipConstant: undefined,
      icon: undefined,
      file: path.relative(ROOT_DIR, filePath)
    };
    
    // Extract name from setNameEnhance("...") or setName("...")
    let nameMatch = block.match(/\.setNameEnhance\(\s*"([^"]+)"\s*\)/)
      || block.match(/\.setName\(\s*"([^"]+)"\s*\)/);
    if (!nameMatch) {
      // Try constant indirection
      const nameConstMatch = block.match(/\.setName(?:Enhance)?\(\s*([A-Z0-9_]+)\s*\)/);
      if (nameConstMatch && stringConsts[nameConstMatch[1]]) {
        item.name = stringConsts[nameConstMatch[1]];
      }
    } else {
      item.name = nameMatch[1];
    }
    
    // Extract tooltip from setTooltipExtended(CONSTANT) or setTooltipExtended("...")
    let tooltipMatch = block.match(/\.setTooltipExtended\(\s*"([^"]+)"\s*\)/);
    if (!tooltipMatch) {
      // Try constant: setTooltipExtended(HASTE_TT)
      const tooltipConstMatch = block.match(/\.setTooltipExtended\(\s*([A-Z0-9_]+_TT)\s*\)/);
      if (tooltipConstMatch) {
        item.tooltipConstant = tooltipConstMatch[1];
        // Try to resolve from tooltipConstants map
        if (tooltipConstants[tooltipConstMatch[1]]) {
          const ttData = tooltipConstants[tooltipConstMatch[1]];
          // Combine base text with additional text if available
          item.tooltip = ttData.baseText + (ttData.additionalText ? ' ' + ttData.additionalText : '');
        }
      }
    } else {
      item.tooltip = tooltipMatch[1];
    }
    
    // Extract icon
    let iconMatch = block.match(/\.setInterfaceIcon\(\s*"([^"]+)"\s*\)/);
    if (!iconMatch) {
      const iconConstMatch = block.match(/\.setInterfaceIcon\(\s*([A-Z0-9_.]+)\s*\)/);
      if (iconConstMatch && stringConsts[iconConstMatch[1]]) {
        item.icon = stringConsts[iconConstMatch[1]];
      } else if (iconConstMatch) {
        item.icon = iconConstMatch[1];
      }
    } else {
      item.icon = iconMatch[1];
    }
    
    if (item.name) {
      items.push(item);
    }
  }
  
  // Also find createUsableItem patterns
  const createItemRegex = /create(?:Usable|Perishable|PowerUp|Basic)Item\(\s*([A-Z0-9_]+)\s*\)\s*([\s\S]*?)\n\s*;/g;
  for (const m of content.matchAll(createItemRegex)) {
    const codeId = m[1];
    const block = m[2] || '';
    const item = {
      codeId,
      name: undefined,
      tooltip: undefined,
      icon: undefined,
      file: path.relative(ROOT_DIR, filePath)
    };
    const nameMatch = block.match(/\.setName\(\s*"([^"]+)"\s*\)/);
    if (nameMatch) item.name = nameMatch[1];
    const iconMatch = block.match(/\.setInterfaceIcon\(\s*"([^"]+)"\s*\)/);
    if (iconMatch) item.icon = iconMatch[1];
    if (item.name) {
      items.push(item);
    }
  }
  
  return items;
}

function main() {
  console.log('Extracting item data from Wurst source files...\n');
  
  const files = walkFiles(WURST_DIR, ['.wurst']);
  console.log(`Found ${files.length} Wurst files\n`);
  
  // First pass: collect all tooltip constants
  const allTooltipConstants = {};
  for (const file of files) {
    const content = readText(file);
    if (!content) continue;
    const tooltips = extractTooltipConstants(content);
    Object.assign(allTooltipConstants, tooltips);
  }
  console.log(`Found ${Object.keys(allTooltipConstants).length} tooltip constants\n`);
  
  // Second pass: extract items
  const allItems = [];
  for (const file of files) {
    const content = readText(file);
    if (!content) continue;
    // Quick check to skip non-item files
    if (!/CustomItemDefinition|createUsableItem|createPerishableItem|createPowerUpItem/.test(content)) continue;
    
    const items = extractItemsFromWurst(content, file, allTooltipConstants);
    allItems.push(...items);
  }
  
  // Deduplicate by codeId (keep first occurrence)
  const byCodeId = new Map();
  for (const item of allItems) {
    if (!byCodeId.has(item.codeId)) {
      byCodeId.set(item.codeId, item);
    }
  }
  
  const uniqueItems = Array.from(byCodeId.values()).sort((a, b) => {
    const nameA = a.name || a.codeId;
    const nameB = b.name || b.codeId;
    return nameA.localeCompare(nameB);
  });
  
  console.log(`Extracted ${uniqueItems.length} unique items\n`);
  
  // Write output
  const output = {
    generatedAt: new Date().toISOString(),
    tooltipConstants: allTooltipConstants,
    items: uniqueItems,
    stats: {
      totalItems: uniqueItems.length,
      itemsWithNames: uniqueItems.filter(i => i.name).length,
      itemsWithTooltips: uniqueItems.filter(i => i.tooltip).length,
      itemsWithTooltipConstants: uniqueItems.filter(i => i.tooltipConstant).length,
      itemsWithIcons: uniqueItems.filter(i => i.icon).length
    }
  };
  
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));
  
  console.log(`Output written to: ${path.relative(ROOT_DIR, OUTPUT_JSON)}\n`);
  console.log('Statistics:');
  console.log(`  Total items: ${output.stats.totalItems}`);
  console.log(`  Items with names: ${output.stats.itemsWithNames}`);
  console.log(`  Items with tooltips: ${output.stats.itemsWithTooltips}`);
  console.log(`  Items with tooltip constants: ${output.stats.itemsWithTooltipConstants}`);
  console.log(`  Items with icons: ${output.stats.itemsWithIcons}`);
  
  // Show some examples
  console.log('\nExample items:');
  const examples = uniqueItems.filter(i => i.name && i.tooltip).slice(0, 5);
  for (const item of examples) {
    console.log(`\n  ${item.name} (${item.codeId})`);
    if (item.tooltip) {
      console.log(`    Tooltip: ${item.tooltip.substring(0, 80)}...`);
    }
    if (item.tooltipConstant && !item.tooltip) {
      console.log(`    Tooltip constant: ${item.tooltipConstant} (not resolved)`);
    }
  }
}

main();


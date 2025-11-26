// Simple extractor and comparator for ITT items (CommonJS version)
// - Scans external Wurst files for item definitions and names
// - Reads our in-project ITEMS_DATA names
// - Reports mismatches and writes a snapshot JSON file

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const EXTERNAL_DIR = path.join(REPO_ROOT, 'external', 'island-troll-tribes');
const WURST_DIR = path.join(EXTERNAL_DIR, 'wurst');
const ITEMS_TS = path.join(REPO_ROOT, 'src', 'features', 'guides', 'data', 'items.ts');
const OUTPUT_JSON = path.join(REPO_ROOT, 'content', 'itt-external-items.json');

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

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// Extract item display names from a wurst file via heuristics
function extractItemsFromWurst(content, filePath) {
  const items = [];

  // Gather string constants within the file for later lookup (e.g., NAME, ICON)
  const stringConsts = {};
  const constRegex = /(?:public\s+)?(?:let|constant)\s+([A-Z0-9_]+)\s*=\s*"([^"]+)"/g;
  for (const m of content.matchAll(constRegex)) {
    stringConsts[m[1]] = m[2];
  }

  // Find CustomItemDefinition(...) and capture following chained setters within the same block
  const customDefRegex = /new\s+CustomItemDefinition\s*\(\s*([A-Z0-9_]+)[^)]*\)\s*([\s\S]*?)\)\s*\)/g;
  for (const m of content.matchAll(customDefRegex)) {
    const codeId = m[1];
    const block = m[2] || '';
    const item = { codeId, name: undefined, icon: undefined, file: filePath };

    // Try to resolve name from setNameEnhance("...") or setName("...")
    let nameMatch = block.match(/\.setNameEnhance\(\s*"([^"]+)"\s*\)/)
      || block.match(/\.setName\(\s*"([^"]+)"\s*\)/);
    if (!nameMatch) {
      // Try constant indirection: setNameEnhance(NAME)
      const nameConstMatch = block.match(/\.setName(?:Enhance)?\(\s*([A-Z0-9_]+)\s*\)/);
      if (nameConstMatch && stringConsts[nameConstMatch[1]]) {
        item.name = stringConsts[nameConstMatch[1]];
      }
    } else {
      item.name = nameMatch[1];
    }

    // Try to resolve icon
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

    if (item.name) items.push(item);
  }

  // Find createUsableItem(ITEM_...) chains with setName("...")
  const createItemRegex = /create(?:Usable|Perishable|PowerUp|Basic)Item\(\s*([A-Z0-9_]+)\s*\)\s*([\s\S]*?)\n\s*\)/g;
  for (const m of content.matchAll(createItemRegex)) {
    const codeId = m[1];
    const block = m[2] || '';
    const item = { codeId, name: undefined, icon: undefined, file: filePath };
    const nameMatch = block.match(/\.setName\(\s*"([^"]+)"\s*\)/);
    if (nameMatch) item.name = nameMatch[1];
    const iconMatch = block.match(/\.setInterfaceIcon\(\s*"([^"]+)"\s*\)/);
    if (iconMatch) item.icon = iconMatch[1];
    if (item.name) items.push(item);
  }

  return items;
}

function extractExternalItems() {
  const files = walkFiles(WURST_DIR, ['.wurst']);
  const all = [];
  for (const f of files) {
    const txt = readText(f);
    if (!txt) continue;
    if (!/CustomItemDefinition|createUsableItem|createPerishableItem|createPowerUpItem/.test(txt)) continue;
    const items = extractItemsFromWurst(txt, path.relative(REPO_ROOT, f));
    all.push(...items);
  }
  // Deduplicate by normalized name
  const byName = new Map();
  for (const it of all) {
    const key = normalizeName(it.name);
    const existing = byName.get(key);
    if (existing) {
      if (!existing.codeId && it.codeId) existing.codeId = it.codeId;
      if (!existing.icon && it.icon) existing.icon = it.icon;
      if (!existing.files.includes(it.file)) existing.files.push(it.file);
    } else {
      byName.set(key, { codeId: it.codeId, name: it.name, icon: it.icon, files: [it.file] });
    }
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function extractProjectItemNames() {
  const txt = readText(ITEMS_TS);
  const names = [];
  // Handles escaped quotes inside the string
  const nameRegex = /\bname\s*:\s*(?:'((?:\\.|[^'])*)'|"((?:\\.|[^"])*)")/g;
  for (const m of txt.matchAll(nameRegex)) {
    const raw = m[1] ?? m[2] ?? '';
    // Unescape common escapes
    const val = raw.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    names.push(val);
  }
  return names;
}

function main() {
  if (!fs.existsSync(WURST_DIR)) {
    console.error('External Wurst directory not found:', WURST_DIR);
    process.exit(2);
  }
  if (!fs.existsSync(ITEMS_TS)) {
    console.error('Project items file not found:', ITEMS_TS);
    process.exit(2);
  }

  const external = extractExternalItems();
  const projectNames = extractProjectItemNames();

  // Ensure content dir exists
  const contentDir = path.dirname(OUTPUT_JSON);
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

  // Write snapshot
  fs.writeFileSync(
    OUTPUT_JSON,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      count: external.length,
      items: external,
    }, null, 2)
  );

  // Compare
  const normalizeSet = (arr) => new Set(arr.map(normalizeName));
  const projSet = normalizeSet(projectNames);
  const extSet = new Set(external.map((e) => normalizeName(e.name)));

  const missingInProject = [];
  for (const e of external) {
    const key = normalizeName(e.name);
    if (!projSet.has(key)) missingInProject.push(e.name);
  }

  const missingInExternal = [];
  for (const n of projectNames) {
    const key = normalizeName(n);
    if (!extSet.has(key)) missingInExternal.push(n);
  }

  // Report
  const lines = [];
  lines.push(`ITT items snapshot written to: ${path.relative(REPO_ROOT, OUTPUT_JSON)}`);
  lines.push(`External items found: ${external.length}`);
  lines.push(`Project items declared: ${projectNames.length}`);
  lines.push('');
  lines.push(`Missing in project (${missingInProject.length}):`);
  lines.push(...missingInProject.map((n) => `  - ${n}`));
  lines.push('');
  lines.push(`Missing in external (${missingInExternal.length}):`);
  lines.push(...missingInExternal.map((n) => `  - ${n}`));

  console.log(lines.join('\n'));
}

if (require.main === module) {
  main();
}



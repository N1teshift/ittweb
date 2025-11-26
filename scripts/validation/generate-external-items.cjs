// Generate missing item entries from the external snapshot into a TS file
// Usage: node scripts/generate-external-items.cjs

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SNAPSHOT = path.join(REPO_ROOT, 'content', 'itt-external-items.json');
const ITEMS_TS = path.join(REPO_ROOT, 'src', 'features', 'guides', 'data', 'items.ts');
const OUT_TS = path.join(REPO_ROOT, 'src', 'features', 'guides', 'data', 'items.external.ts');

function readText(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function extractProjectItemNames() {
  const txt = readText(ITEMS_TS);
  const names = [];
  const nameRegex = /\bname\s*:\s*(?:'((?:\\.|[^'])*)'|"((?:\\.|[^"])*)")/g;
  for (const m of txt.matchAll(nameRegex)) {
    const raw = m[1] ?? m[2] ?? '';
    const val = raw.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    names.push(val);
  }
  return names;
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function mapCategory(name) {
  const s = name.toLowerCase();
  // Scrolls
  if (s.startsWith('scroll of ') || s.includes(' scroll')) {
    return { category: 'scrolls' };
  }
  // Potions & Essences
  if (s.includes('potion') || s.includes('essence')) {
    if (s.includes('healing')) return { category: 'potions', subcategory: 'healing-potions' };
    if (s.includes('mana')) return { category: 'potions', subcategory: 'mana-potions' };
    return { category: 'potions', subcategory: 'special-potions' };
  }
  // Armor
  if (/(coat|cuirass|robe|gloves|boots|cloak)/i.test(name)) {
    return { category: 'armor' };
  }
  // Weapons
  if (/(axe|staff|dagger|sword|tidebringer)/i.test(name)) {
    return { category: 'weapons' };
  }
  // Raw materials
  if (/(hide|bone|mushroom|leaf|seed|egg|scale|tinder)/i.test(name)) {
    const isHerbLike = /(mushroom|leaf|seed|herb)/i.test(name);
    return { category: 'raw-materials', subcategory: isHerbLike ? 'herbs' : 'materials' };
  }
  // Default bucket
  return { category: 'tools' };
}

function main() {
  if (!fs.existsSync(SNAPSHOT)) {
    console.error('Snapshot not found. Run: npm run check:items');
    process.exit(2);
  }
  const snap = JSON.parse(readText(SNAPSHOT));
  const externalNames = (snap.items || []).map((x) => x.name).filter(Boolean);
  const projectNames = extractProjectItemNames();
  const projSet = new Set(projectNames.map(normalizeName));
  const missing = externalNames.filter((n) => !projSet.has(normalizeName(n)));

  const entries = missing.map((name) => {
    const id = slugify(name);
    const { category, subcategory } = mapCategory(name);
    return { id, name, category, subcategory };
  });

  const header = `// Auto-generated from content/itt-external-items.json\n// Do not edit by hand. Re-generate via: npm run check:items && node scripts/generate-external-items.cjs\n\nimport type { ItemData } from '@/types/items';\n\n`;
  const bodyItems = entries.map((e) => {
    const lines = [];
    lines.push('{');
    lines.push(`  id: '${e.id}',`);
    lines.push(`  name: ${JSON.stringify(e.name)},`);
    lines.push(`  category: '${e.category}',`);
    if (e.subcategory) lines.push(`  subcategory: '${e.subcategory}',`);
    lines.push(`  description: 'Imported from game data snapshot.',`);
    lines.push('}');
    return lines.join('\n');
  }).join(',\n');

  const ts = `${header}export const EXTERNAL_ITEMS: ItemData[] = [\n${bodyItems}\n];\n`;
  fs.writeFileSync(OUT_TS, ts);

  console.log(`Wrote ${entries.length} items to ${path.relative(REPO_ROOT, OUT_TS)}`);
}

if (require.main === module) {
  main();
}



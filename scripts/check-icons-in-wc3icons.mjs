import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// List of missing icons from our previous scan
const missingIcons = [
  'BTNAdvancedStrengthOfTheMoon.png',
  'BTNAltarOfDepths.png',
  'BTNAncestralSpirit.png',
  'BTNBronzeDragon.png',
  'BTNCheese.png',
  'BTNCorrosiveBreath.png',
  'BTNCrate.png',
  'BTNDevourMagic.png',
  'BTNEnchantedBears.png',
  'BTNEntrapmentWard.png',
  'BTNEtherealFormOn.png',
  'BTNEvasion.png',
  'BTNFaerieFire.png',
  'BTNFeedBack.png',
  'BTNFireRocks.png',
  'BTNForceOfNature.png',
  'BTNFrost.png',
  'BTNFrostBolt.png',
  'BTNGoldmine.png',
  'BTNGreaterInvisibility.png',
  'BTNGreenDragon.png',
  'BTNHydraWarStomp.png',
  'BTNHornOfDoom.png',
  'BTNHowlOfTerror.png',
  'BTNIncinerateOn.png',
  'BTNJungleBeast.png',
  'BTNLoad.png',
  'BTNLocustSwarm.png',
  'bTNMammothBoots.png',
  'BTNMeatapult.png',
  'BTNNagaUnBurrow.png',
  'BTNNagaWeaponUp2.png',
  'BTNNetherDragon.png',
  'BTNOrbOfCorruption.png',
  'BTNPenguin.png',
  'BTNPolymorph.png',
  'BTNPortal.png',
  'BTNPurge.png',
  'BTNRazormaneChief.png',
  'BTNRedDragon.png',
  'BTNRedDragonDevour.png',
  'BTNReinforcedHides.png',
  'BTNRockGolem.png',
  'BTNRockTower.png',
  'BTNRoot.png',
  'BTNSacrificialPit.png',
  'BTNSeaGiantWarStomp.png',
  'BTNSkink.png',
  'BTNSpellSteal.png',
  'BTNStrengthOfTheWild.png',
  'BTNtemp.png',
  'BTNUndeadLoad.png',
  'BTNUndeadUnLoad.png',
  'BTNWindSerpent.png',
  'BTNWyvernRider.png',
  'DISBTNFeedPet.png',
  'DISPASBTNImmolation.png',
  'PASBTNSeaGiantPulverize.png'
];

// Path to wc3icons folder
const wc3iconsDir = resolve(projectRoot, '..', '..', '..', 'Pictures', 'wc3icons');
// Also try alternative path
const wc3iconsDirAlt = 'C:\\Users\\user\\Pictures\\wc3icons';

let actualWc3iconsDir = null;
if (existsSync(wc3iconsDir)) {
  actualWc3iconsDir = wc3iconsDir;
} else if (existsSync(wc3iconsDirAlt)) {
  actualWc3iconsDir = wc3iconsDirAlt;
} else {
  console.error('❌ wc3icons folder not found!');
  console.error(`   Tried: ${wc3iconsDir}`);
  console.error(`   Tried: ${wc3iconsDirAlt}`);
  process.exit(1);
}

console.log(`📁 Scanning wc3icons folder: ${actualWc3iconsDir}\n`);

// Get all files in wc3icons (case-insensitive map)
const wc3iconsFiles = new Map();
const files = readdirSync(actualWc3iconsDir);
for (const file of files) {
  if (file.toLowerCase().endsWith('.png')) {
    wc3iconsFiles.set(file.toLowerCase(), file);
  }
}

console.log(`📦 Found ${wc3iconsFiles.size} PNG files in wc3icons\n`);

// Normalize icon name for comparison (remove .png, lowercase)
function normalizeIconName(name) {
  return name.replace(/\.png$/i, '').toLowerCase();
}

// Find matches
const found = [];
const notFound = [];
const foundWithVariations = [];

for (const missingIcon of missingIcons) {
  const normalized = normalizeIconName(missingIcon);
  const exactMatch = wc3iconsFiles.get(missingIcon.toLowerCase());
  
  if (exactMatch) {
    found.push({ missing: missingIcon, found: exactMatch, type: 'exact' });
  } else {
    // Try to find variations (reforged, etc.)
    const baseName = normalized.replace(/-reforged$/, '');
    let variationMatch = null;
    
    // Check for exact base name
    if (wc3iconsFiles.has(baseName + '.png')) {
      variationMatch = wc3iconsFiles.get(baseName + '.png');
    }
    // Check for -reforged version
    else if (wc3iconsFiles.has(baseName + '-reforged.png')) {
      variationMatch = wc3iconsFiles.get(baseName + '-reforged.png');
    }
    // Check with btn prefix variations
    else {
      // Try without BTN prefix
      const withoutPrefix = baseName.replace(/^(btn|pasbtn|disbtn|dispasbtn)/, '');
      const variations = [
        'btn' + withoutPrefix + '.png',
        'btn' + withoutPrefix + '-reforged.png',
        'pasbtn' + withoutPrefix + '.png',
        'pasbtn' + withoutPrefix + '-reforged.png',
        'disbtn' + withoutPrefix + '.png',
        'disbtn' + withoutPrefix + '-reforged.png',
        'dispasbtn' + withoutPrefix + '.png',
        'dispasbtn' + withoutPrefix + '-reforged.png'
      ];
      
      for (const variant of variations) {
        if (wc3iconsFiles.has(variant.toLowerCase())) {
          variationMatch = wc3iconsFiles.get(variant.toLowerCase());
          break;
        }
      }
    }
    
    if (variationMatch) {
      foundWithVariations.push({ missing: missingIcon, found: variationMatch, type: 'variation' });
    } else {
      notFound.push(missingIcon);
    }
  }
}

// Print results
console.log('='.repeat(70));
console.log('📊 ICON AVAILABILITY REPORT');
console.log('='.repeat(70));
console.log(`\n✅ Found (exact match): ${found.length}`);
if (found.length > 0) {
  for (const item of found) {
    console.log(`   ${item.missing} → ${item.found}`);
  }
}

console.log(`\n✨ Found (variation): ${foundWithVariations.length}`);
if (foundWithVariations.length > 0) {
  for (const item of foundWithVariations) {
    console.log(`   ${item.missing} → ${item.found}`);
  }
}

console.log(`\n❌ Not found in wc3icons: ${notFound.length}`);
if (notFound.length > 0) {
  console.log('\n   Missing icons:');
  for (const icon of notFound) {
    console.log(`   ${icon}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log(`📈 SUMMARY:`);
console.log(`   Total missing icons: ${missingIcons.length}`);
console.log(`   ✅ Found in wc3icons: ${found.length + foundWithVariations.length}`);
console.log(`   ❌ Still missing: ${notFound.length}`);
console.log('='.repeat(70));

// Export list of found icons for easy copying
if (found.length > 0 || foundWithVariations.length > 0) {
  console.log('\n\n=== COPY-PASTE LIST OF FOUND ICONS ===\n');
  for (const item of [...found, ...foundWithVariations]) {
    console.log(item.found);
  }
}


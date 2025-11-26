/**
 * Copy missing icons from wc3icons folder to public/icons/itt with correct naming
 */

import { readFileSync, existsSync, readdirSync, copyFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Paths
const wc3iconsDir = 'C:\\Users\\user\\Pictures\\wc3icons';
const ittIconsDir = resolve(projectRoot, 'public/icons/itt');

// Mapping of missing icons to their source files in wc3icons
const iconMappings = [
  { missing: 'BTNAdvancedStrengthOfTheMoon.png', source: 'btnadvancedstrengthofthemoon.png' },
  { missing: 'BTNAltarOfDepths.png', source: 'btnaltarofdepths.png' },
  { missing: 'BTNAncestralSpirit.png', source: 'btnancestralspirit.png' },
  { missing: 'BTNBronzeDragon.png', source: 'btnbronzedragon.png' },
  { missing: 'BTNCheese.png', source: 'btncheese.png' },
  { missing: 'BTNCorrosiveBreath.png', source: 'btncorrosivebreath.png' },
  { missing: 'BTNCrate.png', source: 'btncrate.png' },
  { missing: 'BTNDevourMagic.png', source: 'btndevourmagic.png' },
  { missing: 'BTNEnchantedBears.png', source: 'btnenchantedbears.png' },
  { missing: 'BTNEntrapmentWard.png', source: 'btnentrapmentward.png' },
  { missing: 'BTNEtherealFormOn.png', source: 'btnetherealformon.png' },
  { missing: 'BTNEvasion.png', source: 'btnevasion.png' },
  { missing: 'BTNFaerieFire.png', source: 'btnfaeriefire.png' },
  { missing: 'BTNFeedBack.png', source: 'btnfeedback.png' },
  { missing: 'BTNFireRocks.png', source: 'btnfirerocks.png' },
  { missing: 'BTNForceOfNature.png', source: 'btnforceofnature.png' },
  { missing: 'BTNFrost.png', source: 'btnfrost.png' },
  { missing: 'BTNFrostBolt.png', source: 'btnfrostbolt.png' },
  { missing: 'BTNGoldmine.png', source: 'btngoldmine.png' },
  { missing: 'BTNGreaterInvisibility.png', source: 'btngreaterinvisibility.png' },
  { missing: 'BTNGreenDragon.png', source: 'btngreendragon.png' },
  { missing: 'BTNHydraWarStomp.png', source: 'btnhydrawarstomp.png' },
  { missing: 'BTNHornOfDoom.png', source: 'btnhornofdoom.png' },
  { missing: 'BTNHowlOfTerror.png', source: 'btnhowlofterror.png' },
  { missing: 'BTNIncinerateOn.png', source: 'btnincinerateon.png' },
  { missing: 'BTNJungleBeast.png', source: 'btnjunglebeast.png' },
  { missing: 'BTNLoad.png', source: 'btnload.png' },
  { missing: 'BTNLocustSwarm.png', source: 'btnlocustswarm.png' },
  { missing: 'BTNMeatapult.png', source: 'btnmeatapult.png' },
  { missing: 'BTNNagaUnBurrow.png', source: 'btnnagaunburrow.png' },
  { missing: 'BTNNagaWeaponUp2.png', source: 'btnnagaweaponup2.png' },
  { missing: 'BTNNetherDragon.png', source: 'btnnetherdragon.png' },
  { missing: 'BTNOrbOfCorruption.png', source: 'btnorbofcorruption.png' },
  { missing: 'BTNPenguin.png', source: 'btnpenguin.png' },
  { missing: 'BTNPolymorph.png', source: 'btnpolymorph.png' },
  { missing: 'BTNPortal.png', source: 'btnportal.png' },
  { missing: 'BTNPurge.png', source: 'btnpurge.png' },
  { missing: 'BTNRazormaneChief.png', source: 'btnrazormanechief.png' },
  { missing: 'BTNRedDragon.png', source: 'btnreddragon.png' },
  { missing: 'BTNRedDragonDevour.png', source: 'btnreddragondevour.png' },
  { missing: 'BTNReinforcedHides.png', source: 'btnreinforcedhides.png' },
  { missing: 'BTNRockGolem.png', source: 'btnrockgolem.png' },
  { missing: 'BTNRockTower.png', source: 'btnrocktower.png' },
  { missing: 'BTNRoot.png', source: 'btnroot.png' },
  { missing: 'BTNSacrificialPit.png', source: 'btnsacrificialpit.png' },
  { missing: 'BTNSeaGiantWarStomp.png', source: 'btnseagiantwarstomp.png' },
  { missing: 'BTNSkink.png', source: 'btnskink.png' },
  { missing: 'BTNSpellSteal.png', source: 'btnspellsteal.png' },
  { missing: 'BTNStrengthOfTheWild.png', source: 'btnstrengthofthewild.png' },
  { missing: 'BTNtemp.png', source: 'btntemp.png' },
  { missing: 'BTNUndeadLoad.png', source: 'btnundeadload.png' },
  { missing: 'BTNUndeadUnLoad.png', source: 'btnundeadunload.png' },
  { missing: 'BTNWindSerpent.png', source: 'btnwindserpent.png' },
  { missing: 'BTNWyvernRider.png', source: 'btnwyvernrider.png' },
  { missing: 'PASBTNSeaGiantPulverize.png', source: 'pasbtnseagiantpulverize.png' },
  { missing: 'DISPASBTNImmolation.png', source: 'pasbtnimmolation.png' }, // variation
];

/**
 * Get all files in wc3icons (case-insensitive map)
 */
function getWc3iconsMap() {
  if (!existsSync(wc3iconsDir)) {
    throw new Error(`wc3icons directory not found: ${wc3iconsDir}`);
  }
  
  const files = readdirSync(wc3iconsDir);
  const fileMap = new Map();
  
  for (const file of files) {
    if (file.toLowerCase().endsWith('.png')) {
      fileMap.set(file.toLowerCase(), file);
    }
  }
  
  return fileMap;
}

/**
 * Find the actual filename in wc3icons (handles case variations)
 */
function findSourceFile(sourceName, wc3iconsMap) {
  // Try exact lowercase match
  if (wc3iconsMap.has(sourceName.toLowerCase())) {
    return wc3iconsMap.get(sourceName.toLowerCase());
  }
  
  // Try with -reforged suffix
  const reforged = sourceName.toLowerCase().replace(/\.png$/, '-reforged.png');
  if (wc3iconsMap.has(reforged)) {
    return wc3iconsMap.get(reforged);
  }
  
  return null;
}

/**
 * Main function
 */
function main() {
  console.log('🔄 Copying icons from wc3icons to itt folder...\n');
  console.log(`📁 Source: ${wc3iconsDir}`);
  console.log(`📁 Destination: ${ittIconsDir}\n`);
  
  // Ensure destination directory exists
  if (!existsSync(ittIconsDir)) {
    console.log(`📂 Creating destination directory...`);
    mkdirSync(ittIconsDir, { recursive: true });
  }
  
  // Get wc3icons file map
  console.log('📦 Reading wc3icons folder...');
  const wc3iconsMap = getWc3iconsMap();
  console.log(`   Found ${wc3iconsMap.size} PNG files\n`);
  
  // Process each mapping
  let copied = 0;
  let skipped = 0;
  let notFound = 0;
  const results = [];
  
  for (const mapping of iconMappings) {
    const sourceFile = findSourceFile(mapping.source, wc3iconsMap);
    
    if (!sourceFile) {
      console.log(`❌ Not found: ${mapping.source}`);
      notFound++;
      results.push({ missing: mapping.missing, status: 'NOT_FOUND', source: mapping.source });
      continue;
    }
    
    const sourcePath = resolve(wc3iconsDir, sourceFile);
    const destPath = resolve(ittIconsDir, mapping.missing);
    
    // Check if already exists
    if (existsSync(destPath)) {
      console.log(`⏭️  Already exists: ${mapping.missing}`);
      skipped++;
      results.push({ missing: mapping.missing, status: 'EXISTS', source: sourceFile });
      continue;
    }
    
    // Check if source exists
    if (!existsSync(sourcePath)) {
      console.log(`❌ Source file not found: ${sourcePath}`);
      notFound++;
      results.push({ missing: mapping.missing, status: 'SOURCE_NOT_FOUND', source: sourceFile });
      continue;
    }
    
    // Copy the file
    try {
      copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied: ${sourceFile} → ${mapping.missing}`);
      copied++;
      results.push({ missing: mapping.missing, status: 'COPIED', source: sourceFile });
    } catch (error) {
      console.error(`❌ Error copying ${mapping.missing}:`, error.message);
      results.push({ missing: mapping.missing, status: 'ERROR', source: sourceFile, error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 COPY SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Successfully copied: ${copied}`);
  console.log(`⏭️  Already existed (skipped): ${skipped}`);
  console.log(`❌ Not found: ${notFound}`);
  console.log(`📦 Total processed: ${iconMappings.length}`);
  console.log('='.repeat(70));
  
  // Show not found items
  const notFoundItems = results.filter(r => r.status === 'NOT_FOUND' || r.status === 'SOURCE_NOT_FOUND');
  if (notFoundItems.length > 0) {
    console.log('\n⚠️  Icons not found in wc3icons:');
    for (const item of notFoundItems) {
      console.log(`   ${item.missing} (looked for: ${item.source})`);
    }
  }
  
  // Show errors
  const errorItems = results.filter(r => r.status === 'ERROR');
  if (errorItems.length > 0) {
    console.log('\n❌ Errors during copy:');
    for (const item of errorItems) {
      console.log(`   ${item.missing}: ${item.error}`);
    }
  }
  
  if (copied > 0) {
    console.log(`\n✨ Successfully copied ${copied} icons!`);
  }
}

main();


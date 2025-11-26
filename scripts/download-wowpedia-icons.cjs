const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const WIKI_BASE_URL = 'https://wowpedia.fandom.com';
const ICONS_PAGE_URL = 'https://wowpedia.fandom.com/wiki/Wowpedia:Warcraft_III_icons';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons', 'itt', 'wowpedia');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Rate limiting: wait between downloads
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        return downloadFile(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

function extractIconUrls(html) {
  const urls = new Set();
  
  // Match img tags with src attributes pointing to static.wikia.nocookie.net
  const imgRegex = /<img[^>]+src=["']([^"']*static\.wikia\.nocookie\.net[^"']*\.(?:png|jpg|jpeg))[^"']*["'][^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    let url = match[1];
    
    // Clean up URL - remove query parameters and get full resolution
    // Replace /revision/latest with /revision/latest/scale-to-width-down/64 to get full size
    url = url.replace(/\/revision\/latest[^"']*/, '/revision/latest');
    
    // Get the full resolution version
    url = url.replace(/\/scale-to-width-down\/\d+/, '');
    
    // Make sure it's a full URL
    if (url.startsWith('//')) {
      url = 'https:' + url;
    } else if (url.startsWith('/')) {
      url = 'https://static.wikia.nocookie.net' + url;
    }
    
    urls.add(url);
  }
  
  return Array.from(urls);
}

function extractFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = path.basename(pathname);
    
    // Clean filename - remove query params and get base name
    return filename.split('?')[0].split('/').pop();
  } catch (err) {
    // Fallback: extract from URL string
    const match = url.match(/\/([^\/]+\.(?:png|jpg|jpeg))(?:\?|$)/i);
    return match ? match[1] : `icon_${Date.now()}.png`;
  }
}

function normalizeFilename(filename) {
  // Normalize to lowercase and ensure .png extension
  let normalized = filename.toLowerCase();
  if (!normalized.endsWith('.png') && !normalized.endsWith('.jpg') && !normalized.endsWith('.jpeg')) {
    normalized += '.png';
  }
  return normalized;
}

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return fetchPage(response.headers.location).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch page: ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function downloadIcons() {
  console.log('📥 Fetching Wowpedia icons page...\n');
  
  try {
    const html = await fetchPage(ICONS_PAGE_URL);
    console.log('✅ Page fetched successfully\n');
    
    const iconUrls = extractIconUrls(html);
    console.log(`🔍 Found ${iconUrls.length} icon URLs\n`);
    
    if (iconUrls.length === 0) {
      console.log('⚠️  No icons found. The page structure might have changed.');
      return;
    }
    
    console.log('📥 Downloading icons...\n');
    
    let downloaded = 0;
    let skipped = 0;
    let errors = 0;
    const downloadedFiles = new Set();
    
    for (let i = 0; i < iconUrls.length; i++) {
      const url = iconUrls[i];
      const filename = normalizeFilename(extractFilenameFromUrl(url));
      
      // Skip if we've already downloaded this filename
      if (downloadedFiles.has(filename)) {
        console.log(`⏭️  [${i + 1}/${iconUrls.length}] Skipping duplicate: ${filename}`);
        skipped++;
        continue;
      }
      
      const filepath = path.join(OUTPUT_DIR, filename);
      
      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`⏭️  [${i + 1}/${iconUrls.length}] Already exists: ${filename}`);
        skipped++;
        downloadedFiles.add(filename);
        continue;
      }
      
      try {
        await downloadFile(url, filepath);
        downloadedFiles.add(filename);
        downloaded++;
        console.log(`✅ [${i + 1}/${iconUrls.length}] Downloaded: ${filename}`);
        
        // Rate limiting: wait 200ms between downloads
        if (i < iconUrls.length - 1) {
          await delay(200);
        }
      } catch (err) {
        errors++;
        console.log(`❌ [${i + 1}/${iconUrls.length}] Failed: ${filename} - ${err.message}`);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Downloaded: ${downloaded}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📁 Output directory: ${OUTPUT_DIR}`);
    console.log('\n💡 Icons are saved in the wowpedia subdirectory.');
    console.log('   You can review them and move/copy the ones you need to the appropriate category folders.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  downloadIcons();
}

module.exports = { downloadIcons, extractIconUrls };


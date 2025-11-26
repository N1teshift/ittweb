import type { NextApiRequest, NextApiResponse } from 'next';
import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';

type IconFile = {
  filename: string;
  path: string;
  category: string;
  subdirectory?: string;
};

// Recursively find all .png files in a directory
async function findPngFiles(dir: string, baseDir: string, category: string, subdir: string = ''): Promise<IconFile[]> {
  const files: IconFile[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip certain directories if needed, or recursively search all
        const newSubdir = subdir ? `${subdir}/${entry.name}` : entry.name;
        const subFiles = await findPngFiles(fullPath, baseDir, category, newSubdir);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
        // Skip texture files and unit files
        const nameLower = entry.name.toLowerCase();
        if (!nameLower.includes('texture') && !nameLower.includes('pasunit')) {
          // Calculate relative path from baseDir
          const relativePath = relative(baseDir, fullPath).replace(/\\/g, '/');
          const pathParts = relativePath.split('/');
          const filename = pathParts[pathParts.length - 1];
          
          // Determine subdirectory if file is in a subdirectory
          // relativePath from baseDir (public/icons/itt) will be like:
          // - 'abilities/btnbloodlust.png' (no subdir)
          // - 'abilities/enabled/btnbloodlust.png' (subdir: 'enabled')
          const actualSubdir = pathParts.length > 2 ? pathParts.slice(1, -1).join('/') : undefined;
          
          // Debug logging for specific file
          if (filename.toLowerCase().includes('bloodlust')) {
            console.log(`[API] Found bloodlust: filename=${filename}, relativePath=${relativePath}, pathParts=${JSON.stringify(pathParts)}, actualSubdir=${actualSubdir}, category=${category}`);
          }
          
          files.push({
            filename,
            path: `/icons/itt/${relativePath}`,
            category,
            subdirectory: actualSubdir,
          });
        }
      }
    }
  } catch (err) {
    console.warn(`Error reading directory ${dir}:`, err);
  }
  
  return files;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IconFile[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const iconsDir = join(process.cwd(), 'public', 'icons', 'itt');
    const categories = ['abilities', 'items', 'buildings', 'trolls', 'unclassified', 'base', 'wowpedia'];
    const allIcons: IconFile[] = [];

    for (const category of categories) {
      const categoryPath = join(iconsDir, category);
      try {
        const categoryExists = await stat(categoryPath).then(s => s.isDirectory()).catch(() => false);
        if (categoryExists) {
          const categoryIcons = await findPngFiles(categoryPath, iconsDir, category);
          allIcons.push(...categoryIcons);
          console.log(`[API] Found ${categoryIcons.length} icons in ${category}`);
          
          // Check for bloodlust specifically
          const bloodlustIcons = categoryIcons.filter(icon => icon.filename.toLowerCase().includes('bloodlust'));
          if (bloodlustIcons.length > 0) {
            console.log(`[API] Bloodlust icons in ${category}:`, bloodlustIcons);
          }
        }
      } catch (err) {
        // Category directory might not exist, skip it
        console.warn(`Could not read category ${category}:`, err);
      }
    }
    
    console.log(`Total icons found: ${allIcons.length}`);

    // Sort by category, then by filename
    allIcons.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.filename.localeCompare(b.filename);
    });

    return res.status(200).json(allIcons);
  } catch (error) {
    console.error('Error listing icons:', error);
    return res.status(500).json({ error: 'Failed to list icons' });
  }
}


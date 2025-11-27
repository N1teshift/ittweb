import type { NextApiRequest, NextApiResponse } from 'next';
import { readdir } from 'fs/promises';
import { join } from 'path';

type IconFile = {
  filename: string;
  path: string;
  category: string;
  subdirectory?: string;
};

// Find all .png files in a flat directory
async function findPngFiles(dir: string, baseDir: string, category: string): Promise<IconFile[]> {
  const files: IconFile[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip subdirectories (all icons should be flat now)
      if (entry.isDirectory()) {
        continue;
      }
      
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
        // Skip texture files and unit files
        const nameLower = entry.name.toLowerCase();
        if (!nameLower.includes('texture') && !nameLower.includes('pasunit')) {
          const filename = entry.name;
          
          files.push({
            filename,
            path: `/icons/itt/${filename}`,
            category,
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
    // All icons are now in a flat directory structure
    const allIcons: IconFile[] = [];

    try {
      const icons = await findPngFiles(iconsDir, iconsDir, 'icons');
      allIcons.push(...icons);
      console.log(`[API] Found ${icons.length} icons in flat directory`);
    } catch (err) {
      console.warn(`Could not read icons directory:`, err);
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


/**
 * Migration script to move posts from filesystem (content/posts/*.mdx) to Firestore
 * 
 * Usage: node scripts/migrate-posts-to-firestore.mjs
 * 
 * This script reads all .mdx and .md files from content/posts/ and creates
 * corresponding documents in the Firestore 'posts' collection.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const POSTS_DIR = path.join(__dirname, '..', 'content', 'posts');

// Firebase Admin SDK setup would be needed here for migration
// For now, this is a template showing how to read and parse the files

function readPostFiles() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('Posts directory does not exist:', POSTS_DIR);
    return [];
  }

  const files = fs.readdirSync(POSTS_DIR);
  const postFiles = files.filter(
    (file) => file.endsWith('.md') || file.endsWith('.mdx')
  );

  console.log(`Found ${postFiles.length} post file(s)`);

  return postFiles.map((file) => {
    const filePath = path.join(POSTS_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(fileContent);
    const slug = file.replace(/\.(md|mdx)$/i, '');

    return {
      slug,
      title: typeof data.title === 'string' ? data.title : slug,
      date: typeof data.date === 'string' ? data.date : new Date().toISOString(),
      excerpt: typeof data.excerpt === 'string' ? data.excerpt : undefined,
      content,
    };
  });
}

async function main() {
  console.log('Reading posts from filesystem...');
  const posts = readPostFiles();

  console.log('\nPosts found:');
  posts.forEach((post) => {
    console.log(`- ${post.slug}: "${post.title}" (${post.date})`);
  });

  console.log('\n⚠️  Migration to Firestore not yet implemented.');
  console.log('To migrate posts:');
  console.log('1. Use the API endpoint POST /api/posts with each post data');
  console.log('2. Or use Firebase Admin SDK in this script');
  console.log('\nPost data structure:');
  posts.forEach((post) => {
    console.log(JSON.stringify(post, null, 2));
  });
}

main().catch(console.error);



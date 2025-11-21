import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export type PostMeta = {
  title: string;
  date: string; // ISO string preferred
  slug: string;
  excerpt?: string;
};

export type LoadedPost = {
  meta: PostMeta;
  content: string;
};

export type SerializedPost = {
  meta: PostMeta;
  mdxSource: MDXRemoteSerializeResult;
};

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

function ensurePostsDirExists(): void {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
}

export function listPostSlugs(): string[] {
  ensurePostsDirExists();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => file.replace(/\.(md|mdx)$/i, ''));
}

export function loadPostBySlug(slug: string): LoadedPost | null {
  ensurePostsDirExists();
  const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`);
  const mdPath = path.join(POSTS_DIR, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;

  const file = fs.readFileSync(filePath, 'utf8');
  const { content, data } = matter(file);

  const meta: PostMeta = {
    title: typeof data.title === 'string' ? data.title : slug,
    date: typeof data.date === 'string' ? data.date : new Date().toISOString(),
    slug,
    excerpt: typeof data.excerpt === 'string' ? data.excerpt : undefined,
  };

  return { meta, content };
}

export function loadAllPosts(): LoadedPost[] {
  return listPostSlugs()
    .map((slug) => loadPostBySlug(slug))
    .filter((p): p is LoadedPost => Boolean(p))
    .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}

export async function loadLatestPostSerialized(): Promise<SerializedPost | null> {
  const posts = loadAllPosts();
  if (posts.length === 0) return null;
  const latest = posts[0];

  const mdxSource = await serialize(latest.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
      format: 'mdx',
    },
    parseFrontmatter: false,
  });

  return { meta: latest.meta, mdxSource };
}



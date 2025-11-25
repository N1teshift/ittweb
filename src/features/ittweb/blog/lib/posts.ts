import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { getAllPosts, getPostBySlug, getLatestPost } from './postService';
import type { Post } from '@/types/post';

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

/**
 * Convert Post to PostMeta
 */
function postToMeta(post: Post): PostMeta {
  return {
    title: post.title,
    date: post.date,
    slug: post.slug,
    excerpt: post.excerpt,
  };
}

/**
 * List all post slugs
 */
export async function listPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
}

/**
 * Load a post by slug
 */
export async function loadPostBySlug(slug: string): Promise<LoadedPost | null> {
  const post = await getPostBySlug(slug);
  if (!post) return null;

  return {
    meta: postToMeta(post),
    content: post.content,
  };
}

/**
 * Load all posts
 */
export async function loadAllPosts(): Promise<LoadedPost[]> {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    meta: postToMeta(post),
    content: post.content,
  }));
}

/**
 * Load and serialize the latest post for display
 */
export async function loadLatestPostSerialized(): Promise<SerializedPost | null> {
  const latest = await getLatestPost();
  if (!latest) return null;

  const mdxSource = await serialize(latest.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
      format: 'mdx',
    },
    parseFrontmatter: false,
  });

  return { meta: postToMeta(latest), mdxSource };
}



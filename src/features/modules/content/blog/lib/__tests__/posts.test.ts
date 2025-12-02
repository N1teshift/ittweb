import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import {
  listPostSlugs,
  loadAllPosts,
  loadLatestPostSerialized,
  loadPostBySlug,
} from '../posts';
import { getAllPosts, getLatestPost, getPostBySlug } from '../postService';
import type { Post } from '@/types/post';

jest.mock('remark-gfm', () => jest.fn());
jest.mock('rehype-slug', () => jest.fn());
jest.mock('rehype-autolink-headings', () => jest.fn());
jest.mock('../postService', () => ({
  getAllPosts: jest.fn(),
  getPostBySlug: jest.fn(),
  getLatestPost: jest.fn(),
}));

jest.mock('next-mdx-remote/serialize', () => ({
  serialize: jest.fn(),
}));

type SerializeMock = jest.MockedFunction<typeof serialize>;

describe('Blog posts loading and validation', () => {
  const getAllPostsMock = getAllPosts as jest.MockedFunction<typeof getAllPosts>;
  const getPostBySlugMock = getPostBySlug as jest.MockedFunction<typeof getPostBySlug>;
  const getLatestPostMock = getLatestPost as jest.MockedFunction<typeof getLatestPost>;
  const serializeMock = serialize as SerializeMock;

  const basePost: Post = {
    id: 'post-1',
    title: 'First Post',
    content: '# Hello world',
    date: '2024-01-01T00:00:00.000Z',
    slug: 'first-post',
    excerpt: 'A hello world post',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    creatorName: 'Tester',
    createdByDiscordId: null,
    submittedAt: '2024-01-01T00:00:00.000Z',
    published: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all unique slugs for valid posts', async () => {
    getAllPostsMock.mockResolvedValue([
      basePost,
      { ...basePost, id: 'post-2', slug: 'first-post' },
      { ...basePost, id: 'post-3', slug: 'second-post', title: '', content: '' },
    ]);

    const slugs = await listPostSlugs();

    expect(slugs).toEqual(['first-post']);
    expect(getAllPostsMock).toHaveBeenCalledTimes(1);
  });

  it('loads a post by slug with meta and content', async () => {
    getPostBySlugMock.mockResolvedValue(basePost);

    const result = await loadPostBySlug('first-post');

    expect(result).toEqual({
      meta: {
        id: 'post-1',
        title: 'First Post',
        date: '2024-01-01T00:00:00.000Z',
        slug: 'first-post',
        excerpt: 'A hello world post',
        creatorName: 'Tester',
        createdByDiscordId: null,
      },
      content: '# Hello world',
    });
  });

  it('returns null when a post fails validation', async () => {
    getPostBySlugMock.mockResolvedValue({ ...basePost, title: '' });

    const result = await loadPostBySlug('first-post');

    expect(result).toBeNull();
  });

  it('loads all valid posts and filters invalid ones', async () => {
    getAllPostsMock.mockResolvedValue([
      basePost,
      { ...basePost, id: 'post-2', slug: 'second-post', title: 'Second', date: 'invalid-date' },
    ]);

    const result = await loadAllPosts();

    expect(result).toHaveLength(1);
    expect(result[0].meta.slug).toBe('first-post');
  });

  it('serializes the latest valid post with MDX options', async () => {
    const mdxResult = { compiledSource: '<p>content</p>' } as unknown as MDXRemoteSerializeResult;
    getLatestPostMock.mockResolvedValue({ ...basePost, content: '---\ntitle: Frontmatter\n---\n# Hello' });
    serializeMock.mockResolvedValue(mdxResult);

    const result = await loadLatestPostSerialized();

    expect(result).toEqual({
      meta: {
        id: 'post-1',
        title: 'First Post',
        date: '2024-01-01T00:00:00.000Z',
        slug: 'first-post',
        excerpt: 'A hello world post',
        creatorName: 'Tester',
        createdByDiscordId: null,
      },
      mdxSource: mdxResult,
    });

    expect(serializeMock).toHaveBeenCalledWith(expect.any(String), {
      mdxOptions: expect.objectContaining({
        remarkPlugins: expect.any(Array),
        rehypePlugins: expect.any(Array),
        format: 'mdx',
      }),
      parseFrontmatter: false,
    });
  });

  it('returns null for invalid latest post and does not serialize', async () => {
    getLatestPostMock.mockResolvedValue({ ...basePost, content: '' });

    const result = await loadLatestPostSerialized();

    expect(result).toBeNull();
    expect(serializeMock).not.toHaveBeenCalled();
  });
});


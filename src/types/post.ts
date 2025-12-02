import { Timestamp } from 'firebase/firestore';

export interface Post {
  id: string;
  title: string;
  content: string; // MDX/Markdown content
  date: string; // ISO date string
  slug: string;
  excerpt?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  creatorName: string;
  createdByDiscordId?: string | null;
  submittedAt?: Timestamp | string;
  published: boolean; // Allow draft posts
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
}

export interface CreatePost {
  title: string;
  content: string;
  date: string; // ISO date string
  slug: string;
  excerpt?: string;
  creatorName: string;
  createdByDiscordId?: string | null;
  submittedAt?: Timestamp | string;
  published?: boolean;
}

// PostMeta is defined in src/features/modules/blog/lib/posts.ts









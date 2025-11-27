export interface Post {
  id: string;
  title: string;
  content: string; // MDX/Markdown content
  date: string; // ISO date string
  slug: string;
  excerpt?: string;
  createdAt: string;
  updatedAt: string;
  createdByDiscordId?: string | null;
  createdByName?: string;
  published: boolean; // Allow draft posts
}

export interface CreatePost {
  title: string;
  content: string;
  date: string; // ISO date string
  slug: string;
  excerpt?: string;
  createdByDiscordId?: string | null;
  createdByName?: string;
  published?: boolean;
}

export interface PostMeta {
  title: string;
  date: string; // ISO string preferred
  slug: string;
  excerpt?: string;
}






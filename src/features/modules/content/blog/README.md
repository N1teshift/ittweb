# Blog Module

> Date: 2025-12-02

**Purpose**: Blog post management system with MDX support.

## Exports

### Components
- `BlogPost` - Display blog post content
- `NewPostForm` - Create new blog post form
- `EditPostForm` - Edit existing blog post form
- `NewPostFormModal` - Modal wrapper for new post form
- `PostDeleteDialog` - Delete confirmation dialog

### Hooks
- `useNewPostForm` - New post form state management
- `useEditPostForm` - Edit post form state management

### Services
- `postService` - Blog post CRUD operations
- `posts` - Post data utilities (MDX parsing, etc.)

### Types
- `Post` - Blog post structure (see `src/types/post.ts`)

## Usage

```typescript
import { useNewPostForm } from '@/features/modules/content/blog/hooks/useNewPostForm';
import { createPost, getPostById } from '@/features/modules/content/blog/lib/postService';

// Use new post form hook
const { formState, handleSubmit, handleChange } = useNewPostForm();

// Create post
const post = await createPost({
  title: 'New Post',
  content: '# Markdown content',
  published: true
});

// Get post
const post = await getPostById('post-id');
```

## API Routes

- `GET /api/posts` - List blog posts
- `GET /api/posts/[id]` - Get blog post
- `POST /api/posts` - Create blog post (authenticated)
- `PUT /api/posts/[id]` - Update blog post (authenticated)
- `DELETE /api/posts/[id]` - Delete blog post (authenticated)

## Related Documentation

- [Post Type Definition](../../../../src/types/post.ts)



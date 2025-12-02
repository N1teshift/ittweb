# Blog API

Blog post management endpoints.

## `GET /api/posts`

List blog posts.

**Query Parameters**:
- `published` (boolean, optional) - Filter by published status
- `limit` (number, optional) - Results limit

**Response**:
```typescript
{
  success: true;
  data: Post[];
}
```

## `GET /api/posts/[id]`

Get blog post by ID.

**Response**:
```typescript
{
  success: true;
  data: Post;
}
```

## `POST /api/posts`

Create blog post. **Requires authentication.**

**Request Body**:
```typescript
{
  title: string;
  content: string; // MDX content
  published: boolean;
  // ... other fields
}
```

**Response**:
```typescript
{
  success: true;
  id: string;
}
```

## `PUT /api/posts/[id]`

Update blog post. **Requires authentication.**

**Request Body**:
```typescript
Partial<Post>
```

**Response**:
```typescript
{
  success: true;
  data: Post;
}
```

## `DELETE /api/posts/[id]`

Delete blog post. **Requires authentication.**

**Response**:
```typescript
{
  success: true;
}
```




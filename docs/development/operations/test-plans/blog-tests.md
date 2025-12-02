# Blog Tests

This document outlines all tests needed for the blog module including services, API routes, components, hooks, and post loading/serialization.

## Post Service

### `src/features/modules/blog/lib/postService.ts`

- [ ] Test `getAllPosts` retrieves all posts
  - **What**: Verify all posts are retrieved from Firestore
  - **Expected**: Returns array of all post documents
  - **Edge cases**: Empty collection, very large collection, permission errors

- [ ] Test `getAllPosts` filters deleted posts
  - **What**: Verify soft-deleted posts are excluded
  - **Expected**: Only non-deleted posts returned
  - **Edge cases**: All posts deleted, recently deleted, deleted flag variations

- [ ] Test `getAllPosts` filters by published status
  - **What**: Verify only published posts are returned (unless admin)
  - **Expected**: Only published posts in results
  - **Edge cases**: All unpublished, mixed status, draft posts

- [ ] Test `getPostBySlug` retrieves post by slug
  - **What**: Verify post is retrieved by slug
  - **Expected**: Returns post document matching slug
  - **Edge cases**: Invalid slug format, missing post, duplicate slugs

- [ ] Test `getPostBySlug` returns null for non-existent post
  - **What**: Verify non-existent slug returns null
  - **Expected**: Returns null when post doesn't exist
  - **Edge cases**: Deleted post, invalid slug, slug variations

- [ ] Test `getLatestPost` returns most recent post
  - **What**: Verify latest post by date is returned
  - **Expected**: Returns post with most recent date
  - **Edge cases**: No posts, same dates, future dates

- [ ] Test `createPost` creates new post
  - **What**: Verify new post document is created
  - **Expected**: Post document created with provided data and generated ID
  - **Edge cases**: Missing required fields, duplicate slug, permission errors

- [ ] Test `createPost` validates required fields
  - **What**: Verify required fields are validated
  - **Expected**: Throws error or returns validation failure for missing fields
  - **Edge cases**: Partial data, invalid field types, null values

- [ ] Test `updatePost` updates existing post
  - **What**: Verify post document is updated
  - **Expected**: Post document updated, old data replaced/merged correctly
  - **Edge cases**: Non-existent post, concurrent updates, permission errors

- [ ] Test `deletePost` soft deletes post
  - **What**: Verify post is soft-deleted (flagged, not removed)
  - **Expected**: Post marked as deleted, not physically removed
  - **Edge cases**: Already deleted, non-existent post, permission errors

- [ ] Test post slug uniqueness validation
  - **What**: Verify slug uniqueness is enforced
  - **Expected**: Duplicate slugs rejected with error
  - **Edge cases**: Case variations, slug generation, concurrent creation

## Posts API Routes

### `src/pages/api/posts/index.ts`

- [ ] Test GET returns list of posts
  - **What**: Verify GET endpoint returns array of posts
  - **Expected**: Returns 200 with array of post objects
  - **Edge cases**: Empty list, large datasets, pagination

- [ ] Test GET filters published posts
  - **What**: Verify only published posts returned (unless admin)
  - **Expected**: Only published posts in response
  - **Edge cases**: All unpublished, mixed status, draft access

- [ ] Test POST creates new post
  - **What**: Verify POST endpoint creates new post
  - **Expected**: Returns 201 with created post data
  - **Edge cases**: Missing fields, invalid data, duplicate slug

- [ ] Test POST validates request body
  - **What**: Verify request body validation works
  - **Expected**: Invalid bodies return 400 with error message
  - **Edge cases**: Missing required fields, wrong types, extra fields

- [ ] Test POST requires authentication
  - **What**: Verify unauthenticated requests are rejected
  - **Expected**: Returns 401 for unauthenticated requests
  - **Edge cases**: Expired tokens, invalid tokens, missing auth header

### `src/pages/api/posts/[id].ts`

- [ ] Test GET returns post by ID
  - **What**: Verify GET endpoint returns single post
  - **Expected**: Returns 200 with post object
  - **Edge cases**: Invalid ID format, missing post, deleted post

- [ ] Test GET returns 404 for non-existent post
  - **What**: Verify non-existent post returns 404
  - **Expected**: Returns 404 Not Found
  - **Edge cases**: Invalid ID format, deleted post, slug vs ID

- [ ] Test PUT updates post
  - **What**: Verify PUT endpoint updates post
  - **Expected**: Returns 200 with updated post data
  - **Edge cases**: Non-existent post, invalid data, permission errors

- [ ] Test PUT validates request body
  - **What**: Verify request body validation
  - **Expected**: Invalid bodies return 400
  - **Edge cases**: Missing fields, wrong types, immutable fields

- [ ] Test DELETE soft deletes post
  - **What**: Verify DELETE endpoint soft-deletes post
  - **Expected**: Returns 200 or 204, post marked as deleted
  - **Edge cases**: Non-existent post, already deleted, permission errors

## Blog Components

### `src/features/modules/blog/components/BlogPost.tsx`

- [ ] Test renders post content
  - **What**: Verify post content is rendered
  - **Expected**: Post body/content displayed correctly
  - **Edge cases**: Long content, special characters, formatting

- [ ] Test renders MDX content
  - **What**: Verify MDX content is compiled and rendered
  - **Expected**: MDX compiled to React components and rendered
  - **Edge cases**: Invalid MDX, complex MDX, MDX with components

- [ ] Test renders metadata
  - **What**: Verify post metadata is displayed
  - **Expected**: Title, date, author, tags shown correctly
  - **Edge cases**: Missing metadata, long metadata, special characters

- [ ] Test renders edit button for author
  - **What**: Verify edit button shown only to post author
  - **Expected**: Edit button visible to author, hidden to others
  - **Edge cases**: Not logged in, different user, admin access

### `src/features/modules/blog/components/NewPostForm.tsx`

- [ ] Test renders form fields
  - **What**: Verify all form fields are rendered
  - **Expected**: All required fields present and accessible
  - **Edge cases**: Missing fields, disabled fields, conditional fields

- [ ] Test validates required fields
  - **What**: Verify required field validation works
  - **Expected**: Validation errors shown for missing required fields
  - **Edge cases**: All fields empty, partial completion, field dependencies

- [ ] Test handles form submission
  - **What**: Verify form submission creates post
  - **Expected**: Post created on submit, success message shown
  - **Edge cases**: Network errors, validation errors, duplicate slug

- [ ] Test handles errors
  - **What**: Verify errors are displayed to user
  - **Expected**: Error messages shown, form remains usable
  - **Edge cases**: Network errors, validation errors, server errors

### `src/features/modules/blog/components/EditPostForm.tsx`

- [ ] Test renders form with existing data
  - **What**: Verify form is pre-populated with post data
  - **Expected**: All fields filled with existing post data
  - **Edge cases**: Missing data, partial data, malformed data

- [ ] Test validates required fields
  - **What**: Verify validation works on edit
  - **Expected**: Validation errors shown for invalid edits
  - **Edge cases**: Removing required fields, invalid types, constraints

- [ ] Test handles form submission
  - **What**: Verify form submission updates post
  - **Expected**: Post updated on submit, success message shown
  - **Edge cases**: Network errors, concurrent edits, permission errors

- [ ] Test handles errors
  - **What**: Verify errors are displayed
  - **Expected**: Error messages shown, form remains usable
  - **Edge cases**: Network errors, validation errors, server errors

### `src/features/modules/blog/components/PostDeleteDialog.tsx`

- [ ] Test renders confirmation dialog
  - **What**: Verify delete confirmation dialog is shown
  - **Expected**: Dialog displays with post info and confirmation
  - **Edge cases**: Missing post data, long post titles, special characters

- [ ] Test handles delete action
  - **What**: Verify delete action soft-deletes post
  - **Expected**: Post deleted, dialog closes, success message shown
  - **Edge cases**: Network errors, permission errors, already deleted

- [ ] Test handles cancel action
  - **What**: Verify cancel closes dialog without deleting
  - **Expected**: Dialog closes, post unchanged
  - **Edge cases**: Rapid cancel, cancel after error, multiple dialogs

## Blog Hooks

### `src/features/modules/blog/hooks/useNewPostForm.ts`

- [ ] Test initializes form state
  - **What**: Verify form state is initialized correctly
  - **Expected**: All form fields initialized with default values
  - **Edge cases**: Missing defaults, partial initialization, type mismatches

- [ ] Test handles field updates
  - **What**: Verify field updates update state correctly
  - **Expected**: State updated when fields change
  - **Edge cases**: Rapid updates, invalid values, field dependencies

- [ ] Test validates form
  - **What**: Verify form validation works
  - **Expected**: Validation errors set when form is invalid
  - **Edge cases**: Real-time validation, async validation, custom rules

- [ ] Test handles submission
  - **What**: Verify form submission creates post
  - **Expected**: Post created, form reset, success state set
  - **Edge cases**: Network errors, validation errors, duplicate slug

### `src/features/modules/blog/hooks/useEditPostForm.ts`

- [ ] Test initializes with post data
  - **What**: Verify form initialized with existing post data
  - **Expected**: All fields populated from post data
  - **Edge cases**: Missing data, partial data, malformed data

- [ ] Test handles field updates
  - **What**: Verify field updates work correctly
  - **Expected**: State updated, validation triggered
  - **Edge cases**: Rapid updates, invalid values, field dependencies

- [ ] Test validates changes
  - **What**: Verify validation works for edits
  - **Expected**: Validation errors shown for invalid changes
  - **Edge cases**: Real-time validation, async validation, unchanged data

- [ ] Test handles submission
  - **What**: Verify form submission updates post
  - **Expected**: Post updated, form state updated, success message
  - **Edge cases**: Network errors, validation errors, concurrent edits

## Post Loading & Serialization

### `src/features/modules/blog/lib/posts.ts`

- [ ] Test `listPostSlugs` returns all slugs
  - **What**: Verify all post slugs are returned
  - **Expected**: Returns array of all post slugs
  - **Edge cases**: No posts, many posts, duplicate slugs

- [ ] Test `loadPostBySlug` loads post by slug
  - **What**: Verify post is loaded by slug
  - **Expected**: Returns post data for matching slug
  - **Edge cases**: Invalid slug, missing post, case sensitivity

- [ ] Test `loadPostBySlug` returns null for non-existent slug
  - **What**: Verify non-existent slug returns null
  - **Expected**: Returns null when slug doesn't exist
  - **Edge cases**: Deleted post, invalid slug format, slug variations

- [ ] Test `loadAllPosts` loads all posts
  - **What**: Verify all posts are loaded
  - **Expected**: Returns array of all post data
  - **Edge cases**: No posts, many posts, large files

- [ ] Test `loadLatestPostSerialized` loads latest post
  - **What**: Verify latest post is loaded
  - **Expected**: Returns most recent post by date
  - **Edge cases**: No posts, same dates, future dates

- [ ] Test `loadLatestPostSerialized` serializes MDX correctly
  - **What**: Verify MDX is serialized to React components
  - **Expected**: MDX compiled and serialized correctly
  - **Edge cases**: Invalid MDX, complex MDX, MDX with imports

- [ ] Test `postToMeta` converts Post to PostMeta
  - **What**: Verify post data is converted to metadata format
  - **Expected**: Returns PostMeta with required fields
  - **Edge cases**: Missing fields, extra fields, type mismatches

- [ ] Test MDX serialization with plugins
  - **What**: Verify MDX plugins are applied during serialization
  - **Expected**: Plugins process MDX correctly
  - **Edge cases**: Invalid plugins, plugin conflicts, plugin errors

- [ ] Test MDX serialization with frontmatter
  - **What**: Verify frontmatter is parsed from MDX
  - **Expected**: Frontmatter extracted and available
  - **Edge cases**: Missing frontmatter, invalid frontmatter, YAML errors

## Post Validation

- [ ] Test slug uniqueness
  - **What**: Verify slug uniqueness is enforced
  - **Expected**: Duplicate slugs rejected
  - **Edge cases**: Case variations, slug generation, concurrent creation

- [ ] Test required fields
  - **What**: Verify required fields are validated
  - **Expected**: Missing required fields cause validation error
  - **Edge cases**: All fields missing, partial completion, null values

- [ ] Test date format validation
  - **What**: Verify date format is validated
  - **Expected**: Invalid dates rejected, valid dates accepted
  - **Edge cases**: Invalid formats, future dates, timezone issues

- [ ] Test content validation
  - **What**: Verify content is validated
  - **Expected**: Invalid content rejected, valid content accepted
  - **Edge cases**: Empty content, too long, invalid characters, XSS attempts


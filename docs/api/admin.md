# Admin API

Admin-only operations.

## `POST /api/admin/wipe-test-data`

Wipe test data. **Requires admin authentication.**

**Response**:
```typescript
{
  success: true;
  deleted: number; // Number of documents deleted
}
```




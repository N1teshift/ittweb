# User API

User account operations.

## `GET /api/user/data-notice-status`

Get data collection notice status.

**Response**:
```typescript
{
  accepted: boolean;
  acceptedAt?: string;
}
```

## `POST /api/user/accept-data-notice`

Accept data collection notice. **Requires authentication.**

**Response**:
```typescript
{
  success: true;
}
```

## `DELETE /api/user/delete`

Delete user account. **Requires authentication.**

**Response**:
```typescript
{
  success: true;
}
```




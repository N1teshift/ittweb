# Classes API

Class information endpoints.

## `GET /api/classes`

List all classes.

**Response**:
```typescript
{
  success: true;
  data: Class[];
}
```

## `GET /api/classes/[className]`

Get class details.

**Response**:
```typescript
{
  success: true;
  data: Class;
}
```




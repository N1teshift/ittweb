# Component Error Handling Patterns

Error handling patterns for React components.

## Basic Error Handling

```typescript
import { useState } from 'react';
import { logError } from '@/features/infrastructure/logging';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch('/api/my-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const result = await response.json();
      // Handle success
    } catch (err) {
      const error = err as Error;
      logError(error, 'Failed to submit form', {
        component: 'MyComponent',
        operation: 'handleSubmit',
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-400">{error}</div>}
      {/* Form */}
    </div>
  );
}
```

## Component Logger

For components with multiple operations:

```typescript
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('MyComponent');

function MyComponent() {
  const handleAction = async () => {
    try {
      logger.info('Action started', { userId: user.id });
      // operation
      logger.info('Action completed');
    } catch (error) {
      logger.error('Action failed', error as Error, { userId: user.id });
    }
  };
}
```

## Related Documentation

- [Error Handling Guide](./ERROR_HANDLING.md)
- [API Error Patterns](./api-patterns.md)
- [Service Layer Patterns](./service-patterns.md)


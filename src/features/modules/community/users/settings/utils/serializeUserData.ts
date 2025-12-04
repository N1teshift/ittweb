import { Timestamp } from 'firebase/firestore';
import type { UserData } from '@/types/userData';

type SerializedUserData = Record<string, unknown> | null;

export const serializeUserData = (data: UserData | null): SerializedUserData => {
  if (!data) {
    return null;
  }

  const serialized: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (value instanceof Date) {
      serialized[key] = value.toISOString();
      return;
    }

    if (value && typeof value === 'object' && 'toDate' in value && typeof (value as Timestamp).toDate === 'function') {
      serialized[key] = (value as Timestamp).toDate().toISOString();
      return;
    }

    serialized[key] = value;
  });

  return serialized;
};


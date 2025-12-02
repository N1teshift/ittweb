import { useEffect, useState } from 'react';
import type { ItemData } from '@/types/items';

type ItemsMeta = {
  total: number;
  buildingsTotal: number;
  count: number;
  category?: string;
  query?: string;
};

type ItemsApiResult = {
  items: ItemData[];
  meta: ItemsMeta;
};

let cachedItems: ItemData[] | null = null;
let cachedMeta: ItemsMeta | null = null;
let cachedError: Error | null = null;
let inFlightPromise: Promise<void> | null = null;

async function fetchItems(): Promise<void> {
  const response = await fetch('/api/items');
  if (!response.ok) {
    throw new Error(`Failed to load items (status ${response.status})`);
  }
  const apiResponse = await response.json() as { success: boolean; data: ItemsApiResult };
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error('Invalid API response format');
  }
  cachedItems = apiResponse.data.items;
  cachedMeta = apiResponse.data.meta;
}

export function useItemsData() {
  const [items, setItems] = useState<ItemData[]>(() => cachedItems ?? []);
  const [meta, setMeta] = useState<ItemsMeta>(() => cachedMeta ?? { total: cachedItems?.length ?? 0, buildingsTotal: 0, count: cachedItems?.length ?? 0 });
  const [isLoading, setIsLoading] = useState<boolean>(() => !cachedItems && !cachedError);
  const [error, setError] = useState<Error | null>(() => cachedError);

  useEffect(() => {
    let cancelled = false;

    if (cachedItems) {
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);

    if (!inFlightPromise) {
      inFlightPromise = fetchItems()
        .then(() => {
          cachedError = null;
        })
        .catch((err) => {
          cachedError = err instanceof Error ? err : new Error(String(err));
          throw cachedError;
        })
        .finally(() => {
          inFlightPromise = null;
        });
    }

    inFlightPromise
      ?.then(() => {
        if (cancelled) return;
        setItems(cachedItems ?? []);
        setMeta(cachedMeta ?? { total: 0, buildingsTotal: 0, count: 0 });
        setError(null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = async () => {
    cachedItems = null;
    cachedMeta = null;
    cachedError = null;
    setIsLoading(true);
    try {
      await fetchItems();
      setItems(cachedItems ?? []);
      setMeta(cachedMeta ?? { total: 0, buildingsTotal: 0, count: 0 });
      setError(null);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error(String(err));
      setError(nextError);
      cachedError = nextError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    meta,
    isLoading,
    error,
    refetch,
  };
}






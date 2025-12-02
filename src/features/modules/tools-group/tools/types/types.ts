import type { ItemData } from '@/types/items';

export type TrollSide = 'left' | 'right';

export type DragPayload =
  | { kind: 'paletteItem'; itemId: string }
  | { kind: 'inventoryItem'; side: TrollSide; index: number };

export type TrollLoadout = {
  classSlug: string;
  level: number;
  inventory: (ItemData | null)[]; // 8 slots
  selectedSlotIndex: number | null;
};




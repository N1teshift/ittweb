export const MOVESPEED_PER_LEVEL = 7;
export const MOVESPEED_BASE_OFFSET = 2;
export const MOVESPEED_SUBCLASS_EXTRA = 5;
export const MOVESPEED_SUPER_EXTRA = 6;

export type ClassTier = 'base' | 'sub' | 'super';

export function getMoveSpeedOffset(tier: ClassTier): number {
  switch (tier) {
    case 'base':
      return MOVESPEED_BASE_OFFSET;
    case 'sub':
      return MOVESPEED_BASE_OFFSET + MOVESPEED_SUBCLASS_EXTRA;
    case 'super':
      return MOVESPEED_BASE_OFFSET + MOVESPEED_SUPER_EXTRA;
  }
}

export const ATTR_START_MULTIPLIER: Record<ClassTier, number> = {
  base: 3,
  sub: 8,
  super: 11,
};



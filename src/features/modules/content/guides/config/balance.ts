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

// Attribute conversion constants (WC3-inspired defaults)
export const HP_PER_STRENGTH = 25;
export const MANA_PER_INTELLIGENCE = 15;
export const ARMOR_PER_AGILITY = 0.2;

// Armor damage reduction formula (Warcraft III style)
// reductionFraction = (0.06 * armor) / (1 + 0.06 * |armor|)
// negative armor yields negative reduction (i.e., damage amplification)
export function getArmorDamageReductionPercent(armor: number): number {
  const numerator = 0.06 * armor;
  const denominator = 1 + 0.06 * Math.abs(armor);
  const fraction = numerator / denominator;
  return fraction * 100;
}




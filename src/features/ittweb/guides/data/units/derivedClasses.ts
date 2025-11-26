export type DerivedClassType = 'sub' | 'super';

export type DerivedClassData = {
  slug: string;
  name: string;
  parentSlug: string; // base class slug
  type: DerivedClassType;
  summary: string;
  // Optional explicit icon path, e.g. "/icons/itt/trolls/btnorcwarlock.png"
  iconSrc?: string;
  tips?: string[];
  growth: { strength: number; agility: number; intelligence: number };
  baseAttackSpeed: number;
  baseMoveSpeed: number;
  baseHp: number;
  baseMana: number;
};

export const DERIVED_CLASSES: TrollClassData[] = [
];

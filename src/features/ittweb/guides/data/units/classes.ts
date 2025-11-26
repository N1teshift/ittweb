export type TrollClassData = {
  slug: string;
  name: string;
  summary: string;
  // Optional explicit icon path, e.g. "/icons/itt/trolls/btnorcwarlock.png"
  iconSrc?: string;
  subclasses: string[];
  superclasses?: string[];
  tips?: string[];
  growth: { strength: number; agility: number; intelligence: number };
  baseAttackSpeed: number;
  baseMoveSpeed: number;
  baseHp: number;
  baseMana: number;
};

export const BASE_TROLL_CLASSES: TrollClassData[] = [
];

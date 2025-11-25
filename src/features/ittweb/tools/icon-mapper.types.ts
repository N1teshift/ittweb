import { ITTIconCategory } from '@/features/ittweb/guides/utils/iconUtils';

export type IconFile = {
  filename: string;
  path: string;
  category: string;
  subdirectory?: string;
};

export type IconMapping = {
  [category in ITTIconCategory]: Record<string, string>;
};

export type CategoryStat = {
  category: string;
  total: number;
  mapped: number;
  unmapped: number;
  percentage: number;
};



import { ITTIconCategory } from '@/features/modules/content/guides/utils/iconUtils';

export type IconFile = {
  filename: string;
  path: string;
  category: string;
  subdirectory?: string;
};

export type IconMapping = {
  [category in ITTIconCategory]: Record<string, string>;
};

export type IconMappingEntry = {
  category: ITTIconCategory;
  gameName: string;
  filename: string;
};

export type CategoryStat = {
  category: string;
  total: number;
  mapped: number;
  unmapped: number;
  percentage: number;
};

export type EntityStat = {
  category: 'abilities' | 'units' | 'items' | 'buildings';
  total: number;
  mapped: number;
  unmapped: number;
  percentage: number;
};

export type MarkedForDeletion = Set<string>; // Set of icon paths marked for deletion



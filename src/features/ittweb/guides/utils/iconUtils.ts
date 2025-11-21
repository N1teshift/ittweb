export type ITTIconCategory = 'abilities' | 'items' | 'buildings' | 'trolls';

type OverrideMap = Record<string, string>;

// Minimal overrides for tricky names. Extend this as we verify more mappings.
export const NAME_OVERRIDES: Record<ITTIconCategory, OverrideMap> = {
  abilities: {
    // Common passives in abilities use PASBTN prefix
    'Dream Vision': 'PASBTNDreamVision',
    'Spiritual Guidance': 'PASBTNSpiritualGuidance',
    'Eagle Sight': 'PASBTNEagleSight',
    // Non-passives
    'Track': 'BTNTracking',
    'Net': 'BTNSpikedNet',
    'Poison Spear': 'BTNPoisonSpear',
    'Tame Pet': 'BTNTamePet',
    'Tele Steal': 'BTNTeleSteal',
  },
  items: {
    'Yellow Special Herb': 'BTNYellowHerb',
    // Examples:
    // 'Steel Ingot': 'BTNSteelIngot',
    // 'Iron Ingot': 'BTNIronIngot',
    // 'Purple Special Herb': 'BTNPurpleHerb',
  },
  buildings: {
    // 'Tent': 'BTNTent',
  },
  trolls: {},
};

function toPascalCase(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function guessBtnBaseName(category: ITTIconCategory, displayName: string): string {
  const overrides = NAME_OVERRIDES[category];
  if (overrides && overrides[displayName]) {
    return overrides[displayName];
  }

  // Heuristic: BTN + PascalCase(name). Some icons use synonyms; overrides can correct.
  const pascal = toPascalCase(displayName);
  return `BTN${pascal}`;
}

export type ITTIconState = 'enabled' | 'disabled';

export function getIconPath(options: {
  category: ITTIconCategory;
  name: string; // human-readable name from data
  state?: ITTIconState;
  preferDisabled?: boolean;
}): string {
  const { category, name } = options;
  const base = guessBtnBaseName(category, name);
  // Default to flattened category root
  return `/icons/itt/${category}/${base}.png`;
}

export function getDisabledIconPath(category: ITTIconCategory, name: string): string {
  const base = guessBtnBaseName(category, name)
    .replace(/^BTN/, 'DISBTN')
    .replace(/^PASBTN/, 'DISPASBTN');
  // In flattened setup, disabled also sits at category root
  return `/icons/itt/${category}/${base}.png`;
}

function guessBaseNameVariants(category: ITTIconCategory, displayName: string): string[] {
  const overridden = NAME_OVERRIDES[category]?.[displayName];
  const pascal = toPascalCase(displayName);
  const primary = overridden ?? `BTN${pascal}`;
  const variants = [primary];
  if (category === 'abilities') {
    const pas = overridden?.startsWith('PASBTN') ? overridden : `PASBTN${pascal}`;
    if (!variants.includes(pas)) variants.push(pas);
  }
  return variants;
}

export function getIconCandidates(options: {
  category: ITTIconCategory;
  name: string;
  state?: ITTIconState;
}): string[] {
  const { category, name } = options;
  const variants = guessBaseNameVariants(category, name);
  const paths: string[] = [];
  // 1) Flattened category root (preferred)
  for (const base of variants) paths.push(`/icons/itt/${category}/${base}.png`);
  for (const base of variants) {
    const disabledBase = base.replace(/^BTN/, 'DISBTN').replace(/^PASBTN/, 'DISPASBTN');
    paths.push(`/icons/itt/${category}/${disabledBase}.png`);
  }
  // 2) Legacy enabled/disabled structure
  for (const base of variants) paths.push(`/icons/itt/${category}/enabled/${base}.png`);
  for (const base of variants) {
    const disabledBase = base.replace(/^BTN/, 'DISBTN').replace(/^PASBTN/, 'DISPASBTN');
    paths.push(`/icons/itt/${category}/disabled/${disabledBase}.png`);
  }
  // 3) Base pool from WC3
  for (const base of variants) paths.push(`/icons/itt/base/${base}.png`);
  for (const base of variants) {
    const disabledBase = base.replace(/^BTN/, 'DISBTN').replace(/^PASBTN/, 'DISPASBTN');
    paths.push(`/icons/itt/base/${disabledBase}.png`);
  }
  return paths;
}



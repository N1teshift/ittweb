import { exportMarkedForDeletion, exportMappingsAndDeletions, exportMappingsAsCode, formatCategoryForExport } from '../icon-mapper.utils';
import type { IconMapping } from '../icon-mapper.types';

describe('icon-mapper.utils', () => {
  const baseMappings: IconMapping = {
    abilities: {
      Frostbolt: 'abilities/frostbolt.png',
      Fireball: 'abilities/fireball.png',
    },
    items: {
      Shield: 'items/shield.png',
      Axe: 'items/axe.png',
    },
    buildings: {
      Tower: 'buildings/tower.png',
    },
    trolls: {
      Hunter: 'trolls/hunter.png',
    },
    units: {},
  };

  it('formats categories in alphabetical order', () => {
    const formatted = formatCategoryForExport(baseMappings.items);
    expect(formatted).toContain("'Axe': 'items/axe.png'");
    expect(formatted).toContain("'Shield': 'items/shield.png'");
    expect(formatted.indexOf('Axe')).toBeLessThan(formatted.indexOf('Shield'));
  });

  it('exports mappings as TypeScript code', () => {
    const exported = exportMappingsAsCode(baseMappings);
    expect(exported).toContain('export const ICON_MAP: IconMap = {');
    expect(exported).toContain(`abilities: ${formatCategoryForExport(baseMappings.abilities)}`);
    expect(exported).toContain(`items: ${formatCategoryForExport(baseMappings.items)}`);
    expect(exported).toContain(`buildings: ${formatCategoryForExport(baseMappings.buildings)}`);
    expect(exported).toContain(`trolls: ${formatCategoryForExport(baseMappings.trolls)}`);
  });

  it('exports marked for deletion icons as sorted JSON', () => {
    const marked = new Set(['icons/z.png', 'icons/a.png']);
    const exported = exportMarkedForDeletion(marked);
    expect(exported).toBe(JSON.stringify(['icons/a.png', 'icons/z.png'], null, 2));
  });

  it('combines mappings and deletions into a single JSON blob', () => {
    const marked = new Set(['icons/z.png', 'icons/a.png']);
    const exported = exportMappingsAndDeletions(baseMappings, marked);
    const parsed = JSON.parse(exported);

    expect(parsed).toMatchObject({
      mappings: {
        abilities: baseMappings.abilities,
        items: baseMappings.items,
        buildings: baseMappings.buildings,
        trolls: baseMappings.trolls,
      },
      markedForDeletion: ['icons/a.png', 'icons/z.png'],
    });
  });
});

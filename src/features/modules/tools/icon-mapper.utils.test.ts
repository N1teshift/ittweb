import {
  exportMarkedForDeletion,
  exportMappingsAndDeletions,
  exportMappingsAsCode,
  formatCategoryForExport,
} from './icon-mapper.utils';
import type { IconMapping } from './icon-mapper.types';

describe('icon-mapper.utils', () => {
  const sampleMappings: IconMapping = {
    abilities: { flame: 'flame.png', blink: 'blink.png' },
    items: { sword: 'sword.png', armor: 'armor.png' },
    buildings: { barracks: 'barracks.png', altar: 'altar.png' },
    trolls: { warrior: 'warrior.png', shaman: 'shaman.png' },
  };

  describe('formatCategoryForExport', () => {
    it('formats and sorts category entries alphabetically', () => {
      const formatted = formatCategoryForExport(sampleMappings.abilities);

      expect(formatted).toBe("{\n    'blink': 'blink.png',\n    'flame': 'flame.png'\n  }");
    });

    it('returns empty object representation for empty category', () => {
      expect(formatCategoryForExport({})).toBe('{}');
    });
  });

  it('exports mappings as valid code string', () => {
    const code = exportMappingsAsCode(sampleMappings);

    expect(code).toContain('export const ICON_MAP');
    expect(code).toContain("abilities: {\n    'blink': 'blink.png',\n    'flame': 'flame.png'\n  }");
    expect(code).toContain('items:');
    expect(code.trim().endsWith('};')).toBe(true);
  });

  describe('exportMarkedForDeletion', () => {
    it('serializes marked paths sorted', () => {
      const json = exportMarkedForDeletion(new Set(['zeta.png', 'alpha.png']));

      expect(json).toBe('[\n  "alpha.png",\n  "zeta.png"\n]');
    });

    it('handles empty sets', () => {
      expect(exportMarkedForDeletion(new Set())).toBe('[]');
    });
  });

  it('combines mappings and deletions into JSON', () => {
    const output = exportMappingsAndDeletions(sampleMappings, new Set(['obsolete.png', 'alpha.png']));
    const parsed = JSON.parse(output);

    expect(parsed.mappings.abilities).toEqual(sampleMappings.abilities);
    expect(parsed.markedForDeletion).toEqual(['alpha.png', 'obsolete.png']);
  });
});

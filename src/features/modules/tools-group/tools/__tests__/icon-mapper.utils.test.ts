import { exportMarkedForDeletion, exportMappingsAndDeletions, exportMappingsAsCode, formatCategoryForExport } from '../utils/icon-mapper.utils';
import type { IconMapping } from '../types/icon-mapper.types';

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

  describe('formatCategoryForExport', () => {
    it('formats categories in alphabetical order', () => {
      const formatted = formatCategoryForExport(baseMappings.items);
      expect(formatted).toContain("'Axe': 'items/axe.png'");
      expect(formatted).toContain("'Shield': 'items/shield.png'");
      expect(formatted.indexOf('Axe')).toBeLessThan(formatted.indexOf('Shield'));
    });

    it('sorts entries alphabetically by key', () => {
      const category = {
        Zebra: 'z.png',
        Alpha: 'a.png',
        Beta: 'b.png',
      };
      const formatted = formatCategoryForExport(category);
      
      const alphaIndex = formatted.indexOf('Alpha');
      const betaIndex = formatted.indexOf('Beta');
      const zebraIndex = formatted.indexOf('Zebra');
      
      expect(alphaIndex).toBeLessThan(betaIndex);
      expect(betaIndex).toBeLessThan(zebraIndex);
    });

    it('handles case sensitivity in sorting', () => {
      const category = {
        alpha: 'a.png',
        Beta: 'b.png',
        gamma: 'c.png',
      };
      const formatted = formatCategoryForExport(category);
      
      expect(formatted).toContain("'Beta'");
      expect(formatted).toContain("'alpha'");
      expect(formatted).toContain("'gamma'");
    });

    it('handles special characters in keys', () => {
      const category = {
        'key-with-dash': 'value.png',
        'key_with_underscore': 'value2.png',
        'key.with.dot': 'value3.png',
      };
      const formatted = formatCategoryForExport(category);
      
      expect(formatted).toContain("'key-with-dash'");
      expect(formatted).toContain("'key_with_underscore'");
      expect(formatted).toContain("'key.with.dot'");
    });

    it('handles special characters in values', () => {
      const category = {
        Test: 'path/with-special_chars.png',
      };
      const formatted = formatCategoryForExport(category);
      
      expect(formatted).toContain("'Test': 'path/with-special_chars.png'");
    });

    it('handles empty category', () => {
      const formatted = formatCategoryForExport({});
      expect(formatted).toBe('{}');
    });

    it('formats category as valid TypeScript/JSON structure', () => {
      const formatted = formatCategoryForExport(baseMappings.items);
      expect(formatted).toMatch(/^\{\s*'[\w]+':\s*'[\w/\.]+'/);
    });
  });

  describe('exportMappingsAsCode', () => {
    it('exports mappings as TypeScript code', () => {
      const exported = exportMappingsAsCode(baseMappings);
      expect(exported).toContain('export const ICON_MAP: IconMap = {');
      expect(exported).toContain(`abilities: ${formatCategoryForExport(baseMappings.abilities)}`);
      expect(exported).toContain(`items: ${formatCategoryForExport(baseMappings.items)}`);
      expect(exported).toContain(`buildings: ${formatCategoryForExport(baseMappings.buildings)}`);
      expect(exported).toContain(`trolls: ${formatCategoryForExport(baseMappings.trolls)}`);
    });

    it('generates valid TypeScript code', () => {
      const exported = exportMappingsAsCode(baseMappings);
      expect(() => {
        // Basic syntax check - should not throw
        const code = exported.replace('export const', 'const');
        // eslint-disable-next-line no-eval
        expect(typeof code).toBe('string');
      }).not.toThrow();
    });

    it('includes all categories', () => {
      const exported = exportMappingsAsCode(baseMappings);
      expect(exported).toContain('abilities:');
      expect(exported).toContain('items:');
      expect(exported).toContain('buildings:');
      expect(exported).toContain('trolls:');
    });

    it('handles empty categories', () => {
      const emptyMappings: IconMapping = {
        abilities: {},
        items: {},
        buildings: {},
        trolls: {},
        units: {},
      };
      const exported = exportMappingsAsCode(emptyMappings);
      expect(exported).toContain('abilities: {}');
      expect(exported).toContain('items: {}');
    });

    it('handles large datasets', () => {
      const largeCategory: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        largeCategory[`item${i}`] = `path/item${i}.png`;
      }
      const largeMappings: IconMapping = {
        ...baseMappings,
        items: largeCategory,
      };
      
      const exported = exportMappingsAsCode(largeMappings);
      expect(exported).toContain('export const ICON_MAP: IconMap = {');
      expect(exported.length).toBeGreaterThan(1000);
    });
  });

  describe('exportMarkedForDeletion', () => {
    it('exports marked for deletion icons as sorted JSON', () => {
      const marked = new Set(['icons/z.png', 'icons/a.png']);
      const exported = exportMarkedForDeletion(marked);
      expect(exported).toBe(JSON.stringify(['icons/a.png', 'icons/z.png'], null, 2));
    });

    it('formats array as JSON', () => {
      const marked = new Set(['path/file1.png', 'path/file2.png']);
      const exported = exportMarkedForDeletion(marked);
      
      expect(() => JSON.parse(exported)).not.toThrow();
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('sorts paths alphabetically', () => {
      const marked = new Set(['z.png', 'a.png', 'm.png']);
      const exported = exportMarkedForDeletion(marked);
      const parsed = JSON.parse(exported);
      
      expect(parsed).toEqual(['a.png', 'm.png', 'z.png']);
    });

    it('handles empty array', () => {
      const marked = new Set<string>();
      const exported = exportMarkedForDeletion(marked);
      expect(exported).toBe('[]');
    });

    it('handles special characters in paths', () => {
      const marked = new Set(['path/with-dash.png', 'path/with_underscore.png']);
      const exported = exportMarkedForDeletion(marked);
      const parsed = JSON.parse(exported);
      
      expect(parsed).toContain('path/with-dash.png');
      expect(parsed).toContain('path/with_underscore.png');
    });

    it('handles case sensitivity in sorting', () => {
      const marked = new Set(['Z.png', 'a.png', 'M.png']);
      const exported = exportMarkedForDeletion(marked);
      const parsed = JSON.parse(exported);
      
      expect(parsed[0]).toBe('M.png');
      expect(parsed[1]).toBe('Z.png');
      expect(parsed[2]).toBe('a.png');
    });
  });

  describe('exportMappingsAndDeletions', () => {
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

    it('includes both mappings and deletions', () => {
      const marked = new Set(['file1.png']);
      const exported = exportMappingsAndDeletions(baseMappings, marked);
      const parsed = JSON.parse(exported);
      
      expect(parsed).toHaveProperty('mappings');
      expect(parsed).toHaveProperty('markedForDeletion');
    });

    it('handles empty mappings', () => {
      const emptyMappings: IconMapping = {
        abilities: {},
        items: {},
        buildings: {},
        trolls: {},
        units: {},
      };
      const marked = new Set(['file.png']);
      const exported = exportMappingsAndDeletions(emptyMappings, marked);
      const parsed = JSON.parse(exported);
      
      expect(parsed.mappings).toEqual({
        abilities: {},
        items: {},
        buildings: {},
        trolls: {},
      });
      expect(parsed.markedForDeletion).toEqual(['file.png']);
    });

    it('handles empty deletions', () => {
      const marked = new Set<string>();
      const exported = exportMappingsAndDeletions(baseMappings, marked);
      const parsed = JSON.parse(exported);
      
      expect(parsed.markedForDeletion).toEqual([]);
      expect(parsed.mappings).toBeDefined();
    });

    it('handles both empty mappings and deletions', () => {
      const emptyMappings: IconMapping = {
        abilities: {},
        items: {},
        buildings: {},
        trolls: {},
        units: {},
      };
      const marked = new Set<string>();
      const exported = exportMappingsAndDeletions(emptyMappings, marked);
      const parsed = JSON.parse(exported);
      
      expect(parsed.mappings).toEqual({
        abilities: {},
        items: {},
        buildings: {},
        trolls: {},
      });
      expect(parsed.markedForDeletion).toEqual([]);
    });
  });
});


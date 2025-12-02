import { normalizeJsonToSimpleMap } from '../mapUtils';
import type { SimpleMapData } from '../../types/map';

describe('normalizeJsonToSimpleMap', () => {
  it('parses optimized tile arrays into SimpleMapData', () => {
    const input = {
      meta: { w: 2, h: 2 },
      tiles: [
        [0, 0, 0, 0, 5],
        [1, 0, 0, 1, 2, 7],
      ],
    };

    const result = normalizeJsonToSimpleMap(input);

    expect(result).toEqual<SimpleMapData>({
      width: 2,
      height: 2,
      tiles: [
        { isWater: false, groundHeight: 5 },
        { isWater: true, groundHeight: 2, waterHeight: 7 },
        { isWater: false, groundHeight: 0 },
        { isWater: false, groundHeight: 0 },
      ],
    });
  });

  it('extracts data from raw translator JSON with flags and cliffs', () => {
    const WATER_FLAG = 0x20000000;
    const RAMP = 0x00000002;
    const NO_WATER = 0x00000004;

    const input = {
      map: { width: 2, height: 1 },
      flags: [WATER_FLAG, RAMP | NO_WATER],
      groundHeight: [3, 4],
      waterHeight: [10, 0],
      cliffData: [0b00001001, 0b00000110],
    };

    const result = normalizeJsonToSimpleMap(input);

    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    expect(result.tiles).toHaveLength(2);
    expect(result.tiles[0]).toMatchObject({
      isWater: true,
      groundHeight: 3,
      waterHeight: 10,
      flagsMask: WATER_FLAG,
      isRamp: false,
      isNoWater: false,
      cliffLevel: -7,
    });
    expect(result.tiles[1]).toMatchObject({
      isWater: false,
      groundHeight: 4,
      waterHeight: undefined,
      flagsMask: RAMP | NO_WATER,
      isRamp: true,
      isNoWater: true,
      cliffLevel: 6,
    });
  });

  it('validates input and throws for invalid or unsupported shapes', () => {
    expect(() => normalizeJsonToSimpleMap(null)).toThrow('Invalid JSON');
    expect(() => normalizeJsonToSimpleMap({})).toThrow('Unsupported map JSON format');
  });
});


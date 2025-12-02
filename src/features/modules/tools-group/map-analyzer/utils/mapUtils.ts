import type { SimpleMapData, SimpleTile } from '../types/map';

export function normalizeJsonToSimpleMap(json: unknown): SimpleMapData {
  if (!json || typeof json !== 'object') throw new Error('Invalid JSON');
  const obj = json as Record<string, unknown>;

  // support two shapes: optimized { meta: { w,h }, tiles: [...] } and raw-like { map:{width,height}, flags, groundHeight, waterHeight }
  if (obj.meta && typeof obj.meta === 'object' && obj.meta !== null) {
    const meta = obj.meta as Record<string, unknown>;
    if (typeof meta.w === 'number' && typeof meta.h === 'number' && Array.isArray(obj.tiles)) {
      const width = meta.w;
      const height = meta.h;
    // optimized tiles format (varies). Expect [x,y,visualX,type,groundHeight,...]
    const tiles: SimpleTile[] = new Array(width * height);
    const rawTiles = obj.tiles as unknown[];
    for (let i = 0; i < rawTiles.length; i++) {
      const tileRaw = rawTiles[i] as unknown;
      if (!Array.isArray(tileRaw)) continue;
      const tileArray = tileRaw as unknown[];
      const x = typeof tileArray[0] === 'number' ? tileArray[0] : 0;
      const y = typeof tileArray[1] === 'number' ? tileArray[1] : 0;
      const typeCode = typeof tileArray[3] === 'number' ? tileArray[3] : 0;
      const groundHeight = typeof tileArray[4] === 'number' ? tileArray[4] : 0;
      const waterHeight = typeof tileArray[5] === 'number' ? tileArray[5] : undefined;
      const idx = y * width + x;
      tiles[idx] = {
        isWater: typeCode === 1,
        groundHeight: Number(groundHeight) || 0,
        waterHeight: typeof waterHeight === 'number' ? waterHeight : undefined,
      };
    }
    // fill any undefined with land
    for (let i = 0; i < tiles.length; i++) {
      if (!tiles[i]) tiles[i] = { isWater: false, groundHeight: 0 };
    }
    return { width, height, tiles };
    }
  }

  if (obj.map && typeof obj.map === 'object' && obj.map !== null) {
    const mapObj = obj.map as Record<string, unknown>;
    if (typeof mapObj.width === 'number' && typeof mapObj.height === 'number' && Array.isArray(obj.flags) && Array.isArray(obj.groundHeight)) {
      const width = mapObj.width as number;
      const height = mapObj.height as number;
    const flags = obj.flags as number[];
    const ground = obj.groundHeight as number[];
    const water = (obj.waterHeight as number[]) || [];
    const cliffs = (obj.cliffData as number[]) || [];
    const WATER_FLAG = 0x20000000; // from wc3maptranslator WATER.FLAG
    const tiles: SimpleTile[] = new Array(width * height);
    const RAMP = 0x00000002;
    const NO_WATER = 0x00000004;
    for (let i = 0; i < width * height; i++) {
      const isWater = (flags[i] & WATER_FLAG) !== 0;
      let cliffLevel: number | undefined;
      if (cliffs[i] != null) {
        const byte = cliffs[i] as number;
        const level4bit = byte & 0x0f; // low 4 bits
        cliffLevel = (level4bit & 0x8) ? (level4bit - 0x10) : level4bit; // two's complement for 4-bit signed
      }
      tiles[i] = {
        isWater,
        groundHeight: Number(ground[i]) || 0,
        waterHeight: isWater ? Number(water[i]) || 0 : undefined,
        cliffLevel,
        flagsMask: flags[i] >>> 0,
        isRamp: (flags[i] & RAMP) !== 0,
        isNoWater: (flags[i] & NO_WATER) !== 0,
      };
    }
    return { width, height, tiles };
    }
  }

  throw new Error('Unsupported map JSON format');
}




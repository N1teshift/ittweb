export type SimpleTile = {
  isWater: boolean;
  groundHeight: number;
  waterHeight?: number;
  cliffLevel?: number;
  flagsMask?: number;
  isRamp?: boolean;
  isNoWater?: boolean;
};

export type SimpleMapData = {
  width: number;
  height: number;
  tiles: SimpleTile[]; // flat array length = width*height
};




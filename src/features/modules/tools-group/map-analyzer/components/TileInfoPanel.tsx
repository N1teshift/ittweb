import React from 'react';

export type BasicTile = { x: number; y: number } | null;
export type TileDetails = {
  x: number;
  y: number;
  isWater: boolean;
  groundHeight: number;
  waterHeight?: number;
} | null;

export default function TileInfoPanel({ title, tile, details }: { title: string; tile: BasicTile; details?: TileDetails }) {
  return (
    <div className="bg-black/30 border border-amber-500/30 rounded p-3 text-gray-200 text-sm">
      <div className="font-semibold mb-1">{title}</div>
      {tile ? (
        <div className="space-y-1">
          <div>Pos: ({tile.x}, {tile.y})</div>
          {details && (
            <div className="text-gray-300">
              <div>Type: {details.isWater ? 'Water' : 'Land'}</div>
              <div>Ground: {details.groundHeight}</div>
              {details.isWater && <div>Water: {details.waterHeight ?? 0}</div>}
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-400">No tile</div>
      )}
    </div>
  );
}




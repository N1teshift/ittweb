import React, { useEffect, useRef, useState } from 'react';
import type { BasicTile } from './TileInfoPanel';
import type { SimpleMapData } from '../types/map';

export default function MapContainer({
  onHover,
  onHoverInfo,
  onSelect,
  map,
  zoom = 1,
  viewportHeightPx = 480,
  onZoomChange,
  initialScrollLeft = 0,
  initialScrollTop = 0,
  onScrollChange,
  renderMode = 'complete',
  minHeight,
  maxHeight,
  selectedFlags,
  sliceMin,
  sliceMax,
  sliceEnabled,
}: {
  onHover: (tile: BasicTile) => void;
  onHoverInfo?: (info: { tile: BasicTile; x: number; y: number }) => void;
  onSelect: (tile: BasicTile) => void;
  map?: SimpleMapData | null;
  zoom?: number;
  viewportHeightPx?: number;
  onZoomChange?: (z: number) => void;
  initialScrollLeft?: number;
  initialScrollTop?: number;
  onScrollChange?: (pos: { left: number; top: number }) => void;
  renderMode?: 'complete' | 'elevation' | 'cliffs';
  minHeight?: number;
  maxHeight?: number;
  selectedFlags?: number[];
  sliceMin?: number;
  sliceMax?: number;
  sliceEnabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackWidth] = useState(32);
  const [fallbackHeight] = useState(24);
  const [baseCell] = useState(16);
  const isDraggingRef = useRef(false);
  const dragStartMouseRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartScrollRef = useRef<{ left: number; top: number } | null>(null);
  const didDragRef = useRef(false);
  const zoomingRef = useRef(false);
  const wheelTimerRef = useRef<number | null>(null);
  const wheelAccumRef = useRef(0);
  const wheelRafRef = useRef<number | null>(null);
  const dragPausedRef = useRef(false);
  const dragPauseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Apply initial scroll after render
    const id = requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = initialScrollLeft;
        containerRef.current.scrollTop = initialScrollTop;
      }
    });
    return () => cancelAnimationFrame(id);
  }, [initialScrollLeft, initialScrollTop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = map?.width ?? fallbackWidth;
    const height = map?.height ?? fallbackHeight;
    const cell = Math.max(2, Math.floor(baseCell * zoom));
    canvas.width = width * cell;
    canvas.height = height * cell;

    // background
    ctx.fillStyle = 'rgb(12,12,12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw tiles when map provided
    if (map?.tiles?.length === width * height) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const t = map.tiles[y * width + x];
          if (renderMode === 'complete') {
            if (t.isWater) {
              const depth = typeof t.waterHeight === 'number' ? (t.waterHeight - t.groundHeight) : 0;
              const d = Math.max(0, Math.min(255, Math.floor(depth)));
              ctx.fillStyle = `rgb(${Math.max(0, 20 - d * 0.1)}, ${Math.max(0, 120 - d * 0.2)}, ${200 - d * 0.3})`;
            } else {
              ctx.fillStyle = landColorFromHeight(t.groundHeight, minHeight, maxHeight);
            }
          } else if (renderMode === 'elevation') {
            if (t.isWater) {
              ctx.fillStyle = 'rgb(10,70,140)';
            } else {
              ctx.fillStyle = landColorFromHeight(t.groundHeight, minHeight, maxHeight);
            }
          } else {
            // cliffs render: map cliffLevel if present; fallback to elevation
            if (t.isWater) {
              ctx.fillStyle = 'rgb(10,70,140)';
            } else if (typeof t.cliffLevel === 'number') {
              ctx.fillStyle = cliffColorFromLevel(t.cliffLevel);
            } else {
              ctx.fillStyle = landColorFromHeight(t.groundHeight, minHeight, maxHeight);
            }
          }
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      // overlay selected flags with semi-transparent color
      if (selectedFlags && selectedFlags.length) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const t = map.tiles[y * width + x];
            const matched = selectedFlags.find((f) => ((t.flagsMask ?? 0) & f) !== 0);
            if (matched != null) {
              ctx.fillStyle = flagColor(matched);
              ctx.fillRect(x * cell, y * cell, cell, cell);
            }
          }
        }
        ctx.restore();
      }

      // height slice dimming overlay
      if (sliceEnabled && (typeof sliceMin === 'number' || typeof sliceMax === 'number')) {
        const low = typeof sliceMin === 'number' ? sliceMin : -Infinity;
        const high = typeof sliceMax === 'number' ? sliceMax : Infinity;
        const minRange = Math.min(low, high);
        const maxRange = Math.max(low, high);
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const t = map.tiles[y * width + x];
            const val = t.groundHeight;
            const inside = val >= minRange && val <= maxRange;
            if (!inside) {
              ctx.fillRect(x * cell, y * cell, cell, cell);
            }
          }
        }
        ctx.restore();
      }
    }

    // grid (only draw when cell is large enough to be readable)
    if (cell >= 8) {
      ctx.strokeStyle = 'rgba(255,191,0,0.12)';
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cell + 0.5);
        ctx.lineTo(canvas.width, y * cell + 0.5);
        ctx.stroke();
      }
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cell + 0.5, 0);
        ctx.lineTo(x * cell + 0.5, canvas.height);
        ctx.stroke();
      }
    }
  }, [map, fallbackWidth, fallbackHeight, baseCell, zoom, renderMode, minHeight, maxHeight, selectedFlags, sliceEnabled, sliceMin, sliceMax]);

  function landColorFromHeight(h: number, minH?: number, maxH?: number): string {
    const minv = typeof minH === 'number' ? minH : 0;
    const maxv = typeof maxH === 'number' && maxH > minv ? maxH : minv + 1;
    let p = (h - minv) / (maxv - minv);
    p = Math.max(0, Math.min(1, p));
    const stops = [
      [60, 40, 20],
      [90, 70, 30],
      [120, 90, 40],
      [160, 120, 60],
      [220, 200, 120],
    ];
    const idx = Math.min(stops.length - 2, Math.floor(p * (stops.length - 1)));
    const frac = p * (stops.length - 1) - idx;
    const c0 = stops[idx];
    const c1 = stops[idx + 1];
    const r = Math.round(c0[0] + (c1[0] - c0[0]) * frac);
    const g = Math.round(c0[1] + (c1[1] - c0[1]) * frac);
    const b = Math.round(c0[2] + (c1[2] - c0[2]) * frac);
    return `rgb(${r},${g},${b})`;
  }

  function cliffColorFromLevel(level: number): string {
    // Map -1..5 roughly to a palette
    const palette: Record<number, [number, number, number]> = {
      [-1]: [180, 180, 180],
      0: [200, 200, 200],
      1: [180, 160, 120],
      2: [170, 140, 100],
      3: [160, 120, 80],
      4: [140, 100, 60],
      5: [120, 80, 40],
    } as Record<number, [number, number, number]>;
    const c = palette[level as keyof typeof palette] || [200, 200, 200];
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  function flagColor(flagId: number): string {
    // Known wc3 terrain flags in this app
    // Water 0x20000000 -> blue, Ramp 0x2 -> purple, NoWater 0x4 -> orange
    if (flagId === 0x20000000) return 'rgb(0,120,220)';
    if (flagId === 0x00000002) return 'rgb(180,80,200)';
    if (flagId === 0x00000004) return 'rgb(220,150,40)';
    // default red
    return 'rgb(220,60,60)';
  }

  const getTileFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const width = map?.width ?? fallbackWidth;
    const height = map?.height ?? fallbackHeight;
    const cell = Math.max(2, Math.floor(baseCell * zoom));
    const scrollLeft = containerRef.current?.scrollLeft ?? 0;
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    const x = Math.floor((scrollLeft + px) / cell);
    const y = Math.floor((scrollTop + py) / cell);
    if (x < 0 || y < 0 || x >= width || y >= height) return null;
    return { x, y } as BasicTile;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-auto border border-amber-500/30 rounded select-none ${isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ height: viewportHeightPx, overscrollBehavior: 'contain' }}
      onPointerDown={(e) => {
        if (e.button !== 0) return; // left button only
        isDraggingRef.current = true;
        dragStartMouseRef.current = { x: e.clientX, y: e.clientY };
        didDragRef.current = false;
        if (containerRef.current) {
          dragStartScrollRef.current = {
            left: containerRef.current.scrollLeft,
            top: containerRef.current.scrollTop,
          };
        }
        try { 
          if (e.currentTarget.setPointerCapture) {
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        } catch {}
        e.preventDefault();
      }}
      onPointerMove={(e) => {
        if (isDraggingRef.current && dragStartMouseRef.current && dragStartScrollRef.current && containerRef.current) {
          const dx = e.clientX - dragStartMouseRef.current.x;
          const dy = e.clientY - dragStartMouseRef.current.y;
          if (!didDragRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
            didDragRef.current = true;
          }
          containerRef.current.scrollLeft = dragStartScrollRef.current.left - dx;
          containerRef.current.scrollTop = dragStartScrollRef.current.top - dy;
          e.preventDefault();
        }
      }}
      onPointerUp={(e) => {
        isDraggingRef.current = false;
        dragStartMouseRef.current = null;
        dragStartScrollRef.current = null;
        try { 
          if (e.currentTarget.releasePointerCapture) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        } catch {}
        // briefly pause hover after drag end to avoid post-drag flicker
        dragPausedRef.current = true;
        if (dragPauseTimerRef.current) {
          window.clearTimeout(dragPauseTimerRef.current);
          dragPauseTimerRef.current = null;
        }
        dragPauseTimerRef.current = window.setTimeout(() => {
          dragPausedRef.current = false;
        }, 80);
      }}
      onPointerLeave={() => {
        isDraggingRef.current = false;
        dragStartMouseRef.current = null;
        dragStartScrollRef.current = null;
        onHover(null);
      }}
      onContextMenu={(e) => {
        if (isDraggingRef.current) e.preventDefault();
      }}
      onScroll={() => {
        if (!containerRef.current) return;
        onScrollChange?.({
          left: containerRef.current.scrollLeft,
          top: containerRef.current.scrollTop,
        });
      }}
        onWheel={(e) => {
        if (!onZoomChange || !containerRef.current) return;
        e.preventDefault();
          zoomingRef.current = true;
          wheelAccumRef.current += e.deltaY;
          if (wheelRafRef.current == null) {
            const rect = containerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const contentX = (containerRef.current.scrollLeft ?? 0) + mouseX;
            const contentY = (containerRef.current.scrollTop ?? 0) + mouseY;
            const oldScale = baseCell * zoom;
            const tileX = contentX / oldScale;
            const tileY = contentY / oldScale;
            wheelRafRef.current = requestAnimationFrame(() => {
              wheelRafRef.current = null;
              const dy = wheelAccumRef.current;
              wheelAccumRef.current = 0;
              const factor = Math.exp(-dy * 0.001);
              const nextZoom = Math.max(0.1, Math.min(4, +(zoom * factor).toFixed(3)));
              const newScale = baseCell * nextZoom;
              const newContentX = tileX * newScale;
              const newContentY = tileY * newScale;
              const nextScrollLeft = newContentX - mouseX;
              const nextScrollTop = newContentY - mouseY;
              onZoomChange(nextZoom);
              // apply scroll after two frames for layout stabilization
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (!containerRef.current) return;
                  containerRef.current.scrollLeft = nextScrollLeft;
                  containerRef.current.scrollTop = nextScrollTop;
                  if (wheelTimerRef.current) {
                    window.clearTimeout(wheelTimerRef.current);
                    wheelTimerRef.current = null;
                  }
                  wheelTimerRef.current = window.setTimeout(() => {
                    zoomingRef.current = false;
                  }, 100);
                });
              });
            });
          }
      }}
    >
      <canvas
        ref={canvasRef}
        className="block"
        onMouseMove={(e) => {
          if (isDraggingRef.current || zoomingRef.current || dragPausedRef.current) return; // suppress hover updates during drag/zoom
          const tile = getTileFromEvent(e);
          onHover(tile);
          if (onHoverInfo) {
            const rect = (containerRef.current as HTMLDivElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            onHoverInfo({ tile, x, y });
          }
        }}
        onMouseLeave={() => onHover(null)}
        onClick={(e) => {
          if (didDragRef.current) {
            // Treat as drag end, not a click selection
            didDragRef.current = false;
            e.preventDefault();
            return;
          }
          onSelect(getTileFromEvent(e));
        }}
      />
    </div>
  );
}





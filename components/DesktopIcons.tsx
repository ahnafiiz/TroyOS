'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useOSStore } from '@/store/useOSStore';

interface DesktopIconProps {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  onDragEnd?: (id: string, x: number, y: number) => void;
  onOpen: () => void;
}

/**
 * Finds the closest free grid cell, searching outward from the drop target.
 * Tries right → down → left → up in expanding rings until a free slot is found.
 */
export function findFreeGridCell(
  targetX: number,
  targetY: number,
  gridStep: number,
  occupied: Array<{ x: number; y: number }>,
  clockRect?: { x: number; y: number; w: number; h: number },
  maxW = 1200,
  maxH = 900
): { x: number; y: number } {

  const snap = (v: number) => Math.round(v / gridStep) * gridStep;
  const tx = snap(targetX);
  const ty = snap(targetY);

  const isOccupied = (cx: number, cy: number) => {
    if (cx < 20 || cy < 20 || cx > maxW - 100 || cy > maxH - 100) return true;
    if (clockRect) {
      if (cx >= clockRect.x - 40 && cx <= clockRect.x + clockRect.w &&
          cy >= clockRect.y - 40 && cy <= clockRect.y + clockRect.h) return true;
    }
    return occupied.some(p => Math.round(p.x / gridStep) * gridStep === cx && Math.round(p.y / gridStep) * gridStep === cy);
  };

  if (!isOccupied(tx, ty)) return { x: tx, y: ty };

  // Spiral search: offset in multiples of gridStep
  for (let ring = 1; ring <= 10; ring++) {
    const candidates: Array<{ x: number; y: number }> = [];
    for (let dx = -ring; dx <= ring; dx++) {
      for (let dy = -ring; dy <= ring; dy++) {
        if (Math.abs(dx) === ring || Math.abs(dy) === ring) {
          candidates.push({ x: tx + dx * gridStep, y: ty + dy * gridStep });
        }
      }
    }
    // Sort by distance from target
    candidates.sort((a, b) => {
      const da = Math.hypot(a.x - tx, a.y - ty);
      const db = Math.hypot(b.x - tx, b.y - ty);
      return da - db;
    });
    for (const c of candidates) {
      if (!isOccupied(c.x, c.y)) return c;
    }
  }

  // Fallback: just return target
  return { x: tx, y: ty };
}

export default function DesktopIcon({ id, name, emoji, x, y, onDragEnd, onOpen }: DesktopIconProps) {
  const { setIconPosition, iconSize } = useOSStore();
  const size = iconSize ?? 72;

  const dragStart  = useRef({ mouseX: 0, mouseY: 0, iconX: 0, iconY: 0 });
  const hasDragged = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localX, setLocalX] = useState(x);
  const [localY, setLocalY] = useState(y);

  // Keep local position in sync with prop when not dragging
  React.useEffect(() => { setLocalX(x); setLocalY(y); }, [x, y]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    hasDragged.current = false;
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, iconX: x, iconY: y };
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStart.current.mouseX;
      const dy = ev.clientY - dragStart.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
      const nx = Math.max(12, Math.min(dragStart.current.iconX + dx, window.innerWidth  - size - 12));
      const ny = Math.max(12, Math.min(dragStart.current.iconY + dy, window.innerHeight - size - 70));
      setLocalX(nx);
      setLocalY(ny);
    };

    const onUp = (ev: MouseEvent) => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      if (hasDragged.current) {
        const finalX = ev.clientX - dragStart.current.mouseX + dragStart.current.iconX;
        const finalY = ev.clientY - dragStart.current.mouseY + dragStart.current.iconY;
        onDragEnd?.(id, finalX, finalY);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    e.preventDefault();
  }, [id, x, y, size, onDragEnd]);

  const handleDoubleClick = useCallback(() => {
    if (!hasDragged.current) onOpen();
  }, [onOpen]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className="desktop-icon"
      style={{
        position: 'absolute',
        left: localX,
        top:  localY,
        width:  size,
        height: size,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        borderRadius: 'var(--radius-sm)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'left var(--dur-normal) var(--ease-spring), top var(--dur-normal) var(--ease-spring)',
        transform: isDragging ? 'scale(1.08)' : 'scale(1)',
        zIndex: isDragging ? 999 : 'var(--z-icon)' as any,
        filter: isDragging ? 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))' : 'none',
      }}
    >
      {/* Icon inner — glass card on hover */}
      <div
        style={{
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.44,
          background: 'rgba(255,255,255,0)',
          border: '1px solid transparent',
          transition: 'background var(--dur-fast), border-color var(--dur-fast), transform var(--dur-fast) var(--ease-spring)',
        }}
        className="desktop-icon-inner"
      >
        <span style={{ pointerEvents: 'none', userSelect: 'none' }}>{emoji}</span>
      </div>

      {/* Label */}
      <span
        className="desktop-icon-label"
        style={{
          fontSize: 'var(--text-xs)',
          maxWidth: size + 8,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          padding: '0 4px',
        }}
      >{name}</span>

      <style>{`
        .desktop-icon:hover .desktop-icon-inner {
          background: rgba(255,255,255,0.08) !important;
          border-color: var(--glass-border-hi) !important;
          transform: scale(1.06) !important;
          box-shadow: var(--shadow-sm) !important;
        }
      `}</style>
    </div>
  );
}
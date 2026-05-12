'use client';

import React, { useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';

interface DesktopIconProps {
  id: string; 
  name: string;
  emoji: string;
  x: number;
  y: number;
}

export default function DesktopIcon({ id, name, emoji, x, y }: DesktopIconProps) {
  const store = useOSStore();
  const openApp = store.openApp;
  const setIconPosition = store.setIconPosition;

  const dragStart = useRef({ mouseX: 0, mouseY: 0, iconX: 0, iconY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, iconX: x, iconY: y };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStart.current.mouseX;
      const dy = moveEvent.clientY - dragStart.current.mouseY;

      // Snap coordinates loosely to an imaginary 20px grid
      const gridX = Math.round((dragStart.current.iconX + dx) / 20) * 20;
      const gridY = Math.round((dragStart.current.iconY + dy) / 20) * 20;

      // Restrict values to keep icons safely on-screen
      const clampedX = Math.max(20, Math.min(gridX, window.innerWidth - 120));
      const clampedY = Math.max(20, Math.min(gridY, window.innerHeight - 120));

      setIconPosition(id, clampedX, clampedY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={() => openApp(id, name, emoji, '#3b82f6')}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 80,
        height: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 8,
        cursor: 'grab',
        userSelect: 'none',
        transition: 'background-color 0.15s, transform 0.1s',
        fontFamily: 'var(--font-system)',
      }}
      className="hover:bg-white/5 active:cursor-grabbing group"
    >
      <span className="text-3xl transition-transform duration-200 group-hover:scale-105 select-none pointer-events-none">
        {emoji}
      </span>
      
      <span
        style={{
          fontSize: '11px',
          fontWeight: 500,
          color: '#ffffff',
          textShadow: '0px 1px 3px rgba(0, 0, 0, 0.9)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          padding: '0 4px',
          letterSpacing: '0.02em',
        }}
      >
        {name}
      </span>
    </div>
  );
}
'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { useOSStore } from '@/store/useOSStore';

interface Props {
  id: number; appId: string; title: string; emoji: string; color: string;
  x: number; y: number; width: number; height: number; zIndex: number;
  minimized: boolean; maximized: boolean; isNew: boolean; children: ReactNode;
}

const MODERN_FONT = 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif';

export default function Window({
  id, title, emoji, x, y, width, height, zIndex, minimized, maximized, isNew, children,
}: Props) {
  const { activeWindowId, accentColor, closeWindow, minimizeWindow,
          maximizeWindow, focusWindow, moveWindow, resizeWindow } = useOSStore();

  const isActive = activeWindowId === id;
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isResizing = useRef(false);
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });
  
  // Local drag state for dynamic momentum scale effect
  const [localDragging, setLocalDragging] = useState(false);

  const taskbarBuffer = 80; // Workspace layout height boundary

  const onTitleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (maximized) return;
    e.preventDefault();
    isDragging.current = true;
    setLocalDragging(true);
    dragOffset.current = { x: e.clientX - x, y: e.clientY - y };
    focusWindow(id);
  };

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, w: width, h: height };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const nextX = e.clientX - dragOffset.current.x;
        const nextY = e.clientY - dragOffset.current.y;

        const clampedX = Math.max(-width + 100, Math.min(nextX, window.innerWidth - 100));
        const clampedY = Math.max(0, Math.min(nextY, window.innerHeight - taskbarBuffer));

        moveWindow(id, clampedX, clampedY);
      }
      if (isResizing.current) {
        const dx = e.clientX - resizeStart.current.mouseX;
        const dy = e.clientY - resizeStart.current.mouseY;
        
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight - taskbarBuffer - y;

        resizeWindow(
          id, 
          Math.min(maxWidth, Math.max(450, resizeStart.current.w + dx)), 
          Math.min(maxHeight, Math.max(320, resizeStart.current.h + dy))
        );
      }
    };

    const onMouseUp = () => { 
      isDragging.current = false; 
      setLocalDragging(false);
      isResizing.current = false; 
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => { 
      document.removeEventListener('mousemove', onMouseMove); 
      document.removeEventListener('mouseup', onMouseUp); 
    };
  }, [id, moveWindow, resizeWindow, x, y, width, height]);

  if (minimized) return null;

  const windowStyle = maximized
    ? { top: 0, left: 0, width: '100vw', height: `calc(100vh - ${taskbarBuffer}px)` }
    : { top: y, left: x, width, height };

  return (
    <div
      onClick={() => focusWindow(id)}
      style={{
        position: 'absolute',
        ...windowStyle,
        zIndex: zIndex + 100,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(15, 18, 25, 0.45)', // Sleeker physical glass transparency
        backdropFilter: 'blur(32px) saturate(160%)',
        WebkitBackdropFilter: 'blur(32px) saturate(160%)',
        border: `1px solid ${isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: maximized ? 0 : 16,
        overflow: 'hidden',
        boxShadow: isActive 
          ? `0 32px 72px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)` 
          : `0 12px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)`,
        // Added dynamic subtle physical scaling when grabbing/moving windows
        transform: isNew 
          ? 'scale(0.96) translateY(8px)' 
          : localDragging 
            ? 'scale(0.99)' 
            : 'scale(1) translateY(0)',
        opacity: isNew ? 0 : 1,
        transition: 'box-shadow 0.3s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s',
        fontFamily: MODERN_FONT,
        animation: isNew ? 'windowEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none'
      }}
    >
      <style>{`
        @keyframes windowEnter { to { opacity: 1; transform: scale(1) translateY(0); } }
        
        /* Premium custom control designs with vector icons appearing only on title area hover */
        .window-controls:hover .ctrl-svg {
          opacity: 0.8 !important;
        }
      `}</style>

      {/* ── HEADER (TITLE BAR) ──────────────────────────────────────── */}
      <div
        onMouseDown={onTitleMouseDown}
        style={{
          display: 'flex', 
          alignItems: 'center', 
          height: 40, 
          padding: '0 16px',
          background: 'rgba(10, 12, 18, 0.25)', 
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          cursor: maximized ? 'default' : localDragging ? 'grabbing' : 'grab'
        }}
        className="window-controls"
      >
        {/* Modern clean control buttons */}
        <div style={{ display: 'flex', gap: 6, width: 80 }}>
          <button onClick={() => closeWindow(id)} style={{ position: 'relative', width: 11, height: 11, borderRadius: '50%', background: '#ff5f56', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="ctrl-svg" style={{ opacity: 0, transition: 'opacity 0.15s', fontSize: 7, color: '#4c0002', fontWeight: 800, position: 'absolute' }}>×</span>
          </button>
          <button onClick={() => minimizeWindow(id)} style={{ position: 'relative', width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="ctrl-svg" style={{ opacity: 0, transition: 'opacity 0.15s', fontSize: 7, color: '#5c3e00', fontWeight: 800, position: 'absolute' }}>-</span>
          </button>
          <button onClick={() => maximizeWindow(id)} style={{ position: 'relative', width: 11, height: 11, borderRadius: '50%', background: '#27c93f', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="ctrl-svg" style={{ opacity: 0, transition: 'opacity 0.15s', fontSize: 5, color: '#024d00', fontWeight: 800, position: 'absolute' }}>▲</span>
          </button>
        </div>

        {/* Dynamic header label */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, opacity: isActive ? 1 : 0.45, transition: 'opacity 0.2s' }}>
          <span style={{ fontSize: 14, display: 'flex', alignItems: 'center' }}>{emoji}</span>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.01em', color: '#f3f4f6' }}>{title}</span>
        </div>

        <div style={{ width: 80, display: 'flex', justifyContent: 'flex-end' }}>
          {isActive && (
            <div style={{ 
              width: 5, height: 5, borderRadius: '50%', 
              background: accentColor, 
              boxShadow: `0 0 10px ${accentColor}` 
            }} />
          )}
        </div>
      </div>

      {/* ── APP CONTENT WINDOW ─────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {children}
      </div>

      {/* Premium minimal resize grabber (active-only bottom right corner) */}
      {!maximized && isActive && (
        <div 
          onMouseDown={onResizeMouseDown}
          style={{ 
            position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, 
            cursor: 'nwse-resize', zIndex: 100,
            backgroundImage: 'linear-gradient(135deg, transparent 60%, rgba(255,255,255,0.2) 60%)',
          }} 
        />
      )}
    </div>
  );
}
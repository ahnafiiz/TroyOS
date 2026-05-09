// components/Window.tsx
'use client';

import { useRef, useEffect, ReactNode } from 'react';
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

  // Workspace configuration (prevents windows going behind taskbar)
  const taskbarBuffer = 84; // Taskbar height + floating margins + gap

  const onTitleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (maximized) return;
    e.preventDefault();
    isDragging.current = true;
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

        // ── CLAMPING: Keeps the title bar visible and window on screen ──
        const clampedX = Math.max(-width + 100, Math.min(nextX, window.innerWidth - 100));
        const clampedY = Math.max(0, Math.min(nextY, window.innerHeight - taskbarBuffer));

        moveWindow(id, clampedX, clampedY);
      }
      if (isResizing.current) {
        const dx = e.clientX - resizeStart.current.mouseX;
        const dy = e.clientY - resizeStart.current.mouseY;
        
        // Limits resizing so it doesn't push through the bottom taskbar area
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight - taskbarBuffer - y;

        resizeWindow(
          id, 
          Math.min(maxWidth, Math.max(400, resizeStart.current.w + dx)), 
          Math.min(maxHeight, Math.max(300, resizeStart.current.h + dy))
        );
      }
    };

    const onMouseUp = () => { isDragging.current = false; isResizing.current = false; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => { 
      document.removeEventListener('mousemove', onMouseMove); 
      document.removeEventListener('mouseup', onMouseUp); 
    };
  }, [id, moveWindow, resizeWindow, x, y, width, height]);

  if (minimized) return null;

  // ── WORKSPACE HEIGHT: Ensures maximized windows stop before the Taskbar ──
  const windowStyle = maximized
    ? { top: 0, left: 0, width: '100vw', height: `calc(100vh - ${taskbarBuffer}px)` }
    : { top: y, left: x, width, height };

  return (
    <div
      onClick={() => focusWindow(id)}
      style={{
        position: 'absolute',
        ...windowStyle,
        zIndex: zIndex + 100, // Offset to ensure windows stay above desktop icons
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(15, 18, 25, 0.75)',
        backdropFilter: 'blur(25px) saturate(160%)',
        WebkitBackdropFilter: 'blur(25px) saturate(160%)',
        border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: maximized ? 0 : 18,
        overflow: 'hidden',
        boxShadow: isActive ? `0 30px 60px rgba(0,0,0,0.5)` : `0 10px 30px rgba(0,0,0,0.3)`,
        transition: 'box-shadow 0.3s ease, transform 0.2s ease, opacity 0.3s ease',
        fontFamily: MODERN_FONT,
        // Entry animation logic
        transform: isNew ? 'scale(0.95) translateY(10px)' : 'scale(1) translateY(0)',
        opacity: isNew ? 0 : 1,
        animation: isNew ? 'windowEnter 0.4s cubic-bezier(0.2, 1, 0.2, 1) forwards' : 'none'
      }}
    >
      <style>{`
        @keyframes windowEnter { to { opacity: 1; transform: scale(1) translateY(0); } }
        .win-btn { transition: all 0.2s ease; }
        .win-btn:hover { filter: brightness(1.2); transform: scale(1.1); }
        .win-btn:active { transform: scale(0.9); }
      `}</style>

      {/* ── HEADER ──────────────────────────────────────── */}
      <div
        onMouseDown={onTitleMouseDown}
        style={{
          display: 'flex', alignItems: 'center', height: 44, padding: '0 16px',
          background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)',
          cursor: maximized ? 'default' : 'grab'
        }}
      >
        <div style={{ display: 'flex', gap: 8, width: 80 }}>
          <button className="win-btn" onClick={() => closeWindow(id)} style={{ width: 13, height: 13, borderRadius: '50%', background: '#ff5f57', border: 'none', cursor: 'pointer' }} />
          <button className="win-btn" onClick={() => minimizeWindow(id)} style={{ width: 13, height: 13, borderRadius: '50%', background: '#febc2e', border: 'none', cursor: 'pointer' }} />
          <button className="win-btn" onClick={() => maximizeWindow(id)} style={{ width: 13, height: 13, borderRadius: '50%', background: '#28c840', border: 'none', cursor: 'pointer' }} />
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, opacity: isActive ? 1 : 0.6 }}>
          <span style={{ fontSize: 16 }}>{emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', color: '#fff' }}>{title}</span>
        </div>

        <div style={{ width: 80, display: 'flex', justifyContent: 'flex-end' }}>
            {isActive && <div style={{ 
              width: 8, height: 8, borderRadius: '50%', 
              background: accentColor, 
              boxShadow: `0 0 12px ${accentColor}` 
            }} />}
        </div>
      </div>

      {/* ── APP CONTENT ─────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {children}
      </div>

      {/* Resize Handle (only visible on active window) */}
      {!maximized && isActive && (
        <div 
          onMouseDown={onResizeMouseDown}
          style={{ 
            position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, 
            cursor: 'nwse-resize', zIndex: 100 
          }} 
        />
      )}
    </div>
  );
}

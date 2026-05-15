'use client';

import { useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

interface WindowProps {
  id: string;
  appId: string;
  name?: string;
  emoji?: string;
  color?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  zIndex?: number;
  minimized?: boolean;
  maximized?: boolean;
  children: React.ReactNode;
}

export default function Window({
  id,
  name = '',
  emoji = '📦',
  color = '#3b82f6',
  width = 800,
  height = 560,
  x = 100,
  y = 80,
  zIndex = 10,
  minimized = false,
  maximized = false,
  children,
}: WindowProps) {
  const store = useOSStore();
  const activeWindowId    = store.activeWindowId;
  const uiStyleProfile    = store.uiStyleProfile    || 'default';
  const windowAnimationCurve = store.windowAnimationCurve || 'smooth';
  const windowBorderGlow  = store.windowBorderGlow !== false;
  const taskbarHeight     = store.taskbarHeight ?? 54;

  const closeWindow    = store.closeWindow    ?? (() => {});
  const focusWindow    = store.focusWindow    ?? (() => {});
  const toggleMinimize = store.toggleMinimize ?? (() => {});
  const toggleMaximize = store.toggleMaximize ?? (() => {});
  const moveWindow     = store.updateWindowPosition ?? (() => {});
  const resizeWindow   = store.updateWindowSize     ?? (() => {});

  const [hoveredControls, setHoveredControls] = useState(false);
  const isFocused = activeWindowId === id;

  const dragStart   = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, winW: 0, winH: 0 });

  if (minimized) return null;

  // ── Clamp helpers ──────────────────────────────────────────────────────────
  // Min visible: titlebar must always be reachable (top 40px of window on screen)
  // Max: window top-left must stay within viewport minus taskbar
  const TITLEBAR_H  = 40;
  const TASKBAR_CLEARANCE = taskbarHeight + 20;

  const clampPos = (nx: number, ny: number): { x: number; y: number } => {
    const vw = typeof window !== 'undefined' ? window.innerWidth  : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      x: Math.max(-width  + 120, Math.min(nx, vw  - 60)),
      y: Math.max(0,             Math.min(ny, vh - TASKBAR_CLEARANCE - TITLEBAR_H)),
    };
  };

  const clampSize = (nw: number, nh: number): { width: number; height: number } => {
    const vw = typeof window !== 'undefined' ? window.innerWidth  : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      width:  Math.min(nw, vw),
      height: Math.min(nh, vh - TASKBAR_CLEARANCE),
    };
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (maximized || e.button !== 0) return;
    focusWindow(id);
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, winX: x, winY: y };

    const onMove = (ev: MouseEvent) => {
      const dx  = ev.clientX - dragStart.current.mouseX;
      const dy  = ev.clientY - dragStart.current.mouseY;
      const pos = clampPos(dragStart.current.winX + dx, dragStart.current.winY + dy);
      moveWindow(id, pos);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (maximized || e.button !== 0) return;
    e.stopPropagation();
    focusWindow(id);
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, winW: width, winH: height };

    const onMove = (ev: MouseEvent) => {
      const dx   = ev.clientX - resizeStart.current.mouseX;
      const dy   = ev.clientY - resizeStart.current.mouseY;
      const size = clampSize(
        Math.max(280, resizeStart.current.winW + dx),
        Math.max(200, resizeStart.current.winH + dy),
      );
      resizeWindow(id, size);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const getAnimationTransition = () => {
    if (windowAnimationCurve === 'slide') return 'width 0.12s ease, height 0.12s ease, left 0.12s ease, top 0.12s ease';
    if (windowAnimationCurve === 'fade')  return 'all 0.3s ease';
    return 'width 0.22s cubic-bezier(0.2,0.8,0.2,1), height 0.22s cubic-bezier(0.2,0.8,0.2,1), left 0.22s cubic-bezier(0.2,0.8,0.2,1), top 0.22s cubic-bezier(0.2,0.8,0.2,1), transform 0.2s ease, opacity 0.2s ease';
  };

  const getWindowStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      left:   maximized ? 0 : x,
      top:    maximized ? 0 : y,
      width:  maximized ? '100vw' : width,
      height: maximized ? `calc(100vh - var(--taskbar-offset, 60px))` : height,
      zIndex,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--font-size)',
      transition: getAnimationTransition(),
      transform: isFocused ? 'scale(1)' : 'scale(0.995)',
      opacity:   isFocused ? 1 : 0.9,
    };

    if (uiStyleProfile === 'neo-brutalism') return { ...base, background: '#ffffff', color: '#000000', borderRadius: 0, border: isFocused ? '3px solid #000000' : '2px solid #222222', boxShadow: isFocused ? '6px 6px 0px #000000' : '3px 3px 0px #000000' };
    if (uiStyleProfile === 'cyberpunk')     return { ...base, background: 'rgba(10,10,14,0.93)', color: '#00ffcc', borderRadius: 0, border: `1px solid ${color || '#00ffcc'}`, boxShadow: isFocused && windowBorderGlow ? `0 0 20px ${color}66, inset 0 0 10px ${color}33` : '0 4px 15px rgba(0,0,0,0.8)' };
    if (uiStyleProfile === 'minimalist')    return { ...base, background: '#ffffff', color: '#111111', borderRadius: 6, border: isFocused ? '1px solid #111111' : '1px solid #e5e7eb', boxShadow: isFocused ? '0 10px 25px -5px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)' };

    return {
      ...base,
      background: 'rgba(18,18,18,var(--ui-opacity,0.75))',
      backdropFilter: 'blur(var(--ui-blur,20px))',
      WebkitBackdropFilter: 'blur(var(--ui-blur,20px))',
      color: '#f3f4f6',
      borderRadius: 'var(--border-radius,14px)',
      border: isFocused ? `1px solid ${color}cc` : '1px solid rgba(255,255,255,0.08)',
      boxShadow: isFocused && windowBorderGlow ? `0 12px 40px rgba(0,0,0,0.6), 0 0 15px ${color}33` : '0 8px 24px rgba(0,0,0,0.4)',
    };
  };

  return (
    <div onClick={() => focusWindow(id)} style={getWindowStyles()}>
      {/* Title bar */}
      <div
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={() => toggleMaximize(id)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: uiStyleProfile === 'neo-brutalism' ? '12px' : '10px 14px',
          background: uiStyleProfile === 'neo-brutalism' ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
          borderBottom: uiStyleProfile === 'neo-brutalism' ? '3px solid #000000' : '1px solid rgba(255,255,255,0.05)',
          cursor: maximized ? 'default' : 'move',
          userSelect: 'none',
          minHeight: TITLEBAR_H,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>{emoji}</span>
          <span style={{
            fontWeight: uiStyleProfile === 'neo-brutalism' ? 900 : 600,
            fontSize: 13, letterSpacing: '0.02em',
            textTransform: store.fontTransformStyle === 'uppercase' ? 'uppercase' : store.fontTransformStyle === 'lowercase' ? 'lowercase' : 'none',
            color: uiStyleProfile === 'neo-brutalism' ? '#000000' : isFocused ? '#ffffff' : 'rgba(255,255,255,0.55)',
          }}>
            {name}
          </span>
        </div>

        <div
          onMouseEnter={() => setHoveredControls(true)}
          onMouseLeave={() => setHoveredControls(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {/* Minimise */}
          <div onClick={(e) => { e.stopPropagation(); toggleMinimize(id); }} style={{ width: 13, height: 13, borderRadius: uiStyleProfile === 'neo-brutalism' ? 0 : '50%', background: '#fbbf24', border: uiStyleProfile === 'neo-brutalism' ? '2px solid #000000' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 9, fontWeight: 900, color: '#451a03' }}>
            {hoveredControls && '–'}
          </div>
          {/* Maximise */}
          <div onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }} style={{ width: 13, height: 13, borderRadius: uiStyleProfile === 'neo-brutalism' ? 0 : '50%', background: '#34d399', border: uiStyleProfile === 'neo-brutalism' ? '2px solid #000000' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 8, fontWeight: 900, color: '#064e3b' }}>
            {hoveredControls && (maximized ? '⤫' : '⤢')}
          </div>
          {/* Close */}
          <div onClick={(e) => { e.stopPropagation(); closeWindow(id); }} style={{ width: 13, height: 13, borderRadius: uiStyleProfile === 'neo-brutalism' ? 0 : '50%', background: '#f87171', border: uiStyleProfile === 'neo-brutalism' ? '2px solid #000000' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10, fontWeight: 900, color: '#7f1d1d' }}>
            {hoveredControls && '×'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, overflow: 'auto', position: 'relative',
        background: uiStyleProfile === 'neo-brutalism' ? '#ffffff' : uiStyleProfile === 'minimalist' ? '#fafafa' : 'transparent',
      }}>
        {children}
      </div>

      {/* Resize handle */}
      {!maximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute', bottom: 0, right: 0, width: 18, height: 18,
            cursor: 'se-resize', zIndex: 99999,
            background: uiStyleProfile === 'neo-brutalism' ? '#000000' : 'transparent',
            clipPath: uiStyleProfile === 'neo-brutalism' ? 'polygon(100% 0, 0 100%, 100% 100%)' : 'none',
          }}
        />
      )}
    </div>
  );
}
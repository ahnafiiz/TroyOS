'use client';

import { useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

// FIX: Props now use `minimized`/`maximized` to match WindowState in the store,
// and x/y/width/height are optional with sensible defaults since WindowState
// stores position/size as nested objects. Desktop spreads {...win} so we accept
// both the flat props used internally and the optional nested shapes.
interface WindowProps {
  id: string;
  appId: string;
  name?: string;
  emoji?: string;
  color?: string;
  width?: number;
  height?: number;
  // FIX: x/y come from position.x/y in WindowState; Desktop passes them via spread
  // so we keep them optional here and default to 100/100 below
  x?: number;
  y?: number;
  zIndex?: number;
  // FIX: renamed from isMinimized/isMaximized → minimized/maximized to match WindowState
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
  const activeWindowId = store.activeWindowId;

  const uiStyleProfile    = store.uiStyleProfile    || 'default';
  const windowAnimationCurve = store.windowAnimationCurve || 'smooth';
  const windowBorderGlow  = store.windowBorderGlow !== false;

  const closeWindow   = typeof store.closeWindow   === 'function' ? store.closeWindow   : () => {};
  const focusWindow   = typeof store.focusWindow   === 'function' ? store.focusWindow   : () => {};
  const toggleMinimize = typeof store.toggleMinimize === 'function' ? store.toggleMinimize : () => {};
  const toggleMaximize = typeof store.toggleMaximize === 'function' ? store.toggleMaximize : () => {};

  // FIX: updateWindowPosition / updateWindowSize each take (id, { x, y }) / (id, { width, height })
  // NOT separate numeric arguments — match the OSState signature exactly
  const moveWindow   = typeof store.updateWindowPosition === 'function'
    ? store.updateWindowPosition
    : (_id: string, _pos: { x: number; y: number }) => {};
  const resizeWindow = typeof store.updateWindowSize === 'function'
    ? store.updateWindowSize
    : (_id: string, _size: { width: number; height: number }) => {};

  const [hoveredControls, setHoveredControls] = useState(false);
  const isFocused = activeWindowId === id;

  const dragStart   = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, winW: 0, winH: 0 });

  // FIX: use `minimized` (not `isMinimized`)
  if (minimized) return null;

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    // FIX: use `maximized` (not `isMaximized`)
    if (maximized || e.button !== 0) return;
    focusWindow(id);
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, winX: x, winY: y };

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStart.current.mouseX;
      const dy = ev.clientY - dragStart.current.mouseY;
      // FIX: pass position as an object { x, y }
      moveWindow(id, { x: dragStart.current.winX + dx, y: dragStart.current.winY + dy });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (maximized || e.button !== 0) return;
    e.stopPropagation();
    focusWindow(id);
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, winW: width, winH: height };

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - resizeStart.current.mouseX;
      const dy = ev.clientY - resizeStart.current.mouseY;
      const nextW = Math.max(280, resizeStart.current.winW + dx);
      const nextH = Math.max(200, resizeStart.current.winH + dy);
      // FIX: pass size as an object { width, height }
      resizeWindow(id, { width: nextW, height: nextH });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const getAnimationTransition = () => {
  if (windowAnimationCurve === 'slide') {
    return 'width 0.12s ease, height 0.12s ease, left 0.12s ease, top 0.12s ease';
  }

  if (windowAnimationCurve === 'fade') {
    return 'all 0.3s ease';
  }

  // smooth (default)
  return `
    width 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
    height 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
    left 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
    top 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.2s ease,
    opacity 0.2s ease
  `;
};
  const getWindowStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      left:   maximized ? 0 : x,
      top:    maximized ? 0 : y,
      width:  maximized ? '100vw' : width,
      height: maximized ? 'calc(100vh - var(--taskbar-offset, 60px))' : height,
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

    if (uiStyleProfile === 'neo-brutalism') {
      return {
        ...baseStyles,
        background: '#ffffff',
        color: '#000000',
        borderRadius: '0px',
        border: isFocused ? '3px solid #000000' : '2px solid #222222',
        boxShadow: isFocused ? '6px 6px 0px #000000' : '3px 3px 0px #000000',
      };
    }

    if (uiStyleProfile === 'cyberpunk') {
      return {
        ...baseStyles,
        background: 'rgba(10, 10, 14, 0.93)',
        color: '#00ffcc',
        borderRadius: '0px',
        border: `1px solid ${color || '#00ffcc'}`,
        boxShadow: isFocused && windowBorderGlow
          ? `0 0 20px ${color}66, inset 0 0 10px ${color}33`
          : '0 4px 15px rgba(0,0,0,0.8)',
      };
    }

    if (uiStyleProfile === 'minimalist') {
      return {
        ...baseStyles,
        background: '#ffffff',
        color: '#111111',
        borderRadius: '6px',
        border: isFocused ? '1px solid #111111' : '1px solid #e5e7eb',
        boxShadow: isFocused
          ? '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.05)',
      };
    }

    return {
      ...baseStyles,
      background: 'rgba(18, 18, 18, var(--ui-opacity, 0.75))',
      backdropFilter: 'blur(var(--ui-blur, 20px))',
      WebkitBackdropFilter: 'blur(var(--ui-blur, 20px))',
      color: '#f3f4f6',
      borderRadius: 'var(--border-radius, 14px)',
      border: isFocused ? `1px solid ${color}cc` : '1px solid rgba(255,255,255,0.08)',
      boxShadow: isFocused && windowBorderGlow
        ? `0 12px 40px rgba(0, 0, 0, 0.6), 0 0 15px ${color}33`
        : '0 8px 24px rgba(0,0,0,0.4)',
    };
  };

  return (
    <div onClick={() => focusWindow(id)} style={getWindowStyles()}>
      {/* Title bar */}
      <div
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={() => toggleMaximize(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: uiStyleProfile === 'neo-brutalism' ? '12px' : '10px 14px',
          background: uiStyleProfile === 'neo-brutalism' ? '#f3f4f6' : 'rgba(255, 255, 255, 0.03)',
          borderBottom: uiStyleProfile === 'neo-brutalism' ? '3px solid #000000' : '1px solid rgba(255, 255, 255, 0.05)',
          cursor: maximized ? 'default' : 'move',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '16px' }}>{emoji}</span>
          <span style={{
            fontWeight: uiStyleProfile === 'neo-brutalism' ? 900 : 600,
            fontSize: '13px',
            letterSpacing: '0.02em',
            textTransform: store.fontTransformStyle === 'uppercase'
              ? 'uppercase'
              : store.fontTransformStyle === 'lowercase'
              ? 'lowercase'
              : 'none',
            color: uiStyleProfile === 'neo-brutalism'
              ? '#000000'
              : isFocused ? '#ffffff' : 'rgba(255,255,255,0.55)',
          }}>
            {name}
          </span>
        </div>

        <div
          onMouseEnter={() => setHoveredControls(true)}
          onMouseLeave={() => setHoveredControls(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <div
            onClick={(e) => { e.stopPropagation(); toggleMinimize(id); }}
            style={{
              width: 13, height: 13,
              borderRadius: uiStyleProfile === 'neo-brutalism' ? '0px' : '50%',
              background: '#fbbf24',
              border: uiStyleProfile === 'neo-brutalism' ? '2px solid #000000' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '9px', fontWeight: 900, color: '#451a03',
            }}
          >
            {hoveredControls && '–'}
          </div>

          <div
            onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
            style={{
              width: 13, height: 13,
              borderRadius: uiStyleProfile === 'neo-brutalism' ? '0px' : '50%',
              background: '#34d399',
              border: uiStyleProfile === 'neo-brutalism' ? '2px solid #000000' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '8px', fontWeight: 900, color: '#064e3b',
            }}
          >
            {hoveredControls && (maximized ? '⤫' : '⤢')}
          </div>

          <div
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            style={{
              width: 13, height: 13,
              borderRadius: uiStyleProfile === 'neo-brutalism' ? '0px' : '50%',
              background: '#f87171',
              border: uiStyleProfile === 'neo-brutalism' ? '2px solid #000000' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '10px', fontWeight: 900, color: '#7f1d1d',
            }}
          >
            {hoveredControls && '×'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative',
        background: uiStyleProfile === 'neo-brutalism'
          ? '#ffffff'
          : uiStyleProfile === 'minimalist'
          ? '#fafafa'
          : 'transparent',
      }}>
        {children}
      </div>

      {/* Resize handle */}
      {!maximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 16, height: 16,
            cursor: 'se-resize',
            zIndex: 99999,
            background: uiStyleProfile === 'neo-brutalism' ? '#000000' : 'transparent',
            clipPath: uiStyleProfile === 'neo-brutalism' ? 'polygon(100% 0, 0 100%, 100% 100%)' : 'none',
          }}
        />
      )}
    </div>
  );
}
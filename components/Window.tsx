'use client';

import { useRef, useEffect, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';

interface WindowProps {
  id: string;
  appId: string;
  name: string;
  emoji: string;
  color: string;
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  children: React.ReactNode;
}

export default function Window({
  id,
  name,
  emoji,
  color,
  width,
  height,
  x,
  y,
  zIndex,
  isMinimized,
  isMaximized,
  children
}: WindowProps) {
  const store = useOSStore();
  const activeWindowId = store.activeWindowId;

  // Store actions
  const closeWindow = typeof store.closeWindow === 'function' ? store.closeWindow : () => {};
  const focusWindow = typeof store.focusWindow === 'function' ? store.focusWindow : () => {};
  const toggleMinimize = typeof store.toggleMinimize === 'function' ? store.toggleMinimize : () => {};
  const toggleMaximize = typeof store.toggleMaximize === 'function' ? store.toggleMaximize : () => {};
  const moveWindow = typeof store.updateWindowPosition === 'function' ? store.updateWindowPosition : () => {};
  const resizeWindow = typeof store.updateWindowSize === 'function' ? store.updateWindowSize : () => {};

  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const isDragging = useRef(false);

  const resizeStart = useRef({ mouseX: 0, mouseY: 0, winW: 0, winH: 0 });
  const isResizing = useRef(false);

  const [hoveredControls, setHoveredControls] = useState(false);

  const isActive = activeWindowId === id;

  // Dynamic customization profiles derived from store settings
  const sysFont = store.systemFontFamily || 'var(--font-geist-sans), sans-serif';
  const sysFontSize = store.systemFontSize || 13;
  const sysBlur = store.uiBlur ?? 24;
  const sysOpacity = store.uiOpacity ?? 0.75;
  const sysBorderRadius = store.uiBorderRadius ?? 16; 

  // Core desktop geometry setting: Define the exact height of your bottom unified taskbar
  const TASKBAR_HEIGHT = 48; 

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMaximized || e.button !== 0) return;
    focusWindow(id);
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, winX: x, winY: y };
    isDragging.current = true;
    e.preventDefault();
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isMaximized || e.button !== 0) return;
    focusWindow(id);
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, winW: width, winH: height };
    isResizing.current = true;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const dx = e.clientX - dragStart.current.mouseX;
        const dy = e.clientY - dragStart.current.mouseY;
        const nextX = dragStart.current.winX + dx;
        const nextY = dragStart.current.winY + dy;

        // Constraint: Prevent drag operations from pushing standard windows below the taskbar plane
        const clampedX = Math.max(0, Math.min(nextX, window.innerWidth - 100));
        const clampedY = Math.max(0, Math.min(nextY, window.innerHeight - (TASKBAR_HEIGHT + 40)));

        moveWindow(id, clampedX, clampedY);
      }
      if (isResizing.current) {
        const dx = e.clientX - resizeStart.current.mouseX;
        const dy = e.clientY - resizeStart.current.mouseY;
        const newW = Math.max(350, resizeStart.current.winW + dx);
        
        // Constraint: Prevent sizing controls from overlapping past the taskbar boundary
        const maxAllowedHeight = window.innerHeight - y - TASKBAR_HEIGHT;
        const newH = Math.max(250, Math.min(resizeStart.current.winH + dy, maxAllowedHeight));

        resizeWindow(id, newW, newH);
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      isResizing.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [id, x, y, width, height, isMaximized, moveWindow, resizeWindow]);

  if (isMinimized) return null;

  // Fully Maximized mode now fills the screen but stops perfectly at the top of the taskbar
  const finalStyle: React.CSSProperties = isMaximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: `calc(100vh - ${TASKBAR_HEIGHT}px)`, 
        zIndex: zIndex + 50, 
        borderRadius: 0,
        border: 'none',
      }
    : {
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        zIndex: zIndex + 50,
        borderRadius: `${sysBorderRadius}px`,
        border: isActive ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.06)',
      };

  return (
    <div
      onMouseDown={() => focusWindow(id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: isActive ? `rgba(16, 20, 30, ${sysOpacity})` : `rgba(13, 16, 23, ${sysOpacity - 0.15})`,
        backdropFilter: `blur(${sysBlur}px) saturate(120%)`,
        boxShadow: isActive 
          ? `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${color}15, inset 0 1px 0 rgba(255,255,255,0.08)` 
          : '0 12px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
        transition: isDragging.current || isResizing.current ? 'none' : 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        pointerEvents: 'auto',
        fontFamily: sysFont,
        ...finalStyle,
      }}
    >
      {/* Titlebar Header */}
      <div
        onMouseDown={handleHeaderMouseDown}
        style={{
          height: 40,
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          cursor: isMaximized ? 'default' : 'move',
          flexShrink: 0,
        }}
      >
        {/* App Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <span style={{ 
            fontSize: `${sysFontSize}px`, 
            fontWeight: 600, 
            color: isActive ? '#f3f4f6' : '#9ca3af', 
            letterSpacing: '0.01em' 
          }}>
            {name}
          </span>
        </div>

        {/* System Control Buttons with hover indicator symbols */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 2 }} 
          onMouseDown={e => e.stopPropagation()}
          onMouseEnter={() => setHoveredControls(true)}
          onMouseLeave={() => setHoveredControls(false)}
        >
          {/* Minimize */}
          <div 
            onClick={() => toggleMinimize(id)}
            style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <div style={{
              width: 12, height: 12, borderRadius: '50%', background: '#fbbf24',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#451a03', fontSize: '9px', fontWeight: 800,
              transition: 'transform 0.15s, filter 0.15s',
              transform: hoveredControls ? 'scale(1.1)' : 'scale(1)',
              filter: hoveredControls ? 'brightness(1.1)' : 'brightness(0.95)'
            }}>
              {hoveredControls && '−'}
            </div>
          </div>

          {/* Maximize */}
          <div 
            onClick={() => toggleMaximize(id)}
            style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <div style={{
              width: 12, height: 12, borderRadius: '50%', background: '#34d399',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#022c22', fontSize: '8px', fontWeight: 800,
              transition: 'transform 0.15s, filter 0.15s',
              transform: hoveredControls ? 'scale(1.1)' : 'scale(1)',
              filter: hoveredControls ? 'brightness(1.1)' : 'brightness(0.95)'
            }}>
              {hoveredControls && (isMaximized ? '⤫' : '⤢')}
            </div>
          </div>

          {/* Close */}
          <div 
            onClick={() => closeWindow(id)}
            style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <div style={{
              width: 12, height: 12, borderRadius: '50%', background: '#f87171',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#7f1d1d', fontSize: '10px', fontWeight: 700,
              transition: 'transform 0.15s, filter 0.15s',
              transform: hoveredControls ? 'scale(1.1)' : 'scale(1)',
              filter: hoveredControls ? 'brightness(1.1)' : 'brightness(0.95)'
            }}>
              {hoveredControls && '×'}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Window Area */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {children}
      </div>

      {/* Resize Handle Trigger (Bottom Right Corner) */}
      {!isMaximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 16,
            height: 16,
            cursor: 'se-resize',
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
}
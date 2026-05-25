'use client';

import { useRef, useState, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import AppIcon from '@/components/AppIcon';

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
  color,
  width = 800,
  height = 560,
  x = 100,
  y = 80,
  zIndex = 100,
  minimized = false,
  maximized = false,
  children,
}: WindowProps) {
  const store               = useOSStore();
  const activeWindowId      = store.activeWindowId;
  const uiStyleProfile      = store.uiStyleProfile      || 'default';
  const windowAnimationCurve = store.windowAnimationCurve || 'smooth';
  const windowBorderGlow    = store.windowBorderGlow !== false;
  const taskbarHeight       = store.taskbarHeight ?? 54;
  const dockPosition        = store.dockPosition  ?? 'bottom';
  const accentColor         = store.accentColor   || '#3b82f6';
  const iconImages          = store.iconImages;

  const closeWindow    = store.closeWindow          ?? (() => {});
  const focusWindow    = store.focusWindow          ?? (() => {});
  const toggleMinimize = store.toggleMinimize       ?? (() => {});
  const toggleMaximize = store.toggleMaximize       ?? (() => {});
  const moveWindow     = store.updateWindowPosition ?? (() => {});
  const resizeWindow   = store.updateWindowSize     ?? (() => {});

  const [hoveredControls, setHoveredControls] = useState(false);
  const [viewport, setViewport] = useState({ w: 1280, h: 800 });
  const isFocused = activeWindowId === id;

  const dragStart   = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, winW: 0, winH: 0 });

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (minimized) return null;

  const TITLEBAR_H = 40;
  /* ── Minimum window size ── */
  const MIN_W = 680;
  const MIN_H = 480;

  const usable = {
    top:    dockPosition === 'top'    ? taskbarHeight : 0,
    bottom: dockPosition === 'bottom' ? taskbarHeight : 0,
    left:   dockPosition === 'left'   ? taskbarHeight : 0,
    right:  dockPosition === 'right'  ? taskbarHeight : 0,
  };

  const usableW = viewport.w - usable.left - usable.right;
  const usableH = viewport.h - usable.top  - usable.bottom;

  const clampPos = (nx: number, ny: number) => ({
    x: Math.max(usable.left - width  + 120, Math.min(nx, usable.left + usableW - 60)),
    y: Math.max(usable.top,                 Math.min(ny, usable.top  + usableH - TITLEBAR_H)),
  });

  const clampSize = (nw: number, nh: number) => ({
    width:  Math.max(MIN_W, Math.min(nw, usableW)),
    height: Math.max(MIN_H, Math.min(nh, usableH)),
  });

  const maximizedStyle: React.CSSProperties = {
    left:   usable.left,
    top:    usable.top,
    width:  usableW,
    height: usableH,
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (maximized || e.button !== 0) return;
    focusWindow(id);
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, winX: x, winY: y };
    const onMove = (ev: MouseEvent) => {
      moveWindow(id, clampPos(
        dragStart.current.winX + ev.clientX - dragStart.current.mouseX,
        dragStart.current.winY + ev.clientY - dragStart.current.mouseY,
      ));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (maximized || e.button !== 0) return;
    e.stopPropagation();
    focusWindow(id);
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, winW: width, winH: height };
    const onMove = (ev: MouseEvent) => {
      resizeWindow(id, clampSize(
        resizeStart.current.winW + ev.clientX - resizeStart.current.mouseX,
        resizeStart.current.winH + ev.clientY - resizeStart.current.mouseY,
      ));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  };

  const getAnimationTransition = () => {
    switch (windowAnimationCurve) {
      case 'slide':  return 'width 0.12s ease, height 0.12s ease, left 0.12s ease, top 0.12s ease';
      case 'fade':   return 'all 0.3s ease';
      case 'snappy': return 'width 0.08s ease, height 0.08s ease, left 0.08s ease, top 0.08s ease';
      case 'retro-pop': return 'none';
      default:       return 'width 0.22s cubic-bezier(0.2,0.8,0.2,1), height 0.22s cubic-bezier(0.2,0.8,0.2,1), left 0.22s cubic-bezier(0.2,0.8,0.2,1), top 0.22s cubic-bezier(0.2,0.8,0.2,1), transform 0.2s ease, opacity 0.2s ease';
    }
  };

  /* ── Capitalise first letter of name ── */
  const displayName = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : '';

  /* ── Resolve app icon: custom upload → SVG file → emoji fallback ── */
  const iconSrc = iconImages[id] ?? iconImages[emoji] ?? `/icons/apps/${id}.svg`;

  const getWindowStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position:       'absolute',
      left:           maximized ? maximizedStyle.left   : x,
      top:            maximized ? maximizedStyle.top    : y,
      width:          maximized ? maximizedStyle.width  : width,
      height:         maximized ? maximizedStyle.height : height,
      minWidth:       MIN_W,
      minHeight:      MIN_H,
      display:        'flex',
      flexDirection:  'column',
      overflow:       'hidden',
      fontFamily:     'var(--font-family)',
      fontSize:       'var(--font-size)',
      transition:     getAnimationTransition(),
      transform:      isFocused ? 'scale(1)'   : 'scale(0.995)',
      opacity:        isFocused ? 1            : 0.9,
      zIndex:         isFocused ? zIndex + 20  : zIndex,
    };

    if (uiStyleProfile === 'neo-brutalism') return { ...base, background: '#ffffff', color: '#000000', borderRadius: 0, border: isFocused ? '3px solid #000000' : '2px solid #222222', boxShadow: isFocused ? '6px 6px 0px #000000' : '3px 3px 0px #000000' };
    if (uiStyleProfile === 'cyberpunk')     return { ...base, background: 'rgba(10,10,14,0.93)', color: '#00ffcc', borderRadius: 0, border: `1px solid ${accentColor}`, boxShadow: isFocused && windowBorderGlow ? `0 0 20px ${accentColor}66, inset 0 0 10px ${accentColor}33` : '0 4px 15px rgba(0,0,0,0.8)' };
    if (uiStyleProfile === 'minimalist')    return { ...base, background: '#ffffff', color: '#111111', borderRadius: 6, border: isFocused ? `1px solid ${accentColor}` : '1px solid #e5e7eb', boxShadow: isFocused ? `0 10px 25px -5px ${accentColor}33` : '0 1px 3px rgba(0,0,0,0.05)' };

    return {
      ...base,
      background:           'rgba(18,18,18,var(--ui-opacity,0.75))',
      backdropFilter:       'blur(var(--ui-blur,20px))',
      WebkitBackdropFilter: 'blur(var(--ui-blur,20px))',
      color:                '#f3f4f6',
      borderRadius:         'var(--border-radius,14px)',
      border:               isFocused ? `1px solid ${accentColor}cc` : '1px solid rgba(255,255,255,0.08)',
      boxShadow:            isFocused && windowBorderGlow ? `0 12px 40px rgba(0,0,0,0.6), 0 0 15px ${accentColor}33` : '0 8px 24px rgba(0,0,0,0.4)',
    };
  };

  return (
    <div data-window onClick={() => focusWindow(id)} style={getWindowStyles()}>
      {/* Title bar */}
      <div
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={() => toggleMaximize(id)}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        uiStyleProfile === 'neo-brutalism' ? '12px' : '10px 14px',
          background:     uiStyleProfile === 'neo-brutalism' ? '#f3f4f6' : 'rgba(255,255,255,0.03)',
          borderBottom:   uiStyleProfile === 'neo-brutalism' ? '3px solid #000000' : '1px solid rgba(255,255,255,0.05)',
          cursor:         maximized ? 'default' : 'move',
          userSelect:     'none',
          minHeight:      TITLEBAR_H,
          flexShrink:     0,
        }}
      >
        {/* Left: icon + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {/* App icon — tries SVG file, falls back to emoji */}
          <div style={{
            width: 22, height: 22,
            borderRadius: 6,
            background: color ? `${color}22` : 'rgba(255,255,255,0.06)',
            border: color ? `1px solid ${color}33` : '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            <AppIcon
              src={iconSrc}
              size={14}
              color={accentColor}
              style={{ display: 'block' }}
            />
          </div>

          <span style={{
            fontWeight:    uiStyleProfile === 'neo-brutalism' ? 900 : 600,
            fontSize:      13,
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
            {displayName}
          </span>
        </div>

        {/* Right: traffic-light controls */}
        <div
          onMouseEnter={() => setHoveredControls(true)}
          onMouseLeave={() => setHoveredControls(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <div onClick={(e) => { e.stopPropagation(); toggleMinimize(id); }} style={{ width: 14, height: 14, borderRadius: uiStyleProfile === 'neo-brutalism' ? 0 : '50%', background: '#fbbf24', border: uiStyleProfile === 'neo-brutalism' ? '2px solid #000000' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 900, color: '#451a03' }}>
            {hoveredControls && '–'}
          </div>
          <div onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }} style={{ width: 14, height: 14, borderRadius: uiStyleProfile === 'neo-brutalism' ? 0 : '50%', background: '#34d399', border: uiStyleProfile === 'neo-brutalism' ? '2px solid #000000' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10, fontWeight: 900, color: '#064e3b' }}>
            {hoveredControls && (maximized ? '⤫' : '⤢')}
          </div>
          <div onClick={(e) => { e.stopPropagation(); closeWindow(id); }} style={{ width: 14, height: 14, borderRadius: uiStyleProfile === 'neo-brutalism' ? 0 : '50%', background: '#f87171', border: uiStyleProfile === 'neo-brutalism' ? '2px solid #000000' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 900, color: '#7f1d1d' }}>
            {hoveredControls && '×'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex:       1,
        overflow:   'auto',
        position:   'relative',
        background: uiStyleProfile === 'neo-brutalism' ? '#ffffff' : uiStyleProfile === 'minimalist' ? '#fafafa' : 'transparent',
      }}>
        {children}
      </div>

      {/* Resize handle */}
      {!maximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position:  'absolute',
            bottom:    0,
            right:     0,
            width:     18,
            height:    18,
            cursor:    'se-resize',
            zIndex:    99999,
            background: uiStyleProfile === 'neo-brutalism' ? '#000000' : 'transparent',
            clipPath:   uiStyleProfile === 'neo-brutalism' ? 'polygon(100% 0, 0 100%, 100% 100%)' : 'none',
          }}
        />
      )}
    </div>
  );
}
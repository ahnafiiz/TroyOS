'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { WALLPAPERS } from '@/config/themes';
import { APPS } from '@/config/apps';
import Window from './Window';
import Taskbar from './Taskbar';
import AppLauncher from './AppLauncher';

import BrowserApp  from './apps/BrowserApp';
import GamingHub   from './apps/GamingHub';
import Terminal    from './apps/Terminal';
import AIAssistant from './apps/AIAssistant';
import Settings    from './apps/Settings';

import SnakeGame  from './games/SnakeGame';
import Game2048   from './games/Game2048';
import MemoryGame from './games/MemoryGame';
import TicTacToe  from './games/TicTacToe';

const BUILTIN_GAMES: Record<number, React.ReactNode> = {
  10: <SnakeGame />,
  11: <Game2048 />,
  12: <MemoryGame />,
  13: <TicTacToe />,
};

const GRID_STEP = 100;
const snapToGrid = (val: number) => Math.round(val / GRID_STEP) * GRID_STEP;

// Clock sizing — derived from font size, not fixed constants
const CLOCK_H_PADDING = 85; // px each side
const CLOCK_V_PADDING = 18; // px top/bottom

function getClockWidth(fontSize: number, use24Hour: boolean, showSeconds = false): number {
  const charWidth  = fontSize * 0.62;
  const colonWidth = fontSize * 0.3;
  const spaceWidth = fontSize * 0.25;
  // "HH:MM" = 4 digits + 1 colon; seconds adds ":SS" = 1 colon + 2 digits
  const secondsExtra = showSeconds ? colonWidth + 2 * charWidth : 0;
  const amPmWidth    = use24Hour ? 0 : fontSize * 0.45 * 2 + spaceWidth; // "AM"/"PM" + space
  const textWidth    = 4 * charWidth + colonWidth + secondsExtra + amPmWidth;
  return Math.ceil(textWidth + CLOCK_H_PADDING * 2);
}

function getClockHeight(fontSize: number, showDate: boolean): number {
  const timeLineHeight = fontSize * 1.1;
  const dateLine       = showDate ? fontSize * 0.22 + 10 : 0;
  return Math.ceil(timeLineHeight + dateLine + CLOCK_V_PADDING * 2);
}

function getAppContent(appId: string) {
  const gameId = parseInt(appId);
  if (!isNaN(gameId) && BUILTIN_GAMES[gameId]) return BUILTIN_GAMES[gameId];

  switch (appId) {
    case 'browser':  return <BrowserApp />;
    case 'gaming':   return <GamingHub />;
    case 'terminal': return <Terminal />;
    case 'ai':       return <AIAssistant />;
    case 'settings': return <Settings />;
  }

  const app = APPS.find(a => a.id === appId);
  if (app?.url) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#12131a', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '8px 16px',
          background: 'rgba(20, 21, 28, 0.6)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500, letterSpacing: '0.02em' }}>
            ⚠️ External application sandbox. Unresponsive frames can be recovered by launching in tab.
          </span>
          <a href={app.url} target="_blank" rel="noreferrer" style={{
            fontSize: 11, color: '#3b82f6', fontWeight: 600, textDecoration: 'none',
            background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '6px', transition: 'background 0.2s',
          }}>
            Open in Tab ↗
          </a>
        </div>
        <iframe src={app.url} style={{ flex: 1, border: 'none', background: '#fff' }} title={app.name}
          allow="fullscreen; autoplay"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock" />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: 'rgba(10,12,18,0.6)', backdropFilter: 'blur(10px)' }}>
      <span style={{ fontSize: 44, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}>{app?.emoji || '📦'}</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Coming soon</span>
    </div>
  );
}

interface ClockStyleSettings {
  type: 'hud' | 'glass' | 'retro' | 'minimal';
  color: string;
  glowColor: string;
  use24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  fontFamily?: string;
  fontSize?: number;
}

interface CustomClockProps {
  timeStr: string;
  dateStr: string;
  settings: ClockStyleSettings;
  position: { x: number; y: number };
  onDragEnd: (x: number, y: number) => void;
}

function CustomizableClock({ timeStr, dateStr, settings, position, onDragEnd }: CustomClockProps) {
  // Track live drag offset only — position comes from props (parent state)
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const dragStartRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const fontSize = settings.fontSize ?? 52;
  const clockW   = getClockWidth(fontSize, settings.use24Hour, settings.showSeconds);
  const clockH   = getClockHeight(fontSize, settings.showDate);

  // Derived display position — parent's committed pos + live drag delta
  const displayPos = dragOffset
    ? { x: position.x + dragOffset.dx, y: position.y + dragOffset.dy }
    : position;

  const isDragging = dragOffset !== null;

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragStartRef.current = { mx: e.clientX, my: e.clientY, px: position.x, py: position.y };
    setDragOffset({ dx: 0, dy: 0 });

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragStartRef.current) return;
      setDragOffset({
        dx: ev.clientX - dragStartRef.current.mx,
        dy: ev.clientY - dragStartRef.current.my,
      });
    };

    const onMouseUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (dragStartRef.current) {
        const finalX = snapToGrid(dragStartRef.current.px + (ev.clientX - dragStartRef.current.mx));
        const finalY = snapToGrid(dragStartRef.current.py + (ev.clientY - dragStartRef.current.my));
        onDragEnd(finalX, finalY);
      }
      setDragOffset(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const getStylePreset = (): React.CSSProperties => {
    switch (settings.type) {
      case 'glass':
        return {
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          padding: `${CLOCK_V_PADDING}px ${CLOCK_H_PADDING}px`,
          borderRadius: 'var(--border-radius, 24px)',
        };
      case 'retro':
        return {
          background: '#040508',
          border: `2px solid ${settings.color}`,
          boxShadow: `0 0 20px ${settings.glowColor}`,
          padding: `${CLOCK_V_PADDING}px ${CLOCK_H_PADDING}px`,
          borderRadius: 'calc(var(--border-radius, 12px) * 0.75)',
        };
      case 'minimal':
        return {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: `${CLOCK_V_PADDING}px ${CLOCK_H_PADDING}px`,
          borderRadius: 0,
        };
      case 'hud':
      default:
        return {
          background: 'rgba(10, 12, 18, var(--ui-opacity, 0.5))',
          backdropFilter: 'blur(var(--ui-blur, 16px))',
          border: '1px solid rgba(255,255,255,0.04)',
          boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
          padding: `${CLOCK_V_PADDING}px ${CLOCK_H_PADDING}px`,
          borderRadius: 'var(--border-radius, 20px)',
        };
    }
  };

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: displayPos.x,
        top: displayPos.y,
        width: clockW,
        height: clockH,
        zIndex: 5,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        transition: isDragging
          ? 'none'
          : 'width 0.3s cubic-bezier(0.16,1,0.3,1), height 0.3s cubic-bezier(0.16,1,0.3,1)',
        boxSizing: 'border-box',
        ...getStylePreset(),
      }}
    >
      {/* Time */}
      <div style={{
        fontSize,
        fontWeight: settings.type === 'retro' ? 900 : 300,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        color: settings.color,
        fontFamily: settings.fontFamily || 'inherit',
        textShadow: `0 0 16px ${settings.glowColor}`,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}>
        {timeStr}
      </div>

      {/* Date */}
      {settings.showDate && (
        <div style={{
          fontSize: Math.max(9, fontSize * 0.18),
          fontWeight: 700,
          marginTop: Math.max(4, fontSize * 0.1),
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          whiteSpace: 'nowrap',
        }}>
          {dateStr}
        </div>
      )}
    </div>
  );
}

interface DraggableIconProps {
  appId: string;
  emoji: string;
  name: string;
  initialX: number;
  initialY: number;
  onDragEnd?: (appId: string, x: number, y: number) => void;
  onOpen?: () => void;
}

function DraggableIcon({ appId, emoji, name, initialX, initialY, onDragEnd, onOpen }: DraggableIconProps) {
  // Track live drag delta only — committed position comes from props
  const [dragDelta, setDragDelta]   = useState<{ dx: number; dy: number } | null>(null);
  const dragStartRef = useRef<{ mx: number; my: number } | null>(null);
  const didDrag      = useRef(false);

  const isDragging  = dragDelta !== null;
  const displayX    = isDragging ? initialX + dragDelta.dx : initialX;
  const displayY    = isDragging ? initialY + dragDelta.dy : initialY;

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    didDrag.current    = false;
    dragStartRef.current = { mx: e.clientX, my: e.clientY };
    setDragDelta({ dx: 0, dy: 0 });

    const onMove = (ev: MouseEvent) => {
      if (!dragStartRef.current) return;
      didDrag.current = true;
      setDragDelta({
        dx: ev.clientX - dragStartRef.current.mx,
        dy: ev.clientY - dragStartRef.current.my,
      });
    };

    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (didDrag.current && dragStartRef.current) {
        const snappedX = snapToGrid(initialX + (ev.clientX - dragStartRef.current.mx));
        const snappedY = snapToGrid(initialY + (ev.clientY - dragStartRef.current.my));
        if (typeof onDragEnd === 'function') onDragEnd(appId, snappedX, snappedY);
      }
      setDragDelta(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!didDrag.current && typeof onOpen === 'function') onOpen();
      }}
      style={{
        position: 'absolute',
        left: displayX,
        top:  displayY,
        width: 84, height: 84,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        padding: '4px',
        borderRadius: 'var(--border-radius, 12px)',
        background: isDragging ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: `1px solid ${isDragging ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
        backdropFilter: isDragging ? 'blur(10px)' : 'none',
        boxShadow: isDragging ? '0 16px 32px rgba(0,0,0,0.4)' : 'none',
        transform: isDragging ? 'scale(1.04)' : 'scale(1)',
        transition: isDragging ? 'none' : 'all 0.23s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: isDragging ? 9999 : 30,
        userSelect: 'none',
      }}
      className="desktop-icon"
    >
      <div style={{
        fontSize: 24, width: 44, height: 44,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'calc(var(--border-radius, 12px) * 0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)', flexShrink: 0,
      }} className="desktop-icon-inner">
        {emoji}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 500, marginTop: 5, textAlign: 'center',
        color: '#f3f4f6', textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        lineHeight: 1.15, width: '100%', padding: '0 2px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {name}
      </span>
    </div>
  );
}

export default function Desktop() {
  const store = useOSStore();

  const windows        = store.windows || [];
  const wallpaperIndex = store.wallpaperIndex ?? 0;
  const launcherOpen   = store.launcherOpen ?? false;
  const notifications  = store.notifications || [];
  const rawCurrentTime = store.currentTime || null;
  const iconPositions  = useOSStore((state) => state.iconPositions) ?? {};

  const openApp            = store.openApp;
  const removeNotification = store.removeNotification;
  const setIconPosition    = store.setIconPosition;

  const wallpaper = WALLPAPERS[wallpaperIndex];
  const [clockPosition, setClockPosition] = useState({ x: 900, y: 100 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  const systemFontFamily = store.systemFontFamily || 'var(--font-geist-sans), sans-serif';
  const systemFontSize   = store.systemFontSize   || 13;
  const accentColor      = store.accentColor      || '#3b82f6';
  const uiOpacity        = store.uiOpacity        ?? 0.75;
  const uiBlur           = store.uiBlur           ?? 20;
  const uiBorderRadius   = store.uiBorderRadius   ?? 16;
  const taskbarHeight    = store.taskbarHeight    ?? 54;
  const customWallpaper  = store.customWallpaper;
  const wallpaperStyle   = store.wallpaperStyle   || 'fill';

  // Fix: stabilise currentTime so useMemo deps don't change every render
  const currentTime = useMemo(
    () => (rawCurrentTime instanceof Date ? rawCurrentTime : new Date()),
    [rawCurrentTime],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ui-blur',       `${uiBlur}px`);
    root.style.setProperty('--ui-opacity',    String(uiOpacity));
    root.style.setProperty('--border-radius', `${uiBorderRadius}px`);
    root.style.setProperty('--font-family',   systemFontFamily);
    root.style.setProperty('--font-size',     `${systemFontSize}px`);
    root.style.setProperty('--accent',        accentColor);
    root.style.setProperty('--accent-glow-soft', accentColor + '55');
    root.style.setProperty('--taskbar-offset', `${taskbarHeight + 12}px`);
    root.style.setProperty('--glass-blur',     `${uiBlur}px`);
    root.style.setProperty('--glass-saturate', '160%');
    root.style.setProperty('--glass-bg',       `rgba(18,18,18,${uiOpacity})`);
    root.style.setProperty('--glass-bg-deep',  `rgba(10,12,18,${uiOpacity})`);
    root.style.setProperty('--glass-border',   'rgba(255,255,255,0.08)');
    root.style.setProperty('--text-primary',   '#ffffff');
    root.style.setProperty('--text-secondary', 'rgba(255,255,255,0.65)');
    root.style.setProperty('--text-tertiary',  'rgba(255,255,255,0.35)');
    root.style.setProperty('--border-subtle',  'rgba(255,255,255,0.05)');
    root.style.setProperty('--border-default', 'rgba(255,255,255,0.10)');

    if (store.cursorStyle && store.cursorStyle !== 'default') {
      root.style.setProperty('cursor', (store.cursorStyle as string) === 'dot' ? 'none' : store.cursorStyle);
    } else {
      root.style.removeProperty('cursor');
    }

    if (store.reducedMotion) {
      root.style.setProperty('--dur-fast',   '0ms');
      root.style.setProperty('--dur-normal', '0ms');
      root.style.setProperty('--dur-slow',   '0ms');
    } else {
      root.style.setProperty('--dur-fast',   '100ms');
      root.style.setProperty('--dur-normal', '200ms');
      root.style.setProperty('--dur-slow',   '400ms');
    }
  }, [
    uiBlur, uiOpacity, uiBorderRadius,
    systemFontFamily, systemFontSize,
    accentColor, taskbarHeight,
    store.cursorStyle, store.reducedMotion,
  ]);

  const parsedWallpaperStyle = useMemo(() => {
    if (customWallpaper) {
      let size   = 'cover';
      let repeat = 'no-repeat';
      if (wallpaperStyle === 'fit')     { size = 'contain'; }
      if (wallpaperStyle === 'stretch') { size = '100% 100%'; }
      if (wallpaperStyle === 'tile')    { size = 'auto'; repeat = 'repeat'; }
      return { backgroundImage: `url("${customWallpaper}")`, backgroundSize: size, backgroundRepeat: repeat, backgroundPosition: 'center' };
    }

    if (!wallpaper?.background) return { backgroundColor: '#0a0c12' };

    const bgStr        = wallpaper.background || '';
    const normalizedBg = bgStr.startsWith('/public/') ? bgStr.replace('/public/', '/') : bgStr;

    const isImage =
      /^https?:\/\//.test(normalizedBg) ||
      normalizedBg.startsWith('/') ||
      normalizedBg.startsWith('blob:') ||
      normalizedBg.startsWith('data:image') ||
      /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(normalizedBg);

    if (isImage) {
      return {
        backgroundImage: `url("${normalizedBg}")`,
        backgroundSize: wallpaperStyle === 'fit' ? 'contain' : wallpaperStyle === 'stretch' ? '100% 100%' : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }

    if (normalizedBg.startsWith('linear-gradient') || normalizedBg.startsWith('radial-gradient')) {
      return { backgroundImage: normalizedBg };
    }

    return { backgroundColor: normalizedBg || '#000' };
  }, [wallpaper, customWallpaper, wallpaperStyle]);

  // Clock settings
  const clockSettings = useMemo((): ClockStyleSettings => ({
    type:        (store.clockSettings?.type as ClockStyleSettings['type']) || 'hud',
    color:       store.clockSettings?.color      || '#ffffff',
    glowColor:   store.clockSettings?.glowColor  || accentColor + '33',
    use24Hour:   store.clockSettings?.use24Hour  !== false,
    showDate:    store.clockSettings?.showDate   !== false,
    showSeconds: !!store.clockSettings?.showSeconds,
    fontSize:    store.clockSettings?.fontSize   || 52,
    fontFamily:  systemFontFamily,
  }), [store.clockSettings, accentColor, systemFontFamily]);

  // Time string — respects use24Hour + showSeconds, uses stable currentTime
  const timeStr = useMemo(() => {
    return currentTime.toLocaleTimeString([], {
      hour:   '2-digit',
      minute: '2-digit',
      ...(clockSettings.showSeconds ? { second: '2-digit' } : {}),
      hour12: !clockSettings.use24Hour,
    });
  }, [currentTime, clockSettings.use24Hour, clockSettings.showSeconds]);

  // Date string — only computed when showDate is true
  const dateStr = useMemo(() => {
    if (!clockSettings.showDate) return '';
    return currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  }, [currentTime, clockSettings.showDate]);

  const getCleanGridPos = (index: number) => {
    if (typeof window === 'undefined') return { x: 30, y: 30 };
    const gridSpacingX = 100, gridSpacingY = 112, margin = 30;
    const maxRows = Math.max(1, Math.floor((window.innerHeight - 180 - margin) / gridSpacingY));
    const col = Math.floor(index / maxRows);
    const row = index % maxRows;
    return { x: snapToGrid(margin + col * gridSpacingX), y: snapToGrid(margin + row * gridSpacingY) };
  };

  const handleIconDragEnd = (appId: string, targetX: number, targetY: number) => {
    const clockW = getClockWidth(clockSettings.fontSize ?? 52, clockSettings.use24Hour, clockSettings.showSeconds);
    const clockH = getClockHeight(clockSettings.fontSize ?? 52, clockSettings.showDate);

    const hitsClock =
      targetX >= clockPosition.x - 40 && targetX <= clockPosition.x + clockW &&
      targetY >= clockPosition.y - 40 && targetY <= clockPosition.y + clockH;

    const posEntries = Object.entries(iconPositions);
    const isOccupied = posEntries.some(([id, pos]) =>
      id !== appId && snapToGrid(pos.x) === targetX && snapToGrid(pos.y) === targetY
    );

    if (isOccupied || hitsClock) {
      let shiftOffset = GRID_STEP;
      let nextX = targetX + shiftOffset;
      while (
        posEntries.some(([id, p]) => id !== appId && snapToGrid(p.x) === nextX && snapToGrid(p.y) === targetY) ||
        (nextX >= clockPosition.x - 40 && nextX <= clockPosition.x + clockW && targetY >= clockPosition.y - 40 && targetY <= clockPosition.y + clockH)
      ) {
        shiftOffset += GRID_STEP;
        nextX = targetX + shiftOffset;
      }
      setIconPosition(appId, { x: nextX, y: targetY });
    } else {
      setIconPosition(appId, { x: targetX, y: targetY });
    }
  };

  const handleClockDragEnd = (targetX: number, targetY: number) => {
    const clockW = getClockWidth(clockSettings.fontSize ?? 52, clockSettings.use24Hour, clockSettings.showSeconds);
    const clockH = getClockHeight(clockSettings.fontSize ?? 52, clockSettings.showDate);

    const checkAt = (checkX: number) => APPS.some((app, index) => {
      const saved = iconPositions[app.id];
      const pos = saved ? { x: snapToGrid(saved.x), y: snapToGrid(saved.y) } : getCleanGridPos(index);
      return pos.x >= checkX - 40 && pos.x <= checkX + clockW &&
             pos.y >= targetY - 40 && pos.y <= targetY + clockH;
    });

    if (checkAt(targetX)) {
      let shiftOffset = GRID_STEP, nextX = targetX + shiftOffset;
      while (checkAt(nextX)) { shiftOffset += GRID_STEP; nextX = targetX + shiftOffset; }
      setClockPosition({ x: nextX, y: targetY });
    } else {
      setClockPosition({ x: targetX, y: targetY });
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  };

  useEffect(() => {
    const close = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden', userSelect: 'none',
        fontFamily: 'var(--font-family, inherit)', color: '#fff', fontSize: 'var(--font-size, 13px)',
      }}
    >
      <style>{`
        @keyframes gridPulse { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.25; } }
        .notif-enter { animation: notifSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1), notifFadeOut 0.4s 4.6s forwards ease-out; }
        @keyframes notifSlide { from { transform: translateY(-20px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes notifFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.92); filter: blur(4px); } }
        .desktop-icon:hover .desktop-icon-inner {
          background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03)) !important;
          border-color: rgba(255,255,255,0.15) !important;
          box-shadow: 0 8px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15) !important;
          transform: translateY(-2px);
        }
      `}</style>

      {/* Wallpaper */}
      <div
        id="troy-desktop-bg"
        style={{
          position: 'absolute', inset: 0,
          transition:
            'background-color 0.8s cubic-bezier(0.16,1,0.3,1), ' +
            'background-image 0.8s cubic-bezier(0.16,1,0.3,1), ' +
            'filter 0.4s ease',
          willChange: 'background-image, background-color',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          ...parsedWallpaperStyle,
        }}
      />

      {/* Grid overlay */}
      {!customWallpaper && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: [
            `linear-gradient(${wallpaper?.gridColor || 'rgba(59,130,246,0.1)'} 1px, transparent 1px)`,
            `linear-gradient(90deg, ${wallpaper?.gridColor || 'rgba(59,130,246,0.1)'} 1px, transparent 1px)`,
          ].join(','),
          backgroundSize: `${GRID_STEP}px ${GRID_STEP}px`,
          animation: 'gridPulse 10s ease-in-out infinite',
        }} />
      )}

      {/* Clock */}
      <CustomizableClock
        timeStr={timeStr}
        dateStr={dateStr}
        settings={clockSettings}
        position={clockPosition}
        onDragEnd={handleClockDragEnd}
      />

      {/* Desktop icons */}
      {APPS.map((app, index) => {
        const saved = iconPositions[app.id];
        const pos   = getCleanGridPos(index);
        return (
          <DraggableIcon
            key={app.id}
            appId={app.id}
            emoji={app.emoji}
            name={app.name}
            initialX={saved ? snapToGrid(saved.x) : pos.x}
            initialY={saved ? snapToGrid(saved.y) : pos.y}
            onDragEnd={handleIconDragEnd}
            onOpen={() => openApp(app.id)}
          />
        );
      })}

      {/* Windows */}
      {windows.map(win => (
        <Window
          key={win.id}
          id={win.id}
          appId={win.appId}
          name={win.name   ?? win.title}
          emoji={win.emoji  ?? '📦'}
          color={win.color  ?? '#3b82f6'}
          width={win.size?.width   ?? win.width  ?? 800}
          height={win.size?.height ?? win.height ?? 560}
          x={win.position?.x ?? 100}
          y={win.position?.y ?? 80}
          zIndex={10}
          minimized={win.minimized ?? false}
          maximized={win.maximized ?? false}
        >
          {getAppContent(win.appId)}
        </Window>
      ))}

      {/* Launcher */}
      {launcherOpen && <AppLauncher />}

      {/* Notifications */}
      <div style={{ position: 'absolute', top: 30, right: 30, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifications.map(n => (
          <div key={n.id} className="notif-enter" onClick={() => removeNotification(n.id)}
            style={{
              background: `rgba(20, 24, 35, ${uiOpacity})`,
              backdropFilter: `blur(${uiBlur}px) saturate(140%)`,
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '12px 18px',
              borderRadius: 'var(--border-radius, 16px)',
              display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', minWidth: 280,
              boxShadow: '0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
            <div style={{ fontSize: 18, width: 32, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 'calc(var(--border-radius, 16px) * 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>{n.icon}</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{n.title}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>{n.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Context menu */}
      {contextMenu.visible && (
        <div style={{
          position: 'absolute', left: contextMenu.x, top: contextMenu.y, width: 170,
          background: `rgba(15, 18, 25, ${uiOpacity})`,
          backdropFilter: `blur(${uiBlur}px)`,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--border-radius, 12px)',
          padding: '6px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <button
            onClick={() => openApp('settings')}
            style={{
              background: 'transparent', border: 'none',
              borderRadius: 'calc(var(--border-radius, 12px) - 4px)',
              color: '#fff', fontSize: 12, fontWeight: 500, textAlign: 'left', padding: '8px 12px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}22`)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ color: accentColor }}>🎨</span> Personalize
          </button>
          <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <div style={{ padding: '4px 12px', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>Troy OS v2.0</div>
        </div>
      )}

      {/* Taskbar */}
      <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 101, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Taskbar />
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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

const GRID_STEP  = 100;
const ICON_SIZE  = 84;
const snapToGrid = (val: number) => Math.round(val / GRID_STEP) * GRID_STEP;

// Reduced padding for tighter clock layout
const CLOCK_H_PADDING = 24;
const CLOCK_V_PADDING = 10;

function getClockWidth(fontSize: number, use24Hour: boolean, showSeconds = false): number {
  const dW = fontSize * 0.60;
  const cW = fontSize * 0.28;
  const sW = fontSize * 0.20;
  const aW = fontSize * 0.44;

  let text = 4 * dW + cW;

  if (showSeconds) text += cW + 2 * dW;

  if (!use24Hour) {
    text += sW + 3 * aW;
  } else {
    // extra width for 24h layout
    text += fontSize * 0.9;
  }

  return Math.ceil(text + CLOCK_H_PADDING * 2);
}

function getClockHeight(fontSize: number, showDate: boolean): number {
  const timeH = fontSize * 1.15;
  const dateH = showDate ? Math.max(10, fontSize * 0.20) + 8 : 0;
  return Math.ceil(timeH + dateH + CLOCK_V_PADDING * 2);
}

// ── Universal free space finder (works for both icons and clock) ──────────────
function findFreeGridCell(
  targetX: number,
  targetY: number,
  gridStep: number,
  occupied: Array<{ x: number; y: number; w: number; h: number }>,
  itemWidth: number,
  itemHeight: number,
  maxW: number,
  maxH: number,
  taskbarH: number
): { x: number; y: number } {
  const candidates: Array<{ x: number; y: number; dist: number }> = [];
  const EDGE_MARGIN = 8; // Reduced from 16

  // Generate all possible grid positions with reduced strictness
  for (let x = EDGE_MARGIN; x < maxW - itemWidth - EDGE_MARGIN; x += gridStep) {
    for (let y = EDGE_MARGIN; y < maxH - taskbarH - itemHeight - EDGE_MARGIN; y += gridStep) {
      // Check if this position overlaps with any occupied space
      const overlaps = occupied.some(occ => 
        x < occ.x + occ.w + 4 && // Reduced collision padding from 8
        x + itemWidth > occ.x - 4 &&
        y < occ.y + occ.h + 4 &&
        y + itemHeight > occ.y - 4
      );

      if (!overlaps) {
        const dist = Math.hypot(x - targetX, y - targetY);
        candidates.push({ x, y, dist });
      }
    }
  }

  // Sort by distance and return closest
  candidates.sort((a, b) => a.dist - b.dist);
  
  return candidates[0] || { 
    x: Math.max(EDGE_MARGIN, Math.min(snapToGrid(targetX), maxW - itemWidth - EDGE_MARGIN)),
    y: Math.max(EDGE_MARGIN, Math.min(snapToGrid(targetY), maxH - taskbarH - itemHeight - EDGE_MARGIN))
  };
}

// ── App content resolver ──────────────────────────────────────────────────────
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
          padding: '8px 16px', background: 'rgba(20,21,28,0.6)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            ⚠️ External sandbox — unresponsive frames can be opened in a new tab.
          </span>
          <a href={app.url} target="_blank" rel="noreferrer" style={{
            fontSize: 11, color: '#3b82f6', fontWeight: 600, textDecoration: 'none',
            background: 'rgba(59,130,246,0.1)', padding: '4px 10px', borderRadius: 6,
          }}>Open in Tab ↗</a>
        </div>
        <iframe src={app.url} style={{ flex: 1, border: 'none', background: '#fff' }} title={app.name}
          allow="fullscreen; autoplay"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock" />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: 'rgba(10,12,18,0.6)', backdropFilter: 'blur(10px)' }}>
      <span style={{ fontSize: 44 }}>{app?.emoji || '📦'}</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Coming soon</span>
    </div>
  );
}

// ── Clock component ───────────────────────────────────────────────────────────

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
  settings: ClockStyleSettings;
  position: { x: number; y: number };
  onDragEnd: (x: number, y: number) => void;
}

function CustomizableClock({ settings, position, onDragEnd }: CustomClockProps): import("react/jsx-runtime").JSX.Element {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], {
        hour:   '2-digit',
        minute: '2-digit',
        ...(settings.showSeconds ? { second: '2-digit' } : {}),
        hour12: !settings.use24Hour,
      }));
      if (settings.showDate) {
        setDateStr(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));
      } else {
        setDateStr('');
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [settings.use24Hour, settings.showSeconds, settings.showDate]);

  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const dragStartRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const fontSize = settings.fontSize ?? 52;
  const clockW   = getClockWidth(fontSize, settings.use24Hour, settings.showSeconds);
  const clockH   = getClockHeight(fontSize, settings.showDate);

  const displayPos = dragOffset
    ? { x: position.x + dragOffset.dx, y: position.y + dragOffset.dy }
    : position;

  const isDragging = dragOffset !== null;

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragStartRef.current = { mx: e.clientX, my: e.clientY, px: position.x, py: position.y };
    setDragOffset({ dx: 0, dy: 0 });

    const onMove = (ev: MouseEvent) => {
      if (!dragStartRef.current) return;
      setDragOffset({ dx: ev.clientX - dragStartRef.current.mx, dy: ev.clientY - dragStartRef.current.my });
    };
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (dragStartRef.current) {
        const rawX = dragStartRef.current.px + (ev.clientX - dragStartRef.current.mx);
        const rawY = dragStartRef.current.py + (ev.clientY - dragStartRef.current.my);
        onDragEnd(rawX, rawY);
      }
      setDragOffset(null);
      dragStartRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const getStylePreset = (): React.CSSProperties => {
    switch (settings.type) {
      case 'glass':
        return {
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          borderRadius: 'var(--border-radius, 24px)',
        };
      case 'retro':
        return {
          background: '#040508',
          border: `2px solid ${settings.color}`,
          boxShadow: `0 0 20px ${settings.glowColor}`,
          borderRadius: 'calc(var(--border-radius, 12px) * 0.75)',
        };
      case 'minimal':
        return { background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: 0 };
      case 'hud':
      default:
        return {
          background: 'rgba(10,12,18,var(--ui-opacity,0.5))',
          backdropFilter: 'blur(var(--ui-blur,16px))',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
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
        top:  displayPos.y,
        width: clockW,
        height: clockH,
        zIndex: 10, // Above icons (30) but below windows
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${CLOCK_V_PADDING}px ${CLOCK_H_PADDING}px`,
        boxSizing: 'border-box',
        transition: isDragging ? 'none' : 'left 0.23s cubic-bezier(0.16,1,0.3,1), top 0.23s cubic-bezier(0.16,1,0.3,1), width 0.3s cubic-bezier(0.16,1,0.3,1), height 0.3s cubic-bezier(0.16,1,0.3,1)',
        ...getStylePreset(),
      }}
    >
      <div style={{
        fontSize,
        fontWeight: settings.type === 'retro' ? 900 : 300,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        color: settings.color,
        fontFamily: settings.fontFamily || 'inherit',
        textShadow: `0 0 20px ${settings.glowColor}`,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}>
        {timeStr || '--:--'}
      </div>
      {settings.showDate && dateStr && (
        <div style={{
          fontSize: Math.max(9, fontSize * 0.19),
          fontWeight: 700,
          marginTop: Math.max(4, fontSize * 0.08),
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          whiteSpace: 'nowrap',
        }}>
          {dateStr}
        </div>
      )}
    </div>
  );
}

// ── Draggable desktop icon ────────────────────────────────────────────────────

interface DraggableIconProps {
  appId: string;
  emoji: string;
  name: string;
  initialX: number;
  initialY: number;
  iconSize: number;
  labelSize: number;
  showLabel: boolean;
  onDragEnd?: (appId: string, x: number, y: number) => void;
  onOpen?: () => void;
}

function DraggableIcon({ appId, emoji, name, initialX, initialY, iconSize, labelSize, showLabel, onDragEnd, onOpen }: DraggableIconProps) {
  const [dragDelta, setDragDelta] = useState<{ dx: number; dy: number } | null>(null);
  const dragStartRef = useRef<{ mx: number; my: number } | null>(null);
  const didDrag      = useRef(false);

  const isDragging = dragDelta !== null;
  const displayX   = isDragging ? initialX + dragDelta.dx : initialX;
  const displayY   = isDragging ? initialY + dragDelta.dy : initialY;

  const iconInnerSize = Math.max(34, Math.min(64, Math.round(iconSize * 0.54)));
  const iconFontSize = Math.max(18, Math.min(26, Math.round(iconInnerSize * 0.55)));
  const labelFontSize = showLabel ? Math.max(8, Math.min(18, labelSize)) : 0;

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    didDrag.current      = false;
    dragStartRef.current = { mx: e.clientX, my: e.clientY };
    setDragDelta({ dx: 0, dy: 0 });

    const onMove = (ev: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = ev.clientX - dragStartRef.current.mx;
      const dy = ev.clientY - dragStartRef.current.my;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
      setDragDelta({ dx, dy });
    };
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (didDrag.current && dragStartRef.current) {
        const rawX = initialX + (ev.clientX - dragStartRef.current.mx);
        const rawY = initialY + (ev.clientY - dragStartRef.current.my);
        if (typeof onDragEnd === 'function') onDragEnd(appId, rawX, rawY);
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
      onDoubleClick={(e) => { e.stopPropagation(); if (!didDrag.current && onOpen) onOpen(); }}
      style={{
        position: 'absolute',
        left: displayX, top: displayY,
        width: iconSize, height: iconSize,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        padding: 0,
        gap: 8,
        boxSizing: 'border-box',
        borderRadius: 'var(--border-radius, 12px)',
        background:     isDragging ? 'rgba(255,255,255,0.08)' : 'transparent',
        border:         `1px solid ${isDragging ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
        backdropFilter: isDragging ? 'blur(10px)' : 'none',
        boxShadow:      isDragging ? '0 16px 32px rgba(0,0,0,0.4)' : 'none',
        transform:      isDragging ? 'scale(1.04)' : 'scale(1)',
        transition:     isDragging ? 'none' : 'all 0.23s cubic-bezier(0.16,1,0.3,1)',
        zIndex: isDragging ? 9999 : 1,
        userSelect: 'none',
      }}
      className="desktop-icon"
    >
      <div style={{
        fontSize: iconFontSize,
        width: iconInnerSize, height: iconInnerSize,
        background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'calc(var(--border-radius,12px)*0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)', flexShrink: 0,
      }} className="desktop-icon-inner">
        {emoji}
      </div>
      <span style={{
        display: showLabel ? 'block' : 'none',
        fontSize: labelFontSize, fontWeight: 500, marginTop: 0, textAlign: 'center',
        color: '#f3f4f6', textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        lineHeight: 1.15, width: '100%', padding: '0 2px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {name}
      </span>
    </div>
  );
}

// ── Desktop ───────────────────────────────────────────────────────────────────

export default function Desktop() {
  const store = useOSStore();

  const windows        = store.windows || [];
  const wallpaperIndex = store.wallpaperIndex ?? 0;
  const launcherOpen   = store.launcherOpen ?? false;
  const notifications  = store.notifications || [];
  const iconPositionsFromStore = useOSStore(s => s.iconPositions);
  const iconPositions = useMemo(() => iconPositionsFromStore ?? {}, [iconPositionsFromStore]);

  const openApp            = store.openApp;
  const removeNotification = store.removeNotification;
  const setIconPosition    = store.setIconPosition;

  const wallpaper = WALLPAPERS[wallpaperIndex];
  const [desktopRefresh, setDesktopRefresh] = useState(0);
  const clockPosition = useMemo(() => store.clockPosition || { x: 900, y: 100 }, [store.clockPosition]);
  const setClockPosition = store.setClockPosition;
  const snapToGridEnabled = store.snapToGridEnabled ?? true;
  const [contextMenu, setContextMenu]     = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  const desktopRef = useRef<HTMLDivElement>(null);
  const [desktopSize, setDesktopSize] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const update = () => {
      if (desktopRef.current) {
        setDesktopSize({ w: desktopRef.current.offsetWidth, h: desktopRef.current.offsetHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const systemFontFamily = store.systemFontFamily || 'var(--font-geist-sans), sans-serif';
  const systemFontSize   = store.systemFontSize   || 13;
  const accentColor      = store.accentColor      || '#3b82f6';
  const uiOpacity        = store.uiOpacity        ?? 0.75;
  const uiBlur           = store.uiBlur           ?? 20;
  const uiBorderRadius   = store.uiBorderRadius   ?? 16;
  const taskbarHeight    = store.taskbarHeight    ?? 54;
  const customWallpaper           = store.customWallpaper;
  const customBackgroundGradient  = store.customBackgroundGradient;
  const customBackgroundColor     = store.customBackgroundColor;
  const wallpaperStyle            = store.wallpaperStyle   || 'fill';
  const showDesktopGrid           = store.showDesktopGrid  ?? true;
  const currentIconSize           = store.iconSize         ?? ICON_SIZE;
  const desktopIconLabelsVisible  = store.desktopIconLabelsVisible ?? true;
  const desktopIconLabelSize      = store.desktopIconLabelSize ?? 11;
  const taskbarOpacity            = store.taskbarOpacity ?? 0.82;
  const launcherOpacity           = store.launcherOpacity ?? 0.96;
  const notificationPosition      = store.notificationPosition || 'top-right';

  const taskbarClearance = taskbarHeight;
  const refreshDesktop = () => setDesktopRefresh((prev) => prev + 1);

  const getNotificationPositionStyles = () => {
    switch (notificationPosition) {
      case 'top-left': return { top: 30, left: 30, right: 'auto', bottom: 'auto' };
      case 'top-right': return { top: 30, right: 30, left: 'auto', bottom: 'auto' };
      case 'bottom-left': return { bottom: 30, left: 30, right: 'auto', top: 'auto' };
      case 'bottom-right':
      default: return { bottom: 30, right: 30, left: 'auto', top: 'auto' };
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ui-blur',           `${uiBlur}px`);
    root.style.setProperty('--ui-opacity',        String(uiOpacity));
    root.style.setProperty('--border-radius',     `${uiBorderRadius}px`);
    root.style.setProperty('--font-family',       systemFontFamily);
    root.style.setProperty('--font-size',         `${systemFontSize}px`);
    root.style.setProperty('--accent',            accentColor);
    root.style.setProperty('--accent-glow-soft',  accentColor + '55');
    root.style.setProperty('--taskbar-offset',    `${taskbarHeight + 12}px`);
    root.style.setProperty('--glass-blur',        `${uiBlur}px`);
    root.style.setProperty('--glass-saturate',    '160%');
    root.style.setProperty('--glass-bg',          `rgba(18,18,18,${uiOpacity})`);
    root.style.setProperty('--glass-bg-deep',     `rgba(10,12,18,${taskbarOpacity})`);
    root.style.setProperty('--taskbar-opacity',   String(taskbarOpacity));
    root.style.setProperty('--launcher-opacity',  String(launcherOpacity));
    root.style.setProperty('--glass-border',      'rgba(255,255,255,0.08)');
    root.style.setProperty('--text-primary',      '#ffffff');
    root.style.setProperty('--text-secondary',    'rgba(255,255,255,0.65)');
    root.style.setProperty('--text-tertiary',     'rgba(255,255,255,0.35)');
    root.style.setProperty('--border-subtle',     'rgba(255,255,255,0.05)');
    root.style.setProperty('--border-default',    'rgba(255,255,255,0.10)');

    if (store.cursorStyle && store.cursorStyle !== 'default') {
      root.style.setProperty('cursor', store.cursorStyle === 'dot' ? 'none' : store.cursorStyle);
    } else {
      root.style.removeProperty('cursor');
    }

    root.style.setProperty('--dur-fast',   store.reducedMotion ? '0ms' : '100ms');
    root.style.setProperty('--dur-normal', store.reducedMotion ? '0ms' : '200ms');
    root.style.setProperty('--dur-slow',   store.reducedMotion ? '0ms' : '400ms');
  }, [uiBlur, uiOpacity, uiBorderRadius, systemFontFamily, systemFontSize, accentColor, taskbarHeight, taskbarOpacity, launcherOpacity, store.cursorStyle, store.reducedMotion]);

  const parsedWallpaperStyle = useMemo(() => {
    if (customWallpaper) {
      let size = 'cover', repeat = 'no-repeat';
      if (wallpaperStyle === 'fit')     { size = 'contain'; }
      if (wallpaperStyle === 'stretch') { size = '100% 100%'; }
      if (wallpaperStyle === 'tile')    { size = 'auto'; repeat = 'repeat'; }
      return { backgroundImage: `url("${customWallpaper}")`, backgroundSize: size, backgroundRepeat: repeat, backgroundPosition: 'center' };
    }
    if (!wallpaper?.background) {
      if (customBackgroundGradient) return { backgroundImage: customBackgroundGradient };
      return { backgroundColor: customBackgroundColor || '#0a0c12' };
    }
    const bg  = wallpaper.background;
    const nbg = bg.startsWith('/public/') ? bg.replace('/public/', '/') : bg;
    const isImg = /^https?:\/\//.test(nbg) || /^(\/|blob:|data:image)/.test(nbg) || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(nbg);
    if (isImg) return { backgroundImage: `url("${nbg}")`, backgroundSize: wallpaperStyle === 'fit' ? 'contain' : wallpaperStyle === 'stretch' ? '100% 100%' : 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
    if (nbg.startsWith('linear-gradient') || nbg.startsWith('radial-gradient')) return { backgroundImage: nbg };
    return { backgroundColor: nbg || '#000' };
  }, [wallpaper, customWallpaper, wallpaperStyle, customBackgroundColor, customBackgroundGradient]);

  const clockSettings = useMemo((): ClockStyleSettings => ({
    type:        (store.clockSettings?.type as ClockStyleSettings['type']) || 'hud',
    color:       store.clockSettings?.color     || '#ffffff',
    glowColor:   store.clockSettings?.glowColor || accentColor + '44',
    use24Hour:   store.clockSettings?.use24Hour !== false,
    showDate:    store.clockSettings?.showDate  !== false,
    showSeconds: !!store.clockSettings?.showSeconds,
    fontSize:    store.clockSettings?.fontSize  || 52,
    fontFamily:  systemFontFamily,
  }), [store.clockSettings, accentColor, systemFontFamily]);

  const getCleanGridPos = useCallback((index: number) => {
    const gx = 100, gy = 112, margin = 20; // Reduced from 30
    const maxRows = Math.max(1, Math.floor((desktopSize.h - taskbarClearance - margin * 2) / gy));
    const col = Math.floor(index / maxRows), row = index % maxRows;
    return { x: snapToGrid(margin + col * gx), y: snapToGrid(margin + row * gy) };
  }, [desktopSize, taskbarClearance]);

  // Get all occupied spaces (icons + clock)
  const getAllOccupiedSpaces = useCallback(() => {
    const occupied: Array<{ x: number; y: number; w: number; h: number }> = [];
    
    // Add all icon positions
    APPS.forEach((app, index) => {
      const saved = iconPositions[app.id];
      const pos = saved ? { x: snapToGrid(saved.x), y: snapToGrid(saved.y) } : getCleanGridPos(index);
      occupied.push({ x: pos.x, y: pos.y, w: currentIconSize, h: currentIconSize });
    });
    
    // Add clock position
    const clockW = getClockWidth(clockSettings.fontSize ?? 52, clockSettings.use24Hour, clockSettings.showSeconds);
    const clockH = getClockHeight(clockSettings.fontSize ?? 52, clockSettings.showDate);
    occupied.push({ x: clockPosition.x, y: clockPosition.y, w: clockW, h: clockH });
    
    return occupied;
  }, [iconPositions, clockPosition, clockSettings, getCleanGridPos, currentIconSize]);

  const clampDesktopPosition = useCallback((x: number, y: number, w: number, h: number) => ({
    x: Math.max(0, Math.min(x, desktopSize.w - w)),
    y: Math.max(0, Math.min(y, desktopSize.h - taskbarClearance - h)),
  }), [desktopSize, taskbarClearance]);

  const handleIconDragEnd = useCallback((appId: string, rawX: number, rawY: number) => {
    if (!snapToGridEnabled) {
      setIconPosition(appId, clampDesktopPosition(rawX, rawY, currentIconSize, currentIconSize));
      return;
    }

    const occupied = getAllOccupiedSpaces().filter(occ => {
      const saved = iconPositions[appId];
      if (!saved) return true;
      return !(snapToGrid(saved.x) === occ.x && snapToGrid(saved.y) === occ.y && occ.w === currentIconSize);
    });

    const free = findFreeGridCell(
      rawX, rawY,
      GRID_STEP,
      occupied,
      currentIconSize,
      currentIconSize,
      desktopSize.w,
      desktopSize.h,
      taskbarClearance
    );
    
    setIconPosition(appId, free);
  }, [iconPositions, getAllOccupiedSpaces, desktopSize, taskbarClearance, setIconPosition, currentIconSize, snapToGridEnabled, clampDesktopPosition]);

  const handleClockDragEnd = useCallback((rawX: number, rawY: number) => {
    const clockW = getClockWidth(clockSettings.fontSize ?? 52, clockSettings.use24Hour, clockSettings.showSeconds);
    const clockH = getClockHeight(clockSettings.fontSize ?? 52, clockSettings.showDate);

    if (!snapToGridEnabled) {
      setClockPosition(clampDesktopPosition(rawX, rawY, clockW, clockH));
      return;
    }

    const occupied: Array<{ x: number; y: number; w: number; h: number }> = [];
    APPS.forEach((app, index) => {
      const saved = iconPositions[app.id];
      const pos = saved ? { x: snapToGrid(saved.x), y: snapToGrid(saved.y) } : getCleanGridPos(index);
      occupied.push({ x: pos.x, y: pos.y, w: currentIconSize, h: currentIconSize });
    });

    const free = findFreeGridCell(
      rawX, rawY,
      GRID_STEP,
      occupied,
      clockW,
      clockH,
      desktopSize.w,
      desktopSize.h,
      taskbarClearance
    );
    
    setClockPosition(free);
  }, [clockSettings, iconPositions, desktopSize, taskbarClearance, getCleanGridPos, currentIconSize, snapToGridEnabled, clampDesktopPosition, setClockPosition]);

  const clampWindowPos = (wx: number, wy: number, ww: number, wh: number) => ({
    x: Math.max(0, Math.min(wx, desktopSize.w - ww)),
    y: Math.max(0, Math.min(wy, desktopSize.h - taskbarClearance - wh)),
  });

const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  const target = e.target as HTMLElement;

  if (
    target.closest('.desktop-icon') ||
    target.closest('[data-window]')
  ) {
    return;
  }

  setContextMenu({
    x: e.clientX,
    y: e.clientY,
    visible: true,
  });
};

useEffect(() => {
  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      setContextMenu(prev => ({
        ...prev,
        visible: false,
      }));
    }
  };

  window.addEventListener('mousedown', handleMouseDown);

  return () => {
    window.removeEventListener('mousedown', handleMouseDown);
  };
}, []);

  return (
    <div
      key={desktopRefresh}
      ref={desktopRef}
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden', userSelect: 'none',
        fontFamily: 'var(--font-family,inherit)', color: '#fff', fontSize: 'var(--font-size,13px)',
      }}
    >
      <style>{`
        @keyframes gridPulse { 0%,100% { opacity:0.15; } 50% { opacity:0.25; } }
        .notif-enter { animation: notifSlide 0.5s cubic-bezier(0.16,1,0.3,1), notifFadeOut 0.4s 4.6s forwards ease-out; }
        @keyframes notifSlide { from { transform:translateY(-20px) scale(0.95);opacity:0; } to { transform:translateY(0) scale(1);opacity:1; } }
        @keyframes notifFadeOut { from { opacity:1; } to { opacity:0;transform:scale(0.92);filter:blur(4px); } }
        .desktop-icon:hover .desktop-icon-inner {
          background: linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03)) !important;
          border-color: rgba(255,255,255,0.15) !important;
          box-shadow: 0 8px 16px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.15) !important;
          transform: translateY(-2px);
        }
      `}</style>

      {/* Wallpaper */}
      <div id="troy-desktop-bg" style={{
        position: 'absolute', inset: 0,
        transition: 'background-color 0.8s cubic-bezier(0.16,1,0.3,1), background-image 0.8s cubic-bezier(0.16,1,0.3,1)',
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        ...parsedWallpaperStyle,
      }} />

      {/* Grid overlay */}
      {!customWallpaper && showDesktopGrid && (
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

      {/* Clock — z-index 50 (above icons at 30) */}
      <CustomizableClock
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
            iconSize={currentIconSize}
            labelSize={desktopIconLabelSize}
            showLabel={desktopIconLabelsVisible}
            onDragEnd={handleIconDragEnd}
            onOpen={() => openApp(app.id)}
          />
        );
      })}

      {/* Windows */}
      {windows.map(win => {
        const ww = win.size?.width  ?? win.width  ?? 800;
        const wh = win.size?.height ?? win.height ?? 560;
        const rawX = win.position?.x ?? 100;
        const rawY = win.position?.y ?? 80;
        const { x: cx, y: cy } = win.maximized ? { x: rawX, y: rawY } : clampWindowPos(rawX, rawY, ww, wh);
        return (
          <Window
            key={win.id}
            id={win.id}
            appId={win.appId}
            name={win.name  ?? win.title}
            emoji={win.emoji ?? '📦'}
            color={win.color ?? '#3b82f6'}
            width={ww}
            height={wh}
            x={cx}
            y={cy}
            zIndex={10}
            minimized={win.minimized ?? false}
            maximized={win.maximized ?? false}
          >
            {getAppContent(win.appId)}
          </Window>
        );
      })}

      {/* Launcher */}
      {launcherOpen && <AppLauncher />}

      {/* Notifications */}
      <div style={{ position: 'absolute', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10, ...getNotificationPositionStyles() }}>
        {notifications.map(n => (
          <div key={n.id} className="notif-enter" onClick={() => removeNotification(n.id)}
            style={{
              background: `rgba(20,24,35,${uiOpacity})`, backdropFilter: `blur(${uiBlur}px) saturate(140%)`,
              border: '1px solid rgba(255,255,255,0.08)', padding: '12px 18px',
              borderRadius: 'var(--border-radius,16px)', display: 'flex', alignItems: 'center',
              gap: 14, cursor: 'pointer', minWidth: 280,
              boxShadow: '0 12px 40px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
            <div style={{ fontSize: 18, width: 32, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 'calc(var(--border-radius,16px)*0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>{n.icon}</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{n.title}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>{n.message}</div>
            </div>
          </div>
        ))}
      </div>

  {/* Context menu */}
<div
  style={{
    position: 'absolute',
    left: Math.min(contextMenu.x, desktopSize.w - 180),
    top: Math.min(contextMenu.y, desktopSize.h - 100),

    width: 170,

    background: `rgba(15,18,25,${uiOpacity})`,
    backdropFilter: `blur(${uiBlur}px)`,

    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--border-radius,12px)',

    padding: 6,

    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',

    zIndex: 9999,

    display: 'flex',
    flexDirection: 'column',
    gap: 2,

    opacity: contextMenu.visible ? 1 : 0,

    transform: contextMenu.visible
      ? 'scale(1) translateY(0px)'
      : 'scale(0.96) translateY(6px)',

    pointerEvents: contextMenu.visible ? 'auto' : 'none',

    transition:
      'opacity 140ms ease, transform 180ms cubic-bezier(0.16,1,0.3,1)',
  }}
>
          <button onClick={(e) => { e.stopPropagation(); refreshDesktop(); setContextMenu(p => ({ ...p, visible: false })); }} style={{
            background: 'transparent', border: 'none', borderRadius: 'calc(var(--border-radius,12px) - 4px)',
            color: '#fff', fontSize: 12, fontWeight: 500, textAlign: 'left', padding: '8px 12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}22`)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ color: accentColor }}>🔄</span> Refresh
          </button>
          <button onClick={(e) => { e.stopPropagation(); store.setSnapToGridEnabled(!snapToGridEnabled); setContextMenu(p => ({ ...p, visible: false })); }} style={{
            background: 'transparent', border: 'none', borderRadius: 'calc(var(--border-radius,12px) - 4px)',
            color: '#fff', fontSize: 12, fontWeight: 500, textAlign: 'left', padding: '8px 12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}22`)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ color: accentColor }}>{snapToGridEnabled ? '📌' : '⭕'}</span> Snap to Grid: {snapToGridEnabled ? 'On' : 'Off'}
          </button>
          <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <button onClick={(e) => { e.stopPropagation(); openApp('settings'); setContextMenu(p => ({ ...p, visible: false })); }} style={{
            background: 'transparent', border: 'none', borderRadius: 'calc(var(--border-radius,12px) - 4px)',
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
      

      {/* Taskbar */}
      <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 101, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Taskbar />
        </div>
      </div>
    </div>
  );
}
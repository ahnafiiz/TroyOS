'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { WALLPAPERS } from '@/config/themes';
import { APPS } from '@/config/apps';
import Window from './Window';
import Taskbar from './Taskbar';
import AppLauncher from './AppLauncher';

// --- Apps & Games Imports ---
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

// Unified grid step base calculation
const GRID_STEP = 100;
const snapToGrid = (val: number) => {
  return Math.round(val / GRID_STEP) * GRID_STEP;
};

// Rough clock bounding box dimensions used for collision calculations
const CLOCK_WIDTH = 250;
const CLOCK_HEIGHT = 120;

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
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500, letterSpacing: '0.02em' }}>
            ⚠️ External application sandbox. Unresponsive frames can be recovered by launching in tab.
          </span>
          <a href={app.url} target="_blank" rel="noreferrer"
            style={{ 
              fontSize: 11, 
              color: '#3b82f6', 
              fontWeight: 600, 
              textDecoration: 'none',
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '4px 10px',
              borderRadius: '6px',
              transition: 'background 0.2s',
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
  const [pos, setPos] = useState(position);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });

  useEffect(() => {
    setPos(position);
  }, [position]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragOffset.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    setDragging(true);

    const onMouseMove = (ev: MouseEvent) => {
      setPos({ x: ev.clientX - dragOffset.current.dx, y: ev.clientY - dragOffset.current.dy });
    };

    const onMouseUp = (ev: MouseEvent) => {
      setDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      const finalX = snapToGrid(ev.clientX - dragOffset.current.dx);
      const finalY = snapToGrid(ev.clientY - dragOffset.current.dy);
      if (typeof onDragEnd === 'function') {
        onDragEnd(finalX, finalY);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const getStylePreset = () => {
    switch (settings.type) {
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          padding: '24px 32px',
          borderRadius: 24,
        };
      case 'retro':
        return {
          background: '#040508',
          border: `2px solid ${settings.color}`,
          boxShadow: `0 0 20px ${settings.glowColor}`,
          padding: '14px 22px',
          borderRadius: 12,
        };
      case 'minimal':
        return {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: '8px',
          borderRadius: 0,
        };
      case 'hud':
      default:
        return {
          background: 'rgba(10, 12, 18, 0.5)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.04)',
          boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
          padding: '18px 26px',
          borderRadius: 20,
        };
    }
  };

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: CLOCK_WIDTH,
        height: CLOCK_HEIGHT,
        zIndex: 5, 
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        transition: dragging ? 'none' : 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxSizing: 'border-box',
        ...getStylePreset(),
      }}
    >
      <div style={{
        fontSize: settings.fontSize || 52,
        fontWeight: settings.type === 'retro' ? 900 : 300,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        color: settings.color,
        fontFamily: settings.fontFamily || 'inherit',
        textShadow: `0 0 16px ${settings.glowColor}`,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {timeStr}
      </div>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        marginTop: 6,
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        fontFamily: 'var(--font-geist-sans), sans-serif',
      }}>
        {dateStr}
      </div>
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
  const [localPos, setLocalPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const didDrag = useRef(false);

  useEffect(() => {
    if (!dragging) {
      setLocalPos({ x: initialX, y: initialY });
    }
  }, [initialX, initialY, dragging]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    didDrag.current = false;
    dragOffset.current = { dx: e.clientX - localPos.x, dy: e.clientY - localPos.y };
    setDragging(true);

    const onMove = (ev: MouseEvent) => {
      didDrag.current = true;
      setLocalPos({ x: ev.clientX - dragOffset.current.dx, y: ev.clientY - dragOffset.current.dy });
    };

    const onUp = (ev: MouseEvent) => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      
      const targetX = ev.clientX - dragOffset.current.dx;
      const targetY = ev.clientY - dragOffset.current.dy;
      
      const snappedX = snapToGrid(targetX);
      const snappedY = snapToGrid(targetY);

      if (didDrag.current) {
        if (typeof onDragEnd === 'function') {
          onDragEnd(appId, snappedX, snappedY);
        } else {
          setLocalPos({ x: snappedX, y: snappedY });
        }
      } else {
        setLocalPos({ x: initialX, y: initialY });
      }
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
        left: dragging ? localPos.x : initialX, 
        top: dragging ? localPos.y : initialY, 
        width: 84,  
        height: 84, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        cursor: dragging ? 'grabbing' : 'grab',
        padding: '4px', 
        borderRadius: 12,
        background: dragging ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: `1px solid ${dragging ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
        backdropFilter: dragging ? 'blur(10px)' : 'none',
        boxShadow: dragging ? '0 16px 32px rgba(0,0,0,0.4)' : 'none',
        transform: dragging ? 'scale(1.04)' : 'scale(1)',
        transition: dragging ? 'none' : 'all 0.23s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: dragging ? 9999 : 30, 
        userSelect: 'none',
      }}
      className="desktop-icon"
    >
      <div style={{ 
        fontSize: 24, 
        width: 44,
        height: 44,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        flexShrink: 0
      }} className="desktop-icon-inner">
        {emoji}
      </div>
      <span style={{
        fontSize: 11, 
        fontWeight: 500, 
        marginTop: 5, 
        textAlign: 'center',
        color: '#f3f4f6', 
        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        lineHeight: 1.15, 
        width: '100%',
        padding: '0 2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {name}
      </span>
    </div>
  );
}

export default function Desktop() {
  const store = useOSStore();

  const windows = store.windows || [];
  const wallpaperIndex = store.wallpaperIndex ?? 0;
  const launcherOpen = store.launcherOpen ?? false;
  const notifications = store.notifications || [];
  const currentTime = store.currentTime || new Date();
  const iconPositions = useOSStore((state) => state.iconPositions) || [];

  const openApp = typeof store.openApp === 'function' ? store.openApp : () => {};
  const removeNotification = typeof store.removeNotification === 'function' ? store.removeNotification : () => {};
  const setIconPosition = typeof store.setIconPosition === 'function' ? store.setIconPosition : () => {};

  const wallpaper = WALLPAPERS[wallpaperIndex];
  const [clockPosition, setClockPosition] = useState({ x: 900, y: 100 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  const systemFontFamily = store.systemFontFamily || 'var(--font-geist-sans), sans-serif';
  const systemFontSize = store.systemFontSize || 13;
  const accentColor = store.accentColor || '#3b82f6';
  const customWallpaper = store.customWallpaper;
  const wallpaperStyle = store.wallpaperStyle || 'fill';
  const customBackgroundGradient = store.customBackgroundGradient;
  const customBackgroundColor = store.customBackgroundColor;

  const parsedWallpaperStyle = useMemo(() => {
    if (customWallpaper) {
      let size = 'cover';
      let repeat = 'no-repeat';
      if (wallpaperStyle === 'fit') size = 'contain';
      if (wallpaperStyle === 'stretch') size = '100% 100%';
      if (wallpaperStyle === 'tile') { size = 'auto'; repeat = 'repeat'; }
      return { backgroundImage: `url(${customWallpaper})`, backgroundSize: size, backgroundRepeat: repeat, backgroundPosition: 'center' };
    }
    if (customBackgroundGradient) return { background: customBackgroundGradient };
    if (customBackgroundColor) return { backgroundColor: customBackgroundColor };
    if (!wallpaper || !wallpaper.background) return { background: '#0a0c12' }; 
    
    let bgStr = wallpaper.background.trim();
    if (bgStr.startsWith('/public/')) bgStr = bgStr.replace('/public/', '/');
    if (bgStr.startsWith('/') || bgStr.startsWith('http') || bgStr.startsWith('blob:') || bgStr.startsWith('data:image')) {
      return { backgroundImage: `url("${bgStr}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
    }
    return { background: bgStr };
  }, [wallpaper, customWallpaper, wallpaperStyle, customBackgroundGradient, customBackgroundColor]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof store.setTime === 'function') store.setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [store.setTime]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof store.addNotification === 'function') {
        store.addNotification('Nexus OS Engine v2.0 initialized successfully.', '🧠');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [store.addNotification]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      const fadeTimer = setTimeout(() => { removeNotification(latestNotification.id); }, 5000);
      return () => clearTimeout(fadeTimer);
    }
  }, [notifications, removeNotification]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClockPosition({ x: snapToGrid(window.innerWidth - 320), y: 100 });
    }
  }, []);

  const clockSettings = useMemo(() => {
    const defaultGlow = accentColor + '33';
    return {
      type: store.clockSettings?.type || 'hud',
      color: store.clockSettings?.color || '#ffffff',
      glowColor: store.clockSettings?.glowColor || defaultGlow,
      use24Hour: store.clockSettings?.use24Hour !== false,
      fontSize: 52,
      fontFamily: systemFontFamily
    };
  }, [store.clockSettings, accentColor, systemFontFamily]);

  const timeStr = useMemo(() => {
    return (currentTime instanceof Date ? currentTime : new Date()).toLocaleTimeString([], { 
      hour: '2-digit', minute: '2-digit', hour12: !clockSettings.use24Hour 
    });
  }, [currentTime, clockSettings.use24Hour]);

  const dateStr = useMemo(() => {
    return (currentTime instanceof Date ? currentTime : new Date()).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  }, [currentTime]);
  
  const getCleanGridPos = (index: number) => {
    if (typeof window === 'undefined') return { x: 30, y: 30 };
    const gridSpacingX = 100; 
    const gridSpacingY = 112; 
    const margin = 30;
    const maxHeight = window.innerHeight - 180; 
    const maxRows = Math.max(1, Math.floor((maxHeight - margin) / gridSpacingY));
    const col = Math.floor(index / maxRows);
    const row = index % maxRows;
    return {
      x: snapToGrid(margin + col * gridSpacingX),
      y: snapToGrid(margin + row * gridSpacingY)
    };
  };

  // Anti-collision verification step protecting other icons AND the clock zone
  const handleIconDragEnd = (appId: string, targetX: number, targetY: number) => {
    const hitsClock = 
      targetX >= clockPosition.x - 40 && 
      targetX <= clockPosition.x + CLOCK_WIDTH &&
      targetY >= clockPosition.y - 40 && 
      targetY <= clockPosition.y + CLOCK_HEIGHT;

    const isOccupied = iconPositions.some(
      (pos) => pos.appId !== appId && snapToGrid(pos.x) === targetX && snapToGrid(pos.y) === targetY
    );

    if (isOccupied || hitsClock) {
      let shiftOffset = GRID_STEP;
      let nextX = targetX + shiftOffset;
      
      while (
        iconPositions.some((p) => p.appId !== appId && snapToGrid(p.x) === nextX && snapToGrid(p.y) === targetY) ||
        (nextX >= clockPosition.x - 40 && nextX <= clockPosition.x + CLOCK_WIDTH && targetY >= clockPosition.y - 40 && targetY <= clockPosition.y + CLOCK_HEIGHT)
      ) {
        shiftOffset += GRID_STEP;
        nextX = targetX + shiftOffset;
      }
      setIconPosition(appId, nextX, targetY);
    } else {
      setIconPosition(appId, targetX, targetY);
    }
  };

  // Anti-collision step for the Clock: prevents it from sitting on top of any active desktop icons
  const handleClockDragEnd = (targetX: number, targetY: number) => {
    // Check if any icon is within the clock's landing zone
    const hitsAnyIcon = APPS.some((app, index) => {
      const saved = iconPositions.find(p => p.appId === app.id);
      const pos = saved ? { x: snapToGrid(saved.x), y: snapToGrid(saved.y) } : getCleanGridPos(index);
      
      return (
        pos.x >= targetX - 40 &&
        pos.x <= targetX + CLOCK_WIDTH &&
        pos.y >= targetY - 40 &&
        pos.y <= targetY + CLOCK_HEIGHT
      );
    });

    if (hitsAnyIcon) {
      // If dropped onto an icon field, push it to a clean column path over
      let shiftOffset = GRID_STEP;
      let nextX = targetX + shiftOffset;
      
      const checkCollisionAt = (checkX: number) => {
        return APPS.some((app, index) => {
          const saved = iconPositions.find(p => p.appId === app.id);
          const pos = saved ? { x: snapToGrid(saved.x), y: snapToGrid(saved.y) } : getCleanGridPos(index);
          return (
            pos.x >= checkX - 40 &&
            pos.x <= checkX + CLOCK_WIDTH &&
            pos.y >= targetY - 40 &&
            pos.y <= targetY + CLOCK_HEIGHT
          );
        });
      };

      while (checkCollisionAt(nextX)) {
        shiftOffset += GRID_STEP;
        nextX = targetX + shiftOffset;
      }
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
    const closeContextMenu = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, []);

  return (
    <div 
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden', userSelect: 'none',
        fontFamily: systemFontFamily, color: '#fff', fontSize: `${systemFontSize}px`
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

      {/* Wallpaper Layer */}
      <div id="nexus-desktop-bg" style={{ position: 'absolute', inset: 0, transition: 'background 0.8s cubic-bezier(0.16, 1, 0.3, 1), background-image 0.8s cubic-bezier(0.16, 1, 0.3, 1)', ...parsedWallpaperStyle }} />

      {/* Grid Lines Overlay */}
      {!customWallpaper && !customBackgroundGradient && !customBackgroundColor && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: [`linear-gradient(${wallpaper?.gridColor || 'rgba(59,130,246,0.1)'} 1px, transparent 1px)`, `linear-gradient(90deg, ${wallpaper?.gridColor || 'rgba(59,130,246,0.1)'} 1px, transparent 1px)`].join(','),
          backgroundSize: `${GRID_STEP}px ${GRID_STEP}px`, animation: 'gridPulse 10s ease-in-out infinite',
        }} />
      )}

      {/* Clock component with newly introduced dynamic validation drag end action hook */}
      <CustomizableClock timeStr={timeStr} dateStr={dateStr} settings={clockSettings} position={clockPosition} onDragEnd={handleClockDragEnd} />

      {/* Desktop App Icons */}
      {APPS.map((app, index) => {
        const saved = iconPositions.find(p => p.appId === app.id);
        const dynamicPosition = getCleanGridPos(index);
        
        return (
          <DraggableIcon
            key={app.id}
            appId={app.id}
            emoji={app.emoji}
            name={app.name}
            initialX={saved ? snapToGrid(saved.x) : dynamicPosition.x}
            initialY={saved ? snapToGrid(saved.y) : dynamicPosition.y}
            onDragEnd={handleIconDragEnd}
            onOpen={() => openApp(app.id, app.name, app.emoji, app.color, app.defaultWidth, app.defaultHeight)}
          />
        );
      })}

      {/* Application Sandbox Windows */}
      {windows.map(win => (
        <Window key={win.id} {...win}>
          {getAppContent(win.appId)}
        </Window>
      ))}

      {/* System Launcher Menu Overlay */}
      {launcherOpen && <AppLauncher />}

      {/* System Notifications Overlay */}
      <div style={{ position: 'absolute', top: 30, right: 30, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifications.map(n => (
          <div key={n.id} className="notif-enter" onClick={() => removeNotification(n.id)}
            style={{
              background: 'rgba(20, 24, 35, 0.75)', backdropFilter: 'blur(24px) saturate(140%)', border: '1px solid rgba(255,255,255,0.08)', 
              padding: '12px 18px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', minWidth: 280,
              boxShadow: '0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
            <div style={{ fontSize: 18, width: 32, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>{n.icon}</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>System</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>{n.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Right Click Workspace Menu */}
      {contextMenu.visible && (
        <div style={{
          position: 'absolute', left: contextMenu.x, top: contextMenu.y, width: 170, background: 'rgba(15, 18, 25, 0.85)',
          backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '6px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <button 
            onClick={() => openApp('settings', 'Settings', '⚙️', '#4b5563', 650, 500)}
            style={{ background: 'transparent', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 500, textAlign: 'left', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>🎨</span> Personalize
          </button>
          <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <div style={{ padding: '4px 12px', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>Troy OS v2.0</div>
        </div>
      )}

      {/* Floating System Taskbar Layer */}
      <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 101, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Taskbar />
        </div>
      </div>
    </div>
  );
}
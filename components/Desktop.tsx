'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { WALLPAPERS } from '@/config/themes';
import { APPS } from '@/config/apps';
import Window from './Window';
import Taskbar from './Taskbar';
import Dock from './Dock';
import AppLauncher from './AppLauncher';

// --- Apps & Games Imports ---
import BrowserApp  from './apps/BrowserApp'; // 👈 Imported your custom BrowserApp
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

const snapToGrid = (val: number, gridSize: number = 64) => {
  return Math.round(val / gridSize) * gridSize;
};

function getAppContent(appId: string, customProps?: any) {
  const gameId = parseInt(appId);
  if (!isNaN(gameId) && BUILTIN_GAMES[gameId]) return BUILTIN_GAMES[gameId];

  // Route specific application IDs to their custom components
  switch (appId) {
    case 'browser':  return <BrowserApp />; // 👈 Renders your custom BrowserApp instead of the fallback iframe
    case 'gaming':   return <GamingHub />;
    case 'terminal': return <Terminal />;
    case 'ai':       return <AIAssistant />;
    case 'settings': 
      return (
        <Settings 
          clockSettings={customProps?.clockSettings}
          setClockSettings={customProps?.setClockSettings}
          dockPosition={customProps?.dockPosition}
          setDockPosition={customProps?.setDockPosition}
        />
      );
  }

  // Fallback for generic external link apps (if any remain)
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

// ── Clock Customization Interface ─────────────────────────────────────────
interface ClockStyleSettings {
  type: 'hud' | 'glass' | 'retro' | 'minimal';
  color: string;
  glowColor: string;
  fontFamily: string;
  fontSize: number;
  use24Hour: boolean;
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
      onDragEnd(finalX, finalY);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const getStylePreset = () => {
    switch (settings.type) {
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
          padding: '20px 28px',
          borderRadius: 28,
        };
      case 'retro':
        return {
          background: '#05070a',
          border: `2px solid ${settings.color}`,
          boxShadow: `0 0 15px ${settings.glowColor}`,
          padding: '12px 20px',
          borderRadius: 8,
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
          background: 'rgba(10, 12, 18, 0.45)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          padding: '16px 24px',
          borderRadius: 24,
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
        zIndex: 100,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        transition: dragging ? 'none' : 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...getStylePreset(),
      }}
    >
      <div style={{
        fontSize: settings.fontSize,
        fontWeight: settings.type === 'retro' ? 900 : 300,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        color: settings.color,
        fontFamily: settings.fontFamily,
        textShadow: `0 0 12px ${settings.glowColor}`,
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

// ── Draggable Icon ────────────────────────────────────────────────────────
interface DraggableIconProps {
  appId: string;
  emoji: string;
  name: string;
  initialX: number;
  initialY: number;
  onDragEnd: (appId: string, x: number, y: number) => void;
  onOpen: () => void;
}

function DraggableIcon({ appId, emoji, name, initialX, initialY, onDragEnd, onOpen }: DraggableIconProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const didDrag = useRef(false);

  useEffect(() => {
    setPos({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    didDrag.current = false;
    dragOffset.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    setDragging(true);

    const onMove = (ev: MouseEvent) => {
      didDrag.current = true;
      setPos({ x: ev.clientX - dragOffset.current.dx, y: ev.clientY - dragOffset.current.dy });
    };
    const onUp = (ev: MouseEvent) => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (didDrag.current) {
        const snappedX = snapToGrid(ev.clientX - dragOffset.current.dx);
        const snappedY = snapToGrid(ev.clientY - dragOffset.current.dy);
        onDragEnd(appId, snappedX, snappedY);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!didDrag.current) onOpen();
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      style={{
        position: 'absolute', 
        left: pos.x, 
        top: pos.y, 
        width: 84,
        height: 94,
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        cursor: dragging ? 'grabbing' : 'grab',
        padding: '8px', 
        borderRadius: 16,
        background: dragging ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: `1px solid ${dragging ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
        backdropFilter: dragging ? 'blur(10px)' : 'none',
        boxShadow: dragging ? '0 16px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
        transform: dragging ? 'scale(1.05)' : 'scale(1)',
        transition: dragging ? 'none' : 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: dragging ? 9999 : 40,
        userSelect: 'none',
      }}
      className="desktop-icon"
    >
      <div style={{ 
        fontSize: 30, 
        width: 52,
        height: 52,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }} className="desktop-icon-inner">
        {emoji}
      </div>
      <span style={{
        fontSize: 11, 
        fontWeight: 500, 
        marginTop: 8, 
        textAlign: 'center',
        color: '#f3f4f6', 
        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
        lineHeight: 1.2, 
        wordBreak: 'break-word',
        letterSpacing: '0.01em',
        maxWidth: '100%',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {name}
      </span>
    </div>
  );
}

// ── Desktop ───────────────────────────────────────────────────────────────
export default function Desktop() {
  const {
    windows, wallpaperIndex, launcherOpen, notifications, currentTime,
    iconPositions, setTime, addNotification, openApp, removeNotification, setIconPosition,
  } = useOSStore();

  const wallpaper = WALLPAPERS[wallpaperIndex];

  // Clock state customizations
  const [clockPosition, setClockPosition] = useState({ x: 900, y: 64 });
  const [clockSettings, setClockSettings] = useState<ClockStyleSettings>({
    type: 'hud',
    color: '#ffffff',
    glowColor: 'rgba(255, 255, 255, 0.15)',
    fontFamily: 'var(--font-geist-sans), sans-serif',
    fontSize: 52,
    use24Hour: true
  });

  // Taskbar/Dock alignments
  const [dockPosition, setDockPosition] = useState<'center' | 'left'>('center');

  // Custom Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  // Has custom wallpaper checking
  const [hasCustomWallpaper, setHasCustomWallpaper] = useState(false);

  useEffect(() => {
    const checkCustom = () => {
      const bg = document.getElementById('nexus-desktop-bg');
      setHasCustomWallpaper(!!bg?.hasAttribute('data-has-custom'));
    };
    
    // Observer changes on the #nexus-desktop-bg attribute list
    const observer = new MutationObserver(checkCustom);
    const bgNode = document.getElementById('nexus-desktop-bg');
    if (bgNode) {
      observer.observe(bgNode, { attributes: true, attributeFilter: ['data-has-custom'] });
    }
    
    return () => observer.disconnect();
  }, []);

  // Custom wallpaper safety loader (Yields inline styling when custom uploads are applied)
  const parsedWallpaperStyle = useMemo(() => {
    if (hasCustomWallpaper) return {}; // Let custom CSS styles handle it cleanly
    if (!wallpaper || !wallpaper.background) {
      return { background: '#0a0c12' }; 
    }
    let bgStr = wallpaper.background.trim();
    
    if (bgStr.startsWith('/public/')) {
      bgStr = bgStr.replace('/public/', '/');
    }

    const isImageFile = bgStr.startsWith('/') || bgStr.startsWith('http') || bgStr.startsWith('blob:') || bgStr.startsWith('data:image');
    if (isImageFile) {
      return {
        backgroundImage: `url("${bgStr}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return { background: bgStr };
  }, [wallpaper, hasCustomWallpaper]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [setTime]);

  useEffect(() => {
    const timer = setTimeout(() => addNotification('Nexus OS Engine v2.0 initialized successfully.', '🧠'), 1200);
    return () => clearTimeout(timer);
  }, [addNotification]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClockPosition({ x: snapToGrid(window.innerWidth - 360), y: 64 });
    }
  }, []);

  const timeStr = useMemo(() => {
    return currentTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: !clockSettings.use24Hour 
    });
  }, [currentTime, clockSettings.use24Hour]);

  const dateStr = currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  
  // ── Smart Dynamic Grid Initialization (Fixes initial messy overlap alignment) ──
  const getCleanGridPos = (index: number) => {
    if (typeof window === 'undefined') return { x: 64, y: 64 };
    const gridSpacingX = 104; // Column size
    const gridSpacingY = 110; // Row size
    const margin = 48;
    const maxHeight = window.innerHeight - 180; // Safe bottom clearance
    
    const maxRows = Math.max(1, Math.floor((maxHeight - margin) / gridSpacingY));
    const col = Math.floor(index / maxRows);
    const row = index % maxRows;

    return {
      x: snapToGrid(margin + col * gridSpacingX),
      y: snapToGrid(margin + row * gridSpacingY)
    };
  };

  // Context Menu helpers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, []);

  return (
    <div 
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden', userSelect: 'none',
        fontFamily: 'var(--font-geist-sans), sans-serif', color: '#fff',
      }}
    >
      <style>{`
        @keyframes gridPulse { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.25; } }
        .notif-enter { animation: notifSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes notifSlide { from { transform: translateY(-20px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        
        .desktop-icon:hover .desktop-icon-inner {
          background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03)) !important;
          border-color: rgba(255,255,255,0.15) !important;
          box-shadow: 0 8px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15) !important;
          transform: translateY(-2px);
        }
      `}</style>

      {/* Wallpaper Layer */}
      <div
        id="nexus-desktop-bg"
        style={{
          position: 'absolute', inset: 0,
          transition: 'background 0.8s cubic-bezier(0.16, 1, 0.3, 1), background-image 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          ...parsedWallpaperStyle,
        }}
      />

      {/* Grid Lines */}
      {!hasCustomWallpaper && (
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: [
              `linear-gradient(${wallpaper?.gridColor || 'rgba(59,130,246,0.1)'} 1px, transparent 1px)`,
              `linear-gradient(90deg, ${wallpaper?.gridColor || 'rgba(59,130,246,0.1)'} 1px, transparent 1px)`,
            ].join(','),
            backgroundSize: '64px 64px',
            animation: 'gridPulse 10s ease-in-out infinite',
          }}
        />
      )}

      {/* Draggable Snappable Clock */}
      <CustomizableClock
        timeStr={timeStr}
        dateStr={dateStr}
        settings={clockSettings}
        position={clockPosition}
        onDragEnd={(x, y) => setClockPosition({ x, y })}
      />

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
            onDragEnd={setIconPosition}
            onOpen={() => openApp(app.id, app.name, app.emoji, app.color, app.defaultWidth, app.defaultHeight)}
          />
        );
      })}

      {/* Windows with Personalization State Props */}
      {windows.map(win => (
        <Window key={win.id} {...win}>
          {getAppContent(win.appId, {
            clockSettings, setClockSettings,
            dockPosition, setDockPosition
          })}
        </Window>
      ))}

      {launcherOpen && <AppLauncher />}

      {/* Notifications */}
      <div style={{ position: 'absolute', top: 30, right: 30, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifications.map(n => (
          <div key={n.id} className="notif-enter" onClick={() => removeNotification(n.id)}
            style={{
              background: 'rgba(20, 24, 35, 0.75)', 
              backdropFilter: 'blur(24px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.08)', 
              padding: '12px 18px',
              borderRadius: 16, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 14,
              cursor: 'pointer', 
              minWidth: 280,
              boxShadow: '0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
            <div style={{ 
              fontSize: 18, width: 32, height: 32,
              background: 'rgba(255,255,255,0.05)', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>{n.icon}</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>System</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>{n.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu.visible && (
        <div style={{
          position: 'absolute',
          left: contextMenu.x,
          top: contextMenu.y,
          width: 170,
          background: 'rgba(15, 18, 25, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: '6px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          <button 
            onClick={() => openApp('settings', 'Settings', '⚙️', '#4b5563', 650, 500)}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              fontWeight: 500,
              textAlign: 'left',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>🎨</span> Personalize
          </button>
          <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <div style={{ padding: '4px 12px', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>Troy OS v2.0</div>
        </div>
      )}

      {/* ── Fixed Bottom Alignment Wrapper (Preempts Dock Clipping) ── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: dockPosition === 'left' ? 24 : 0,
        right: dockPosition === 'left' ? 'auto' : 0,
        width: dockPosition === 'left' ? 'auto' : '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: dockPosition === 'left' ? 'flex-start' : 'center',
        paddingBottom: 0,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 50,
        pointerEvents: 'none',
      }}>
        <div style={{ 
          pointerEvents: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: dockPosition === 'left' ? 'flex-start' : 'center', 
          width: '100%' 
        }}>
          <Dock />
          <Taskbar />
        </div>
      </div>
    </div>
  );
}
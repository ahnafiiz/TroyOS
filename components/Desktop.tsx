// components/Desktop.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { WALLPAPERS } from '@/config/themes';
import { APPS } from '@/config/apps';
import Window from './Window';
import Taskbar from './Taskbar';
import Dock from './Dock';
import AppLauncher from './AppLauncher';

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

function getAppContent(appId: string) {
  const gameId = parseInt(appId);
  if (!isNaN(gameId) && BUILTIN_GAMES[gameId]) return BUILTIN_GAMES[gameId];

  switch (appId) {
    case 'gaming':   return <GamingHub />;
    case 'terminal': return <Terminal />;
    case 'ai':       return <AIAssistant />;
    case 'settings': return <Settings />;
  }

  const app = APPS.find(a => a.id === appId);
  if (app?.url) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '6px 14px', background: 'rgba(245,158,11,0.15)',
          borderBottom: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(245,158,11,0.9)' }}>
            ⚠️ Some websites block embedding — if blank, use the button →
          </span>
          <a href={app.url} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
            Open in Tab ↗
          </a>
        </div>
        <iframe src={app.url} style={{ flex: 1, border: 'none' }} title={app.name}
          allow="fullscreen; autoplay"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock" />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, background: 'rgba(10,12,18,0.4)' }}>
      <span style={{ fontSize: 40 }}>{app?.emoji || '📦'}</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Coming soon</span>
    </div>
  );
}

// ── Draggable Icon Component ──────────────────────────────────────────────
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

  // Keep in sync if parent resets positions
  useEffect(() => {
    setPos({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  const onMouseDown = (e: React.MouseEvent) => {
    // Only drag on left click, ignore if clicking inside a window
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    didDrag.current = false;
    dragOffset.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    setDragging(true);

    const onMove = (ev: MouseEvent) => {
      didDrag.current = true;
      setPos({
        x: ev.clientX - dragOffset.current.dx,
        y: ev.clientY - dragOffset.current.dy,
      });
    };

    const onUp = (ev: MouseEvent) => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (didDrag.current) {
        onDragEnd(appId, ev.clientX - dragOffset.current.dx, ev.clientY - dragOffset.current.dy);
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
        width: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: dragging ? 'grabbing' : 'grab',
        padding: 12,
        borderRadius: 16,
        background: dragging ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${dragging ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
        boxShadow: dragging ? '0 12px 40px rgba(0,0,0,0.5)' : 'none',
        transform: dragging ? 'scale(1.1)' : 'scale(1)',
        transition: dragging ? 'none' : 'background 0.2s, transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        zIndex: dragging ? 9999 : 40,
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: 36, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>{emoji}</div>
      <span style={{
        fontSize: 11, fontWeight: 600, marginTop: 8, textAlign: 'center',
        color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.9)',
        lineHeight: 1.2, wordBreak: 'break-word',
      }}>
        {name}
      </span>
    </div>
  );
}

// ── Main Desktop ──────────────────────────────────────────────────────────
export default function Desktop() {
  const {
    windows, wallpaperIndex, launcherOpen, notifications, currentTime,
    iconPositions, setTime, addNotification, openApp, removeNotification, setIconPosition,
  } = useOSStore();

  const wallpaper = WALLPAPERS[wallpaperIndex];

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [setTime]);

  useEffect(() => {
    const timer = setTimeout(() => addNotification('Troy OS V2.0.1 — System Booted', '✅'), 1200);
    return () => clearTimeout(timer);
  }, [addNotification]);

  const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // Default column positions for icons
  const getDefaultPos = (index: number) => ({ x: 30, y: 30 + index * 110 });

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', userSelect: 'none',
      fontFamily: 'var(--font-geist-sans), sans-serif', color: '#fff',
    }}>
      <style>{`
        @keyframes gridPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .notif-enter { animation: notifSlide 0.5s cubic-bezier(0.2, 1, 0.2, 1); }
        @keyframes notifSlide { from { transform: translateX(120%) scale(0.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
      `}</style>

      {/* Wallpaper */}
      <div
        id="nexus-desktop-bg"
        style={{
          position: 'absolute', inset: 0,
          background: wallpaper.background,
          backgroundImage: [
            `linear-gradient(${wallpaper.gridColor} 1px, transparent 1px)`,
            `linear-gradient(90deg, ${wallpaper.gridColor} 1px, transparent 1px)`,
          ].join(','),
          backgroundSize: '60px 60px',
          animation: 'gridPulse 8s ease infinite',
          transition: 'background 0.5s ease',
        }}
      />

      {/* Clock */}
      <div style={{ position: 'absolute', top: 40, right: 40, textAlign: 'right', zIndex: 50, pointerEvents: 'none' }}>
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.9, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
          {timeStr}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
          {dateStr}
        </div>
      </div>

      {/* Draggable Desktop Icons */}
      {APPS.map((app, index) => {
        const saved = iconPositions.find(p => p.appId === app.id);
        const def = getDefaultPos(index);
        return (
          <DraggableIcon
            key={app.id}
            appId={app.id}
            emoji={app.emoji}
            name={app.name}
            initialX={saved?.x ?? def.x}
            initialY={saved?.y ?? def.y}
            onDragEnd={setIconPosition}
            onOpen={() => openApp(app.id, app.name, app.emoji, app.color, app.defaultWidth, app.defaultHeight)}
          />
        );
      })}

      {/* Windows */}
      {windows.map(win => (
        <Window key={win.id} {...win}>
          {getAppContent(win.appId)}
        </Window>
      ))}

      {launcherOpen && <AppLauncher />}

      {/* Notifications */}
      <div style={{ position: 'absolute', top: 30, right: 30, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifications.map(n => (
          <div key={n.id} className="notif-enter" onClick={() => removeNotification(n.id)}
            style={{
              background: 'rgba(15,18,25,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)', padding: '14px 20px',
              borderRadius: 18, display: 'flex', alignItems: 'center', gap: 15,
              cursor: 'pointer', minWidth: 260,
            }}>
            <div style={{ fontSize: 20 }}>{n.icon}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>System</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{n.message}</div>
            </div>
          </div>
        ))}
      </div>

      <Dock />
      <Taskbar />
    </div>
  );
}
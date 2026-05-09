// components/Desktop.tsx
'use client';

import { useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { WALLPAPERS } from '@/config/themes';
import { APPS } from '@/config/apps';
import { GAMES } from '@/config/games';
import Window from './Window';
import Taskbar from './Taskbar';
import Dock from './Dock';
import AppLauncher from './AppLauncher';

// Native app components
import GamingHub   from './apps/GamingHub';
import Terminal    from './apps/Terminal';
import AIAssistant from './apps/AIAssistant';
import Settings    from './apps/Settings';
// import Notes      from './apps/Notes';
// import FileExplorer from './apps/FileExplorer';

// Built-in game components
import SnakeGame  from './games/SnakeGame';
import Game2048   from './games/Game2048';
import MemoryGame from './games/MemoryGame';
import TicTacToe  from './games/TicTacToe';

// Maps builtin game IDs to their React components
const BUILTIN_GAMES: Record<number, React.ReactNode> = {
  10: <SnakeGame />,
  11: <Game2048 />,
  12: <MemoryGame />,
  13: <TicTacToe />,
};

function getAppContent(appId: string) {
  // ── 1. Check if it's a builtin game (opened from GamingHub) ──────
  const gameId = parseInt(appId);
  if (!isNaN(gameId) && BUILTIN_GAMES[gameId]) {
    return BUILTIN_GAMES[gameId];
  }

  // ── 2. Check if it's a native desktop app ────────────────────────
  switch (appId) {
    case 'gaming':   return <GamingHub />;
    case 'terminal': return <Terminal />;
    case 'ai':       return <AIAssistant />;
    case 'settings': return <Settings />;
    // case 'notes':    return <Notes />;
    // case 'files':    return <FileExplorer />;
  }

  // ── 3. Check if it has a URL (browser app, external tools) ───────
  const app = APPS.find(a => a.id === appId);
  if (app?.url) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        {/* Warning bar — honest about iframe limitations */}
        <div style={{
          padding: '6px 14px', background: 'rgba(245,158,11,0.15)',
          borderBottom: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(245,158,11,0.9)' }}>
            ⚠️ Some websites block embedding — if this is blank, use the button →
          </span>
          <a href={app.url} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
            Open in Tab ↗
          </a>
        </div>
        <iframe
          src={app.url}
          style={{ flex: 1, border: 'none', background: '#fff' }}
          title={app.name}
          allow="fullscreen; autoplay"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock"
        />
      </div>
    );
  }

  // ── 4. Fallback ───────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, background: 'rgba(10,12,18,0.4)' }}>
      <span style={{ fontSize: 40 }}>{app?.emoji || '📦'}</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Coming soon</span>
    </div>
  );
}

export default function Desktop() {
  const {
    windows, wallpaperIndex, launcherOpen, notifications, currentTime,
    setTime, addNotification, openApp, removeNotification,
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

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', userSelect: 'none',
      fontFamily: 'var(--font-geist-sans), sans-serif', color: '#fff',
    }}>
      <style>{`
        @keyframes gridPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .notif-enter { animation: notifSlide 0.5s cubic-bezier(0.2, 1, 0.2, 1); }
        @keyframes notifSlide { from { transform: translateX(120%) scale(0.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
        .desktop-icon { transition: all 0.25s ease; }
        .desktop-icon:hover { background: rgba(255,255,255,0.1) !important; transform: translateY(-2px); }
      `}</style>

      {/* Wallpaper — id="nexus-desktop-bg" lets Settings inject custom wallpapers */}
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
        }}
      />

      {/* Clock */}
      <div style={{ position: 'absolute', top: 40, right: 40, textAlign: 'right', zIndex: 50, pointerEvents: 'none' }}>
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.9 }}>{timeStr}</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{dateStr}</div>
      </div>

      {/* Desktop Icons */}
      <div style={{ position: 'absolute', top: 30, left: 30, display: 'flex', flexDirection: 'column', gap: 15, zIndex: 40 }}>
        {APPS.map(app => (
          <div key={app.id}
            className="desktop-icon"
            onDoubleClick={() => openApp(app.id, app.name, app.emoji, app.color, app.defaultWidth, app.defaultHeight)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.03)', width: 80 }}>
            <div style={{ fontSize: 36, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{app.emoji}</div>
            <span style={{ fontSize: 11, fontWeight: 600, marginTop: 8, textAlign: 'center' }}>{app.name}</span>
          </div>
        ))}
      </div>

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
            style={{ background: 'rgba(15,18,25,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 20px', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 15, cursor: 'pointer', minWidth: 260 }}>
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